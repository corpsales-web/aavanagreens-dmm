"""
Offline Sync Service for Aavana Greens
Handles autosave, offline queueing, and data synchronization
"""

import os
import asyncio
import uuid
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Union
from enum import Enum

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument
import redis.asyncio as aioredis

logger = logging.getLogger(__name__)

class SyncStatus(str, Enum):
    PENDING = "pending"
    SYNCING = "syncing"
    COMPLETED = "completed"
    FAILED = "failed"
    CONFLICT = "conflict"

class OfflineSyncService:
    """Service for handling offline operations and data synchronization"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.offline_queue_collection = db.offline_queue
        self.sync_conflicts_collection = db.sync_conflicts
        self.autosave_collection = db.autosave
        
        # Redis for real-time sync coordination (optional)
        self.redis_client = None
        self._initialize_redis()
        
        # Sync configuration
        self.autosave_interval = 10  # seconds
        self.max_queue_size = 1000
        self.sync_batch_size = 50
        self.conflict_resolution_timeout = 300  # 5 minutes
        
        # Supported operations for offline sync
        self.syncable_operations = {
            'leads': ['create', 'update', 'add_remark'],
            'tasks': ['create', 'update', 'complete'],
            'targets': ['create', 'update'],
            'follow_ups': ['create', 'update'],
            'voice_remarks': ['create'],
            'lead_actions': ['create']
        }
        
        # Background sync task
        self.sync_task = None
        self.is_syncing = False
    
    def _initialize_redis(self):
        """Initialize Redis connection for real-time coordination"""
        try:
            redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
            if redis_url and redis_url != 'redis://localhost:6379':
                # Only connect if Redis URL is explicitly configured
                self.redis_client = aioredis.from_url(redis_url)
                logger.info("Redis client initialized for sync coordination")
        except Exception as e:
            logger.warning(f"Redis not available for sync coordination: {e}")
            self.redis_client = None
    
    async def start_background_sync(self):
        """Start background synchronization task"""
        if self.sync_task is None or self.sync_task.done():
            self.sync_task = asyncio.create_task(self._background_sync_loop())
            logger.info("Background sync task started")
    
    async def stop_background_sync(self):
        """Stop background synchronization task"""
        if self.sync_task and not self.sync_task.done():
            self.sync_task.cancel()
            try:
                await self.sync_task
            except asyncio.CancelledError:
                pass
            logger.info("Background sync task stopped")
    
    async def _background_sync_loop(self):
        """Background loop for processing sync queue"""
        while True:
            try:
                await self._process_sync_queue()
                await asyncio.sleep(5)  # Check every 5 seconds
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in background sync loop: {e}")
                await asyncio.sleep(10)  # Wait longer on error
    
    async def queue_offline_operation(self, operation_data: Dict[str, Any],
                                    user_id: str, entity_type: str,
                                    operation_type: str) -> str:
        """Queue an operation for offline processing"""
        try:
            # Validate operation
            if entity_type not in self.syncable_operations:
                raise ValueError(f"Entity type {entity_type} not supported for offline sync")
            
            if operation_type not in self.syncable_operations[entity_type]:
                raise ValueError(f"Operation {operation_type} not supported for {entity_type}")
            
            # Check queue size limit
            queue_size = await self.offline_queue_collection.count_documents({'user_id': user_id})
            if queue_size >= self.max_queue_size:
                # Remove oldest entries to make space
                oldest_entries = await self.offline_queue_collection.find(
                    {'user_id': user_id}
                ).sort('created_at', 1).limit(10).to_list(length=None)
                
                for entry in oldest_entries:
                    await self.offline_queue_collection.delete_one({'_id': entry['_id']})
            
            # Create queue entry
            queue_entry = {
                'id': str(uuid.uuid4()),
                'user_id': user_id,
                'entity_type': entity_type,
                'operation_type': operation_type,
                'operation_data': operation_data,
                'status': SyncStatus.PENDING,
                'created_at': datetime.now(timezone.utc),
                'retry_count': 0,
                'last_retry_at': None,
                'error_message': None
            }
            
            await self.offline_queue_collection.insert_one(queue_entry)
            
            # Notify Redis subscribers if available
            if self.redis_client:
                await self.redis_client.publish('sync_queue', json.dumps({
                    'action': 'new_operation',
                    'user_id': user_id,
                    'entity_type': entity_type
                }))
            
            logger.info(f"Operation queued for offline sync: {entity_type}.{operation_type}")
            return queue_entry['id']
            
        except Exception as e:
            logger.error(f"Error queueing offline operation: {e}")
            raise
    
    async def _process_sync_queue(self):
        """Process pending sync operations"""
        if self.is_syncing:
            return
        
        self.is_syncing = True
        
        try:
            # Get pending operations
            cursor = self.offline_queue_collection.find(
                {'status': SyncStatus.PENDING}
            ).sort('created_at', 1).limit(self.sync_batch_size)
            
            pending_operations = await cursor.to_list(length=None)
            
            if not pending_operations:
                return
            
            logger.info(f"Processing {len(pending_operations)} pending sync operations")
            
            # Process each operation
            for operation in pending_operations:
                try:
                    await self._sync_operation(operation)
                except Exception as e:
                    logger.error(f"Error syncing operation {operation['id']}: {e}")
                    await self._handle_sync_error(operation, str(e))
        
        finally:
            self.is_syncing = False
    
    async def _sync_operation(self, operation: Dict[str, Any]):
        """Sync a single operation"""
        try:
            # Mark as syncing
            await self.offline_queue_collection.update_one(
                {'_id': operation['_id']},
                {
                    '$set': {
                        'status': SyncStatus.SYNCING,
                        'sync_started_at': datetime.now(timezone.utc)
                    }
                }
            )
            
            entity_type = operation['entity_type']
            operation_type = operation['operation_type']
            operation_data = operation['operation_data']
            
            # Route to appropriate sync handler
            if entity_type == 'leads':
                result = await self._sync_lead_operation(operation_type, operation_data)
            elif entity_type == 'tasks':
                result = await self._sync_task_operation(operation_type, operation_data)
            elif entity_type == 'targets':
                result = await self._sync_target_operation(operation_type, operation_data)
            elif entity_type == 'follow_ups':
                result = await self._sync_follow_up_operation(operation_type, operation_data)
            elif entity_type == 'voice_remarks':
                result = await self._sync_voice_remark_operation(operation_type, operation_data)
            elif entity_type == 'lead_actions':
                result = await self._sync_lead_action_operation(operation_type, operation_data)
            else:
                raise ValueError(f"Unknown entity type: {entity_type}")
            
            # Mark as completed
            await self.offline_queue_collection.update_one(
                {'_id': operation['_id']},
                {
                    '$set': {
                        'status': SyncStatus.COMPLETED,
                        'sync_completed_at': datetime.now(timezone.utc),
                        'sync_result': result
                    }
                }
            )
            
            logger.info(f"Operation {operation['id']} synced successfully")
            
        except Exception as e:
            await self._handle_sync_error(operation, str(e))
            raise
    
    async def _sync_lead_operation(self, operation_type: str, operation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync lead-related operations"""
        if operation_type == 'create':
            # Check if lead already exists (conflict resolution)
            existing_lead = await self.db.leads.find_one({
                'phone': operation_data.get('phone'),
                'email': operation_data.get('email')
            })
            
            if existing_lead:
                # Handle conflict
                await self._handle_sync_conflict('leads', 'create', operation_data, existing_lead)
                return {'status': 'conflict', 'existing_id': existing_lead.get('id')}
            
            # Create new lead
            lead_data = operation_data.copy()
            lead_data['id'] = lead_data.get('id', str(uuid.uuid4()))
            lead_data['created_at'] = datetime.now(timezone.utc)
            
            await self.db.leads.insert_one(lead_data)
            return {'status': 'created', 'id': lead_data['id']}
            
        elif operation_type == 'update':
            # Update existing lead
            lead_id = operation_data.get('id')
            if not lead_id:
                raise ValueError("Lead ID required for update operation")
            
            update_data = {k: v for k, v in operation_data.items() if k != 'id'}
            update_data['updated_at'] = datetime.now(timezone.utc)
            
            result = await self.db.leads.update_one(
                {'id': lead_id},
                {'$set': update_data}
            )
            
            return {'status': 'updated', 'matched_count': result.matched_count}
            
        elif operation_type == 'add_remark':
            # Add remark to lead
            remark_data = operation_data.copy()
            remark_data['id'] = remark_data.get('id', str(uuid.uuid4()))
            remark_data['created_at'] = datetime.now(timezone.utc)
            
            await self.db.lead_remarks.insert_one(remark_data)
            return {'status': 'remark_added', 'id': remark_data['id']}
        
        else:
            raise ValueError(f"Unknown lead operation: {operation_type}")
    
    async def _sync_target_operation(self, operation_type: str, operation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync target-related operations"""
        if operation_type == 'create':
            # Check for duplicate targets
            existing_target = await self.db.targets.find_one({
                'user_id': operation_data.get('user_id'),
                'target_type': operation_data.get('target_type'),
                'period': operation_data.get('period'),
                'created_at': {
                    '$gte': datetime.now(timezone.utc) - timedelta(days=1)
                }
            })
            
            if existing_target:
                await self._handle_sync_conflict('targets', 'create', operation_data, existing_target)
                return {'status': 'conflict', 'existing_id': existing_target.get('id')}
            
            # Create new target
            target_data = operation_data.copy()
            target_data['id'] = target_data.get('id', str(uuid.uuid4()))
            target_data['created_at'] = datetime.now(timezone.utc)
            
            await self.db.targets.insert_one(target_data)
            return {'status': 'created', 'id': target_data['id']}
            
        elif operation_type == 'update':
            target_id = operation_data.get('id')
            if not target_id:
                raise ValueError("Target ID required for update operation")
            
            update_data = {k: v for k, v in operation_data.items() if k != 'id'}
            update_data['updated_at'] = datetime.now(timezone.utc)
            
            result = await self.db.targets.update_one(
                {'id': target_id},
                {'$set': update_data}
            )
            
            return {'status': 'updated', 'matched_count': result.matched_count}
        
        else:
            raise ValueError(f"Unknown target operation: {operation_type}")
    
    async def _handle_sync_error(self, operation: Dict[str, Any], error_message: str):
        """Handle sync operation error"""
        retry_count = operation.get('retry_count', 0) + 1
        max_retries = 3
        
        if retry_count <= max_retries:
            # Schedule retry
            next_retry = datetime.now(timezone.utc) + timedelta(minutes=retry_count * 5)
            
            await self.offline_queue_collection.update_one(
                {'_id': operation['_id']},
                {
                    '$set': {
                        'status': SyncStatus.PENDING,
                        'retry_count': retry_count,
                        'last_retry_at': datetime.now(timezone.utc),
                        'next_retry_at': next_retry,
                        'error_message': error_message
                    }
                }
            )
            
            logger.warning(f"Operation {operation['id']} scheduled for retry {retry_count}/{max_retries}")
        else:
            # Mark as failed
            await self.offline_queue_collection.update_one(
                {'_id': operation['_id']},
                {
                    '$set': {
                        'status': SyncStatus.FAILED,
                        'error_message': error_message,
                        'failed_at': datetime.now(timezone.utc)
                    }
                }
            )
            
            logger.error(f"Operation {operation['id']} failed after {max_retries} retries")
    
    async def _handle_sync_conflict(self, entity_type: str, operation_type: str,
                                  offline_data: Dict[str, Any], server_data: Dict[str, Any]):
        """Handle synchronization conflicts"""
        conflict_record = {
            'id': str(uuid.uuid4()),
            'entity_type': entity_type,
            'operation_type': operation_type,
            'offline_data': offline_data,
            'server_data': {k: v for k, v in server_data.items() if k != '_id'},
            'status': 'pending_resolution',
            'created_at': datetime.now(timezone.utc),
            'expires_at': datetime.now(timezone.utc) + timedelta(seconds=self.conflict_resolution_timeout)
        }
        
        await self.sync_conflicts_collection.insert_one(conflict_record)
        logger.warning(f"Sync conflict detected for {entity_type}.{operation_type}")
    
    async def autosave_data(self, data: Dict[str, Any], entity_type: str,
                          entity_id: str, user_id: str) -> str:
        """Auto-save data for offline editing"""
        try:
            autosave_record = {
                'id': str(uuid.uuid4()),
                'entity_type': entity_type,
                'entity_id': entity_id,
                'user_id': user_id,
                'data': data,
                'version': 1,
                'created_at': datetime.now(timezone.utc),
                'expires_at': datetime.now(timezone.utc) + timedelta(hours=24)
            }
            
            # Check if autosave already exists
            existing = await self.autosave_collection.find_one({
                'entity_type': entity_type,
                'entity_id': entity_id,
                'user_id': user_id
            })
            
            if existing:
                # Update existing autosave
                autosave_record['version'] = existing.get('version', 1) + 1
                
                await self.autosave_collection.update_one(
                    {'_id': existing['_id']},
                    {'$set': autosave_record}
                )
            else:
                # Create new autosave
                await self.autosave_collection.insert_one(autosave_record)
            
            return autosave_record['id']
            
        except Exception as e:
            logger.error(f"Error auto-saving data: {e}")
            raise
    
    async def get_autosaved_data(self, entity_type: str, entity_id: str,
                               user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve auto-saved data"""
        try:
            autosave = await self.autosave_collection.find_one(
                {
                    'entity_type': entity_type,
                    'entity_id': entity_id,
                    'user_id': user_id,
                    'expires_at': {'$gt': datetime.now(timezone.utc)}
                },
                {'_id': 0}
            )
            
            return autosave
            
        except Exception as e:
            logger.error(f"Error retrieving autosaved data: {e}")
            return None
    
    async def get_sync_queue_status(self, user_id: str) -> Dict[str, Any]:
        """Get sync queue status for a user"""
        try:
            pipeline = [
                {'$match': {'user_id': user_id}},
                {'$group': {
                    '_id': '$status',
                    'count': {'$sum': 1}
                }}
            ]
            
            cursor = self.offline_queue_collection.aggregate(pipeline)
            results = await cursor.to_list(length=None)
            
            status_counts = {result['_id']: result['count'] for result in results}
            
            # Get oldest pending operation
            oldest_pending = await self.offline_queue_collection.find_one(
                {'user_id': user_id, 'status': SyncStatus.PENDING},
                sort=[('created_at', 1)]
            )
            
            return {
                'total_operations': sum(status_counts.values()),
                'status_breakdown': status_counts,
                'oldest_pending_at': oldest_pending.get('created_at') if oldest_pending else None,
                'is_syncing': self.is_syncing
            }
            
        except Exception as e:
            logger.error(f"Error getting sync queue status: {e}")
            return {'error': str(e)}
    
    async def get_sync_conflicts(self, user_id: Optional[str] = None,
                               limit: int = 50) -> List[Dict[str, Any]]:
        """Get unresolved sync conflicts"""
        try:
            query = {'status': 'pending_resolution'}
            if user_id:
                query['$or'] = [
                    {'offline_data.user_id': user_id},
                    {'server_data.user_id': user_id}
                ]
            
            cursor = self.sync_conflicts_collection.find(
                query, {'_id': 0}
            ).sort('created_at', -1).limit(limit)
            
            conflicts = await cursor.to_list(length=None)
            return conflicts
            
        except Exception as e:
            logger.error(f"Error getting sync conflicts: {e}")
            return []
    
    async def resolve_sync_conflict(self, conflict_id: str, resolution: str,
                                  resolved_by: str) -> bool:
        """Resolve a sync conflict"""
        try:
            resolution_data = {
                'status': 'resolved',
                'resolution': resolution,  # 'use_offline', 'use_server', 'merge'
                'resolved_by': resolved_by,
                'resolved_at': datetime.now(timezone.utc)
            }
            
            result = await self.sync_conflicts_collection.update_one(
                {'id': conflict_id},
                {'$set': resolution_data}
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Error resolving sync conflict: {e}")
            return False
    
    async def cleanup_old_records(self):
        """Clean up old sync records"""
        try:
            # Clean up completed operations older than 7 days
            cutoff_date = datetime.now(timezone.utc) - timedelta(days=7)
            
            result1 = await self.offline_queue_collection.delete_many({
                'status': SyncStatus.COMPLETED,
                'sync_completed_at': {'$lt': cutoff_date}
            })
            
            # Clean up expired autosave records
            result2 = await self.autosave_collection.delete_many({
                'expires_at': {'$lt': datetime.now(timezone.utc)}
            })
            
            # Clean up expired conflicts
            result3 = await self.sync_conflicts_collection.delete_many({
                'expires_at': {'$lt': datetime.now(timezone.utc)}
            })
            
            logger.info(f"Cleaned up {result1.deleted_count} sync operations, "
                       f"{result2.deleted_count} autosaves, {result3.deleted_count} conflicts")
            
        except Exception as e:
            logger.error(f"Error cleaning up old records: {e}")
    
    # Placeholder methods for other entity sync operations
    async def _sync_task_operation(self, operation_type: str, operation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync task-related operations"""
        # Implementation would depend on task management service
        return {'status': 'not_implemented'}
    
    async def _sync_follow_up_operation(self, operation_type: str, operation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync follow-up operations"""
        # Implementation would depend on follow-up service
        return {'status': 'not_implemented'}
    
    async def _sync_voice_remark_operation(self, operation_type: str, operation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync voice remark operations"""
        # Implementation would depend on voice STT service
        return {'status': 'not_implemented'}
    
    async def _sync_lead_action_operation(self, operation_type: str, operation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync lead action operations"""
        # Implementation would depend on lead management service
        return {'status': 'not_implemented'}

# Service instance will be initialized with database connection
offline_sync_service = None

def initialize_offline_sync_service(db: AsyncIOMotorDatabase):
    """Initialize the offline sync service"""
    global offline_sync_service
    offline_sync_service = OfflineSyncService(db)
    return offline_sync_service