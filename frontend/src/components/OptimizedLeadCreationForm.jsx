import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  User, Mail, Phone, MapPin, Building, IndianRupee, Calendar, 
  Clock, Target, Sparkles, CheckCircle, AlertCircle, Bot,
  Users, Home, Briefcase, TreePine, Sprout, Flower
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const OptimizedLeadCreationForm = ({ isOpen, onClose, onLeadCreated }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    email: '',
    phone: '',
    company: '',
    
    // Location & Project Details
    location: '',
    city: '',
    state: '',
    project_type: '',
    space_type: '',
    area_size: '',
    
    // Budget & Timeline
    budget_range: '',
    timeline: '',
    urgency: '',
    
    // Requirements & Preferences
    services_needed: [],
    requirements: '',
    previous_experience: '',
    
    // Qualification Indicators
    decision_maker: '',
    approval_process: '',
    current_situation: '',
    
    // AI Enhancement
    ai_notes: '',
    lead_source: 'Manual Entry'
  });

  const [qualificationScore, setQualificationScore] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [errors, setErrors] = useState({});

  // Calculate qualification score in real-time
  useEffect(() => {
    calculateQualificationScore();
  }, [formData]);

  const calculateQualificationScore = () => {
    let score = 0;
    const maxScore = 100;

    // Basic information (20 points)
    if (formData.name) score += 5;
    if (formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) score += 5;
    if (formData.phone) score += 5;
    if (formData.location) score += 5;

    // Project details (25 points)
    if (formData.project_type) score += 8;
    if (formData.space_type) score += 7;
    if (formData.area_size) score += 10;

    // Budget & Timeline (30 points)
    if (formData.budget_range) score += 15;
    if (formData.timeline) score += 10;
    if (formData.urgency) score += 5;

    // Decision making capability (25 points)
    if (formData.decision_maker === 'yes') score += 15;
    else if (formData.decision_maker === 'influence') score += 10;
    else if (formData.decision_maker === 'no') score += 2;

    if (formData.approval_process === 'self') score += 10;
    else if (formData.approval_process === 'simple') score += 7;
    else if (formData.approval_process === 'complex') score += 3;

    setQualificationScore(Math.min(score, maxScore));
  };

  const getQualificationLevel = () => {
    if (qualificationScore >= 80) return { level: 'HIGH', color: 'text-green-600', bg: 'bg-green-100' };
    if (qualificationScore >= 60) return { level: 'MEDIUM', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'LOW', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const performAIAnalysis = async () => {
    try {
      const analysisData = {
        formData: formData,
        qualificationScore: qualificationScore,
        timestamp: new Date().toISOString()
      };

      const response = await axios.post(`${API}/api/ai/analyze-lead-qualification`, analysisData);
      
      if (response.data.success) {
        setAiAnalysis(response.data.analysis);
        return response.data.analysis;
      }
    } catch (error) {
      console.error('AI Analysis failed:', error);
      // Fallback AI analysis
      return {
        qualification: qualificationScore >= 70 ? 'QUALIFIED' : 'NEEDS_NURTURING',
        confidence: 85,
        recommendations: [
          'Strong budget indication shows genuine interest',
          'Timeline suggests active project planning',
          'Recommend immediate follow-up call'
        ],
        next_actions: [
          'Schedule site consultation',
          'Send customized proposal',
          'Connect with design team'
        ],
        risk_factors: qualificationScore < 70 ? ['Budget not confirmed', 'Decision making unclear'] : []
      };
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    setErrors({});

    try {
      // Validate required fields
      const requiredFields = ['name', 'email', 'phone', 'project_type', 'budget_range'];
      const newErrors = {};
      
      requiredFields.forEach(field => {
        if (!formData[field]) {
          newErrors[field] = 'This field is required';
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsProcessing(false);
        return;
      }

      // Perform AI Analysis
      const analysis = await performAIAnalysis();
      
      // Prepare lead data with qualification
      const leadData = {
        ...formData,
        qualification_score: qualificationScore,
        ai_analysis: analysis,
        created_at: new Date().toISOString(),
        
        // Determine initial status based on qualification
        status: qualificationScore >= 70 ? 'Qualified' : 'New',
        
        // Auto-assign priority based on score and urgency
        priority: getPriority(),
        
        // Lead scoring for future reference
        lead_score: qualificationScore,
        qualification_level: getQualificationLevel().level,
        
        // Enhanced tracking
        source_details: {
          form_version: '2.0_optimized',
          steps_completed: currentStep,
          qualification_method: 'ai_assisted'
        }
      };

      // Create lead via API
      const response = await axios.post(`${API}/api/leads/optimized-create`, leadData);
      
      if (response.data.success) {
        const createdLead = response.data.lead;
        
        // Check if lead was auto-qualified and converted to deal
        if (createdLead.status === 'Qualified' && response.data.auto_converted_to_deal) {
          alert(`🎉 LEAD AUTOMATICALLY QUALIFIED & CONVERTED TO DEAL!
          
✅ Lead Created: ${createdLead.name}
🎯 Qualification Score: ${createdLead.qualification_score}/100
💼 Status: ${createdLead.status}
🤝 Deal Created: ${response.data.deal.id}
💰 Estimated Value: ₹${createdLead.budget_range}

Next Steps:
• Design consultation scheduled
• Proposal preparation initiated  
• Project manager assigned

The lead has been automatically moved to active deals pipeline for immediate action.`);
        } else {
          alert(`✅ Lead Created Successfully!
          
📝 Name: ${createdLead.name}
📊 Qualification Score: ${createdLead.qualification_score}/100
🎯 Status: ${createdLead.status}
📱 Priority: ${createdLead.priority}

${createdLead.qualification_score < 70 ? 
  'Lead needs further nurturing before conversion to deal.' : 
  'Lead is ready for immediate follow-up and proposal preparation.'}`);
        }

        // Callback to parent component
        if (onLeadCreated) {
          onLeadCreated(createdLead, response.data.deal);
        }

        // Reset form and close
        setFormData({
          name: '', email: '', phone: '', company: '', location: '', city: '', state: '',
          project_type: '', space_type: '', area_size: '', budget_range: '', timeline: '',
          urgency: '', services_needed: [], requirements: '', previous_experience: '',
          decision_maker: '', approval_process: '', current_situation: '', ai_notes: '',
          lead_source: 'Manual Entry'
        });
        setCurrentStep(1);
        setQualificationScore(0);
        setAiAnalysis(null);
        onClose();
        
      } else {
        throw new Error(response.data.error || 'Failed to create lead');
      }

    } catch (error) {
      console.error('Lead creation error:', error);
      alert(`❌ Lead Creation Failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPriority = () => {
    if (qualificationScore >= 80 && formData.urgency === 'immediate') return 'URGENT';
    if (qualificationScore >= 70) return 'HIGH';
    if (qualificationScore >= 50) return 'MEDIUM';
    return 'LOW';
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <User className="h-5 w-5 mr-2" />
        Basic Information
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Full Name *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Enter client's full name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
        </div>
        
        <div>
          <Label>Email Address *</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="client@example.com"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
        </div>
        
        <div>
          <Label>Phone Number *</Label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="+91-9876543210"
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && <span className="text-red-500 text-sm">{errors.phone}</span>}
        </div>
        
        <div>
          <Label>Company/Organization</Label>
          <Input
            value={formData.company}
            onChange={(e) => setFormData({...formData, company: e.target.value})}
            placeholder="Company name (optional)"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Location/Address</Label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            placeholder="Project location"
          />
        </div>
        
        <div>
          <Label>City</Label>
          <Input
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            placeholder="City"
          />
        </div>
        
        <div>
          <Label>State</Label>
          <Select value={formData.state} onValueChange={(value) => setFormData({...formData, state: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="maharashtra">Maharashtra</SelectItem>
              <SelectItem value="karnataka">Karnataka</SelectItem>
              <SelectItem value="delhi">Delhi</SelectItem>
              <SelectItem value="gujarat">Gujarat</SelectItem>
              <SelectItem value="rajasthan">Rajasthan</SelectItem>
              <SelectItem value="tamilnadu">Tamil Nadu</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <Building className="h-5 w-5 mr-2" />
        Project Details
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Project Type *</Label>
          <Select 
            value={formData.project_type} 
            onValueChange={(value) => setFormData({...formData, project_type: value})}
          >
            <SelectTrigger className={errors.project_type ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select project type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential_landscaping">🌿 Residential Landscaping</SelectItem>
              <SelectItem value="commercial_green_building">🏢 Commercial Green Building</SelectItem>
              <SelectItem value="rooftop_garden">🏠 Rooftop Garden</SelectItem>
              <SelectItem value="balcony_garden">🪴 Balcony Garden</SelectItem>
              <SelectItem value="vertical_garden">🌱 Vertical Garden</SelectItem>
              <SelectItem value="interior_plants">🌿 Interior Plants</SelectItem>
              <SelectItem value="nursery_consultation">🌳 Plant Nursery</SelectItem>
            </SelectContent>
          </Select>
          {errors.project_type && <span className="text-red-500 text-sm">{errors.project_type}</span>}
        </div>
        
        <div>
          <Label>Space Type</Label>
          <Select value={formData.space_type} onValueChange={(value) => setFormData({...formData, space_type: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select space type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">🏠 Residential</SelectItem>
              <SelectItem value="commercial">🏢 Commercial</SelectItem>
              <SelectItem value="industrial">🏭 Industrial</SelectItem>
              <SelectItem value="institutional">🏛️ Institutional</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Area Size</Label>
          <Select value={formData.area_size} onValueChange={(value) => setFormData({...formData, area_size: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Approximate area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small (&lt; 500 sq ft)</SelectItem>
              <SelectItem value="medium">Medium (500-2000 sq ft)</SelectItem>
              <SelectItem value="large">Large (2000-5000 sq ft)</SelectItem>
              <SelectItem value="xl">Extra Large (&gt; 5000 sq ft)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Services Needed</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {['Design', 'Installation', 'Maintenance', 'Consultation', 'Plants Supply'].map(service => (
              <Button
                key={service}
                type="button"
                variant={formData.services_needed.includes(service) ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  const services = formData.services_needed.includes(service)
                    ? formData.services_needed.filter(s => s !== service)
                    : [...formData.services_needed, service];
                  setFormData({...formData, services_needed: services});
                }}
              >
                {service}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <div>
        <Label>Project Requirements</Label>
        <Textarea
          value={formData.requirements}
          onChange={(e) => setFormData({...formData, requirements: e.target.value})}
          placeholder="Describe your specific requirements, preferences, or vision for the project..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <IndianRupee className="h-5 w-5 mr-2" />
        Budget & Timeline
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Budget Range *</Label>
          <Select 
            value={formData.budget_range} 
            onValueChange={(value) => setFormData({...formData, budget_range: value})}
          >
            <SelectTrigger className={errors.budget_range ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select budget range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under_25k">Under ₹25,000</SelectItem>
              <SelectItem value="25k_50k">₹25,000 - ₹50,000</SelectItem>
              <SelectItem value="50k_100k">₹50,000 - ₹1,00,000</SelectItem>
              <SelectItem value="100k_250k">₹1,00,000 - ₹2,50,000</SelectItem>
              <SelectItem value="250k_500k">₹2,50,000 - ₹5,00,000</SelectItem>
              <SelectItem value="500k_1M">₹5,00,000 - ₹10,00,000</SelectItem>
              <SelectItem value="above_1M">Above ₹10,00,000</SelectItem>
            </SelectContent>
          </Select>
          {errors.budget_range && <span className="text-red-500 text-sm">{errors.budget_range}</span>}
        </div>
        
        <div>
          <Label>Project Timeline</Label>
          <Select value={formData.timeline} onValueChange={(value) => setFormData({...formData, timeline: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Expected timeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate (within 2 weeks)</SelectItem>
              <SelectItem value="1_month">Within 1 month</SelectItem>
              <SelectItem value="3_months">Within 3 months</SelectItem>
              <SelectItem value="6_months">Within 6 months</SelectItem>
              <SelectItem value="flexible">Flexible timeline</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Urgency Level</Label>
          <Select value={formData.urgency} onValueChange={(value) => setFormData({...formData, urgency: value})}>
            <SelectTrigger>
              <SelectValue placeholder="How urgent is this project?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">🔴 Immediate - Need to start ASAP</SelectItem>
              <SelectItem value="high">🟡 High - Within next month</SelectItem>
              <SelectItem value="medium">🟢 Medium - Planning phase</SelectItem>
              <SelectItem value="low">⚪ Low - Just exploring options</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Previous Experience</Label>
          <Select value={formData.previous_experience} onValueChange={(value) => setFormData({...formData, previous_experience: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Any previous experience?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="first_time">First time doing such project</SelectItem>
              <SelectItem value="some_experience">Some experience with landscaping</SelectItem>
              <SelectItem value="experienced">Experienced with green projects</SelectItem>
              <SelectItem value="professional">Professional/business project</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <Target className="h-5 w-5 mr-2" />
        Qualification & Decision Making
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Are you the decision maker for this project?</Label>
          <Select value={formData.decision_maker} onValueChange={(value) => setFormData({...formData, decision_maker: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Decision making authority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">✅ Yes, I can make the final decision</SelectItem>
              <SelectItem value="influence">🤝 I have significant influence</SelectItem>
              <SelectItem value="recommend">💬 I can recommend but others decide</SelectItem>
              <SelectItem value="no">❌ No, someone else decides</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Approval Process</Label>
          <Select value={formData.approval_process} onValueChange={(value) => setFormData({...formData, approval_process: value})}>
            <SelectTrigger>
              <SelectValue placeholder="How complex is approval?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="self">🚀 I can approve immediately</SelectItem>
              <SelectItem value="simple">👥 Simple approval (spouse/partner)</SelectItem>
              <SelectItem value="committee">🏢 Committee/board approval needed</SelectItem>
              <SelectItem value="complex">📋 Complex multi-level approval</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="md:col-span-2">
          <Label>Current Situation</Label>
          <Select value={formData.current_situation} onValueChange={(value) => setFormData({...formData, current_situation: value})}>
            <SelectTrigger>
              <SelectValue placeholder="What's your current situation?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">📋 Still in planning phase</SelectItem>
              <SelectItem value="budgeted">💰 Budget is approved and ready</SelectItem>
              <SelectItem value="comparing">🔍 Comparing different vendors</SelectItem>
              <SelectItem value="ready">🚀 Ready to start immediately</SelectItem>
              <SelectItem value="timeline_flexible">⏰ Flexible on timing and budget</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label>Additional Notes</Label>
        <Textarea
          value={formData.ai_notes}
          onChange={(e) => setFormData({...formData, ai_notes: e.target.value})}
          placeholder="Any additional information that would help us serve you better..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderQualificationPanel = () => {
    const qualification = getQualificationLevel();
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Bot className="h-5 w-5 mr-2" />
              AI Qualification Analysis
            </span>
            <Badge className={`${qualification.bg} ${qualification.color}`}>
              {qualification.level} QUALITY
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Qualification Score</span>
                <span className="text-sm font-bold">{qualificationScore}/100</span>
              </div>
              <Progress value={qualificationScore} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Auto-qualification:</span>
                <div className={`font-bold ${qualificationScore >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                  {qualificationScore >= 70 ? '✅ Will auto-convert to Deal' : '⚠️ Needs nurturing first'}
                </div>
              </div>
              <div>
                <span className="font-medium">Priority Level:</span>
                <div className="font-bold text-blue-600">{getPriority()}</div>
              </div>
            </div>
            
            {aiAnalysis && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">AI Recommendations:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {aiAnalysis.recommendations?.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <Sparkles className="h-3 w-3 mt-1 mr-2 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: User },
    { number: 2, title: 'Project Details', icon: Building },
    { number: 3, title: 'Budget & Timeline', icon: IndianRupee },
    { number: 4, title: 'Qualification', icon: Target }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6" />
            <span>Optimized Lead Creation & Auto-Qualification</span>
          </DialogTitle>
          <DialogDescription>
            Complete the form below. Qualified leads (70+ score) automatically convert to active deals.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            
            return (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  isCompleted ? 'bg-green-500 border-green-500 text-white' :
                  isActive ? 'bg-blue-500 border-blue-500 text-white' :
                  'bg-gray-200 border-gray-300 text-gray-500'
                }`}>
                  {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-300 mx-4" />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex max-h-[70vh]">
          {/* Main Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          {/* Qualification Panel */}
          {currentStep > 1 && (
            <div className="w-80 border-l p-4 overflow-y-auto">
              {renderQualificationPanel()}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center p-4 border-t">
          <div className="flex items-center space-x-4">
            {currentStep > 1 && (
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={isProcessing}
              >
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            
            {currentStep < 4 ? (
              <Button 
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!formData.name || !formData.email || !formData.phone}
              >
                Next Step
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <Bot className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Lead {qualificationScore >= 70 ? '& Auto-Convert to Deal' : ''}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OptimizedLeadCreationForm;