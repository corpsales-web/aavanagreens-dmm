"""
Role and Department Management Service for Aavana Greens
Handles RBAC, permissions, and organizational structure
"""

import os
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Optional, Any
import logging

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument
from bson import ObjectId
import hashlib

logger = logging.getLogger(__name__)

class RoleManagementService:
    """Service for managing roles, departments, and permissions"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.roles_collection = db.roles
        self.departments_collection = db.departments
        self.users_collection = db.users
        self.permissions_collection = db.permissions
        self.audit_log_collection = db.audit_logs
        
        # Default permissions structure
        self.default_permissions = {
            'leads': ['view', 'create', 'edit', 'delete', 'assign'],
            'tasks': ['view', 'create', 'edit', 'delete', 'assign'],
            'users': ['view', 'create', 'edit', 'delete', 'manage_roles'],
            'projects': ['view', 'create', 'edit', 'delete', 'manage'],
            'ai': ['access', 'configure', 'view_analytics'],
            'analytics': ['view', 'export', 'configure'],
            'hrms': ['view', 'manage_attendance', 'manage_leave', 'view_reports'],
            'erp': ['view', 'manage_inventory', 'manage_orders', 'financial'],
            'system': ['backup', 'restore', 'configure', 'audit']
        }
        
        # Default roles
        self.default_roles = [
            {
                'id': str(uuid.uuid4()),
                'name': 'Super Admin',
                'description': 'Full system access with all permissions',
                'level': 1,
                'permissions': self._get_all_permissions(),
                'is_system_role': True,
                'created_at': datetime.now(timezone.utc)
            },
            {
                'id': str(uuid.uuid4()),
                'name': 'Admin',
                'description': 'Administrative access with most permissions',
                'level': 2,
                'permissions': self._get_admin_permissions(),
                'is_system_role': True,
                'created_at': datetime.now(timezone.utc)
            },
            {
                'id': str(uuid.uuid4()),
                'name': 'Manager',
                'description': 'Management role with team oversight',
                'level': 3,
                'permissions': self._get_manager_permissions(),
                'is_system_role': True,
                'created_at': datetime.now(timezone.utc)
            },
            {
                'id': str(uuid.uuid4()),
                'name': 'Employee',
                'description': 'Standard employee access',
                'level': 4,
                'permissions': self._get_employee_permissions(),
                'is_system_role': True,
                'created_at': datetime.now(timezone.utc)
            }
        ]
    
    def _get_all_permissions(self) -> Dict[str, List[str]]:
        """Get all available permissions"""
        return self.default_permissions.copy()
    
    def _get_admin_permissions(self) -> Dict[str, List[str]]:
        """Get admin-level permissions"""
        permissions = self.default_permissions.copy()
        # Remove some system-level permissions
        if 'system' in permissions:
            permissions['system'] = ['audit', 'configure']
        return permissions
    
    def _get_manager_permissions(self) -> Dict[str, List[str]]:
        """Get manager-level permissions"""
        return {
            'leads': ['view', 'create', 'edit', 'assign'],
            'tasks': ['view', 'create', 'edit', 'assign'],
            'users': ['view'],
            'projects': ['view', 'create', 'edit', 'manage'],
            'ai': ['access', 'view_analytics'],
            'analytics': ['view', 'export'],
            'hrms': ['view', 'manage_attendance', 'manage_leave'],
            'erp': ['view', 'manage_inventory', 'manage_orders']
        }
    
    def _get_employee_permissions(self) -> Dict[str, List[str]]:
        """Get employee-level permissions"""
        return {
            'leads': ['view', 'create'],
            'tasks': ['view', 'create', 'edit'],
            'users': ['view'],
            'projects': ['view'],
            'ai': ['access'],
            'analytics': ['view'],
            'hrms': ['view'],
            'erp': ['view']
        }
    
    async def initialize_default_roles(self):
        """Initialize default roles and departments"""
        try:
            # Check if roles already exist
            existing_roles = await self.roles_collection.count_documents({})
            if existing_roles > 0:
                logger.info("Default roles already exist")
                return
            
            # Insert default roles
            await self.roles_collection.insert_many(self.default_roles)
            logger.info("Default roles initialized")
            
            # Initialize default departments
            default_departments = [
                {
                    'id': str(uuid.uuid4()),
                    'name': 'Sales',
                    'description': 'Sales and business development',
                    'head_user_id': None,
                    'created_at': datetime.now(timezone.utc)
                },
                {
                    'id': str(uuid.uuid4()),
                    'name': 'Marketing',
                    'description': 'Marketing and growth',
                    'head_user_id': None,
                    'created_at': datetime.now(timezone.utc)
                },
                {
                    'id': str(uuid.uuid4()),
                    'name': 'Operations',
                    'description': 'Operations and project management',
                    'head_user_id': None,
                    'created_at': datetime.now(timezone.utc)
                },
                {
                    'id': str(uuid.uuid4()),
                    'name': 'HR',
                    'description': 'Human resources',
                    'head_user_id': None,
                    'created_at': datetime.now(timezone.utc)
                }
            ]
            
            await self.departments_collection.insert_many(default_departments)
            logger.info("Default departments initialized")
            
        except Exception as e:
            logger.error(f"Error initializing default roles and departments: {e}")
            raise
    
    async def create_role(self, role_data: Dict[str, Any], created_by: str) -> Dict[str, Any]:
        """Create a new role"""
        try:
            # Validate role data
            if not role_data.get('name'):
                raise ValueError("Role name is required")
            
            # Check if role name already exists
            existing_role = await self.roles_collection.find_one({'name': role_data['name']})
            if existing_role:
                raise ValueError(f"Role '{role_data['name']}' already exists")
            
            # Create role document
            role = {
                'id': str(uuid.uuid4()),
                'name': role_data['name'],
                'description': role_data.get('description', ''),
                'level': role_data.get('level', 5),  # Default to lowest priority
                'permissions': role_data.get('permissions', {}),
                'is_system_role': False,
                'created_by': created_by,
                'created_at': datetime.now(timezone.utc),
                'updated_at': datetime.now(timezone.utc)
            }
            
            # Insert role
            result = await self.roles_collection.insert_one(role)
            
            # Log audit trail
            await self._log_audit_action(
                action='role_created',
                user_id=created_by,
                details={
                    'role_id': role['id'],
                    'role_name': role['name']
                }
            )
            
            # Remove MongoDB ObjectId for response
            role.pop('_id', None)
            
            logger.info(f"Role '{role['name']}' created successfully")
            return role
            
        except Exception as e:
            logger.error(f"Error creating role: {e}")
            raise
    
    async def get_roles(self, include_system_roles: bool = True) -> List[Dict[str, Any]]:
        """Get all roles"""
        try:
            query = {}
            if not include_system_roles:
                query['is_system_role'] = {'$ne': True}
            
            cursor = self.roles_collection.find(query, {'_id': 0})
            roles = await cursor.to_list(length=None)
            
            return roles
            
        except Exception as e:
            logger.error(f"Error fetching roles: {e}")
            raise
    
    async def get_role_by_id(self, role_id: str) -> Optional[Dict[str, Any]]:
        """Get role by ID"""
        try:
            role = await self.roles_collection.find_one({'id': role_id}, {'_id': 0})
            return role
            
        except Exception as e:
            logger.error(f"Error fetching role {role_id}: {e}")
            raise
    
    async def update_role(self, role_id: str, update_data: Dict[str, Any], 
                         updated_by: str) -> Optional[Dict[str, Any]]:
        """Update role"""
        try:
            # Check if role exists and is not a system role
            role = await self.get_role_by_id(role_id)
            if not role:
                raise ValueError("Role not found")
            
            if role.get('is_system_role'):
                raise ValueError("Cannot modify system roles")
            
            # Prepare update data
            update_fields = {}
            if 'name' in update_data:
                update_fields['name'] = update_data['name']
            if 'description' in update_data:
                update_fields['description'] = update_data['description']
            if 'level' in update_data:
                update_fields['level'] = update_data['level']
            if 'permissions' in update_data:
                update_fields['permissions'] = update_data['permissions']
            
            update_fields['updated_by'] = updated_by
            update_fields['updated_at'] = datetime.now(timezone.utc)
            
            # Update role
            result = await self.roles_collection.find_one_and_update(
                {'id': role_id},
                {'$set': update_fields},
                return_document=ReturnDocument.AFTER,
                projection={'_id': 0}
            )
            
            # Log audit trail
            await self._log_audit_action(
                action='role_updated',
                user_id=updated_by,
                details={
                    'role_id': role_id,
                    'changes': update_fields
                }
            )
            
            logger.info(f"Role {role_id} updated successfully")
            return result
            
        except Exception as e:
            logger.error(f"Error updating role {role_id}: {e}")
            raise
    
    async def delete_role(self, role_id: str, deleted_by: str) -> bool:
        """Delete role"""
        try:
            # Check if role exists and is not a system role
            role = await self.get_role_by_id(role_id)
            if not role:
                raise ValueError("Role not found")
            
            if role.get('is_system_role'):
                raise ValueError("Cannot delete system roles")
            
            # Check if role is assigned to any users
            users_with_role = await self.users_collection.count_documents({'role': role['name']})
            if users_with_role > 0:
                raise ValueError(f"Cannot delete role '{role['name']}' - it is assigned to {users_with_role} users")
            
            # Delete role
            result = await self.roles_collection.delete_one({'id': role_id})
            
            if result.deleted_count > 0:
                # Log audit trail
                await self._log_audit_action(
                    action='role_deleted',
                    user_id=deleted_by,
                    details={
                        'role_id': role_id,
                        'role_name': role['name']
                    }
                )
                
                logger.info(f"Role {role_id} deleted successfully")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error deleting role {role_id}: {e}")
            raise
    
    async def create_department(self, department_data: Dict[str, Any], 
                              created_by: str) -> Dict[str, Any]:
        """Create a new department"""
        try:
            # Validate department data
            if not department_data.get('name'):
                raise ValueError("Department name is required")
            
            # Check if department name already exists
            existing_dept = await self.departments_collection.find_one({'name': department_data['name']})
            if existing_dept:
                raise ValueError(f"Department '{department_data['name']}' already exists")
            
            # Create department document
            department = {
                'id': str(uuid.uuid4()),
                'name': department_data['name'],
                'description': department_data.get('description', ''),
                'head_user_id': department_data.get('head_user_id'),
                'budget': department_data.get('budget', 0),
                'location': department_data.get('location', ''),
                'created_by': created_by,
                'created_at': datetime.now(timezone.utc),
                'updated_at': datetime.now(timezone.utc)
            }
            
            # Insert department
            result = await self.departments_collection.insert_one(department)
            
            # Log audit trail
            await self._log_audit_action(
                action='department_created',
                user_id=created_by,
                details={
                    'department_id': department['id'],
                    'department_name': department['name']
                }
            )
            
            # Remove MongoDB ObjectId for response
            department.pop('_id', None)
            
            logger.info(f"Department '{department['name']}' created successfully")
            return department
            
        except Exception as e:
            logger.error(f"Error creating department: {e}")
            raise
    
    async def get_departments(self) -> List[Dict[str, Any]]:
        """Get all departments"""
        try:
            cursor = self.departments_collection.find({}, {'_id': 0})
            departments = await cursor.to_list(length=None)
            
            # Populate head user information
            for dept in departments:
                if dept.get('head_user_id'):
                    head_user = await self.users_collection.find_one(
                        {'id': dept['head_user_id']},
                        {'full_name': 1, 'email': 1, '_id': 0}
                    )
                    if head_user:
                        dept['head_user'] = head_user
            
            return departments
            
        except Exception as e:
            logger.error(f"Error fetching departments: {e}")
            raise
    
    async def check_permission(self, user_id: str, module: str, action: str) -> bool:
        """Check if user has specific permission"""
        try:
            # Get user with role information
            user = await self.users_collection.find_one({'id': user_id}, {'role': 1, '_id': 0})
            if not user:
                return False
            
            # Get role permissions
            role = await self.roles_collection.find_one({'name': user['role']}, {'permissions': 1, '_id': 0})
            if not role:
                return False
            
            # Check permission
            permissions = role.get('permissions', {})
            module_permissions = permissions.get(module, [])
            
            return action in module_permissions
            
        except Exception as e:
            logger.error(f"Error checking permission for user {user_id}: {e}")
            return False
    
    async def get_user_permissions(self, user_id: str) -> Dict[str, List[str]]:
        """Get all permissions for a user"""
        try:
            # Get user with role information
            user = await self.users_collection.find_one({'id': user_id}, {'role': 1, '_id': 0})
            if not user:
                return {}
            
            # Get role permissions
            role = await self.roles_collection.find_one({'name': user['role']}, {'permissions': 1, '_id': 0})
            if not role:
                return {}
            
            return role.get('permissions', {})
            
        except Exception as e:
            logger.error(f"Error getting permissions for user {user_id}: {e}")
            return {}
    
    async def assign_work_by_criteria(self, work_data: Dict[str, Any], 
                                    criteria: Dict[str, Any]) -> List[str]:
        """Assign work based on department, role, or specific users"""
        try:
            assigned_users = []
            
            # Build query based on criteria
            query = {}
            
            if criteria.get('department'):
                query['department'] = criteria['department']
            
            if criteria.get('role'):
                query['role'] = criteria['role']
            
            if criteria.get('user_ids'):
                query['id'] = {'$in': criteria['user_ids']}
            
            # Find matching users
            cursor = self.users_collection.find(query, {'id': 1, 'full_name': 1, 'email': 1, '_id': 0})
            users = await cursor.to_list(length=None)
            
            # Create work assignments (this would typically be stored in a separate collection)
            work_id = str(uuid.uuid4())
            assignments = []
            
            for user in users:
                assignment = {
                    'id': str(uuid.uuid4()),
                    'work_id': work_id,
                    'user_id': user['id'],
                    'title': work_data.get('title', ''),
                    'description': work_data.get('description', ''),
                    'priority': work_data.get('priority', 'medium'),
                    'due_date': work_data.get('due_date'),
                    'status': 'assigned',
                    'assigned_at': datetime.now(timezone.utc)
                }
                assignments.append(assignment)
                assigned_users.append(user['id'])
            
            # Store assignments (assuming we have a work_assignments collection)
            if assignments:
                await self.db.work_assignments.insert_many(assignments)
            
            return assigned_users
            
        except Exception as e:
            logger.error(f"Error assigning work: {e}")
            raise
    
    async def _log_audit_action(self, action: str, user_id: str, details: Dict[str, Any]):
        """Log audit trail for role/permission changes"""
        try:
            audit_log = {
                'id': str(uuid.uuid4()),
                'action': action,
                'user_id': user_id,
                'details': details,
                'timestamp': datetime.now(timezone.utc),
                'ip_address': None,  # Would be populated from request context
                'user_agent': None   # Would be populated from request context
            }
            
            await self.audit_log_collection.insert_one(audit_log)
            
        except Exception as e:
            logger.error(f"Error logging audit action: {e}")
    
    async def get_audit_logs(self, limit: int = 100, skip: int = 0) -> List[Dict[str, Any]]:
        """Get audit logs for role/permission changes"""
        try:
            cursor = self.audit_log_collection.find(
                {},
                {'_id': 0}
            ).sort('timestamp', -1).skip(skip).limit(limit)
            
            logs = await cursor.to_list(length=None)
            
            # Populate user information
            for log in logs:
                if log.get('user_id'):
                    user = await self.users_collection.find_one(
                        {'id': log['user_id']},
                        {'full_name': 1, 'email': 1, '_id': 0}
                    )
                    if user:
                        log['user'] = user
            
            return logs
            
        except Exception as e:
            logger.error(f"Error fetching audit logs: {e}")
            raise

# Service instance will be initialized with database connection
role_management_service = None

def initialize_role_management_service(db: AsyncIOMotorDatabase):
    """Initialize the role management service"""
    global role_management_service
    role_management_service = RoleManagementService(db)
    return role_management_service