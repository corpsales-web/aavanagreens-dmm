import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Target, Calendar,
  Plus, Edit, Trash2, Eye, Filter, Search, MoreHorizontal, Share,
  ArrowRight, ArrowLeft, CheckCircle, XCircle, Clock, AlertCircle,
  BarChart3, PieChart, LineChart, Activity, Brain, Zap, Star,
  Phone, Mail, MessageSquare, FileText, Image, Award, Percent,
  Save
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const EnhancedPipelineSystem = () => {
  // State Management
  const [activeView, setActiveView] = useState('pipeline');
  const [deals, setDeals] = useState([]);
  const [stages, setStages] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [aiPredictions, setAiPredictions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [showDealModal, setShowDealModal] = useState(false);
  const [showDealEditModal, setShowDealEditModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);

  // Form States
  const [dealForm, setDealForm] = useState({
    title: '',
    company: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    value: '',
    probability: 50,
    stage: '',
    expected_close_date: '',
    description: '',
    source: '',
    assigned_to: '',
    tags: []
  });

  // Deal Edit Form State
  const [dealEditForm, setDealEditForm] = useState({
    title: '',
    company: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    value: '',
    probability: 50,
    stage: '',
    expected_close_date: '',
    description: '',
    source: '',
    assigned_to: '',
    tags: [],
    notes: ''
  });

  // Filters
  const [filters, setFilters] = useState({
    stage: 'all',
    assigned_to: 'all',
    source: 'all',
    value_range: 'all',
    search: ''
  });

  // Initialize data
  useEffect(() => {
    initializePipelineSystem();
  }, []);

  const initializePipelineSystem = async () => {
    setLoading(true);
    try {
      // Initialize pipeline stages
      setStages([
        { id: '1', name: 'Lead', color: '#64748b', order: 1, conversion_rate: 25 },
        { id: '2', name: 'Qualified', color: '#3b82f6', order: 2, conversion_rate: 40 },
        { id: '3', name: 'Proposal', color: '#f59e0b', order: 3, conversion_rate: 60 },
        { id: '4', name: 'Negotiation', color: '#ef4444', order: 4, conversion_rate: 75 },
        { id: '5', name: 'Closed Won', color: '#10b981', order: 5, conversion_rate: 100 },
        { id: '6', name: 'Closed Lost', color: '#6b7280', order: 6, conversion_rate: 0 }
      ]);

      // Initialize users
      setUsers([
        { id: '1', name: 'Rajesh Kumar', email: 'rajesh@aavanagreens.com', role: 'Sales Executive' },
        { id: '2', name: 'Priya Sharma', email: 'priya@aavanagreens.com', role: 'Sales Manager' },
        { id: '3', name: 'Amit Patel', email: 'amit@aavanagreens.com', role: 'Senior Executive' },
        { id: '4', name: 'Sneha Verma', email: 'sneha@aavanagreens.com', role: 'Sales Associate' }
      ]);

      // Load deals from API
      await loadDeals();

      // Initialize analytics
      setAnalytics({
        total_value: 765000,
        weighted_value: 485000,
        win_rate: 35,
        avg_deal_size: 191250,
        sales_cycle: 45,
        deals_this_month: 4,
        closed_won: 2,
        closed_lost: 1,
        pipeline_velocity: 12.5,
        conversion_rates: {
          'lead_to_qualified': 25,
          'qualified_to_proposal': 60,
          'proposal_to_negotiation': 75,
          'negotiation_to_won': 80
        }
      });

      // Initialize AI predictions
      setAiPredictions([
        {
          deal_id: '1',
          close_probability: 92,
          predicted_close_date: '2024-02-12',
          predicted_value: 250000,
          confidence: 'high',
          recommendations: [
            'Schedule final decision meeting',
            'Prepare contract documentation',
            'Confirm project start date'
          ]
        },
        {
          deal_id: '2',
          close_probability: 78,
          predicted_close_date: '2024-01-28',
          predicted_value: 42000,
          confidence: 'medium',
          recommendations: [
            'Address budget concerns',
            'Provide payment plan options',
            'Schedule site measurement'
          ]
        }
      ]);

    } catch (error) {
      console.error('Pipeline system initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Deal Management Functions - Enhanced with Real API Integration
  const loadDeals = async () => {
    try {
      const response = await axios.get(`${API}/api/deals`);
      
      // Map API stage names to component stage IDs
      const stageMapping = {
        'Proposal Preparation': '3',
        'Proposal Sent': '3',
        'Negotiation': '4',
        'Contract': '4',
        'Won': '5',
        'Lost': '6'
      };
      
      // Map API data to component format
      const mappedDeals = response.data.map(deal => ({
        ...deal,
        title: deal.client_name || 'Untitled Deal',
        company: deal.client_name || 'Unknown Company',
        contact_name: deal.client_name,
        contact_email: deal.client_email,
        contact_phone: deal.client_phone,
        value: deal.estimated_value || 0,
        stage: stageMapping[deal.stage] || '3', // Default to Proposal stage
        probability: deal.probability || 50,
        expected_close_date: deal.expected_close_date,
        source: deal.source || 'Unknown',
        assigned_to: deal.assigned_to || '1', // Default to first user
        created_date: deal.created_at,
        last_activity: deal.updated_at,
        activities: [], // Initialize empty activities array
        tags: [], // Initialize empty tags array
        ai_score: Math.floor(Math.random() * 40) + 60, // Generate random AI score for now
        ai_insights: [
          'Deal loaded from API',
          `Original stage: ${deal.stage}`,
          `Probability: ${deal.probability}%`,
          'Follow-up recommended'
        ]
      }));
      setDeals(mappedDeals);
      console.log('✅ Loaded deals:', mappedDeals.length, 'deals');
    } catch (error) {
      console.error('Error loading deals:', error);
    }
  };

  const createDeal = async () => {
    setLoading(true);
    try {
      const newDeal = {
        id: Date.now().toString(),
        ...dealForm,
        value: parseFloat(dealForm.value),
        created_date: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        ai_score: Math.floor(Math.random() * 40) + 60, // Random AI score
        ai_insights: [
          'New opportunity detected',
          'Initial qualification needed',
          'Follow-up recommended'
        ],
        activities: []
      };

      setDeals(prev => [...prev, newDeal]);
      setShowDealModal(false);
      resetDealForm();

      // Generate AI prediction for new deal
      await generateAIPrediction(newDeal);

    } catch (error) {
      console.error('Deal creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const editDeal = async (dealId, updates) => {
    setLoading(true);
    try {
      console.log('🔧 Editing deal:', dealId, updates);
      
      const response = await axios.put(`${API}/api/deals/${dealId}`, {
        deal_id: dealId,
        updates: updates,
        notes: updates.notes
      });
      
      if (response.data.success) {
        // Update local state
        setDeals(prev => prev.map(deal => 
          deal.id === dealId ? { ...deal, ...updates, updated_at: new Date().toISOString() } : deal
        ));
        
        // Show AI insights if available
        if (response.data.ai_insights) {
          console.log('🤖 AI Insights:', response.data.ai_insights);
        }
        
        // Update AI prediction for edited deal
        const updatedDeal = { ...deals.find(d => d.id === dealId), ...updates };
        await generateAIPrediction(updatedDeal);
        
        return response.data;
      }
    } catch (error) {
      console.error('Deal edit error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const moveDeal = async (dealId, newStageId) => {
    try {
      // Update stage using API
      await axios.post(`${API}/api/deals/${dealId}/stage?stage=${newStageId}`);
      
      setDeals(prev => prev.map(deal => 
        deal.id === dealId ? { 
          ...deal, 
          stage: newStageId,
          last_activity: new Date().toISOString()
        } : deal
      ));

      // Update AI prediction when deal moves
      const deal = deals.find(d => d.id === dealId);
      if (deal) {
        await generateAIPrediction({ ...deal, stage: newStageId });
      }
    } catch (error) {
      console.error('Error moving deal:', error);
    }
  };

  const generateAIPrediction = async (deal) => {
    try {
      // Mock AI prediction generation
      const stageWeights = { '1': 20, '2': 40, '3': 60, '4': 75, '5': 100, '6': 0 };
      const baseProbability = stageWeights[deal.stage] || 0;
      const aiBoost = Math.floor(Math.random() * 20) - 10; // -10 to +10
      
      const prediction = {
        deal_id: deal.id,
        close_probability: Math.max(0, Math.min(100, baseProbability + aiBoost)),
        predicted_close_date: deal.expected_close_date,
        predicted_value: deal.value,
        confidence: baseProbability > 60 ? 'high' : baseProbability > 30 ? 'medium' : 'low',
        recommendations: generateRecommendations(deal)
      };

      setAiPredictions(prev => {
        const filtered = prev.filter(p => p.deal_id !== deal.id);
        return [...filtered, prediction];
      });

    } catch (error) {
      console.error('AI prediction error:', error);
    }
  };

  const generateRecommendations = (deal) => {
    const recommendations = [];
    const stageRecommendations = {
      '1': ['Qualify budget and timeline', 'Identify decision makers', 'Schedule discovery call'],
      '2': ['Present detailed solution', 'Provide case studies', 'Arrange site visit'],
      '3': ['Address objections', 'Negotiate terms', 'Present ROI analysis'],
      '4': ['Prepare final proposal', 'Schedule decision meeting', 'Confirm budget approval'],
      '5': ['Celebrate success', 'Plan implementation', 'Request testimonial'],
      '6': ['Analyze loss reasons', 'Maintain relationship', 'Future opportunity tracking']
    };

    return stageRecommendations[deal.stage] || ['Continue engagement', 'Monitor progress', 'Update regularly'];
  };

  // Utility Functions
  const resetDealForm = () => {
    setDealForm({
      title: '',
      company: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      value: '',
      probability: 50,
      stage: '',
      expected_close_date: '',
      description: '',
      source: '',
      assigned_to: '',
      tags: []
    });
  };

  const openDealEditModal = (deal) => {
    setDealEditForm({
      title: deal.title || '',
      company: deal.company || '',
      contact_name: deal.contact_name || '',
      contact_email: deal.contact_email || '',
      contact_phone: deal.contact_phone || '',
      value: deal.value?.toString() || '',
      probability: deal.probability || 50,
      stage: deal.stage || '',
      expected_close_date: deal.expected_close_date ? deal.expected_close_date.split('T')[0] : '',
      description: deal.description || '',
      source: deal.source || '',
      assigned_to: deal.assigned_to || '',
      tags: deal.tags || [],
      notes: ''
    });
    setShowDealEditModal(true);
  };

  const saveDealEdit = async () => {
    if (!selectedDeal) return;

    setLoading(true);
    try {
      const updates = {
        title: dealEditForm.title,
        company: dealEditForm.company,
        contact_name: dealEditForm.contact_name,
        contact_email: dealEditForm.contact_email,
        contact_phone: dealEditForm.contact_phone,
        value: parseFloat(dealEditForm.value),
        probability: dealEditForm.probability,
        stage: dealEditForm.stage,
        expected_close_date: dealEditForm.expected_close_date,
        description: dealEditForm.description,
        source: dealEditForm.source,
        assigned_to: dealEditForm.assigned_to,
        tags: dealEditForm.tags
      };

      const result = await editDeal(selectedDeal.id, updates);
      
      if (result && result.success) {
        setShowDealEditModal(false);
        setSelectedDeal(null);
        
        // Show success message with AI insights
        if (result.ai_insights) {
          alert(`✅ Deal updated successfully!\n\n🤖 AI Insights:\n${result.ai_insights}`);
        } else {
          alert('✅ Deal updated successfully!');
        }
      }
    } catch (error) {
      console.error('Error saving deal edit:', error);
      alert('❌ Error updating deal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDeals = () => {
    return deals.filter(deal => {
      const matchesStage = filters.stage === 'all' || deal.stage === filters.stage;
      const matchesAssignee = filters.assigned_to === 'all' || deal.assigned_to === filters.assigned_to;
      const matchesSource = filters.source === 'all' || deal.source === filters.source;
      const matchesSearch = !filters.search || 
        deal.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        deal.company.toLowerCase().includes(filters.search.toLowerCase()) ||
        deal.contact_name.toLowerCase().includes(filters.search.toLowerCase());

      return matchesStage && matchesAssignee && matchesSource && matchesSearch;
    });
  };

  const getDealsByStage = (stageId) => {
    return getFilteredDeals().filter(deal => deal.stage === stageId);
  };

  const calculateStageValue = (stageId) => {
    return getDealsByStage(stageId).reduce((total, deal) => total + deal.value, 0);
  };

  const getStageConversionRate = (stageId) => {
    const stage = stages.find(s => s.id === stageId);
    return stage ? stage.conversion_rate : 0;
  };

  // Render Functions
  const renderPipelineBoard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 overflow-x-auto min-h-screen">
      {stages.map((stage) => (
        <div 
          key={stage.id} 
          className="bg-gray-50 rounded-lg p-4 min-w-80"
          style={{ borderTop: `4px solid ${stage.color}` }}
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">{stage.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{getDealsByStage(stage.id).length} deals</span>
                <span>•</span>
                <span className="text-green-600">
                  ₹{(calculateStageValue(stage.id) / 100000).toFixed(1)}L
                </span>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className="text-xs"
              style={{ color: stage.color }}
            >
              {getStageConversionRate(stage.id)}%
            </Badge>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {getDealsByStage(stage.id).map((deal) => {
              const assignedUser = users.find(u => u.id === deal.assigned_to);
              const aiPrediction = aiPredictions.find(p => p.deal_id === deal.id);
              
              return (
                <Card 
                  key={deal.id} 
                  className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4"
                  style={{ borderLeftColor: stage.color }}
                  onClick={() => setSelectedDeal(deal)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm line-clamp-2">{deal.title}</h4>
                      <div className="flex items-center space-x-1">
                        {deal.ai_score && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              deal.ai_score >= 80 ? 'border-green-500 text-green-700' :
                              deal.ai_score >= 60 ? 'border-yellow-500 text-yellow-700' :
                              'border-red-500 text-red-700'
                            }`}
                          >
                            <Brain className="h-3 w-3 mr-1" />
                            {deal.ai_score}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-green-600">
                          ₹{(deal.value / 100000).toFixed(1)}L
                        </span>
                        <span className="text-xs text-gray-500">
                          {deal.probability}%
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        <div>{deal.company}</div>
                        <div>{deal.contact_name}</div>
                      </div>
                      
                      <Progress value={deal.probability} className="h-2" />
                    </div>
                    
                    {aiPrediction && (
                      <div className="mb-3 p-2 bg-blue-50 rounded text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">AI Prediction:</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              aiPrediction.confidence === 'high' ? 'border-green-500 text-green-700' :
                              aiPrediction.confidence === 'medium' ? 'border-yellow-500 text-yellow-700' :
                              'border-red-500 text-red-700'
                            }`}
                          >
                            {aiPrediction.close_probability}%
                          </Badge>
                        </div>
                        <div className="mt-1 text-gray-600">
                          Close: {new Date(aiPrediction.predicted_close_date).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {assignedUser && (
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {assignedUser.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(deal.expected_close_date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex space-x-1">
                        {deal.activities.length > 0 && (
                          <Activity className="h-4 w-4 text-blue-500" title="Has Activities" />
                        )}
                        {deal.tags.includes('high-value') && (
                          <Star className="h-4 w-4 text-yellow-500" title="High Value" />
                        )}
                      </div>
                    </div>
                    
                    {/* Stage Movement Buttons */}
                    <div className="flex justify-between mt-3 pt-2 border-t">
                      {stage.order > 1 && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            const prevStage = stages.find(s => s.order === stage.order - 1);
                            if (prevStage) moveDeal(deal.id, prevStage.id);
                          }}
                        >
                          <ArrowLeft className="h-3 w-3" />
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                      
                      {stage.order < 5 && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            const nextStage = stages.find(s => s.order === stage.order + 1);
                            if (nextStage) moveDeal(deal.id, nextStage.id);
                          }}
                        >
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const renderAnalyticsDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Pipeline</p>
                <p className="text-3xl font-bold text-blue-700">
                  ₹{(analytics.total_value / 100000).toFixed(1)}L
                </p>
                <p className="text-blue-600 text-xs">
                  Weighted: ₹{(analytics.weighted_value / 100000).toFixed(1)}L
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Win Rate</p>
                <p className="text-3xl font-bold text-green-700">{analytics.win_rate}%</p>
                <p className="text-green-600 text-xs">This Quarter</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Avg Deal Size</p>
                <p className="text-3xl font-bold text-yellow-700">
                  ₹{(analytics.avg_deal_size / 100000).toFixed(1)}L
                </p>
                <p className="text-yellow-600 text-xs">Per Deal</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Sales Cycle</p>
                <p className="text-3xl font-bold text-purple-700">{analytics.sales_cycle}</p>
                <p className="text-purple-600 text-xs">Days Average</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-600" />
            AI Pipeline Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-gray-800">High Probability Deals</h4>
              <div className="space-y-2">
                {aiPredictions
                  .filter(p => p.close_probability >= 75)
                  .map((prediction) => {
                    const deal = deals.find(d => d.id === prediction.deal_id);
                    return deal ? (
                      <div key={prediction.deal_id} className="flex justify-between items-center p-2 bg-white rounded">
                        <div>
                          <div className="font-medium text-sm">{deal.title}</div>
                          <div className="text-xs text-gray-600">₹{(deal.value / 100000).toFixed(1)}L</div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {prediction.close_probability}%
                        </Badge>
                      </div>
                    ) : null;
                  })}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-gray-800">Needs Attention</h4>
              <div className="space-y-2">
                {deals
                  .filter(deal => {
                    const daysSinceActivity = Math.floor(
                      (new Date() - new Date(deal.last_activity)) / (1000 * 60 * 60 * 24)
                    );
                    return daysSinceActivity > 7;
                  })
                  .slice(0, 3)
                  .map((deal) => (
                    <div key={deal.id} className="flex justify-between items-center p-2 bg-white rounded">
                      <div>
                        <div className="font-medium text-sm">{deal.title}</div>
                        <div className="text-xs text-gray-600">
                          Last activity: {Math.floor((new Date() - new Date(deal.last_activity)) / (1000 * 60 * 60 * 24))} days ago
                        </div>
                      </div>
                      <Badge className="bg-red-100 text-red-800">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Stale
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.slice(0, 4).map((stage, index) => {
              const stageDeals = getDealsByStage(stage.id);
              const nextStage = stages[index + 1];
              const conversionRate = index < 3 ? getStageConversionRate(nextStage.id) : 100;
              
              return (
                <div key={stage.id} className="flex items-center space-x-4">
                  <div className="w-24 text-sm font-medium">{stage.name}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="h-8 rounded"
                        style={{ 
                          backgroundColor: stage.color,
                          width: `${Math.max(10, (stageDeals.length / deals.length) * 100)}%`
                        }}
                      ></div>
                      <span className="text-sm text-gray-600">
                        {stageDeals.length} deals ({((stageDeals.length / deals.length) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-20 text-sm text-gray-600">
                    ₹{(calculateStageValue(stage.id) / 100000).toFixed(1)}L
                  </div>
                  {index < 3 && (
                    <div className="w-16 text-xs text-green-600">
                      {conversionRate}% →
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enhanced Sales Pipeline</h2>
          <p className="text-gray-600">AI-powered sales pipeline with deal prediction and analytics</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setActiveView('analytics');
              console.log('📊 Switching to analytics view');
            }}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={() => setShowDealModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Deal
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search deals..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-48"
              />
            </div>
            
            <Select value={filters.stage} onValueChange={(value) => setFilters({...filters, stage: value})}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.assigned_to} onValueChange={(value) => setFilters({...filters, assigned_to: value})}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.source} onValueChange={(value) => setFilters({...filters, source: value})}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="Google Ads">Google Ads</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
                <SelectItem value="Cold Outreach">Cold Outreach</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeView === 'pipeline' ? 'default' : 'ghost'}
          onClick={() => setActiveView('pipeline')}
          size="sm"
        >
          Pipeline View
        </Button>
        <Button
          variant={activeView === 'analytics' ? 'default' : 'ghost'}
          onClick={() => setActiveView('analytics')}
          size="sm"
        >
          Analytics View
        </Button>
      </div>

      {/* Main Content */}
      {activeView === 'pipeline' && renderPipelineBoard()}
      {activeView === 'analytics' && renderAnalyticsDashboard()}

      {/* Deal Creation Modal */}
      <Dialog open={showDealModal} onOpenChange={setShowDealModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Deal</DialogTitle>
            <DialogDescription>Add a new deal to your sales pipeline</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Deal Title</Label>
                <Input 
                  value={dealForm.title}
                  onChange={(e) => setDealForm({...dealForm, title: e.target.value})}
                  placeholder="Enter deal title..."
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input 
                  value={dealForm.company}
                  onChange={(e) => setDealForm({...dealForm, company: e.target.value})}
                  placeholder="Company name..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contact Name</Label>
                <Input 
                  value={dealForm.contact_name}
                  onChange={(e) => setDealForm({...dealForm, contact_name: e.target.value})}
                  placeholder="Contact person..."
                />
              </div>
              <div>
                <Label>Contact Email</Label>
                <Input 
                  type="email"
                  value={dealForm.contact_email}
                  onChange={(e) => setDealForm({...dealForm, contact_email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Deal Value (₹)</Label>
                <Input 
                  type="number"
                  value={dealForm.value}
                  onChange={(e) => setDealForm({...dealForm, value: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Probability (%)</Label>
                <Input 
                  type="number"
                  min="0"
                  max="100"
                  value={dealForm.probability}
                  onChange={(e) => setDealForm({...dealForm, probability: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Stage</Label>
                <Select value={dealForm.stage} onValueChange={(value) => setDealForm({...dealForm, stage: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.slice(0, 4).map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assigned To</Label>
                <Select value={dealForm.assigned_to} onValueChange={(value) => setDealForm({...dealForm, assigned_to: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Expected Close Date</Label>
                <Input 
                  type="date"
                  value={dealForm.expected_close_date}
                  onChange={(e) => setDealForm({...dealForm, expected_close_date: e.target.value})}
                />
              </div>
              <div>
                <Label>Source</Label>
                <Select value={dealForm.source} onValueChange={(value) => setDealForm({...dealForm, source: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Google Ads">Google Ads</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Cold Outreach">Cold Outreach</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea 
                value={dealForm.description}
                onChange={(e) => setDealForm({...dealForm, description: e.target.value})}
                placeholder="Deal description..."
                rows={3}
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={createDeal} disabled={loading || !dealForm.title}>
                {loading ? 'Creating...' : 'Create Deal'}
              </Button>
              <Button variant="outline" onClick={() => setShowDealModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deal Details Modal */}
      {selectedDeal && (
        <Dialog open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedDeal.title}</DialogTitle>
              <DialogDescription>{selectedDeal.company}</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Deal Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">
                    ₹{(selectedDeal.value / 100000).toFixed(1)}L
                  </div>
                  <div className="text-sm text-blue-600">Deal Value</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">
                    {selectedDeal.probability}%
                  </div>
                  <div className="text-sm text-green-600">Probability</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-700">
                    {selectedDeal.ai_score}
                  </div>
                  <div className="text-sm text-yellow-600">AI Score</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">
                    {Math.floor((new Date(selectedDeal.expected_close_date) - new Date()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-purple-600">Days to Close</div>
                </div>
              </div>

              {/* AI Insights */}
              {selectedDeal.ai_insights && (
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Brain className="h-5 w-5 mr-2 text-purple-600" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedDeal.ai_insights.map((insight, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          <span className="text-sm">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedDeal.activities.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-white rounded-full">
                          {activity.type === 'call' && <Phone className="h-4 w-4 text-blue-500" />}
                          {activity.type === 'email' && <Mail className="h-4 w-4 text-green-500" />}
                          {activity.type === 'meeting' && <Users className="h-4 w-4 text-purple-500" />}
                          {activity.type === 'whatsapp' && <MessageSquare className="h-4 w-4 text-green-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium capitalize">{activity.type}</div>
                              <div className="text-sm text-gray-600">{activity.note}</div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(activity.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button onClick={() => {
                  if (selectedDeal.contact_phone) {
                    window.open(`tel:${selectedDeal.contact_phone}`, '_self');
                  } else {
                    alert('Phone number not available for this deal');
                  }
                }}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button variant="outline" onClick={() => {
                  if (selectedDeal.contact_email) {
                    window.open(`mailto:${selectedDeal.contact_email}?subject=Regarding ${selectedDeal.title}&body=Hi ${selectedDeal.contact_name || 'there'},%0D%0A%0D%0AI hope this email finds you well. I wanted to follow up on your ${selectedDeal.title} project.%0D%0A%0D%0ABest regards,%0D%0AAavana Greens Team`, '_blank');
                  } else {
                    alert('Email address not available for this deal');
                  }
                }}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" onClick={() => {
                  if (selectedDeal.contact_phone) {
                    const phone = selectedDeal.contact_phone.replace(/[^\d+]/g, '');
                    const message = `Hi ${selectedDeal.contact_name || 'there'}! This is regarding your ${selectedDeal.title} project. We'd love to discuss the next steps with you.`;
                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                  } else {
                    alert('Phone number not available for WhatsApp');
                  }
                }} className="bg-green-600 hover:bg-green-700 text-white">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button variant="outline" onClick={() => openDealEditModal(selectedDeal)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Deal
                </Button>
                <Button variant="outline">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Deal Edit Modal */}
      {showDealEditModal && selectedDeal && (
        <Dialog open={showDealEditModal} onOpenChange={setShowDealEditModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Edit className="h-5 w-5 text-blue-600" />
                <span>Edit Deal - {selectedDeal.title}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Deal Title</label>
                  <input
                    type="text"
                    value={dealEditForm.title}
                    onChange={(e) => setDealEditForm(prev => ({...prev, title: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter deal title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <input
                    type="text"
                    value={dealEditForm.company}
                    onChange={(e) => setDealEditForm(prev => ({...prev, company: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Contact Name</label>
                  <input
                    type="text"
                    value={dealEditForm.contact_name}
                    onChange={(e) => setDealEditForm(prev => ({...prev, contact_name: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contact person name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Contact Email</label>
                  <input
                    type="email"
                    value={dealEditForm.contact_email}
                    onChange={(e) => setDealEditForm(prev => ({...prev, contact_email: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="contact@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    value={dealEditForm.contact_phone}
                    onChange={(e) => setDealEditForm(prev => ({...prev, contact_phone: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Deal Value (₹)</label>
                  <input
                    type="number"
                    value={dealEditForm.value}
                    onChange={(e) => setDealEditForm(prev => ({...prev, value: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="150000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Probability (%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={dealEditForm.probability}
                    onChange={(e) => setDealEditForm(prev => ({...prev, probability: parseInt(e.target.value)}))}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600">{dealEditForm.probability}%</div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Stage</label>
                  <select
                    value={dealEditForm.stage}
                    onChange={(e) => setDealEditForm(prev => ({...prev, stage: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Stage</option>
                    {stages.map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Expected Close Date</label>
                  <input
                    type="date"
                    value={dealEditForm.expected_close_date}
                    onChange={(e) => setDealEditForm(prev => ({...prev, expected_close_date: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Source</label>
                  <select
                    value={dealEditForm.source}
                    onChange={(e) => setDealEditForm(prev => ({...prev, source: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Source</option>
                    <option value="Website">Website</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Referral">Referral</option>
                    <option value="Cold Outreach">Cold Outreach</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Exhibition">Exhibition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Assigned To</label>
                  <select
                    value={dealEditForm.assigned_to}
                    onChange={(e) => setDealEditForm(prev => ({...prev, assigned_to: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select User</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={dealEditForm.description}
                  onChange={(e) => setDealEditForm(prev => ({...prev, description: e.target.value}))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Deal description and notes..."
                />
              </div>

              {/* Edit Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">Edit Notes (Optional)</label>
                <textarea
                  value={dealEditForm.notes}
                  onChange={(e) => setDealEditForm(prev => ({...prev, notes: e.target.value}))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add notes about this edit..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDealEditModal(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveDealEdit}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EnhancedPipelineSystem;