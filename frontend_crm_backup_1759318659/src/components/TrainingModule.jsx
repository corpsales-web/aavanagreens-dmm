import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  BookOpen, PlayCircle, FileText, Video, Download, Search, Filter,
  CheckCircle, Clock, Star, Users, TrendingUp, Award, Zap, Target,
  ChevronRight, Eye, Share, BookmarkPlus, Play, Pause, RotateCcw
} from 'lucide-react';

const TrainingModule = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedModule, setSelectedModule] = useState(null);

  // Training categories and modules
  const trainingCategories = [
    { id: 'all', name: 'All Modules', count: 24 },
    { id: 'leads', name: 'Lead Management', count: 6 },
    { id: 'pipeline', name: 'Sales Pipeline', count: 4 },
    { id: 'tasks', name: 'Task Management', count: 3 },
    { id: 'erp', name: 'ERP Systems', count: 5 },
    { id: 'hrms', name: 'HRMS & Attendance', count: 3 },
    { id: 'marketing', name: 'Digital Marketing', count: 3 }
  ];

  const trainingModules = [
    // Lead Management Training
    {
      id: 'lead-001',
      title: 'Lead Creation & Management Basics',
      description: 'Learn how to create, edit, and manage leads effectively in the CRM system',
      category: 'leads',
      type: 'pdf',
      duration: '15 min read',
      difficulty: 'Beginner',
      status: 'completed',
      progress: 100,
      steps: [
        'Creating new leads using the optimized form',
        'Understanding lead qualification process',
        'Using lead action buttons (Call, Email, WhatsApp)',
        'Lead filtering and search functionality',
        'Bulk lead operations and Excel uploads'
      ]
    },
    {
      id: 'lead-002',
      title: 'Advanced Lead Qualification Techniques',
      description: 'Master advanced lead scoring and qualification methods',
      category: 'leads',
      type: 'pdf',
      duration: '20 min read',
      difficulty: 'Intermediate',
      status: 'in-progress',
      progress: 60,
      steps: [
        'AI-powered lead scoring system',
        'Lead routing and assignment rules',
        'Follow-up automation setup',
        'Lead nurturing best practices',
        'Performance analytics and reporting'
      ]
    },
    {
      id: 'lead-003',
      title: 'WhatsApp Integration for Lead Communication',
      description: 'Learn to use WhatsApp integration for effective lead communication',
      category: 'leads',
      type: 'pdf',
      duration: '10 min read',
      difficulty: 'Beginner',
      status: 'not-started',
      progress: 0,
      steps: [
        'Setting up WhatsApp business integration',
        'Using WhatsApp templates for lead outreach',
        'Bulk WhatsApp messaging for campaigns',
        'Managing WhatsApp conversation history',
        'WhatsApp analytics and response tracking'
      ]
    },

    // Pipeline Management Training
    {
      id: 'pipeline-001',
      title: 'Sales Pipeline Setup & Management',
      description: 'Complete guide to setting up and managing your sales pipeline',
      category: 'pipeline',
      type: 'pdf',
      duration: '25 min read',
      difficulty: 'Intermediate',
      status: 'not-started',
      progress: 0,
      steps: [
        'Understanding pipeline stages and flow',
        'Deal creation from qualified leads',
        'Managing deal progression through stages',
        'Deal editing and update procedures',
        'Pipeline analytics and forecasting'
      ]
    },
    {
      id: 'pipeline-002',
      title: 'Deal Editing & Advanced Operations',
      description: 'Learn advanced deal management and editing techniques',
      category: 'pipeline',
      type: 'pdf',
      duration: '18 min read',
      difficulty: 'Intermediate',
      status: 'not-started',
      progress: 0,
      steps: [
        'Accessing deal edit modal functionality',
        'Updating deal values, stages, and probability',
        'Adding notes and comments to deals',
        'Deal collaboration and team assignments',
        'Deal history and audit trail tracking'
      ]
    },

    // Task Management Training
    {
      id: 'task-001',
      title: 'Task Creation & Management System',
      description: 'Master the enhanced task management system with AI features',
      category: 'tasks',
      type: 'pdf',
      duration: '20 min read',
      difficulty: 'Beginner',
      status: 'not-started',
      progress: 0,
      steps: [
        'Creating tasks manually and via voice commands',
        'Task prioritization and scheduling',
        'Project assignment and team collaboration',
        'Task editing and status updates',
        'AI automation and workflow integration'
      ]
    },
    {
      id: 'task-002',
      title: 'Voice-to-Task Conversion Features',
      description: 'Learn to use voice commands for efficient task creation',
      category: 'tasks',
      type: 'pdf',
      duration: '12 min read',
      difficulty: 'Intermediate',
      status: 'not-started',
      progress: 0,
      steps: [
        'Setting up microphone permissions',
        'Voice command patterns and examples',
        'AI-powered task extraction from speech',
        'Reviewing and editing voice-generated tasks',
        'Voice command best practices'
      ]
    },

    // ERP Training
    {
      id: 'erp-001',
      title: 'Project Gallery & Image Management',
      description: 'Complete guide to managing project images and gallery',
      category: 'erp',
      type: 'pdf',
      duration: '22 min read',
      difficulty: 'Beginner',
      status: 'not-started',
      progress: 0,
      steps: [
        'Uploading and organizing project images',
        'AI-powered image categorization',
        'Batch selection and operations',
        'Sharing images with clients via WhatsApp/Email',
        'Gallery management and maintenance'
      ]
    },
    {
      id: 'erp-002',
      title: 'Catalogue Management & Batch Operations',
      description: 'Learn to manage product catalogues and batch sending',
      category: 'erp',
      type: 'pdf',
      duration: '18 min read',
      difficulty: 'Intermediate',
      status: 'not-started',
      progress: 0,
      steps: [
        'Creating and organizing product catalogues',
        'Category management and filtering',
        'Batch catalogue selection (up to 50 items)',
        'Sending catalogues via WhatsApp and Email',
        'Catalogue analytics and performance tracking'
      ]
    },

    // Digital Marketing Training
    {
      id: 'marketing-001',
      title: 'UGC Campaign Creation & Management',
      description: 'Master User Generated Content campaigns for social media',
      category: 'marketing',
      type: 'pdf',
      duration: '25 min read',
      difficulty: 'Intermediate',
      status: 'not-started',
      progress: 0,
      steps: [
        'Understanding UGC campaign strategies',
        'Creating compelling UGC content briefs',
        'Managing UGC submissions and approvals',
        'Cross-platform UGC distribution',
        'Measuring UGC campaign effectiveness'
      ]
    },
    {
      id: 'marketing-002',
      title: 'Brand Content Creation & Strategy',
      description: 'Learn to create effective brand content across platforms',
      category: 'marketing',
      type: 'pdf',
      duration: '20 min read',
      difficulty: 'Intermediate',
      status: 'not-started',
      progress: 0,
      steps: [
        'Brand content planning and strategy',
        'Content creation tools and templates',
        'Platform-specific content optimization',
        'Brand voice and messaging consistency',
        'Content performance analytics'
      ]
    },

    // HRMS Training
    {
      id: 'hrms-001',
      title: 'Face Check-in System & Attendance',
      description: 'Complete guide to the biometric attendance system',
      category: 'hrms',
      type: 'pdf',
      duration: '15 min read',
      difficulty: 'Beginner',
      status: 'not-started',
      progress: 0,
      steps: [
        'Setting up face recognition for attendance',
        'Daily check-in and check-out procedures',
        'Handling attendance exceptions and corrections',
        'Generating attendance reports',
        'Mobile attendance and GPS integration'
      ]
    }
  ];

  // Filter modules based on search and category
  const filteredModules = trainingModules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <BookOpen className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training Center</h1>
          <p className="text-gray-600 mt-2">
            Master all features of Aavana Greens CRM with comprehensive training modules
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Award className="h-4 w-4 mr-1" />
            24 Modules Available
          </Badge>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search training modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex space-x-2 overflow-x-auto">
          {trainingCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              {category.name}
              <Badge variant="secondary" className="ml-2">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Training Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => (
          <Card key={module.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(module.status)}
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex space-x-1">
                  <Badge className={getDifficultyColor(module.difficulty)} variant="secondary">
                    {module.difficulty}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-lg leading-tight">
                {module.title}
              </CardTitle>
              <CardDescription>
                {module.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progress Bar */}
                {module.progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{module.progress}%</span>
                    </div>
                    <Progress value={module.progress} className="h-2" />
                  </div>
                )}

                {/* Module Info */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{module.duration}</span>
                  <Badge className={getStatusColor(module.status)} variant="secondary">
                    {module.status.replace('-', ' ')}
                  </Badge>
                </div>

                {/* Steps Preview */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">What you'll learn:</h4>
                  <ul className="space-y-1">
                    {module.steps.slice(0, 3).map((step, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start">
                        <ChevronRight className="h-3 w-3 mt-0.5 mr-1 flex-shrink-0" />
                        {step}
                      </li>
                    ))}
                    {module.steps.length > 3 && (
                      <li className="text-xs text-gray-500">
                        +{module.steps.length - 3} more topics...
                      </li>
                    )}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setSelectedModule(module)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {module.status === 'completed' ? 'Review' : 
                     module.status === 'in-progress' ? 'Continue' : 'Start'}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Training Module Detail Modal */}
      {selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedModule.title}</h2>
                  <p className="text-gray-600 mt-2">{selectedModule.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedModule(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Module Content */}
                <div className="md:col-span-2">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Badge className={getDifficultyColor(selectedModule.difficulty)}>
                        {selectedModule.difficulty}
                      </Badge>
                      <span className="text-sm text-gray-500">{selectedModule.duration}</span>
                      <Badge className={getStatusColor(selectedModule.status)}>
                        {selectedModule.status.replace('-', ' ')}
                      </Badge>
                    </div>

                    {selectedModule.progress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Your Progress</span>
                          <span>{selectedModule.progress}%</span>
                        </div>
                        <Progress value={selectedModule.progress} className="h-2" />
                      </div>
                    )}

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">📋 Module Outline</h3>
                      <ul className="space-y-2">
                        {selectedModule.steps.map((step, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                              {index + 1}
                            </div>
                            <span className="text-sm">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-yellow-600" />
                        Training Content Coming Soon
                      </h3>
                      <p className="text-sm text-gray-700">
                        Detailed PDF training materials with step-by-step instructions, screenshots, 
                        and best practices will be uploaded here. This module outline shows what 
                        will be covered in the comprehensive training document.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button className="w-full" size="sm">
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Start Module
                      </Button>
                      <Button variant="outline" className="w-full" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button variant="outline" className="w-full" size="sm">
                        <BookmarkPlus className="h-4 w-4 mr-2" />
                        Bookmark
                      </Button>
                      <Button variant="outline" className="w-full" size="sm">
                        <Share className="h-4 w-4 mr-2" />
                        Share Module
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Module Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Category</span>
                        <Badge variant="secondary">
                          {trainingCategories.find(c => c.id === selectedModule.category)?.name}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Difficulty</span>
                        <span className="text-sm font-medium">{selectedModule.difficulty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Duration</span>
                        <span className="text-sm font-medium">{selectedModule.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Topics</span>
                        <span className="text-sm font-medium">{selectedModule.steps.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredModules.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No training modules found</h3>
          <p className="text-gray-500">
            Try adjusting your search query or category filter.
          </p>
        </div>
      )}
    </div>
  );
};

export default TrainingModule;