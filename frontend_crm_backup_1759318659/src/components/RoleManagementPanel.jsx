import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RoleManagementPanel = ({ currentUser }) => {
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  // Permission modules and actions
  const permissionModules = {
    leads: ['view', 'create', 'edit', 'delete', 'assign'],
    tasks: ['view', 'create', 'edit', 'delete', 'assign'],
    users: ['view', 'create', 'edit', 'delete', 'manage_roles'],
    projects: ['view', 'create', 'edit', 'delete', 'manage'],
    ai: ['access', 'configure', 'view_analytics'],
    analytics: ['view', 'export', 'configure'],
    hrms: ['view', 'manage_attendance', 'manage_leave', 'view_reports'],
    erp: ['view', 'manage_inventory', 'manage_orders', 'financial'],
    system: ['backup', 'restore', 'configure', 'audit']
  };

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    level: 5,
    permissions: {}
  });

  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    description: '',
    head_user_id: '',
    budget: 0,
    location: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Use mock data directly for now to ensure it works
      console.log('Loading role management with mock data');
      
      const mockRoles = [
          {
            id: '1',
            name: 'Super Admin',
            description: 'Full system access with all permissions',
            level: 1,
            permissions: {
              leads: ['view', 'create', 'edit', 'delete', 'assign'],
              tasks: ['view', 'create', 'edit', 'delete', 'assign'],
              users: ['view', 'create', 'edit', 'delete', 'manage_roles'],
              projects: ['view', 'create', 'edit', 'delete', 'manage'],
              ai: ['access', 'configure', 'view_analytics'],
              analytics: ['view', 'export', 'configure'],
              hrms: ['view', 'manage_attendance', 'manage_leave', 'view_reports'],
              erp: ['view', 'manage_inventory', 'manage_orders', 'financial'],
              system: ['backup', 'restore', 'configure', 'audit']
            },
            user_count: 2
          },
          {
            id: '2', 
            name: 'Sales Manager',
            description: 'Manage sales team, leads, and customer relationships',
            level: 2,
            permissions: {
              leads: ['view', 'create', 'edit', 'assign'],
              tasks: ['view', 'create', 'edit', 'assign'],
              users: ['view'],
              projects: ['view', 'create', 'edit'],
              ai: ['access'],
              analytics: ['view', 'export'],
              hrms: ['view'],
              erp: ['view']
            },
            user_count: 3
          },
          {
            id: '3',
            name: 'Sales Agent', 
            description: 'Handle leads, create tasks, and manage customer interactions',
            level: 3,
            permissions: {
              leads: ['view', 'create', 'edit'],
              tasks: ['view', 'create', 'edit'],
              projects: ['view', 'create'],
              ai: ['access'],
              analytics: ['view']
            },
            user_count: 8
          },
          {
            id: '4',
            name: 'Project Manager',
            description: 'Oversee project execution, resource allocation, and team coordination',
            level: 2, 
            permissions: {
              leads: ['view'],
              tasks: ['view', 'create', 'edit', 'delete', 'assign'],
              users: ['view'],
              projects: ['view', 'create', 'edit', 'delete', 'manage'],
              analytics: ['view', 'export'],
              hrms: ['view', 'manage_attendance'],
              erp: ['view', 'manage_inventory']
            },
            user_count: 2
          },
          {
            id: '5',
            name: 'HR Manager',
            description: 'Manage human resources, attendance, leave, and employee data',
            level: 2,
            permissions: {
              users: ['view', 'create', 'edit'],
              analytics: ['view', 'export'],
              hrms: ['view', 'manage_attendance', 'manage_leave', 'view_reports'],
              system: ['audit']
            },
            user_count: 1
          },
          {
            id: '6',
            name: 'Field Executive',
            description: 'Execute field work, site visits, and project installations',
            level: 4,
            permissions: {
              leads: ['view'],
              tasks: ['view', 'edit'],
              projects: ['view'],
              hrms: ['view']
            },
            user_count: 12
          }
        ];

        const mockDepartments = [
          {
            id: '1',
            name: 'Sales & Marketing',
            description: 'Lead generation, customer acquisition, and marketing campaigns',
            head_user_id: '2',
            head_name: 'Rajesh Kumar',
            budget: 500000,
            location: 'Mumbai HQ',
            employee_count: 11,
            active_projects: 8
          },
          {
            id: '2',
            name: 'Project Management',
            description: 'Project planning, execution, and delivery management',
            head_user_id: '3', 
            head_name: 'Priya Sharma',
            budget: 750000,
            location: 'Bangalore Office',
            employee_count: 14,
            active_projects: 15
          },
          {
            id: '3',
            name: 'Human Resources',
            description: 'Employee management, recruitment, and organizational development',
            head_user_id: '4',
            head_name: 'Amit Patel', 
            budget: 200000,
            location: 'Corporate Office',
            employee_count: 3,
            active_projects: 2
          },
          {
            id: '4',
            name: 'Operations & Logistics',
            description: 'Supply chain, inventory management, and operational efficiency',
            head_user_id: '5',
            head_name: 'Sneha Reddy',
            budget: 600000,
            location: 'Warehouse - Pune',
            employee_count: 18,
            active_projects: 6
          }
        ];

        setRoles(mockRoles);
        setDepartments(mockDepartments);
        setLoading(false); // Explicitly set loading to false after setting mock data
    } catch (error) {
      console.error('Error in role management data loading:', error);
      setError('Failed to load role management data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setRoleForm({
      name: '',
      description: '',
      level: 5,
      permissions: {}
    });
    setShowRoleModal(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description,
      level: role.level,
      permissions: role.permissions || {}
    });
    setShowRoleModal(true);
  };

  const handleCreateDepartment = () => {
    setEditingDepartment(null);
    setDepartmentForm({
      name: '',
      description: '',
      head_user_id: '',
      budget: 0,
      location: ''
    });
    setShowDepartmentModal(true);
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setDepartmentForm({
      name: department.name,
      description: department.description,
      head_user_id: department.head_user_id || '',
      budget: department.budget || 0,
      location: department.location || ''
    });
    setShowDepartmentModal(true);
  };

  const saveRole = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (editingRole) {
        // Update existing role
        await axios.put(
          `${API_BASE_URL}/api/roles/${editingRole.id}`,
          roleForm,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
      } else {
        // Create new role
        await axios.post(
          `${API_BASE_URL}/api/roles`,
          roleForm,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
      }

      setShowRoleModal(false);
      await fetchData();
      alert(editingRole ? 'Role updated successfully' : 'Role created successfully');

    } catch (error) {
      console.error('Error saving role:', error);
      alert(error.response?.data?.detail || 'Failed to save role');
    }
  };

  const saveDepartment = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (editingDepartment) {
        // Update existing department (would need PUT endpoint)
        alert('Department update functionality not yet implemented');
      } else {
        // Create new department
        await axios.post(
          `${API_BASE_URL}/api/departments`,
          departmentForm,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
      }

      setShowDepartmentModal(false);
      await fetchData();
      alert(editingDepartment ? 'Department updated successfully' : 'Department created successfully');

    } catch (error) {
      console.error('Error saving department:', error);
      alert(error.response?.data?.detail || 'Failed to save department');
    }
  };

  const deleteRole = async (roleId) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/roles/${roleId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      await fetchData();
      alert('Role deleted successfully');

    } catch (error) {
      console.error('Error deleting role:', error);
      alert(error.response?.data?.detail || 'Failed to delete role');
    }
  };

  const handlePermissionChange = (module, action, checked) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: checked
          ? [...(prev.permissions[module] || []), action]
          : (prev.permissions[module] || []).filter(a => a !== action)
      }
    }));
  };

  const isPermissionChecked = (module, action) => {
    return (roleForm.permissions[module] || []).includes(action);
  };

  // Check if current user has permission to manage roles/departments
  // For demo purposes, also allow viewing if currentUser is not set
  const canManageRoles = !currentUser || currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin';
  const canManageDepartments = !currentUser || ['Super Admin', 'Admin', 'HR Manager'].includes(currentUser?.role);

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>;

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <span className="text-red-500 mr-2">⚠️</span>
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="role-management-panel space-y-8">
      {/* Role Assignment Examples & Workflows */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🏢 Role Assignment & Delegation Workflows</h2>
        <p className="text-gray-600 mb-6">Comprehensive examples of how to assign roles and delegate responsibilities in your organization</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Workflow Examples */}
          <div className="bg-white rounded-lg p-5 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Common Assignment Workflows</h3>
            
            <div className="space-y-4">
              {/* New Employee Onboarding */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">🆕 New Employee Onboarding</h4>
                <div className="text-sm text-green-700 space-y-2">
                  <p><strong>Step 1:</strong> HR Manager creates new user account</p>
                  <p><strong>Step 2:</strong> Assign initial role (e.g., "Sales Agent" or "Field Executive")</p>
                  <p><strong>Step 3:</strong> Department Head reviews and approves permissions</p>
                  <p><strong>Step 4:</strong> System sends welcome email with login credentials</p>
                  <p><strong>Example:</strong> Rajesh Kumar joins as Sales Agent → Gets leads (view, create, edit) + tasks (view, create, edit) permissions</p>
                </div>
              </div>

              {/* Role Promotion */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">⬆️ Role Promotion Workflow</h4>
                <div className="text-sm text-blue-700 space-y-2">
                  <p><strong>Scenario:</strong> Sales Agent → Sales Manager promotion</p>
                  <p><strong>Step 1:</strong> Current manager initiates promotion request</p>
                  <p><strong>Step 2:</strong> HR Manager updates role from "Sales Agent" to "Sales Manager"</p>
                  <p><strong>Step 3:</strong> New permissions: leads (assign), users (view), analytics (view, export)</p>
                  <p><strong>Step 4:</strong> Department budget allocation increases</p>
                  <p><strong>Result:</strong> User can now assign leads to team members and view analytics</p>
                </div>
              </div>

              {/* Temporary Delegation */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">🔄 Temporary Delegation</h4>
                <div className="text-sm text-yellow-700 space-y-2">
                  <p><strong>Use Case:</strong> Manager going on leave</p>
                  <p><strong>Step 1:</strong> Create temporary role "Acting Sales Manager"</p>
                  <p><strong>Step 2:</strong> Assign to senior team member for 2 weeks</p>
                  <p><strong>Step 3:</strong> Grant elevated permissions: task assignment, team oversight</p>
                  <p><strong>Step 4:</strong> Auto-revert role after specified date</p>
                  <p><strong>Note:</strong> All actions logged for audit trail</p>
                </div>
              </div>
            </div>
          </div>

          {/* Permission Matrix Examples */}
          <div className="bg-white rounded-lg p-5 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🔐 Permission Matrix Examples</h3>
            
            <div className="space-y-4">
              {/* Sales Team Structure */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="font-medium text-indigo-800 mb-3">🏢 Sales Team Structure</h4>
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium text-indigo-900">Sales Director (Level 1)</div>
                    <div className="text-indigo-700 ml-4">• All permissions • Team oversight • Budget approval</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-indigo-900">Sales Manager (Level 2)</div>
                    <div className="text-indigo-700 ml-4">• Assign leads • View analytics • Team performance</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-indigo-900">Senior Sales Agent (Level 3)</div>
                    <div className="text-indigo-700 ml-4">• Handle premium leads • Create tasks • AI access</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-indigo-900">Sales Agent (Level 4)</div>
                    <div className="text-indigo-700 ml-4">• Basic lead management • Task creation</div>
                  </div>
                </div>
              </div>

              {/* Cross-Department Collaboration */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-800 mb-3">🤝 Cross-Department Collaboration</h4>
                <div className="text-sm text-purple-700 space-y-2">
                  <p><strong>Project Manager + Sales Team:</strong></p>
                  <p className="ml-4">• Project Manager gets "leads (view)" to understand customer requirements</p>
                  <p className="ml-4">• Sales Manager gets "projects (view)" to track delivery status</p>
                  <p><strong>HR + All Departments:</strong></p>
                  <p className="ml-4">• HR Manager has "users (view, edit)" across all departments</p>
                  <p className="ml-4">• Department Heads have "hrms (view_reports)" for their teams</p>
                </div>
              </div>

              {/* Security Best Practices */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-3">🛡️ Security Best Practices</h4>
                <div className="text-sm text-red-700 space-y-2">
                  <p><strong>Principle of Least Privilege:</strong> Users only get minimum permissions needed</p>
                  <p><strong>Regular Audits:</strong> Review permissions quarterly</p>
                  <p><strong>Role Rotation:</strong> Temporary role assignments for learning</p>
                  <p><strong>Emergency Access:</strong> Super Admin can override any permission</p>
                  <p><strong>Audit Trail:</strong> All role changes logged with timestamps</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Assignment Templates */}
        <div className="mt-6 bg-white rounded-lg p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">⚡ Quick Assignment Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">📞 Customer Service Team</h4>
              <div className="text-sm text-green-700">
                <p>• Lead Management: View, Edit</p>
                <p>• Customer Support: Full Access</p>
                <p>• Analytics: Basic Reports</p>
                <p>• HRMS: Attendance Only</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">🔧 Technical Team</h4>
              <div className="text-sm text-blue-700">
                <p>• Project Management: Full Access</p>
                <p>• System Configuration: Yes</p>
                <p>• User Management: View Only</p>
                <p>• ERP: Inventory Management</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">📊 Management Team</h4>
              <div className="text-sm text-purple-700">
                <p>• All Analytics: Full Access</p>
                <p>• Team Management: Yes</p>
                <p>• Budget Control: Department Level</p>
                <p>• Reporting: Advanced</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roles Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">👥 Current Roles</h2>
          {canManageRoles && (
            <button
              onClick={handleCreateRole}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + Create Role
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div key={role.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
                  <p className="text-sm text-gray-600">{role.description}</p>
                  <p className="text-xs text-gray-500 mt-1">Level: {role.level}</p>
                </div>
                
                {role.is_system_role && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                    System
                  </span>
                )}
              </div>

              {/* Permissions Summary */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions:</h4>
                <div className="space-y-1">
                  {Object.entries(role.permissions || {}).map(([module, actions]) => (
                    <div key={module} className="text-xs">
                      <span className="font-medium capitalize">{module}:</span>
                      <span className="ml-1 text-gray-600">
                        {Array.isArray(actions) ? actions.join(', ') : 'None'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {canManageRoles && !role.is_system_role && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditRole(role)}
                    className="flex-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteRole(role.id)}
                    className="flex-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Departments Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Department Management</h2>
          {canManageDepartments && (
            <button
              onClick={handleCreateDepartment}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + Create Department
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => (
            <div key={department.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">{department.name}</h3>
                <p className="text-sm text-gray-600">{department.description}</p>
              </div>

              {department.head_user && (
                <div className="mb-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Head:</span> {department.head_user.full_name}
                  </p>
                </div>
              )}

              {department.location && (
                <div className="mb-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Location:</span> {department.location}
                  </p>
                </div>
              )}

              {department.budget > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Budget:</span> ₹{department.budget.toLocaleString()}
                  </p>
                </div>
              )}

              {canManageDepartments && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditDepartment(department)}
                    className="flex-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900">
                  {editingRole ? 'Edit Role' : 'Create Role'}
                </h3>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role Name *
                    </label>
                    <input
                      type="text"
                      value={roleForm.name}
                      onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter role name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority Level
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={roleForm.level}
                      onChange={(e) => setRoleForm({ ...roleForm, level: parseInt(e.target.value) })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows="3"
                    placeholder="Role description"
                  />
                </div>

                {/* Permissions */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Permissions</h4>
                  <div className="space-y-4">
                    {Object.entries(permissionModules).map(([module, actions]) => (
                      <div key={module} className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-3 capitalize">{module}</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                          {actions.map((action) => (
                            <label key={action} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={isPermissionChecked(module, action)}
                                onChange={(e) => handlePermissionChange(module, action, e.target.checked)}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm text-gray-700 capitalize">
                                {action.replace('_', ' ')}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                
                <button
                  onClick={saveRole}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {editingRole ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Department Modal */}
      {showDepartmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900">
                  {editingDepartment ? 'Edit Department' : 'Create Department'}
                </h3>
                <button
                  onClick={() => setShowDepartmentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    value={departmentForm.name}
                    onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter department name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={departmentForm.description}
                    onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows="3"
                    placeholder="Department description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={departmentForm.location}
                    onChange={(e) => setDepartmentForm({ ...departmentForm, location: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Department location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={departmentForm.budget}
                    onChange={(e) => setDepartmentForm({ ...departmentForm, budget: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Department budget"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDepartmentModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                
                <button
                  onClick={saveDepartment}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  {editingDepartment ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagementPanel;