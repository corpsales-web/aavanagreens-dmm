import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  Target, TrendingUp, Calendar, Clock, Users, Star, Award, 
  Plus, Edit, Trash2, Eye, Filter, BarChart3, PieChart,
  CheckCircle, AlertCircle, ArrowUp, ArrowDown, Zap
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const GoalsManagementSystem = ({ isOpen, onClose }) => {
  // State Management
  const [activeView, setActiveView] = useState('overview');
  const [goals, setGoals] = useState([]);
  const [teams, setTeams] = useState([]);
  const [goalTemplates, setGoalTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [showCreateGoalModal, setShowCreateGoalModal] = useState(false);
  const [showGoalDetailsModal, setShowGoalDetailsModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Form State
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    type: 'individual',
    category: 'sales',
    target_value: '',
    current_value: 0,
    metric_unit: 'number',
    start_date: '',
    end_date: '',
    assigned_to: [],
    priority: 'medium',
    status: 'active'
  });

  // Initialize data
  useEffect(() => {
    if (isOpen) {
      loadGoalsData();
    }
  }, [isOpen]);

  const loadGoalsData = async () => {
    setLoading(true);
    try {
      // Load enhanced demo data
      setGoals([
        {
          id: '1',
          title: 'Q1 Sales Revenue Target',
          description: 'Achieve quarterly sales revenue target for green building projects',
          type: 'team',
          category: 'sales',
          target_value: 2500000,
          current_value: 1650000,
          metric_unit: 'currency',
          progress: 66,
          start_date: '2024-01-01',
          end_date: '2024-03-31',
          status: 'active',
          priority: 'high',
          assigned_to: ['Sales Team', 'Business Development'],
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          title: 'Lead Conversion Rate',
          description: 'Improve lead to customer conversion rate',
          type: 'team',
          category: 'marketing',
          target_value: 35,
          current_value: 28,
          metric_unit: 'percentage',
          progress: 80,
          start_date: '2024-01-01',
          end_date: '2024-06-30',
          status: 'active',
          priority: 'high',
          assigned_to: ['Marketing Team', 'Sales Team'],
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          title: 'Client Satisfaction Score',
          description: 'Maintain high client satisfaction ratings',
          type: 'company',
          category: 'customer_service',
          target_value: 95,
          current_value: 92,
          metric_unit: 'percentage',
          progress: 97,
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          status: 'active',
          priority: 'medium',
          assigned_to: ['All Teams'],
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '4',
          title: 'New Project Acquisitions',
          description: 'Secure new landscaping and construction projects',
          type: 'individual',
          category: 'business_development',
          target_value: 15,
          current_value: 9,
          metric_unit: 'number',
          progress: 60,
          start_date: '2024-01-01',
          end_date: '2024-04-30',
          status: 'active',
          priority: 'high',
          assigned_to: ['John Doe', 'Sarah Wilson'],
          created_at: '2024-01-01T00:00:00Z'
        }
      ]);

      setGoalTemplates([
        {
          id: '1',
          name: 'Monthly Sales Revenue',
          description: 'Standard monthly sales revenue target for green building projects',
          category: 'sales',
          target_type: 'currency',
          default_duration: '1 month',
          suggested_target: 400000
        },
        {
          id: '2',
          name: 'Lead Generation',
          description: 'Monthly lead generation target for marketing campaigns',
          category: 'marketing',
          target_type: 'number',
          default_duration: '1 month',
          suggested_target: 50
        },
        {
          id: '3',
          name: 'Project Completion',
          description: 'Quarterly project completion target',
          category: 'operations',
          target_type: 'number',
          default_duration: '3 months',
          suggested_target: 12
        },
        {
          id: '4',
          name: 'Customer Acquisition',
          description: 'New customer acquisition goal',
          category: 'business_development',
          target_type: 'number',
          default_duration: '1 month',
          suggested_target: 8
        },
        {
          id: '5',
          name: 'Team Performance',
          description: 'Overall team performance and productivity metrics',
          category: 'hr',
          target_type: 'percentage',
          default_duration: '1 month',
          suggested_target: 90
        }
      ]);

      setTeams([
        { id: '1', name: 'Sales Team', members: 8 },
        { id: '2', name: 'Marketing Team', members: 5 },
        { id: '3', name: 'Operations Team', members: 12 },
        { id: '4', name: 'Business Development', members: 4 },
        { id: '5', name: 'Customer Service', members: 6 }
      ]);

    } catch (error) {
      console.error('Error loading goals data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Goal Management Functions
  const createGoal = async () => {
    setLoading(true);
    try {
      const newGoal = {
        id: Date.now().toString(),
        ...goalForm,
        current_value: 0,
        progress: 0,
        created_by: 'Current User',
        created_at: new Date().toISOString(),
        milestones: [],
        kpis: []
      };

      setGoals(prev => [...prev, newGoal]);
      setShowCreateGoalModal(false);
      resetGoalForm();

      // In production, make API call
      // await axios.post(`${API}/api/goals`, newGoal);

    } catch (error) {
      console.error('Goal creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateGoalProgress = async (goalId, newValue) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const progress = Math.min((newValue / goal.target_value) * 100, 100);
        return { ...goal, current_value: newValue, progress };
      }
      return goal;
    }));
  };

  const deleteGoal = async (goalId) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const resetGoalForm = () => {
    setGoalForm({
      title: '',
      description: '',
      type: 'individual',
      category: 'sales',
      target_value: '',
      current_value: 0,
      metric_unit: 'number',
      start_date: '',
      end_date: '',
      assigned_to: [],
      priority: 'medium',
      status: 'active'
    });
  };

  // Analytics Functions
  const getGoalsByStatus = (status) => goals.filter(goal => goal.status === status);
  const getAverageProgress = () => {
    const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0);
    return goals.length > 0 ? Math.round(totalProgress / goals.length) : 0;
  };

  const getGoalsByCategory = () => {
    const categories = {};
    goals.forEach(goal => {
      if (!categories[goal.category]) {
        categories[goal.category] = [];
      }
      categories[goal.category].push(goal);
    });
    return categories;
  };

  // Render Functions
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Goals</p>
                <p className="text-3xl font-bold text-blue-700">{goals.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Active Goals</p>
                <p className="text-3xl font-bold text-green-700">
                  {getGoalsByStatus('active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Avg Progress</p>
                <p className="text-3xl font-bold text-yellow-700">{getAverageProgress()}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-purple-700">
                  {goals.filter(g => g.progress >= 100).length}
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Goals by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(getGoalsByCategory()).map(([category, categoryGoals]) => (
              <div key={category} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold capitalize">{category}</h3>
                  <Badge variant="outline">{categoryGoals.length}</Badge>
                </div>
                <div className="space-y-2">
                  {categoryGoals.slice(0, 3).map(goal => (
                    <div key={goal.id} className="text-sm">
                      <div className="flex justify-between items-center">
                        <span className="truncate">{goal.title}</span>
                        <span className="text-green-600 font-medium">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-1 mt-1" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGoalsList = () => (
    <div className="space-y-4">
      {goals.map(goal => (
        <Card key={goal.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold">{goal.title}</h3>
                  <Badge className={
                    goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                    goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {goal.priority}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {goal.category}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-3">{goal.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Progress</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={goal.progress} className="flex-1" />
                      <span className="text-sm font-medium">{goal.progress}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Current / Target</p>
                    <p className="font-medium">
                      {goal.metric_unit === 'currency' 
                        ? `₹${(goal.current_value / 100000).toFixed(1)}L / ₹${(goal.target_value / 100000).toFixed(1)}L`
                        : `${goal.current_value} / ${goal.target_value} ${goal.metric_unit === 'percentage' ? '%' : ''}`
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Due Date</p>
                    <p className="font-medium">{new Date(goal.end_date).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* KPIs */}
                {goal.kpis && goal.kpis.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Key Performance Indicators</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {goal.kpis.map((kpi, index) => (
                        <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                          <p className="font-medium">{kpi.name}</p>
                          <p className="text-gray-600">{kpi.current} / {kpi.target}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 ml-4">
                <Button size="sm" variant="outline" onClick={() => {
                  setSelectedGoal(goal);
                  setShowGoalDetailsModal(true);
                }}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setGoalForm({
                    title: goal.title,
                    description: goal.description,
                    type: goal.type,
                    category: goal.category,
                    target_value: goal.target_value.toString(),
                    current_value: goal.current_value,
                    metric_unit: goal.metric_unit,
                    start_date: goal.start_date,
                    end_date: goal.end_date,
                    assigned_to: goal.assigned_to,
                    priority: goal.priority,
                    status: goal.status
                  });
                  setShowCreateGoalModal(true);
                }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => deleteGoal(goal.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Goals & Targets Management</span>
          </DialogTitle>
          <DialogDescription>
            Set, track, and achieve your business goals with comprehensive analytics
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-[75vh]">
          {/* Sidebar Navigation */}
          <div className="w-48 border-r p-4">
            <div className="space-y-1">
              <Button
                variant={activeView === 'overview' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveView('overview')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </Button>
              <Button
                variant={activeView === 'goals' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveView('goals')}
              >
                <Target className="h-4 w-4 mr-2" />
                All Goals
              </Button>
              <Button
                variant={activeView === 'templates' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveView('templates')}
              >
                <Star className="h-4 w-4 mr-2" />
                Templates
              </Button>
              <Button
                variant={activeView === 'analytics' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveView('analytics')}
              >
                <PieChart className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </div>

            <div className="mt-6">
              <Button
                onClick={() => setShowCreateGoalModal(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading goals...</span>
              </div>
            )}

            {!loading && activeView === 'overview' && renderOverview()}
            {!loading && activeView === 'goals' && renderGoalsList()}
            {!loading && activeView === 'templates' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Goal Templates</h3>
                  <Badge>{goalTemplates.length} templates available</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goalTemplates.map(template => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">{template.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {template.category.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Target Type:</span>
                            <span className="capitalize">{template.target_type}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Duration:</span>
                            <span>{template.default_duration}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Suggested Target:</span>
                            <span>
                              {template.target_type === 'currency' 
                                ? `₹${(template.suggested_target / 1000)}K`
                                : template.target_type === 'percentage'
                                ? `${template.suggested_target}%`
                                : template.suggested_target
                              }
                            </span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          size="sm"
                          onClick={() => {
                            // Pre-fill form with template data
                            setGoalForm({
                              title: template.name,
                              description: template.description,
                              type: 'team',
                              category: template.category,
                              target_value: template.suggested_target.toString(),
                              current_value: 0,
                              metric_unit: template.target_type,
                              start_date: new Date().toISOString().split('T')[0],
                              end_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0], // 30 days from now
                              assigned_to: [],
                              priority: 'medium',
                              status: 'active'
                            });
                            setShowCreateGoalModal(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {!loading && activeView === 'analytics' && (
              <div className="space-y-6">
                {/* Overall Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">Total Goals</h3>
                      </div>
                      <p className="text-3xl font-bold mt-2">{goals.length}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {getGoalsByStatus('active').length} active • {getGoalsByStatus('completed').length} completed
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold">Average Progress</h3>
                      </div>
                      <p className="text-3xl font-bold mt-2">{getAverageProgress()}%</p>
                      <Progress value={getAverageProgress()} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <Award className="h-5 w-5 text-purple-600" />
                        <h3 className="font-semibold">Achievement Rate</h3>
                      </div>
                      <p className="text-3xl font-bold mt-2">
                        {goals.length > 0 ? Math.round((goals.filter(g => g.progress >= 100).length / goals.length) * 100) : 0}%
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {goals.filter(g => g.progress >= 100).length} of {goals.length} goals achieved
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Goals by Category */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="h-5 w-5" />
                      <span>Goals by Category</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(getGoalsByCategory()).map(([category, categoryGoals]) => {
                        const avgProgress = Math.round(
                          categoryGoals.reduce((sum, goal) => sum + goal.progress, 0) / categoryGoals.length
                        );
                        const categoryColors = {
                          sales: 'bg-blue-500',
                          marketing: 'bg-green-500',
                          customer_service: 'bg-purple-500',
                          business_development: 'bg-orange-500',
                          operations: 'bg-indigo-500',
                          hr: 'bg-pink-500'
                        };
                        
                        return (
                          <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${categoryColors[category] || 'bg-gray-500'}`}></div>
                              <span className="font-medium capitalize">{category.replace('_', ' ')}</span>
                              <Badge variant="outline">{categoryGoals.length} goals</Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">{avgProgress}% avg</span>
                              <Progress value={avgProgress} className="w-20" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Priority Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Priority Distribution</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['high', 'medium', 'low'].map(priority => {
                        const priorityGoals = goals.filter(g => g.priority === priority);
                        const priorityColors = {
                          high: 'bg-red-500',
                          medium: 'bg-yellow-500',
                          low: 'bg-green-500'
                        };
                        
                        return (
                          <div key={priority} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${priorityColors[priority]}`}></div>
                              <span className="font-medium capitalize">{priority} Priority</span>
                              <Badge variant="outline">{priorityGoals.length} goals</Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              {priorityGoals.length > 0 ? 
                                Math.round(priorityGoals.reduce((sum, goal) => sum + goal.progress, 0) / priorityGoals.length) 
                                : 0}% avg progress
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Performing Goals */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="h-5 w-5" />
                      <span>Top Performing Goals</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {goals
                        .sort((a, b) => b.progress - a.progress)
                        .slice(0, 3)
                        .map(goal => (
                          <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="font-medium">{goal.title}</h4>
                              <p className="text-sm text-gray-600">{goal.category}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-2">
                                <Progress value={goal.progress} className="w-20" />
                                <span className="text-sm font-semibold">{Math.round(goal.progress)}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Create Goal Modal */}
        <Dialog open={showCreateGoalModal} onOpenChange={setShowCreateGoalModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>Set up a new goal with targets and tracking</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Goal Title</Label>
                  <Input 
                    value={goalForm.title}
                    onChange={(e) => setGoalForm({...goalForm, title: e.target.value})}
                    placeholder="Enter goal title..."
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={goalForm.category} onValueChange={(value) => setGoalForm({...goalForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea 
                  value={goalForm.description}
                  onChange={(e) => setGoalForm({...goalForm, description: e.target.value})}
                  placeholder="Describe the goal..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Goal Type</Label>
                  <Select value={goalForm.type} onValueChange={(value) => setGoalForm({...goalForm, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Target Value</Label>
                  <Input 
                    type="number"
                    value={goalForm.target_value}
                    onChange={(e) => setGoalForm({...goalForm, target_value: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Select value={goalForm.metric_unit} onValueChange={(value) => setGoalForm({...goalForm, metric_unit: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="currency">Currency (₹)</SelectItem>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input 
                    type="date"
                    value={goalForm.start_date}
                    onChange={(e) => setGoalForm({...goalForm, start_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input 
                    type="date"
                    value={goalForm.end_date}
                    onChange={(e) => setGoalForm({...goalForm, end_date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label>Priority</Label>
                <Select value={goalForm.priority} onValueChange={(value) => setGoalForm({...goalForm, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={createGoal} disabled={loading || !goalForm.title}>
                  {loading ? 'Creating...' : 'Create Goal'}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateGoalModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Goal Details Modal */}
        {selectedGoal && (
          <Dialog open={showGoalDetailsModal} onOpenChange={setShowGoalDetailsModal}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedGoal.title}</DialogTitle>
                <DialogDescription>{selectedGoal.description}</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Progress Overview */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedGoal.progress}%</div>
                      <div className="text-sm text-gray-600">Progress</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedGoal.metric_unit === 'currency' 
                          ? `₹${(selectedGoal.current_value / 100000).toFixed(1)}L`
                          : selectedGoal.current_value
                        }
                      </div>
                      <div className="text-sm text-gray-600">Current</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedGoal.metric_unit === 'currency' 
                          ? `₹${(selectedGoal.target_value / 100000).toFixed(1)}L`
                          : selectedGoal.target_value
                        }
                      </div>
                      <div className="text-sm text-gray-600">Target</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Milestones */}
                {selectedGoal.milestones && selectedGoal.milestones.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Milestones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedGoal.milestones.map((milestone, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                            <div className={`w-3 h-3 rounded-full ${
                              milestone.status === 'completed' ? 'bg-green-500' :
                              milestone.status === 'in_progress' ? 'bg-yellow-500' :
                              'bg-gray-300'
                            }`}></div>
                            <div className="flex-1">
                              <div className="font-medium">{milestone.title}</div>
                              <div className="text-sm text-gray-600">
                                {milestone.achieved} / {milestone.target}
                              </div>
                            </div>
                            <Badge className={
                              milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                              milestone.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {milestone.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* KPIs */}
                {selectedGoal.kpis && selectedGoal.kpis.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Performance Indicators</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {selectedGoal.kpis.map((kpi, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="font-medium mb-2">{kpi.name}</div>
                            <div className="flex justify-between items-center mb-2">
                              <span>{kpi.current}</span>
                              <span className="text-gray-500">/ {kpi.target}</span>
                            </div>
                            <Progress value={(kpi.current / kpi.target) * 100} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GoalsManagementSystem;