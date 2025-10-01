import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Plus, Edit, Trash2, Settings, MapPin, Users, Target, Filter, ArrowRight, Zap } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const LeadRoutingPanel = () => {
  const [routingRules, setRoutingRules] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    conditions: [],
    actions: [],
    priority: 1,
    is_active: true
  });

  useEffect(() => {
    fetchRoutingRules();
    fetchTeams();
  }, []);

  const fetchRoutingRules = async () => {
    try {
      const response = await axios.get(`${API}/api/lead-routing/rules`);
      setRoutingRules(response.data);
    } catch (error) {
      console.error('Fetch routing rules error:', error);
      // Demo data
      setRoutingRules([
        {
          id: '1',
          name: 'High Budget Premium Properties',
          description: 'Route high-budget leads (>50L) to senior sales team',
          conditions: [
            { field: 'budget', operator: '>', value: 5000000 },
            { field: 'property_type', operator: 'equals', value: 'Villa' }
          ],
          actions: [
            { type: 'assign_team', value: 'senior_sales' },
            { type: 'set_priority', value: 'high' }
          ],
          priority: 1,
          is_active: true,
          matches_count: 12,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Location-Based Routing',
          description: 'Route leads to location-specific teams',
          conditions: [
            { field: 'location', operator: 'contains', value: 'Mumbai' }
          ],
          actions: [
            { type: 'assign_team', value: 'mumbai_team' },
            { type: 'send_email', value: 'welcome_mumbai' }
          ],
          priority: 2,
          is_active: true,
          matches_count: 34,
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'First-Time Buyers',
          description: 'Special handling for first-time property buyers',
          conditions: [
            { field: 'buyer_type', operator: 'equals', value: 'first_time' },
            { field: 'budget', operator: '<', value: 3000000 }
          ],
          actions: [
            { type: 'assign_team', value: 'new_buyer_specialists' },
            { type: 'add_tag', value: 'first_time_buyer' },
            { type: 'schedule_call', value: '24_hours' }
          ],
          priority: 3,
          is_active: true,
          matches_count: 28,
          created_at: new Date().toISOString()
        }
      ]);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${API}/api/teams`);
      setTeams(response.data);
    } catch (error) {
      console.error('Fetch teams error:', error);
      // Demo data
      setTeams([
        { id: 'senior_sales', name: 'Senior Sales Team', members: 5, active: true },
        { id: 'mumbai_team', name: 'Mumbai Regional Team', members: 8, active: true },
        { id: 'new_buyer_specialists', name: 'First-Time Buyer Specialists', members: 3, active: true },
        { id: 'luxury_properties', name: 'Luxury Properties Team', members: 4, active: true }
      ]);
    }
  };

  const createRoutingRule = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/api/lead-routing/rules`, newRule);
      setRoutingRules(prev => [...prev, response.data]);
      setShowCreateModal(false);
      resetNewRule();
    } catch (error) {
      console.error('Create routing rule error:', error);
      // Add to demo data
      const mockRule = {
        id: Date.now().toString(),
        ...newRule,
        matches_count: 0,
        created_at: new Date().toISOString()
      };
      setRoutingRules(prev => [...prev, mockRule]);
      setShowCreateModal(false);
      resetNewRule();
    } finally {
      setLoading(false);
    }
  };

  const resetNewRule = () => {
    setNewRule({
      name: '',
      description: '',
      conditions: [],
      actions: [],
      priority: 1,
      is_active: true
    });
  };

  const toggleRule = async (ruleId, isActive) => {
    try {
      await axios.put(`${API}/api/lead-routing/rules/${ruleId}`, { is_active: !isActive });
      setRoutingRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, is_active: !isActive } : rule
      ));
    } catch (error) {
      console.error('Toggle rule error:', error);
      // Update demo data
      setRoutingRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, is_active: !isActive } : rule
      ));
    }
  };

  const addCondition = () => {
    const newCondition = {
      id: Date.now(),
      field: 'budget',
      operator: 'equals',
      value: ''
    };
    setNewRule(prev => ({
      ...prev,
      conditions: [...prev.conditions, newCondition]
    }));
  };

  const addAction = () => {
    const newAction = {
      id: Date.now(),
      type: 'assign_team',
      value: ''
    };
    setNewRule(prev => ({
      ...prev,
      actions: [...prev.actions, newAction]
    }));
  };

  const updateCondition = (conditionId, field, value) => {
    setNewRule(prev => ({
      ...prev,
      conditions: prev.conditions.map(condition => 
        condition.id === conditionId ? { ...condition, [field]: value } : condition
      )
    }));
  };

  const updateAction = (actionId, field, value) => {
    setNewRule(prev => ({
      ...prev,
      actions: prev.actions.map(action => 
        action.id === actionId ? { ...action, [field]: value } : action
      )
    }));
  };

  const removeCondition = (conditionId) => {
    setNewRule(prev => ({
      ...prev,
      conditions: prev.conditions.filter(condition => condition.id !== conditionId)
    }));
  };

  const removeAction = (actionId) => {
    setNewRule(prev => ({
      ...prev,
      actions: prev.actions.filter(action => action.id !== actionId)
    }));
  };

  const getConditionDisplay = (condition) => {
    return `${condition.field} ${condition.operator} ${condition.value}`;
  };

  const getActionDisplay = (action) => {
    switch (action.type) {
      case 'assign_team':
        const team = teams.find(t => t.id === action.value);
        return `Assign to ${team ? team.name : action.value}`;
      case 'set_priority':
        return `Set priority to ${action.value}`;
      case 'add_tag':
        return `Add tag: ${action.value}`;
      case 'send_email':
        return `Send email: ${action.value}`;
      case 'schedule_call':
        return `Schedule call in ${action.value}`;
      default:
        return `${action.type}: ${action.value}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lead Routing</h2>
          <p className="text-gray-600">Automatically route leads to the right teams based on criteria</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Routing Rule
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {routingRules.filter(r => r.is_active).length}
            </div>
            <p className="text-xs text-gray-500">Currently active</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {routingRules.reduce((sum, rule) => sum + (rule.matches_count || 0), 0)}
            </div>
            <p className="text-xs text-gray-500">Leads routed</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {teams.filter(t => t.active).length}
            </div>
            <p className="text-xs text-gray-500">Available teams</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Automation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">94%</div>
            <p className="text-xs text-gray-500">Auto-routed leads</p>
          </CardContent>
        </Card>
      </div>

      {/* Routing Rules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Routing Rules</h3>
        
        {routingRules.map((rule) => (
          <Card key={rule.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    <Filter className="h-5 w-5 mr-2 text-emerald-600" />
                    {rule.name}
                    <Badge className="ml-2" variant="outline">
                      Priority {rule.priority}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">{rule.description}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {rule.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">
                    {rule.matches_count} matches
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Conditions */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Target className="h-4 w-4 mr-1" />
                    Conditions:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {rule.conditions.map((condition, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                        {getConditionDisplay(condition)}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <ArrowRight className="h-4 w-4 mr-1" />
                    Actions:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {rule.actions.map((action, index) => (
                      <Badge key={index} variant="outline" className="bg-green-50 text-green-700">
                        {getActionDisplay(action)}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Rule Actions */}
                <div className="flex space-x-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleRule(rule.id, rule.is_active)}
                  >
                    {rule.is_active ? 'Disable' : 'Enable'}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                  <Button size="sm" variant="outline">
                    <Zap className="h-3 w-3 mr-1" />
                    Test Rule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {routingRules.length === 0 && (
          <Card className="bg-white shadow-lg">
            <CardContent className="text-center py-12">
              <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No routing rules yet</h3>
              <p className="text-gray-600 mb-4">Create your first automated lead routing rule</p>
              <Button onClick={() => setShowCreateModal(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Routing Rule
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Teams Overview */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Available Teams</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <Card key={team.id} className="bg-white shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Users className="h-4 w-4 mr-2 text-blue-600" />
                  {team.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">{team.members} members</p>
                  </div>
                  <Badge className={team.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {team.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create Routing Rule Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Routing Rule</DialogTitle>
            <DialogDescription>Set up automatic lead routing based on conditions</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Rule Name</Label>
                <Input
                  value={newRule.name}
                  onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                  placeholder="Enter rule name"
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={newRule.priority.toString()} onValueChange={(value) => setNewRule({...newRule, priority: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">High (1)</SelectItem>
                    <SelectItem value="2">Medium (2)</SelectItem>
                    <SelectItem value="3">Low (3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={newRule.description}
                onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                placeholder="Describe what this rule does"
              />
            </div>

            {/* Conditions */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <Label className="text-lg">Conditions</Label>
                <Button onClick={addCondition} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </div>

              <div className="space-y-3">
                {newRule.conditions.map((condition, index) => (
                  <Card key={condition.id} className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Select 
                          value={condition.field} 
                          onValueChange={(value) => updateCondition(condition.id, 'field', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="budget">Budget</SelectItem>
                            <SelectItem value="location">Location</SelectItem>
                            <SelectItem value="property_type">Property Type</SelectItem>
                            <SelectItem value="source">Lead Source</SelectItem>
                            <SelectItem value="buyer_type">Buyer Type</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex-1">
                        <Select 
                          value={condition.operator} 
                          onValueChange={(value) => updateCondition(condition.id, 'operator', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Operator" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                            <SelectItem value=">">Greater than</SelectItem>
                            <SelectItem value="<">Less than</SelectItem>
                            <SelectItem value=">=">Greater than or equal</SelectItem>
                            <SelectItem value="<=">Less than or equal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex-1">
                        <Input
                          value={condition.value}
                          onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                          placeholder="Value"
                        />
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCondition(condition.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}

                {newRule.conditions.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Target className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">No conditions added yet</p>
                    <Button onClick={addCondition} variant="outline" size="sm" className="mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Condition
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <Label className="text-lg">Actions</Label>
                <Button onClick={addAction} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Action
                </Button>
              </div>

              <div className="space-y-3">
                {newRule.actions.map((action, index) => (
                  <Card key={action.id} className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Select 
                          value={action.type} 
                          onValueChange={(value) => updateAction(action.id, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select action" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="assign_team">Assign Team</SelectItem>
                            <SelectItem value="set_priority">Set Priority</SelectItem>
                            <SelectItem value="add_tag">Add Tag</SelectItem>
                            <SelectItem value="send_email">Send Email</SelectItem>
                            <SelectItem value="schedule_call">Schedule Call</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex-1">
                        {action.type === 'assign_team' ? (
                          <Select 
                            value={action.value} 
                            onValueChange={(value) => updateAction(action.id, 'value', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                            <SelectContent>
                              {teams.map((team) => (
                                <SelectItem key={team.id} value={team.id}>
                                  {team.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : action.type === 'set_priority' ? (
                          <Select 
                            value={action.value} 
                            onValueChange={(value) => updateAction(action.id, 'value', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={action.value}
                            onChange={(e) => updateAction(action.id, 'value', e.target.value)}
                            placeholder="Action value"
                          />
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAction(action.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}

                {newRule.actions.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <ArrowRight className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">No actions added yet</p>
                    <Button onClick={addAction} variant="outline" size="sm" className="mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Action
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={createRoutingRule}
                disabled={loading || !newRule.name || newRule.conditions.length === 0 || newRule.actions.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? 'Creating...' : 'Create Rule'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadRoutingPanel;