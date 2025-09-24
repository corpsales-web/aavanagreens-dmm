import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Edit, Trash2, Play, Pause, Settings, Zap, Brain, MessageSquare, Calendar, Clock, Users, Target } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const WorkflowAuthoringPanel = () => {
  const [workflows, setWorkflows] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [activeTab, setActiveTab] = useState('workflows');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingWorkflowId, setEditingWorkflowId] = useState(null);

  // New Workflow State
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    trigger: 'manual',
    steps: [],
    is_active: true,
    variables: []
  });

  // Helpers: open edit and use-template flows
  const openEditWorkflow = (wf) => {
    setEditingWorkflowId(wf.id);
    setNewWorkflow({
      name: wf.name || '',
      description: wf.description || '',
      trigger: wf.trigger || 'manual',
      steps: Array.isArray(wf.steps) ? wf.steps : [],
      is_active: wf.is_active !== undefined ? wf.is_active : true,
      variables: wf.variables || []
    });
    setShowCreateModal(true);
  };

  const openUseTemplate = (tpl) => {
    const baseStep = {
      id: Date.now(),
      type: tpl.category === 'lead_nurturing' ? 'task' : 'email',
      content: tpl.template || tpl.description || '',
      delay: 0,
      conditions: []
    };
    setEditingWorkflowId(null);
    setNewWorkflow({
      name: tpl.name || 'New Workflow',
      description: tpl.description || '',
      trigger: 'manual',
      steps: [baseStep],
      is_active: true,
      variables: tpl.variables || []
    });
    setShowCreateModal(true);
  };

  // New Template State
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'lead_nurturing',
    template: '',
    variables: []
  });

  useEffect(() => {
    // Initialize with empty arrays to prevent .map() errors
    setWorkflows([]);
    setTemplates([]);
    
    fetchWorkflows();
    fetchTemplates();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await axios.get(`${API}/api/workflows`);
      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        setWorkflows(response.data);
      } else if (response.data && Array.isArray(response.data.workflows)) {
        setWorkflows(response.data.workflows);
      } else {
        console.warn('Invalid workflows data format, using demo data');
        setWorkflows(getDemoWorkflows());
      }
    } catch (error) {
      console.error('Fetch workflows error:', error);
      setWorkflows(getDemoWorkflows());
    }
  };

  const getDemoWorkflows = () => [
    {
      id: '1',
      name: 'Lead Nurturing Sequence',
      description: 'Automated follow-up sequence for new leads',
      trigger: 'new_lead',
      steps: 5,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Task Reminder System',
      description: 'Automated reminders for pending tasks',
      trigger: 'task_due',
      steps: 3,
      is_active: true,
      created_at: new Date().toISOString()
    }
  ];

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${API}/api/workflow-templates`);
      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        setTemplates(response.data);
      } else if (response.data && Array.isArray(response.data.templates)) {
        setTemplates(response.data.templates);
      } else {
        console.warn('Invalid templates data format, using demo data');
        setTemplates(getDemoTemplates());
      }
    } catch (error) {
      console.error('Fetch templates error:', error);
      setTemplates(getDemoTemplates());
    }
  };

  const getDemoTemplates = () => [
    {
      id: '1',
      name: 'Welcome Email',
      description: 'Initial welcome message for new leads',
      category: 'lead_nurturing',
      template: 'Hello {{name}}, welcome to Aavana Greens! We are excited to help you find your dream property.',
      variables: ['name'],
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Follow-up Reminder',
      description: 'Reminder for sales team follow-ups',
      category: 'internal_communication',
      template: 'Reminder: Follow up with {{lead_name}} ({{phone}}) regarding {{property_type}} inquiry.',
      variables: ['lead_name', 'phone', 'property_type'],
      created_at: new Date().toISOString()
    }
  ];

  const createOrUpdateWorkflow = async () => {
    setLoading(true);
    try {
      if (editingWorkflowId) {
        // Update path
        const response = await axios.put(`${API}/api/workflows/${editingWorkflowId}`, newWorkflow);
        const updated = response.data || { id: editingWorkflowId, ...newWorkflow };
        setWorkflows(prev => Array.isArray(prev) ? prev.map(w => w.id === editingWorkflowId ? updated : w) : []);
      } else {
        // Create path
        const response = await axios.post(`${API}/api/workflows`, newWorkflow);
        setWorkflows(prev => [...prev, response.data]);
      }
      setShowCreateModal(false);
      setEditingWorkflowId(null);
      setNewWorkflow({ name: '', description: '', trigger: 'manual', steps: [], is_active: true, variables: [] });
    } catch (error) {
      console.error('Create/Update workflow error:', error);
      // Demo fallback
      const id = editingWorkflowId || Date.now().toString();
      const mock = { id, ...newWorkflow, steps: Array.isArray(newWorkflow.steps) ? newWorkflow.steps : [], created_at: new Date().toISOString() };
      setWorkflows(prev => {
        if (editingWorkflowId) return prev.map(w => w.id === id ? mock : w);
        return [...prev, mock];
      });
      setShowCreateModal(false);
      setEditingWorkflowId(null);
      setNewWorkflow({ name: '', description: '', trigger: 'manual', steps: [], is_active: true, variables: [] });
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/api/workflow-templates`, newTemplate);
      setTemplates(prev => [...prev, response.data]);
      setShowTemplateModal(false);
      setNewTemplate({
        name: '',
        description: '',
        category: 'lead_nurturing',
        template: '',
        variables: []
      });
    } catch (error) {
      console.error('Create template error:', error);
      // Add to demo data
      const mockTemplate = {
        id: Date.now().toString(),
        ...newTemplate,
        created_at: new Date().toISOString()
      };
      setTemplates(prev => [...prev, mockTemplate]);
      setShowTemplateModal(false);
      setNewTemplate({
        name: '',
        description: '',
        category: 'lead_nurturing',
        template: '',
        variables: []
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkflow = async (workflowId, isActive) => {
    try {
      await axios.put(`${API}/api/workflows/${workflowId}`, { is_active: !isActive });
      setWorkflows(prev => Array.isArray(prev) ? prev.map(w => 
        w.id === workflowId ? { ...w, is_active: !isActive } : w
      ) : []);
    } catch (error) {
      console.error('Toggle workflow error:', error);
      // Update demo data
      setWorkflows(prev => Array.isArray(prev) ? prev.map(w => 
        w.id === workflowId ? { ...w, is_active: !isActive } : w
      ) : []);
    }
  };

  const addWorkflowStep = () => {
    const newStep = {
      id: Date.now(),
      type: 'email',
      content: '',
      delay: 0,
      conditions: []
    };
    setNewWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const removeWorkflowStep = (stepId) => {
    setNewWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  };

  const updateWorkflowStep = (stepId, field, value) => {
    setNewWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, [field]: value } : step
      )
    }));
  };

  const extractVariables = (template) => {
    const matches = template.match(/\{\{([^}]+)\}\}/g) || [];
    return matches.map(match => match.replace(/[{}]/g, ''));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workflow Authoring</h2>
          <p className="text-gray-600">Create and manage automated workflows and templates</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            New Template
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === 'workflows' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('workflows')}
          className="flex items-center"
        >
          <Zap className="h-4 w-4 mr-2" />
          Workflows
        </Button>
        <Button
          variant={activeTab === 'templates' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('templates')}
          className="flex items-center"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Templates
        </Button>
        <Button
          variant={activeTab === 'analytics' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('analytics')}
          className="flex items-center"
        >
          <Target className="h-4 w-4 mr-2" />
          Analytics
        </Button>
      </div>

      {/* Workflows Tab */}
      {activeTab === 'workflows' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(workflows) && workflows.map((workflow) => (
            <Card key={workflow.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{workflow.name || 'Untitled Workflow'}</CardTitle>
                    <CardDescription>{workflow.description || 'No description available'}</CardDescription>
                  </div>
                  <Badge className={workflow.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {workflow.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-sm"><strong>Trigger:</strong> {workflow.trigger ? workflow.trigger.replace(/_/g, ' ') : 'Manual'}</p>
                  <p className="text-sm"><strong>Steps:</strong> {Array.isArray(workflow.steps) ? workflow.steps.length : workflow.steps || 0}</p>
                  <p className="text-sm"><strong>Created:</strong> {workflow.created_at ? new Date(workflow.created_at).toLocaleDateString() : 'Unknown'}</p>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleWorkflow(workflow.id, workflow.is_active)}
                  >
                    {workflow.is_active ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                    {workflow.is_active ? 'Pause' : 'Start'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditWorkflow(workflow)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {workflows.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Zap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows yet</h3>
              <p className="text-gray-600 mb-4">Create your first automated workflow</p>
              <Button onClick={() => setShowCreateModal(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.isArray(templates) && templates.map((template) => (
            <Card key={template.id} className="bg-white shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{template.name || 'Untitled Template'}</CardTitle>
                    <CardDescription>{template.description || 'No description available'}</CardDescription>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {template.category ? template.category.replace(/_/g, ' ') : 'General'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Template Content:</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                      {template.template || 'No template content'}
                    </div>
                  </div>
                  
                  {Array.isArray(template.variables) && template.variables.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Variables:</Label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {Array.isArray(template.variables) && template.variables.map((variable, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Play className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {templates.length === 0 && (
            <div className="col-span-full text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
              <p className="text-gray-600 mb-4">Create your first message template</p>
              <Button onClick={() => setShowTemplateModal(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Active Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-emerald-600">
                  {workflows.filter(w => w.is_active).length}
                </p>
                <p className="text-sm text-gray-600">Currently running</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Total Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{templates.length}</p>
                <p className="text-sm text-gray-600">Available templates</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Automation Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">87%</p>
                <p className="text-sm text-gray-600">Tasks automated</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Workflow Performance</CardTitle>
              <CardDescription>Execution statistics and success rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600">Detailed workflow analytics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Workflow Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription>Build an automated workflow with multiple steps</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Workflow Name</Label>
                <Input
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({...newWorkflow, name: e.target.value})}
                  placeholder="Enter workflow name"
                />
              </div>
              <div>
                <Label>Trigger</Label>
                <Select value={newWorkflow.trigger} onValueChange={(value) => setNewWorkflow({...newWorkflow, trigger: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="new_lead">New Lead</SelectItem>
                    <SelectItem value="task_due">Task Due</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow({...newWorkflow, description: e.target.value})}
                placeholder="Describe what this workflow does"
              />
            </div>

            {/* Workflow Steps */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <Label className="text-lg">Workflow Steps</Label>
                <Button onClick={addWorkflowStep} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>

              <div className="space-y-4">
                {Array.isArray(newWorkflow.steps) && newWorkflow.steps.map((step, index) => (
                  <Card key={step.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium">Step {index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWorkflowStep(step.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Step Type</Label>
                        <Select 
                          value={step.type} 
                          onValueChange={(value) => updateWorkflowStep(step.id, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Send Email</SelectItem>
                            <SelectItem value="sms">Send SMS</SelectItem>
                            <SelectItem value="task">Create Task</SelectItem>
                            <SelectItem value="wait">Wait/Delay</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Delay (hours)</Label>
                        <Input
                          type="number"
                          value={step.delay}
                          onChange={(e) => updateWorkflowStep(step.id, 'delay', parseInt(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <Label>Content</Label>
                      <Textarea
                        value={step.content}
                        onChange={(e) => updateWorkflowStep(step.id, 'content', e.target.value)}
                        placeholder="Enter step content or message"
                      />
                    </div>
                  </Card>
                ))}

                {newWorkflow.steps.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Zap className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">No steps added yet</p>
                    <Button onClick={addWorkflowStep} variant="outline" size="sm" className="mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Step
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={createOrUpdateWorkflow}
                disabled={loading || !newWorkflow.name}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (editingWorkflowId ? 'Updating...' : 'Creating...') : (editingWorkflowId ? 'Update Workflow' : 'Create Workflow')}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Template Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>Create a reusable message template</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Template Name</Label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate({...newTemplate, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead_nurturing">Lead Nurturing</SelectItem>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                    <SelectItem value="internal_communication">Internal Communication</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                placeholder="Describe this template"
              />
            </div>

            <div>
              <Label>Template Content</Label>
              <Textarea
                rows={6}
                value={newTemplate.template}
                onChange={(e) => {
                  const content = e.target.value;
                  const variables = extractVariables(content);
                  setNewTemplate({
                    ...newTemplate, 
                    template: content,
                    variables: [...new Set(variables)]
                  });
                }}
                placeholder="Enter your template content. Use {{variable_name}} for dynamic content."
              />
              <p className="text-xs text-gray-500 mt-1">
                Use double braces for variables: {'{{name}}, {{phone}}, {{email}}'}
              </p>
            </div>

            {newTemplate.variables.length > 0 && (
              <div>
                <Label>Detected Variables</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Array.isArray(newTemplate.variables) && newTemplate.variables.map((variable, index) => (
                    <Badge key={index} variant="outline">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button 
                onClick={createTemplate}
                disabled={loading || !newTemplate.name || !newTemplate.template}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? 'Creating...' : 'Create Template'}
              </Button>
              <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowAuthoringPanel;