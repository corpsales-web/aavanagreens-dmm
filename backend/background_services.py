import asyncio
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import threading
import json
import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import requests

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BackgroundAgentService:
    """
    Background service to run continuous agent activities and data synchronization
    """
    
    def __init__(self):
        self.is_running = False
        self.tasks = {}
        self.sync_intervals = {
            'lead_sync': 300,      # 5 minutes
            'task_sync': 180,      # 3 minutes
            'ai_analysis': 600,    # 10 minutes
            'data_backup': 1800,   # 30 minutes
            'health_check': 60,    # 1 minute
            'notification_queue': 30,  # 30 seconds
            'workflow_automation': 120,  # 2 minutes
        }
        self.last_run = {}
        
        # Initialize database connection
        self.mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        self.db_name = 'aavana_greens'
        self.client = None
        self.db = None
        
    async def initialize(self):
        """Initialize database connections and services"""
        try:
            self.client = AsyncIOMotorClient(self.mongo_url)
            self.db = self.client[self.db_name]
            
            # Test connection
            await self.client.admin.command('ping')
            logger.info("✅ Database connection established")
            
            # Initialize collections if needed
            await self.ensure_collections()
            
        except Exception as e:
            logger.error(f"❌ Database initialization failed: {str(e)}")
            # Use fallback database connection if available
            self.setup_fallback_db()
    
    def setup_fallback_db(self):
        """Setup fallback database connection for background services"""
        try:
            self.client = MongoClient(self.mongo_url)
            self.db = self.client[self.db_name]
            logger.info("✅ Fallback database connection established")
        except Exception as e:
            logger.error(f"❌ Fallback database connection failed: {str(e)}")
    
    async def ensure_collections(self):
        """Ensure required collections exist"""
        collections = ['leads', 'tasks', 'users', 'background_jobs', 'agent_activities', 'sync_logs']
        
        existing_collections = await self.db.list_collection_names()
        
        for collection in collections:
            if collection not in existing_collections:
                await self.db.create_collection(collection)
                logger.info(f"✅ Created collection: {collection}")
    
    async def start_background_services(self):
        """Start all background services"""
        if self.is_running:
            logger.warning("Background services already running")
            return
        
        self.is_running = True
        logger.info("🚀 Starting background agent services...")
        
        # Initialize service
        await self.initialize()
        
        # Start background tasks
        background_tasks = [
            self.lead_sync_service(),
            self.task_sync_service(),
            self.ai_analysis_service(),
            self.data_backup_service(),
            self.health_check_service(),
            self.notification_queue_service(),
            self.workflow_automation_service(),
            self.agent_activity_monitor(),
        ]
        
        # Run all tasks concurrently
        await asyncio.gather(*background_tasks, return_exceptions=True)
    
    async def lead_sync_service(self):
        """Continuously sync and process leads"""
        while self.is_running:
            try:
                logger.info("🔄 Running lead sync service...")
                
                # Fetch leads requiring attention
                if self.db:
                    leads_cursor = self.db.leads.find({
                        '$or': [
                            {'last_contact': {'$lt': datetime.utcnow() - timedelta(days=3)}},
                            {'status': 'new'},
                            {'priority': 'high'}
                        ]
                    })
                    
                    lead_count = 0
                    async for lead in leads_cursor:
                        lead_count += 1
                        await self.process_lead_automation(lead)
                    
                    if lead_count > 0:
                        logger.info(f"✅ Processed {lead_count} leads for automation")
                        
                        # Log sync activity
                        await self.log_sync_activity('lead_sync', {
                            'processed_count': lead_count,
                            'timestamp': datetime.utcnow(),
                            'status': 'success'
                        })
                
                await asyncio.sleep(self.sync_intervals['lead_sync'])
                
            except Exception as e:
                logger.error(f"❌ Lead sync service error: {str(e)}")
                await asyncio.sleep(60)  # Wait before retry
    
    async def process_lead_automation(self, lead):
        """Process individual lead for automated actions"""
        try:
            # Check if lead needs follow-up
            if lead.get('last_contact'):
                last_contact = lead['last_contact']
                if isinstance(last_contact, str):
                    last_contact = datetime.fromisoformat(last_contact.replace('Z', '+00:00'))
                
                days_since_contact = (datetime.utcnow() - last_contact.replace(tzinfo=None)).days
                
                if days_since_contact >= 3:
                    # Create automated follow-up task
                    await self.create_automated_task({
                        'title': f"Follow up with {lead.get('name', 'Lead')}",
                        'description': f"Automated follow-up: Last contact was {days_since_contact} days ago",
                        'lead_id': lead.get('id'),
                        'priority': 'medium',
                        'type': 'follow_up',
                        'automated': True,
                        'created_at': datetime.utcnow(),
                        'due_date': datetime.utcnow() + timedelta(hours=24)
                    })
            
            # AI-powered lead scoring
            if lead.get('score') is None or lead.get('score', 0) == 0:
                score = await self.calculate_lead_score(lead)
                if score:
                    await self.db.leads.update_one(
                        {'id': lead['id']},
                        {'$set': {'score': score, 'scored_at': datetime.utcnow()}}
                    )
                    
        except Exception as e:
            logger.error(f"❌ Lead automation error for {lead.get('id')}: {str(e)}")
    
    async def calculate_lead_score(self, lead):
        """Calculate AI-powered lead score"""
        try:
            score = 50  # Base score
            
            # Budget factor
            budget = lead.get('budget', 0)
            if budget > 100000:
                score += 30
            elif budget > 50000:
                score += 20
            elif budget > 25000:
                score += 10
            
            # Source factor
            source = lead.get('source', '').lower()
            if source == 'referral':
                score += 25
            elif source == 'website':
                score += 15
            elif source in ['facebook', 'google ads']:
                score += 10
            
            # Engagement factor
            if lead.get('phone'):
                score += 5
            if lead.get('email'):
                score += 5
            if lead.get('requirements'):
                score += 10
            
            # Response time factor
            created_at = lead.get('created_at')
            if created_at:
                if isinstance(created_at, str):
                    created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                hours_old = (datetime.utcnow() - created_at.replace(tzinfo=None)).total_seconds() / 3600
                if hours_old < 1:
                    score += 20  # Hot lead
                elif hours_old < 24:
                    score += 10
            
            return min(100, max(0, score))  # Keep score between 0-100
            
        except Exception as e:
            logger.error(f"❌ Lead scoring error: {str(e)}")
            return 50  # Default score
    
    async def task_sync_service(self):
        """Continuously sync and process tasks"""
        while self.is_running:
            try:
                logger.info("📋 Running task sync service...")
                
                if self.db:
                    # Find overdue tasks
                    overdue_tasks = self.db.tasks.find({
                        'due_date': {'$lt': datetime.utcnow()},
                        'status': {'$ne': 'completed'}
                    })
                    
                    overdue_count = 0
                    async for task in overdue_tasks:
                        overdue_count += 1
                        await self.handle_overdue_task(task)
                    
                    # Find tasks due soon
                    due_soon_tasks = self.db.tasks.find({
                        'due_date': {
                            '$gte': datetime.utcnow(),
                            '$lte': datetime.utcnow() + timedelta(hours=2)
                        },
                        'status': {'$ne': 'completed'},
                        'reminder_sent': {'$ne': True}
                    })
                    
                    reminder_count = 0
                    async for task in due_soon_tasks:
                        reminder_count += 1
                        await self.send_task_reminder(task)
                    
                    if overdue_count > 0 or reminder_count > 0:
                        logger.info(f"✅ Processed {overdue_count} overdue tasks, {reminder_count} reminders")
                
                await asyncio.sleep(self.sync_intervals['task_sync'])
                
            except Exception as e:
                logger.error(f"❌ Task sync service error: {str(e)}")
                await asyncio.sleep(60)
    
    async def handle_overdue_task(self, task):
        """Handle overdue task processing"""
        try:
            # Mark task as overdue
            await self.db.tasks.update_one(
                {'id': task['id']},
                {'$set': {'overdue': True, 'overdue_at': datetime.utcnow()}}
            )
            
            # Create notification for overdue task
            await self.create_notification({
                'type': 'task_overdue',
                'title': 'Task Overdue',
                'message': f"Task '{task.get('title', 'Unknown')}' is overdue",
                'user_id': task.get('assigned_to'),
                'priority': 'high',
                'data': {'task_id': task['id']}
            })
            
        except Exception as e:
            logger.error(f"❌ Overdue task handling error: {str(e)}")
    
    async def send_task_reminder(self, task):
        """Send task reminder notification"""
        try:
            await self.create_notification({
                'type': 'task_reminder',
                'title': 'Task Due Soon',
                'message': f"Task '{task.get('title', 'Unknown')}' is due in 2 hours",
                'user_id': task.get('assigned_to'),
                'priority': 'medium',
                'data': {'task_id': task['id']}
            })
            
            # Mark reminder as sent
            await self.db.tasks.update_one(
                {'id': task['id']},
                {'$set': {'reminder_sent': True}}
            )
            
        except Exception as e:
            logger.error(f"❌ Task reminder error: {str(e)}")
    
    async def ai_analysis_service(self):
        """Run AI analysis on data periodically"""
        while self.is_running:
            try:
                logger.info("🤖 Running AI analysis service...")
                
                if self.db:
                    # Analyze lead patterns
                    await self.analyze_lead_patterns()
                    
                    # Generate insights
                    await self.generate_business_insights()
                    
                    # Update AI recommendations
                    await self.update_ai_recommendations()
                
                await asyncio.sleep(self.sync_intervals['ai_analysis'])
                
            except Exception as e:
                logger.error(f"❌ AI analysis service error: {str(e)}")
                await asyncio.sleep(300)
    
    async def analyze_lead_patterns(self):
        """Analyze lead conversion patterns"""
        try:
            # Get leads from last 30 days
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            
            leads_cursor = self.db.leads.find({
                'created_at': {'$gte': thirty_days_ago}
            })
            
            pattern_data = {
                'total_leads': 0,
                'sources': {},
                'budgets': {},
                'conversion_rates': {},
                'best_performing_sources': []
            }
            
            async for lead in leads_cursor:
                pattern_data['total_leads'] += 1
                
                # Source analysis
                source = lead.get('source', 'unknown')
                pattern_data['sources'][source] = pattern_data['sources'].get(source, 0) + 1
                
                # Budget analysis
                budget = lead.get('budget', 0)
                budget_range = self.get_budget_range(budget)
                pattern_data['budgets'][budget_range] = pattern_data['budgets'].get(budget_range, 0) + 1
            
            # Store analysis results
            await self.db.ai_insights.update_one(
                {'type': 'lead_patterns'},
                {'$set': {
                    'data': pattern_data,
                    'analyzed_at': datetime.utcnow(),
                    'period': '30_days'
                }},
                upsert=True
            )
            
            logger.info(f"✅ Analyzed {pattern_data['total_leads']} leads for patterns")
            
        except Exception as e:
            logger.error(f"❌ Lead pattern analysis error: {str(e)}")
    
    def get_budget_range(self, budget):
        """Categorize budget into ranges"""
        if budget < 25000:
            return 'low'
        elif budget < 100000:
            return 'medium'
        elif budget < 500000:
            return 'high'
        else:
            return 'premium'
    
    async def health_check_service(self):
        """Continuous health monitoring"""
        while self.is_running:
            try:
                health_status = {
                    'timestamp': datetime.utcnow(),
                    'database': 'healthy',
                    'services': {},
                    'memory_usage': 0,
                    'active_connections': 0
                }
                
                # Check database connectivity
                if self.db:
                    try:
                        await self.client.admin.command('ping')
                        health_status['database'] = 'healthy'
                    except:
                        health_status['database'] = 'unhealthy'
                
                # Check service statuses
                for service_name in self.sync_intervals.keys():
                    last_run = self.last_run.get(service_name)
                    if last_run:
                        time_since_run = (datetime.utcnow() - last_run).total_seconds()
                        expected_interval = self.sync_intervals[service_name]
                        
                        if time_since_run < expected_interval * 2:  # Allow 2x interval tolerance
                            health_status['services'][service_name] = 'healthy'
                        else:
                            health_status['services'][service_name] = 'delayed'
                    else:
                        health_status['services'][service_name] = 'not_started'
                
                # Store health status
                if self.db:
                    await self.db.system_health.insert_one(health_status)
                
                logger.info(f"💚 System health check completed - DB: {health_status['database']}")
                
                await asyncio.sleep(self.sync_intervals['health_check'])
                
            except Exception as e:
                logger.error(f"❌ Health check service error: {str(e)}")
                await asyncio.sleep(60)
    
    async def notification_queue_service(self):
        """Process notification queue"""
        while self.is_running:
            try:
                if self.db:
                    # Process pending notifications
                    pending_notifications = self.db.notifications.find({
                        'status': 'pending',
                        'scheduled_at': {'$lte': datetime.utcnow()}
                    }).limit(50)
                    
                    processed_count = 0
                    async for notification in pending_notifications:
                        await self.process_notification(notification)
                        processed_count += 1
                    
                    if processed_count > 0:
                        logger.info(f"📱 Processed {processed_count} notifications")
                
                await asyncio.sleep(self.sync_intervals['notification_queue'])
                
            except Exception as e:
                logger.error(f"❌ Notification queue service error: {str(e)}")
                await asyncio.sleep(30)
    
    async def workflow_automation_service(self):
        """Execute automated workflows"""
        while self.is_running:
            try:
                logger.info("⚡ Running workflow automation service...")
                
                if self.db:
                    # Execute scheduled workflows
                    active_workflows = self.db.workflows.find({
                        'status': 'active',
                        'next_execution': {'$lte': datetime.utcnow()}
                    })
                    
                    workflow_count = 0
                    async for workflow in active_workflows:
                        await self.execute_workflow(workflow)
                        workflow_count += 1
                    
                    if workflow_count > 0:
                        logger.info(f"✅ Executed {workflow_count} automated workflows")
                
                await asyncio.sleep(self.sync_intervals['workflow_automation'])
                
            except Exception as e:
                logger.error(f"❌ Workflow automation service error: {str(e)}")
                await asyncio.sleep(120)
    
    async def agent_activity_monitor(self):
        """Monitor and log agent activities"""
        while self.is_running:
            try:
                activity_summary = {
                    'timestamp': datetime.utcnow(),
                    'active_services': len([s for s in self.sync_intervals.keys() if self.last_run.get(s)]),
                    'total_services': len(self.sync_intervals),
                    'uptime_minutes': (datetime.utcnow() - self.start_time).total_seconds() / 60 if hasattr(self, 'start_time') else 0,
                    'processed_items': {
                        'leads': getattr(self, 'processed_leads_count', 0),
                        'tasks': getattr(self, 'processed_tasks_count', 0),
                        'notifications': getattr(self, 'processed_notifications_count', 0),
                        'workflows': getattr(self, 'processed_workflows_count', 0)
                    }
                }
                
                if self.db:
                    await self.db.agent_activities.insert_one(activity_summary)
                
                logger.info(f"📊 Agent activity: {activity_summary['active_services']}/{activity_summary['total_services']} services active")
                
                await asyncio.sleep(300)  # Log every 5 minutes
                
            except Exception as e:
                logger.error(f"❌ Agent activity monitor error: {str(e)}")
                await asyncio.sleep(300)
    
    async def create_automated_task(self, task_data):
        """Create automated task"""
        try:
            if self.db:
                await self.db.tasks.insert_one(task_data)
                logger.info(f"✅ Created automated task: {task_data['title']}")
        except Exception as e:
            logger.error(f"❌ Automated task creation error: {str(e)}")
    
    async def create_notification(self, notification_data):
        """Create notification"""
        try:
            notification_data.update({
                'id': str(int(time.time() * 1000000)),
                'created_at': datetime.utcnow(),
                'status': 'pending',
                'scheduled_at': datetime.utcnow()
            })
            
            if self.db:
                await self.db.notifications.insert_one(notification_data)
                logger.info(f"📱 Created notification: {notification_data['title']}")
        except Exception as e:
            logger.error(f"❌ Notification creation error: {str(e)}")
    
    async def log_sync_activity(self, service_name, activity_data):
        """Log synchronization activity"""
        try:
            self.last_run[service_name] = datetime.utcnow()
            
            if self.db:
                await self.db.sync_logs.insert_one({
                    'service': service_name,
                    'activity': activity_data,
                    'timestamp': datetime.utcnow()
                })
        except Exception as e:
            logger.error(f"❌ Sync activity logging error: {str(e)}")
    
    async def stop_background_services(self):
        """Stop all background services"""
        logger.info("🛑 Stopping background agent services...")
        self.is_running = False
        
        if self.client:
            self.client.close()

# Global service instance
background_service = BackgroundAgentService()

async def start_background_services():
    """Start background services"""
    background_service.start_time = datetime.utcnow()
    await background_service.start_background_services()

async def stop_background_services():
    """Stop background services"""
    await background_service.stop_background_services()

# Utility function to run in separate thread
def run_background_services():
    """Run background services in separate thread"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        loop.run_until_complete(start_background_services())
    except KeyboardInterrupt:
        logger.info("Background services interrupted")
    finally:
        loop.run_until_complete(stop_background_services())
        loop.close()

if __name__ == "__main__":
    run_background_services()