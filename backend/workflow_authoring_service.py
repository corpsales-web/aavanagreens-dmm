"""
Workflow Authoring Service for Aavana Greens
Handles creation, testing, and deployment of GPT-5 powered workflows
"""

import os
import uuid
import asyncio
import json
from datetime import datetime, timezone
from typing import List, Dict, Optional, Any, Union
import logging

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument
import aiohttp

logger = logging.getLogger(__name__)

class WorkflowAuthoringService:
    """Service for creating and managing AI-powered workflow templates"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.workflow_templates_collection = db.workflow_templates
        self.prompt_templates_collection = db.prompt_templates
        self.workflow_versions_collection = db.workflow_versions
        self.test_results_collection = db.workflow_test_results
        
        # Supported workflow step types
        self.step_types = {
            'ai_response': {
                'name': 'AI Response',
                'description': 'Generate AI-powered response using GPT-5',
                'icon': '🤖'
            },
            'send_message': {
                'name': 'Send Message',
                'description': 'Send automated message via WhatsApp/Email/SMS',
                'icon': '📤'
            },
            'wait_for_response': {
                'name': 'Wait for Response',
                'description': 'Wait for user response with timeout',
                'icon': '⏳'
            },
            'conditional': {
                'name': 'Conditional Logic',
                'description': 'Branch workflow based on conditions',
                'icon': '🔀'
            },
            'assign_agent': {
                'name': 'Assign Agent',
                'description': 'Assign lead to specific agent or team',
                'icon': '👥'
            },
            'schedule_followup': {
                'name': 'Schedule Follow-up',
                'description': 'Schedule automated follow-up action',
                'icon': '📅'
            },
            'update_lead': {
                'name': 'Update Lead',
                'description': 'Update lead status or information',
                'icon': '✏️'
            },
            'trigger_notification': {
                'name': 'Send Notification',
                'description': 'Send notification to agent or manager',
                'icon': '🔔'
            }
        }
        
        # AI model configurations
        self.ai_models = {
            'gpt-5': {
                'name': 'GPT-5',
                'provider': 'openai',
                'max_tokens': 4096,
                'temperature_range': (0.0, 2.0),
                'supports_functions': True
            },
            'claude-sonnet-4': {
                'name': 'Claude Sonnet 4',
                'provider': 'anthropic',
                'max_tokens': 4096,
                'temperature_range': (0.0, 1.0),
                'supports_functions': True
            },
            'gemini-2.5-pro': {
                'name': 'Gemini 2.5 Pro',
                'provider': 'google',
                'max_tokens': 4096,
                'temperature_range': (0.0, 2.0),
                'supports_functions': True
            }
        }
    
    async def create_prompt_template(self, template_data: Dict[str, Any], 
                                   user_id: str) -> Dict[str, Any]:
        """Create a new GPT-5 prompt template"""
        try:
            template_id = str(uuid.uuid4())
            
            prompt_template = {
                'id': template_id,
                'name': template_data.get('name'),
                'description': template_data.get('description'),
                'category': template_data.get('category', 'general'),
                'system_prompt': template_data.get('system_prompt', ''),
                'user_prompt_template': template_data.get('user_prompt_template', ''),
                'variables': template_data.get('variables', []),
                'ai_model': template_data.get('ai_model', 'gpt-5'),
                'temperature': template_data.get('temperature', 0.7),
                'max_tokens': template_data.get('max_tokens', 1000),
                'functions': template_data.get('functions', []),
                'examples': template_data.get('examples', []),
                'tags': template_data.get('tags', []),
                'is_active': template_data.get('is_active', True),
                'created_by': user_id,
                'version': 1,
                'created_at': datetime.now(timezone.utc),
                'updated_at': datetime.now(timezone.utc)
            }
            
            await self.prompt_templates_collection.insert_one(prompt_template)
            
            logger.info(f"Created prompt template: {template_id}")
            
            return {
                'success': True,
                'template_id': template_id,
                'message': 'Prompt template created successfully'
            }
            
        except Exception as e:
            logger.error(f"Error creating prompt template: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_prompt_templates(self, category: Optional[str] = None,
                                 active_only: bool = True) -> List[Dict[str, Any]]:
        """Get prompt templates with optional filtering"""
        try:
            query = {}
            if category:
                query['category'] = category
            if active_only:
                query['is_active'] = True
                
            templates = await self.prompt_templates_collection.find(
                query
            ).sort('created_at', -1).to_list(length=None)
            
            # Remove MongoDB ObjectId
            for template in templates:
                if '_id' in template:
                    del template['_id']
                    
            return templates
            
        except Exception as e:
            logger.error(f"Error fetching prompt templates: {str(e)}")
            return []
    
    async def test_prompt_template(self, template_id: str, test_data: Dict[str, Any],
                                 user_id: str) -> Dict[str, Any]:
        """Test a prompt template with sample data"""
        try:
            # Get template
            template = await self.prompt_templates_collection.find_one(
                {'id': template_id}
            )
            
            if not template:
                return {
                    'success': False,
                    'error': 'Template not found'
                }
            
            # Prepare test variables
            variables = test_data.get('variables', {})
            
            # Build the complete prompt
            system_prompt = template.get('system_prompt', '')
            user_prompt = template.get('user_prompt_template', '')
            
            # Replace variables in prompts
            for var_name, var_value in variables.items():
                placeholder = f"{{{var_name}}}"
                system_prompt = system_prompt.replace(placeholder, str(var_value))
                user_prompt = user_prompt.replace(placeholder, str(var_value))
            
            # Call AI service to test the prompt
            ai_response = await self._call_ai_service(
                model=template.get('ai_model', 'gpt-5'),
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=template.get('temperature', 0.7),
                max_completion_tokens=template.get('max_completion_tokens', template.get('max_tokens', 1000))
            )
            
            # Save test result
            test_result = {
                'id': str(uuid.uuid4()),
                'template_id': template_id,
                'test_variables': variables,
                'system_prompt_used': system_prompt,
                'user_prompt_used': user_prompt,
                'ai_response': ai_response,
                'tested_by': user_id,
                'tested_at': datetime.now(timezone.utc)
            }
            
            await self.test_results_collection.insert_one(test_result)
            
            return {
                'success': True,
                'test_id': test_result['id'],
                'ai_response': ai_response,
                'tokens_used': ai_response.get('usage', {}),
                'response_time': ai_response.get('response_time', 0)
            }
            
        except Exception as e:
            logger.error(f"Error testing prompt template: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def create_workflow(self, workflow_data: Dict[str, Any], 
                            user_id: str) -> Dict[str, Any]:
        """Create a new workflow with multiple steps"""
        try:
            workflow_id = str(uuid.uuid4())
            
            workflow = {
                'id': workflow_id,
                'name': workflow_data.get('name'),
                'description': workflow_data.get('description'),
                'category': workflow_data.get('category', 'lead_nurturing'),
                'trigger_conditions': workflow_data.get('trigger_conditions', {}),
                'steps': workflow_data.get('steps', []),
                'global_variables': workflow_data.get('global_variables', {}),
                'settings': {
                    'auto_assign': workflow_data.get('auto_assign', False),
                    'send_notifications': workflow_data.get('send_notifications', True),
                    'max_execution_time': workflow_data.get('max_execution_time', 3600),
                    'retry_on_failure': workflow_data.get('retry_on_failure', True)
                },
                'tags': workflow_data.get('tags', []),
                'is_active': workflow_data.get('is_active', False),  # Start as draft
                'is_published': False,
                'created_by': user_id,
                'version': 1,
                'created_at': datetime.now(timezone.utc),
                'updated_at': datetime.now(timezone.utc)
            }
            
            # Validate workflow steps
            validation_result = await self._validate_workflow_steps(workflow['steps'])
            if not validation_result['valid']:
                return {
                    'success': False,
                    'error': f"Workflow validation failed: {validation_result['errors']}"
                }
            
            await self.workflow_templates_collection.insert_one(workflow)
            
            logger.info(f"Created workflow: {workflow_id}")
            
            return {
                'success': True,
                'workflow_id': workflow_id,
                'message': 'Workflow created successfully'
            }
            
        except Exception as e:
            logger.error(f"Error creating workflow: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def test_workflow(self, workflow_id: str, test_data: Dict[str, Any],
                          user_id: str) -> Dict[str, Any]:
        """Test a complete workflow with sample data"""
        try:
            # Get workflow
            workflow = await self.workflow_templates_collection.find_one(
                {'id': workflow_id}
            )
            
            if not workflow:
                return {
                    'success': False,
                    'error': 'Workflow not found'
                }
            
            test_id = str(uuid.uuid4())
            test_variables = test_data.get('variables', {})
            
            # Execute workflow in test mode
            execution_result = await self._execute_workflow_test(
                workflow, test_variables, test_id
            )
            
            # Save detailed test results
            test_result = {
                'id': test_id,
                'workflow_id': workflow_id,
                'test_variables': test_variables,
                'execution_steps': execution_result.get('steps', []),
                'total_duration': execution_result.get('duration', 0),
                'success': execution_result.get('success', False),
                'errors': execution_result.get('errors', []),
                'ai_calls_made': execution_result.get('ai_calls', 0),
                'tokens_used': execution_result.get('tokens_used', 0),
                'tested_by': user_id,
                'tested_at': datetime.now(timezone.utc)
            }
            
            await self.test_results_collection.insert_one(test_result)
            
            return {
                'success': True,
                'test_id': test_id,
                'execution_result': execution_result,
                'recommendation': await self._generate_test_recommendations(execution_result)
            }
            
        except Exception as e:
            logger.error(f"Error testing workflow: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def publish_workflow(self, workflow_id: str, user_id: str) -> Dict[str, Any]:
        """Publish a workflow to make it available for production use"""
        try:
            workflow = await self.workflow_templates_collection.find_one(
                {'id': workflow_id}
            )
            
            if not workflow:
                return {
                    'success': False,
                    'error': 'Workflow not found'
                }
            
            # Create a new version before publishing
            version_result = await self._create_workflow_version(workflow, user_id)
            
            if not version_result['success']:
                return version_result
            
            # Update workflow status
            await self.workflow_templates_collection.update_one(
                {'id': workflow_id},
                {
                    '$set': {
                        'is_published': True,
                        'is_active': True,
                        'published_at': datetime.now(timezone.utc),
                        'published_by': user_id,
                        'updated_at': datetime.now(timezone.utc)
                    }
                }
            )
            
            logger.info(f"Published workflow: {workflow_id}")
            
            return {
                'success': True,
                'message': 'Workflow published successfully',
                'version': version_result['version']
            }
            
        except Exception as e:
            logger.error(f"Error publishing workflow: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_workflows(self, category: Optional[str] = None,
                          published_only: bool = False) -> List[Dict[str, Any]]:
        """Get workflows with optional filtering"""
        try:
            query = {}
            if category:
                query['category'] = category
            if published_only:
                query['is_published'] = True
                
            workflows = await self.workflow_templates_collection.find(
                query
            ).sort('created_at', -1).to_list(length=None)
            
            # Remove MongoDB ObjectId
            for workflow in workflows:
                if '_id' in workflow:
                    del workflow['_id']
                    
            return workflows
            
        except Exception as e:
            logger.error(f"Error fetching workflows: {str(e)}")
            return []
    
    async def get_workflow_analytics(self, workflow_id: str) -> Dict[str, Any]:
        """Get analytics and performance data for a workflow"""
        try:
            # Get execution statistics
            exec_stats = await self.db.workflow_instances.aggregate([
                {'$match': {'template_id': workflow_id}},
                {'$group': {
                    '_id': None,
                    'total_executions': {'$sum': 1},
                    'successful_executions': {
                        '$sum': {'$cond': [{'$eq': ['$status', 'completed']}, 1, 0]}
                    },
                    'failed_executions': {
                        '$sum': {'$cond': [{'$eq': ['$status', 'failed']}, 1, 0]}
                    },
                    'avg_duration': {'$avg': '$duration'},
                    'total_leads_processed': {'$sum': 1}
                }}
            ]).to_list(length=1)
            
            stats = exec_stats[0] if exec_stats else {}
            
            # Get test results summary
            test_stats = await self.test_results_collection.aggregate([
                {'$match': {'workflow_id': workflow_id}},
                {'$group': {
                    '_id': None,
                    'total_tests': {'$sum': 1},
                    'successful_tests': {
                        '$sum': {'$cond': [{'$eq': ['$success', True]}, 1, 0]}
                    },
                    'avg_response_time': {'$avg': '$total_duration'},
                    'total_tokens_used': {'$sum': '$tokens_used'}
                }}
            ]).to_list(length=1)
            
            test_data = test_stats[0] if test_stats else {}
            
            return {
                'workflow_id': workflow_id,
                'execution_stats': stats,
                'test_stats': test_data,
                'success_rate': (
                    stats.get('successful_executions', 0) / 
                    max(stats.get('total_executions', 1), 1) * 100
                ),
                'generated_at': datetime.now(timezone.utc)
            }
            
        except Exception as e:
            logger.error(f"Error getting workflow analytics: {str(e)}")
            return {}
    
    async def _validate_workflow_steps(self, steps: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Validate workflow step configuration"""
        try:
            errors = []
            
            if not steps:
                errors.append("Workflow must have at least one step")
                return {'valid': False, 'errors': errors}
            
            for i, step in enumerate(steps):
                step_type = step.get('type')
                
                if step_type not in self.step_types:
                    errors.append(f"Step {i+1}: Invalid step type '{step_type}'")
                    continue
                
                # Validate required fields based on step type
                if step_type == 'ai_response':
                    if not step.get('prompt_template_id') and not step.get('prompt'):
                        errors.append(f"Step {i+1}: AI response step requires prompt or template")
                
                elif step_type == 'send_message':
                    if not step.get('message_template'):
                        errors.append(f"Step {i+1}: Send message step requires message template")
                
                elif step_type == 'conditional':
                    if not step.get('conditions'):
                        errors.append(f"Step {i+1}: Conditional step requires conditions")
            
            return {
                'valid': len(errors) == 0,
                'errors': errors
            }
            
        except Exception as e:
            logger.error(f"Error validating workflow steps: {str(e)}")
            return {'valid': False, 'errors': [str(e)]}
    
    async def _execute_workflow_test(self, workflow: Dict[str, Any], 
                                   variables: Dict[str, Any], 
                                   test_id: str) -> Dict[str, Any]:
        """Execute workflow in test mode"""
        try:
            start_time = datetime.now()
            execution_steps = []
            errors = []
            ai_calls = 0
            tokens_used = 0
            
            # Merge global variables with test variables
            all_variables = {**workflow.get('global_variables', {}), **variables}
            
            for i, step in enumerate(workflow.get('steps', [])):
                step_start = datetime.now()
                
                try:
                    step_result = await self._execute_test_step(step, all_variables)
                    
                    execution_steps.append({
                        'step_index': i,
                        'step_type': step.get('type'),
                        'step_name': step.get('name', f"Step {i+1}"),
                        'duration': (datetime.now() - step_start).total_seconds(),
                        'success': step_result.get('success', False),
                        'output': step_result.get('output'),
                        'variables_updated': step_result.get('variables_updated', {})
                    })
                    
                    # Update variables with step output
                    if step_result.get('variables_updated'):
                        all_variables.update(step_result['variables_updated'])
                    
                    # Track AI usage
                    if step.get('type') == 'ai_response':
                        ai_calls += 1
                        tokens_used += step_result.get('tokens_used', 0)
                    
                except Exception as step_error:
                    errors.append(f"Step {i+1} failed: {str(step_error)}")
                    execution_steps.append({
                        'step_index': i,
                        'step_type': step.get('type'),
                        'step_name': step.get('name', f"Step {i+1}"),
                        'duration': (datetime.now() - step_start).total_seconds(),
                        'success': False,
                        'error': str(step_error)
                    })
            
            total_duration = (datetime.now() - start_time).total_seconds()
            
            return {
                'success': len(errors) == 0,
                'steps': execution_steps,
                'duration': total_duration,
                'errors': errors,
                'ai_calls': ai_calls,
                'tokens_used': tokens_used,
                'final_variables': all_variables
            }
            
        except Exception as e:
            logger.error(f"Error executing workflow test: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'steps': [],
                'duration': 0
            }
    
    async def _execute_test_step(self, step: Dict[str, Any], 
                               variables: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single workflow step in test mode"""
        try:
            step_type = step.get('type')
            
            if step_type == 'ai_response':
                # Test AI response generation
                return await self._test_ai_response_step(step, variables)
                
            elif step_type == 'send_message':
                # Simulate message sending
                return {
                    'success': True,
                    'output': f"[TEST] Would send message: {step.get('message_template', '')}",
                    'variables_updated': {'last_action': 'message_sent'}
                }
                
            elif step_type == 'wait_for_response':
                # Simulate wait step
                return {
                    'success': True,
                    'output': f"[TEST] Would wait for {step.get('timeout', 300)} seconds",
                    'variables_updated': {'wait_completed': True}
                }
                
            elif step_type == 'conditional':
                # Test conditional logic
                return await self._test_conditional_step(step, variables)
                
            else:
                return {
                    'success': True,
                    'output': f"[TEST] Simulated execution of {step_type} step"
                }
                
        except Exception as e:
            logger.error(f"Error executing test step: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def _test_ai_response_step(self, step: Dict[str, Any], 
                                   variables: Dict[str, Any]) -> Dict[str, Any]:
        """Test AI response step"""
        try:
            # Get prompt template or use inline prompt
            prompt_template_id = step.get('prompt_template_id')
            
            if prompt_template_id:
                template = await self.prompt_templates_collection.find_one(
                    {'id': prompt_template_id}
                )
                if not template:
                    return {
                        'success': False,
                        'error': 'Prompt template not found'
                    }
                
                system_prompt = template.get('system_prompt', '')
                user_prompt = template.get('user_prompt_template', '')
                ai_model = template.get('ai_model', 'gpt-5')
                temperature = template.get('temperature', 0.7)
                max_completion_tokens = template.get('max_completion_tokens', template.get('max_tokens', 1000))
            else:
                system_prompt = step.get('system_prompt', '')
                user_prompt = step.get('prompt', '')
                ai_model = step.get('ai_model', 'gpt-5')
                temperature = step.get('temperature', 0.7)
                max_completion_tokens = step.get('max_completion_tokens', step.get('max_tokens', 1000))
            
            # Replace variables in prompts
            for var_name, var_value in variables.items():
                placeholder = f"{{{var_name}}}"
                system_prompt = system_prompt.replace(placeholder, str(var_value))
                user_prompt = user_prompt.replace(placeholder, str(var_value))
            
            # Call AI service
            ai_response = await self._call_ai_service(
                model=ai_model,
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=temperature,
                max_completion_tokens=max_completion_tokens
            )
            
            return {
                'success': ai_response.get('success', False),
                'output': ai_response.get('content', ''),
                'tokens_used': ai_response.get('usage', {}).get('total_tokens', 0),
                'variables_updated': {
                    'last_ai_response': ai_response.get('content', ''),
                    'ai_model_used': ai_model
                }
            }
            
        except Exception as e:
            logger.error(f"Error testing AI response step: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def _test_conditional_step(self, step: Dict[str, Any], 
                                   variables: Dict[str, Any]) -> Dict[str, Any]:
        """Test conditional logic step"""
        try:
            conditions = step.get('conditions', [])
            
            for condition in conditions:
                var_name = condition.get('variable')
                operator = condition.get('operator', 'equals')
                expected_value = condition.get('value')
                
                actual_value = variables.get(var_name)
                
                # Simple condition evaluation
                if operator == 'equals' and actual_value == expected_value:
                    return {
                        'success': True,
                        'output': f"[TEST] Condition met: {var_name} {operator} {expected_value}",
                        'variables_updated': {'condition_result': True, 'matched_condition': condition}
                    }
                elif operator == 'contains' and expected_value in str(actual_value):
                    return {
                        'success': True,
                        'output': f"[TEST] Condition met: {var_name} contains {expected_value}",
                        'variables_updated': {'condition_result': True, 'matched_condition': condition}
                    }
            
            return {
                'success': True,
                'output': "[TEST] No conditions met, using default path",
                'variables_updated': {'condition_result': False}
            }
            
        except Exception as e:
            logger.error(f"Error testing conditional step: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def _call_ai_service(self, model: str, system_prompt: str, 
                             user_prompt: str, temperature: float = 0.7,
                             max_tokens: int = 1000) -> Dict[str, Any]:
        """Call AI service for testing (simplified implementation)"""
        try:
            # This would normally call the actual AI service
            # For testing purposes, return a mock response
            
            return {
                'success': True,
                'content': f"[AI TEST RESPONSE] Model: {model}, Temperature: {temperature}, Prompt length: {len(user_prompt)} chars",
                'usage': {
                    'prompt_tokens': len(user_prompt.split()),
                    'completion_tokens': 20,
                    'total_tokens': len(user_prompt.split()) + 20
                },
                'response_time': 1.5
            }
            
        except Exception as e:
            logger.error(f"Error calling AI service: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def _generate_test_recommendations(self, execution_result: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on test execution results"""
        try:
            recommendations = []
            
            if not execution_result.get('success'):
                recommendations.append("❌ Workflow test failed. Review error messages and fix issues before publishing.")
            
            duration = execution_result.get('duration', 0)
            if duration > 30:
                recommendations.append("⏱️ Workflow execution time is high. Consider optimizing AI prompts or reducing wait times.")
            
            ai_calls = execution_result.get('ai_calls', 0)
            if ai_calls > 5:
                recommendations.append("🤖 High number of AI calls detected. Consider combining prompts or caching responses.")
            
            tokens_used = execution_result.get('tokens_used', 0)
            if tokens_used > 3000:
                recommendations.append("💰 High token usage detected. Consider shortening prompts or using more efficient models.")
            
            errors = execution_result.get('errors', [])
            if errors:
                recommendations.append(f"🔧 {len(errors)} error(s) found. Address these issues before production deployment.")
            
            if execution_result.get('success') and duration < 10 and ai_calls <= 3:
                recommendations.append("✅ Excellent! Workflow is optimized and ready for production.")
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            return ["Unable to generate recommendations due to analysis error."]
    
    async def _create_workflow_version(self, workflow: Dict[str, Any], 
                                     user_id: str) -> Dict[str, Any]:
        """Create a versioned snapshot of the workflow"""
        try:
            version_id = str(uuid.uuid4())
            current_version = workflow.get('version', 1)
            new_version = current_version + 1
            
            version_snapshot = {
                'id': version_id,
                'workflow_id': workflow['id'],
                'version': new_version,
                'snapshot': workflow,
                'created_by': user_id,
                'created_at': datetime.now(timezone.utc)
            }
            
            await self.workflow_versions_collection.insert_one(version_snapshot)
            
            # Update workflow version
            await self.workflow_templates_collection.update_one(
                {'id': workflow['id']},
                {'$set': {'version': new_version}}
            )
            
            return {
                'success': True,
                'version': new_version,
                'version_id': version_id
            }
            
        except Exception as e:
            logger.error(f"Error creating workflow version: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

def initialize_workflow_authoring_service(db: AsyncIOMotorDatabase):
    """Initialize and return workflow authoring service instance"""
    return WorkflowAuthoringService(db)