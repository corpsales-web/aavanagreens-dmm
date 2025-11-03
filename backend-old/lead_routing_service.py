"""
Lead Source Routing Service for Aavana Greens
Handles routing of leads from various sources to specific agents/teams
"""

import os
import uuid
import asyncio
from datetime import datetime, timezone
from typing import List, Dict, Optional, Any, Union
import logging
import json

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument
import aiohttp

logger = logging.getLogger(__name__)

class LeadRoutingService:
    """Service for managing lead source routing and workflow automation"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.routing_rules_collection = db.routing_rules
        self.workflow_templates_collection = db.workflow_templates
        self.routing_logs_collection = db.routing_logs
        self.agent_assignments_collection = db.agent_assignments
        
        # Supported lead sources
        self.supported_sources = [
            'whatsapp_360dialog',
            'facebook',
            'instagram', 
            'google_ads',
            'indiamart',
            'justdial',
            'website_organic',
            'referrals',
            'direct_call',
            'walk_in'
        ]
    
    async def create_routing_rule(self, rule_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Create a new lead routing rule"""
        try:
            rule_id = str(uuid.uuid4())
            
            routing_rule = {
                'id': rule_id,
                'name': rule_data.get('name'),
                'source': rule_data.get('source'),
                'conditions': rule_data.get('conditions', {}),
                'target_agent_id': rule_data.get('target_agent_id'),
                'target_team_id': rule_data.get('target_team_id'),
                'workflow_template_id': rule_data.get('workflow_template_id'),
                'priority': rule_data.get('priority', 1),
                'is_active': rule_data.get('is_active', True),
                'created_by': user_id,
                'created_at': datetime.now(timezone.utc),
                'updated_at': datetime.now(timezone.utc)
            }
            
            await self.routing_rules_collection.insert_one(routing_rule)
            
            logger.info(f"Created routing rule: {rule_id} for source: {rule_data.get('source')}")
            
            return {
                'success': True,
                'rule_id': rule_id,
                'message': 'Routing rule created successfully'
            }
            
        except Exception as e:
            logger.error(f"Error creating routing rule: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_routing_rules(self, source: Optional[str] = None, 
                             active_only: bool = True) -> List[Dict[str, Any]]:
        """Get routing rules with optional filtering"""
        try:
            query = {}
            if source:
                query['source'] = source
            if active_only:
                query['is_active'] = True
                
            rules = await self.routing_rules_collection.find(
                query
            ).sort('priority', 1).to_list(length=None)
            
            # Remove MongoDB ObjectId
            for rule in rules:
                if '_id' in rule:
                    del rule['_id']
                    
            return rules
            
        except Exception as e:
            logger.error(f"Error fetching routing rules: {str(e)}")
            return []
    
    async def route_lead(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Route a lead based on configured rules"""
        try:
            source = lead_data.get('source', '').lower()
            
            # Get applicable routing rules for this source
            routing_rules = await self.get_routing_rules(source=source)
            
            if not routing_rules:
                # Default routing if no rules found
                return await self._default_routing(lead_data)
            
            # Apply first matching rule (rules are sorted by priority)
            for rule in routing_rules:
                if await self._evaluate_rule_conditions(lead_data, rule.get('conditions', {})):
                    routing_result = await self._apply_routing_rule(lead_data, rule)
                    
                    # Log the routing decision
                    await self._log_routing_decision(lead_data, rule, routing_result)
                    
                    return routing_result
            
            # If no rules match, use default routing
            return await self._default_routing(lead_data)
            
        except Exception as e:
            logger.error(f"Error routing lead: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'assigned_agent': None,
                'workflow_triggered': False
            }
    
    async def _evaluate_rule_conditions(self, lead_data: Dict[str, Any], 
                                      conditions: Dict[str, Any]) -> bool:
        """Evaluate if lead data matches rule conditions"""
        try:
            if not conditions:
                return True
                
            # Check location conditions
            if 'location' in conditions:
                lead_location = lead_data.get('location', '').lower()
                condition_locations = [loc.lower() for loc in conditions['location']]
                if lead_location not in condition_locations:
                    return False
            
            # Check budget conditions
            if 'budget_range' in conditions:
                lead_budget = lead_data.get('budget_range', '')
                # Simple budget matching logic - can be enhanced
                if conditions['budget_range'] not in lead_budget:
                    return False
            
            # Check time-based conditions
            if 'time_range' in conditions:
                current_hour = datetime.now().hour
                start_hour = conditions['time_range'].get('start', 0)
                end_hour = conditions['time_range'].get('end', 23)
                if not (start_hour <= current_hour <= end_hour):
                    return False
            
            # Check custom field conditions
            if 'custom_fields' in conditions:
                for field, expected_value in conditions['custom_fields'].items():
                    if lead_data.get(field) != expected_value:
                        return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error evaluating rule conditions: {str(e)}")
            return False
    
    async def _apply_routing_rule(self, lead_data: Dict[str, Any], 
                                rule: Dict[str, Any]) -> Dict[str, Any]:
        """Apply the routing rule to assign agent and trigger workflow"""
        try:
            result = {
                'success': True,
                'rule_applied': rule['id'],
                'assigned_agent': None,
                'assigned_team': None,
                'workflow_triggered': False,
                'workflow_id': None
            }
            
            # Assign to specific agent
            if rule.get('target_agent_id'):
                result['assigned_agent'] = rule['target_agent_id']
                await self._assign_lead_to_agent(lead_data['id'], rule['target_agent_id'])
            
            # Assign to team (will be handled by team lead)
            elif rule.get('target_team_id'):
                result['assigned_team'] = rule['target_team_id']
                await self._assign_lead_to_team(lead_data['id'], rule['target_team_id'])
            
            # Trigger workflow template
            if rule.get('workflow_template_id'):
                workflow_result = await self._trigger_workflow(
                    lead_data, rule['workflow_template_id']
                )
                result['workflow_triggered'] = workflow_result['success']
                result['workflow_id'] = workflow_result.get('workflow_instance_id')
            
            return result
            
        except Exception as e:
            logger.error(f"Error applying routing rule: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def _default_routing(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Default routing when no specific rules apply"""
        try:
            # Simple round-robin assignment to available agents
            available_agents = await self._get_available_agents()
            
            if available_agents:
                # Simple rotation based on lead count
                agent_loads = {}
                for agent in available_agents:
                    agent_loads[agent['id']] = await self._get_agent_lead_count(agent['id'])
                
                # Assign to agent with least leads
                assigned_agent = min(agent_loads.items(), key=lambda x: x[1])[0]
                
                await self._assign_lead_to_agent(lead_data['id'], assigned_agent)
                
                return {
                    'success': True,
                    'assigned_agent': assigned_agent,
                    'routing_type': 'default_round_robin'
                }
            
            return {
                'success': True,
                'assigned_agent': None,
                'routing_type': 'unassigned'
            }
            
        except Exception as e:
            logger.error(f"Error in default routing: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def _assign_lead_to_agent(self, lead_id: str, agent_id: str):
        """Assign lead to specific agent"""
        try:
            assignment = {
                'id': str(uuid.uuid4()),
                'lead_id': lead_id,
                'agent_id': agent_id,
                'assigned_at': datetime.now(timezone.utc),
                'status': 'active'
            }
            
            await self.agent_assignments_collection.insert_one(assignment)
            
            # Update lead record with agent assignment
            await self.db.leads.update_one(
                {'id': lead_id},
                {
                    '$set': {
                        'assigned_agent_id': agent_id,
                        'assigned_at': datetime.now(timezone.utc)
                    }
                }
            )
            
        except Exception as e:
            logger.error(f"Error assigning lead to agent: {str(e)}")
    
    async def _assign_lead_to_team(self, lead_id: str, team_id: str):
        """Assign lead to team"""
        try:
            # Update lead record with team assignment
            await self.db.leads.update_one(
                {'id': lead_id},
                {
                    '$set': {
                        'assigned_team_id': team_id,
                        'assigned_at': datetime.now(timezone.utc)
                    }
                }
            )
            
        except Exception as e:
            logger.error(f"Error assigning lead to team: {str(e)}")
    
    async def _trigger_workflow(self, lead_data: Dict[str, Any], 
                              template_id: str) -> Dict[str, Any]:
        """Trigger a workflow template for the lead"""
        try:
            # Get workflow template
            template = await self.workflow_templates_collection.find_one(
                {'id': template_id}
            )
            
            if not template:
                return {
                    'success': False,
                    'error': 'Workflow template not found'
                }
            
            # Create workflow instance
            workflow_instance_id = str(uuid.uuid4())
            
            workflow_instance = {
                'id': workflow_instance_id,
                'template_id': template_id,
                'lead_id': lead_data['id'],
                'status': 'active',
                'current_step': 0,
                'steps_completed': [],
                'variables': lead_data,  # Pass lead data as workflow variables
                'created_at': datetime.now(timezone.utc),
                'updated_at': datetime.now(timezone.utc)
            }
            
            await self.db.workflow_instances.insert_one(workflow_instance)
            
            # Execute first step of workflow
            await self._execute_workflow_step(workflow_instance_id, 0)
            
            return {
                'success': True,
                'workflow_instance_id': workflow_instance_id
            }
            
        except Exception as e:
            logger.error(f"Error triggering workflow: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def _execute_workflow_step(self, workflow_instance_id: str, step_index: int):
        """Execute a specific step in the workflow"""
        try:
            # Implementation for workflow step execution
            # This would include AI-powered responses, automated actions, etc.
            pass
            
        except Exception as e:
            logger.error(f"Error executing workflow step: {str(e)}")
    
    async def _get_available_agents(self) -> List[Dict[str, Any]]:
        """Get list of available agents for assignment"""
        try:
            # Simple implementation - get all active users with agent role
            agents = await self.db.users.find({
                'role': {'$in': ['Agent', 'Sales Agent', 'Lead Agent']},
                'is_active': True
            }).to_list(length=None)
            
            return agents
            
        except Exception as e:
            logger.error(f"Error getting available agents: {str(e)}")
            return []
    
    async def _get_agent_lead_count(self, agent_id: str) -> int:
        """Get current lead count for an agent"""
        try:
            count = await self.db.leads.count_documents({
                'assigned_agent_id': agent_id,
                'status': {'$in': ['New', 'In Progress', 'Follow Up']}
            })
            return count
            
        except Exception as e:
            logger.error(f"Error getting agent lead count: {str(e)}")
            return 0
    
    async def _log_routing_decision(self, lead_data: Dict[str, Any], 
                                  rule: Dict[str, Any], result: Dict[str, Any]):
        """Log routing decision for audit purposes"""
        try:
            log_entry = {
                'id': str(uuid.uuid4()),
                'lead_id': lead_data['id'],
                'rule_id': rule['id'],
                'source': lead_data.get('source'),
                'routing_result': result,
                'timestamp': datetime.now(timezone.utc)
            }
            
            await self.routing_logs_collection.insert_one(log_entry)
            
        except Exception as e:
            logger.error(f"Error logging routing decision: {str(e)}")

    # Workflow Template Management
    async def create_workflow_template(self, template_data: Dict[str, Any], 
                                     user_id: str) -> Dict[str, Any]:
        """Create a new workflow template"""
        try:
            template_id = str(uuid.uuid4())
            
            workflow_template = {
                'id': template_id,
                'name': template_data.get('name'),
                'description': template_data.get('description'),
                'steps': template_data.get('steps', []),
                'variables': template_data.get('variables', {}),
                'triggers': template_data.get('triggers', []),
                'created_by': user_id,
                'is_active': template_data.get('is_active', True),
                'version': 1,
                'created_at': datetime.now(timezone.utc),
                'updated_at': datetime.now(timezone.utc)
            }
            
            await self.workflow_templates_collection.insert_one(workflow_template)
            
            return {
                'success': True,
                'template_id': template_id,
                'message': 'Workflow template created successfully'
            }
            
        except Exception as e:
            logger.error(f"Error creating workflow template: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_workflow_templates(self, active_only: bool = True) -> List[Dict[str, Any]]:
        """Get list of workflow templates"""
        try:
            query = {}
            if active_only:
                query['is_active'] = True
                
            templates = await self.workflow_templates_collection.find(
                query
            ).sort('created_at', -1).to_list(length=None)
            
            # Remove MongoDB ObjectId
            for template in templates:
                if '_id' in template:
                    del template['_id']
                    
            return templates
            
        except Exception as e:
            logger.error(f"Error fetching workflow templates: {str(e)}")
            return []

def initialize_lead_routing_service(db: AsyncIOMotorDatabase):
    """Initialize and return lead routing service instance"""
    return LeadRoutingService(db)