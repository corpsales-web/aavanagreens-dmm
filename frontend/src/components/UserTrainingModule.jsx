import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  BookOpen, Play, Pause, RotateCcw, CheckCircle, Clock, Star,
  Video, FileText, Headphones, Monitor, Smartphone, Award,
  Users, Target, TrendingUp, Search, Filter, Eye, Download
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const UserTrainingModule = ({ isOpen, onClose }) => {
  // State Management
  const [activeCategory, setActiveCategory] = useState('getting_started');
  const [courses, setCourses] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal States
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Training Categories
  const categories = [
    { id: 'getting_started', name: 'Getting Started', icon: '🚀', description: 'Basic app navigation and setup' },
    { id: 'crm_basics', name: 'CRM Basics', icon: '👥', description: 'Lead management and customer relations' },
    { id: 'hrms_features', name: 'HRMS Features', icon: '👤', description: 'Employee management and attendance' },
    { id: 'ai_tools', name: 'AI Tools', icon: '🤖', description: 'AI-powered features and automation' },
    { id: 'sales_pipeline', name: 'Sales Pipeline', icon: '📊', description: 'Deal management and forecasting' },
    { id: 'task_management', name: 'Task Management', icon: '✅', description: 'Productivity and collaboration tools' },
    { id: 'advanced_features', name: 'Advanced Features', icon: '⚡', description: 'Power user tips and tricks' },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: '🔧', description: 'Common issues and solutions' }
  ];

  // Initialize training data
  useEffect(() => {
    if (isOpen) {
      initializeTrainingData();
    }
  }, [isOpen]);

  const initializeTrainingData = async () => {
    setLoading(true);
    try {
      // Initialize comprehensive training courses
      setCourses([
        // Getting Started
        {
          id: '1',
          title: 'Welcome to Aavana Greens CRM',
          description: 'Complete introduction to your new CRM system',
          category: 'getting_started',
          difficulty: 'beginner',
          duration: '15 min',
          type: 'video',
          thumbnail: '/images/training/welcome-course.jpg',
          rating: 4.9,
          enrolled: 1247,
          completed: 1098,
          lessons: [
            {
              id: '1-1',
              title: 'System Overview',
              type: 'video',
              duration: '3 min',
              video_url: '/videos/training/system-overview.mp4',
              completed: false
            },
            {
              id: '1-2',
              title: 'Navigation Basics',
              type: 'interactive',
              duration: '5 min',
              content: 'Interactive tutorial on navigating the interface',
              completed: false
            },
            {
              id: '1-3',
              title: 'Your First Login',
              type: 'video',
              duration: '4 min',
              video_url: '/videos/training/first-login.mp4',
              completed: false
            },
            {
              id: '1-4',
              title: 'Quick Setup Guide',
              type: 'document',
              duration: '3 min',
              document_url: '/docs/training/quick-setup.pdf',
              completed: false
            }
          ]
        },
        {
          id: '2',
          title: 'Dashboard Mastery',
          description: 'Learn to use the dashboard effectively',
          category: 'getting_started',
          difficulty: 'beginner',
          duration: '20 min',
          type: 'video',
          thumbnail: '/images/training/dashboard-course.jpg',
          rating: 4.7,
          enrolled: 1156,
          completed: 892,
          lessons: [
            {
              id: '2-1',
              title: 'Dashboard Widgets',
              type: 'video',
              duration: '6 min',
              video_url: '/videos/training/dashboard-widgets.mp4',
              completed: false
            },
            {
              id: '2-2',
              title: 'Customizing Your View',
              type: 'interactive',
              duration: '8 min',
              content: 'Hands-on dashboard customization',
              completed: false
            },
            {
              id: '2-3',
              title: 'Analytics & Reports',
              type: 'video',
              duration: '6 min',
              video_url: '/videos/training/analytics-reports.mp4',
              completed: false
            }
          ]
        },
        
        // CRM Basics
        {
          id: '3',
          title: 'Lead Management Fundamentals',
          description: 'Master lead capture, qualification, and nurturing',
          category: 'crm_basics',
          difficulty: 'beginner',
          duration: '30 min',
          type: 'mixed',
          thumbnail: '/images/training/lead-management.jpg',
          rating: 4.8,
          enrolled: 1034,
          completed: 756,
          lessons: [
            {
              id: '3-1',
              title: 'Understanding Leads',
              type: 'video',
              duration: '5 min',
              video_url: '/videos/training/understanding-leads.mp4',
              completed: false
            },
            {
              id: '3-2',
              title: 'Adding New Leads',
              type: 'interactive',
              duration: '8 min',
              content: 'Practice adding leads with different sources',
              completed: false
            },
            {
              id: '3-3',
              title: 'Lead Qualification Process',
              type: 'video',
              duration: '10 min',
              video_url: '/videos/training/lead-qualification.mp4',
              completed: false
            },
            {
              id: '3-4',
              title: 'Follow-up Strategies',
              type: 'document',
              duration: '7 min',
              document_url: '/docs/training/followup-strategies.pdf',
              completed: false
            }
          ]
        },
        {
          id: '4',
          title: 'Customer Communication Tools',
          description: 'Email, WhatsApp, calls, and meeting scheduling',
          category: 'crm_basics',
          difficulty: 'intermediate',
          duration: '25 min',
          type: 'mixed',
          thumbnail: '/images/training/communication-tools.jpg',
          rating: 4.6,
          enrolled: 867,
          completed: 623,
          lessons: [
            {
              id: '4-1',
              title: 'Email Integration',
              type: 'video',
              duration: '8 min',
              video_url: '/videos/training/email-integration.mp4',
              completed: false
            },
            {
              id: '4-2',
              title: 'WhatsApp Business Features',
              type: 'interactive',
              duration: '7 min',
              content: 'WhatsApp messaging and templates',
              completed: false
            },
            {
              id: '4-3',
              title: 'Call Management',
              type: 'video',
              duration: '6 min',
              video_url: '/videos/training/call-management.mp4',
              completed: false
            },
            {
              id: '4-4',
              title: 'Meeting Scheduler',
              type: 'interactive',
              duration: '4 min',
              content: 'Practice scheduling meetings',
              completed: false
            }
          ]
        },

        // HRMS Features
        {
          id: '5',
          title: 'HRMS Complete Guide',
          description: 'Employee management, attendance, and performance tracking',
          category: 'hrms_features',
          difficulty: 'intermediate',
          duration: '35 min',
          type: 'comprehensive',
          thumbnail: '/images/training/hrms-guide.jpg',
          rating: 4.7,
          enrolled: 689,
          completed: 445,
          lessons: [
            {
              id: '5-1',
              title: 'Face Check-in System',
              type: 'video',
              duration: '8 min',
              video_url: '/videos/training/face-checkin.mp4',
              completed: false
            },
            {
              id: '5-2',
              title: 'Camera Troubleshooting',
              type: 'interactive',
              duration: '5 min',
              content: 'Common camera issues and fixes',
              completed: false
            },
            {
              id: '5-3',
              title: 'Leave Management System',
              type: 'video',
              duration: '10 min',
              video_url: '/videos/training/leave-management.mp4',
              completed: false
            },
            {
              id: '5-4',
              title: 'Attendance Reporting',
              type: 'interactive',
              duration: '7 min',
              content: 'Generate and analyze attendance reports',
              completed: false
            },
            {
              id: '5-5',
              title: 'Performance Tracking',
              type: 'video',
              duration: '5 min',
              video_url: '/videos/training/performance-tracking.mp4',
              completed: false
            }
          ]
        },

        // AI Tools
        {
          id: '6',
          title: 'AI-Powered Productivity',
          description: 'Master Aavana 2.0 AI assistant and automation tools',
          category: 'ai_tools',
          difficulty: 'intermediate',
          duration: '40 min',
          type: 'advanced',
          thumbnail: '/images/training/ai-productivity.jpg',
          rating: 4.9,
          enrolled: 743,
          completed: 521,
          lessons: [
            {
              id: '6-1',
              title: 'Aavana 2.0 Introduction',
              type: 'video',
              duration: '6 min',
              video_url: '/videos/training/aavana-2-intro.mp4',
              completed: false
            },
            {
              id: '6-2',
              title: 'Voice Commands & Chat',
              type: 'interactive',
              duration: '10 min',
              content: 'Practice using AI voice commands',
              completed: false
            },
            {
              id: '6-3',
              title: 'AI Content Generation',
              type: 'video',
              duration: '8 min',
              video_url: '/videos/training/ai-content-generation.mp4',
              completed: false
            },
            {
              id: '6-4',
              title: 'Workflow Automation',
              type: 'interactive',
              duration: '10 min',
              content: 'Set up automated workflows',
              completed: false
            },
            {
              id: '6-5',
              title: 'AI Analytics & Insights',
              type: 'video',
              duration: '6 min',
              video_url: '/videos/training/ai-analytics.mp4',
              completed: false
            }
          ]
        },

        // Sales Pipeline
        {
          id: '7',
          title: 'Sales Pipeline Excellence',
          description: 'Advanced deal management and forecasting',
          category: 'sales_pipeline',
          difficulty: 'intermediate',
          duration: '45 min',
          type: 'comprehensive',
          thumbnail: '/images/training/sales-pipeline.jpg',
          rating: 4.8,
          enrolled: 598,
          completed: 423,
          lessons: [
            {
              id: '7-1',
              title: 'Pipeline Overview',
              type: 'video',
              duration: '7 min',
              video_url: '/videos/training/pipeline-overview.mp4',
              completed: false
            },
            {
              id: '7-2',
              title: 'Deal Management',
              type: 'interactive',
              duration: '12 min',
              content: 'Create and manage deals through stages',
              completed: false
            },
            {
              id: '7-3',
              title: 'AI Deal Predictions',
              type: 'video',
              duration: '8 min',
              video_url: '/videos/training/ai-deal-predictions.mp4',
              completed: false
            },
            {
              id: '7-4',
              title: 'Sales Analytics',
              type: 'interactive',
              duration: '10 min',
              content: 'Interpret sales data and forecasts',
              completed: false
            },
            {
              id: '7-5',
              title: 'Pipeline Optimization',
              type: 'video',
              duration: '8 min',
              video_url: '/videos/training/pipeline-optimization.mp4',
              completed: false
            }
          ]
        },

        // Task Management
        {
          id: '8',
          title: 'Advanced Task Management',
          description: 'Team collaboration, automation, and productivity',
          category: 'task_management',
          difficulty: 'intermediate',
          duration: '30 min',
          type: 'practical',
          thumbnail: '/images/training/task-management.jpg',
          rating: 4.6,
          enrolled: 712,
          completed: 534,
          lessons: [
            {
              id: '8-1',
              title: 'Task Creation & Organization',
              type: 'interactive',
              duration: '8 min',
              content: 'Organize tasks effectively',
              completed: false
            },
            {
              id: '8-2',
              title: 'Team Collaboration',
              type: 'video',
              duration: '10 min',
              video_url: '/videos/training/team-collaboration.mp4',
              completed: false
            },
            {
              id: '8-3',
              title: 'Voice-to-Task Feature',
              type: 'interactive',
              duration: '5 min',
              content: 'Create tasks using voice commands',
              completed: false
            },
            {
              id: '8-4',
              title: 'Task Automation',
              type: 'video',
              duration: '7 min',
              video_url: '/videos/training/task-automation.mp4',
              completed: false
            }
          ]
        },

        // Advanced Features
        {
          id: '9',
          title: 'Power User Techniques',
          description: 'Advanced tips, shortcuts, and integrations',
          category: 'advanced_features',
          difficulty: 'advanced',
          duration: '50 min',
          type: 'masterclass',
          thumbnail: '/images/training/power-user.jpg',
          rating: 4.9,
          enrolled: 356,
          completed: 234,
          lessons: [
            {
              id: '9-1',
              title: 'Keyboard Shortcuts',
              type: 'document',
              duration: '5 min',
              document_url: '/docs/training/keyboard-shortcuts.pdf',
              completed: false
            },
            {
              id: '9-2',
              title: 'Advanced Filters',
              type: 'interactive',
              duration: '12 min',
              content: 'Master complex filtering and search',
              completed: false
            },
            {
              id: '9-3',
              title: 'Custom Workflows',
              type: 'video',
              duration: '15 min',
              video_url: '/videos/training/custom-workflows.mp4',
              completed: false
            },
            {
              id: '9-4',
              title: 'Integration Setup',
              type: 'interactive',
              duration: '10 min',
              content: 'Connect external tools and services',
              completed: false
            },
            {
              id: '9-5',
              title: 'Performance Optimization',
              type: 'video',
              duration: '8 min',
              video_url: '/videos/training/performance-optimization.mp4',
              completed: false
            }
          ]
        },

        // Troubleshooting
        {
          id: '10',
          title: 'Common Issues & Solutions',
          description: 'Troubleshoot problems and get quick fixes',
          category: 'troubleshooting',
          difficulty: 'beginner',
          duration: '20 min',
          type: 'reference',
          thumbnail: '/images/training/troubleshooting.jpg',
          rating: 4.5,
          enrolled: 892,
          completed: 678,
          lessons: [
            {
              id: '10-1',
              title: 'Camera Not Working',
              type: 'interactive',
              duration: '5 min',
              content: 'Step-by-step camera troubleshooting',
              completed: false
            },
            {
              id: '10-2',
              title: 'Login Problems',
              type: 'document',
              duration: '3 min',
              document_url: '/docs/training/login-issues.pdf',
              completed: false
            },
            {
              id: '10-3',
              title: 'Slow Performance',
              type: 'video',
              duration: '6 min',
              video_url: '/videos/training/performance-issues.mp4',
              completed: false
            },
            {
              id: '10-4',
              title: 'Data Sync Issues',
              type: 'interactive',
              duration: '6 min',
              content: 'Resolve synchronization problems',
              completed: false
            }
          ]
        }
      ]);

      // Initialize user progress (mock data)
      setUserProgress({
        completedCourses: ['1', '2'],
        completedLessons: ['1-1', '1-2', '1-3', '1-4', '2-1', '2-2', '2-3'],
        currentCourse: '3',
        currentLesson: '3-1',
        totalWatchTime: 145, // minutes
        certificatesEarned: ['getting_started'],
        streak: 7, // days
        level: 'Intermediate'
      });

    } catch (error) {
      console.error('Training data initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Course Management Functions
  const startCourse = (course) => {
    setSelectedCourse(course);
    setCurrentLesson(course.lessons[0]);
    setShowCourseModal(true);
  };

  const startLesson = (lesson) => {
    setCurrentLesson(lesson);
    setShowLessonModal(true);
    
    if (lesson.type === 'video') {
      setPlayingVideo(lesson.id);
    }
  };

  const completeLesson = (lessonId) => {
    setUserProgress(prev => ({
      ...prev,
      completedLessons: [...prev.completedLessons, lessonId]
    }));

    // Mark lesson as completed
    if (selectedCourse) {
      const updatedCourse = {
        ...selectedCourse,
        lessons: selectedCourse.lessons.map(lesson =>
          lesson.id === lessonId ? { ...lesson, completed: true } : lesson
        )
      };
      setSelectedCourse(updatedCourse);
    }
  };

  const getCompletionRate = (course) => {
    const completedLessons = course.lessons.filter(lesson => 
      userProgress.completedLessons?.includes(lesson.id)
    ).length;
    return Math.round((completedLessons / course.lessons.length) * 100);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'interactive': return <Monitor className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'audio': return <Headphones className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getFilteredCourses = () => {
    let filtered = courses.filter(course => course.category === activeCategory);
    
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Render Functions
  const renderCourseGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {getFilteredCourses().map((course) => {
        const completionRate = getCompletionRate(course);
        const isCompleted = completionRate === 100;
        
        return (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="aspect-video bg-gray-100 rounded-t-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">{categories.find(c => c.id === course.category)?.icon}</div>
                  <Badge className={getDifficultyColor(course.difficulty)}>
                    {course.difficulty}
                  </Badge>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{course.title}</h3>
                  {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{course.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{course.enrolled}</span>
                  </div>
                </div>
                
                {completionRate > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-medium">{completionRate}%</span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => startCourse(course)}
                    className="flex-1"
                    variant={isCompleted ? "outline" : "default"}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {completionRate > 0 && completionRate < 100 ? 'Continue' : 
                     isCompleted ? 'Review' : 'Start'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderUserProgress = () => (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Award className="h-5 w-5 text-blue-600" />
          <span>Your Learning Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{userProgress.completedCourses?.length || 0}</div>
            <div className="text-sm text-gray-600">Courses Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{userProgress.totalWatchTime || 0}</div>
            <div className="text-sm text-gray-600">Minutes Learned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{userProgress.streak || 0}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{userProgress.certificatesEarned?.length || 0}</div>
            <div className="text-sm text-gray-600">Certificates</div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
            {userProgress.level || 'Beginner'} Level
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>User Training & Learning Center</span>
          </DialogTitle>
          <DialogDescription>
            Master all features of Aavana Greens CRM with comprehensive video tutorials and interactive guides
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-[80vh]">
          {/* Sidebar - Categories */}
          <div className="w-64 border-r p-4 overflow-y-auto">
            <div className="space-y-1 mb-6">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? 'default' : 'ghost'}
                  className="w-full justify-start text-left"
                  onClick={() => setActiveCategory(category.id)}
                >
                  <span className="mr-2">{category.icon}</span>
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xs text-gray-500">{category.description}</div>
                  </div>
                </Button>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Quick Stats</div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>📚 {courses.length} Total Courses</div>
                <div>⏱️ {courses.reduce((acc, course) => acc + parseInt(course.duration), 0)} Total Minutes</div>
                <div>🎯 {userProgress.completedCourses?.length || 0} Completed</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading training content...</span>
              </div>
            )}

            {!loading && (
              <div className="space-y-6">
                {/* User Progress Overview */}
                {renderUserProgress()}

                {/* Search Bar */}
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search courses..."
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category Header */}
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {categories.find(c => c.id === activeCategory)?.icon}
                  </span>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {categories.find(c => c.id === activeCategory)?.name}
                    </h2>
                    <p className="text-gray-600">
                      {categories.find(c => c.id === activeCategory)?.description}
                    </p>
                  </div>
                </div>

                {/* Course Grid */}
                {renderCourseGrid()}
              </div>
            )}
          </div>
        </div>

        {/* Course Modal */}
        <Dialog open={showCourseModal} onOpenChange={setShowCourseModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedCourse?.title}</DialogTitle>
              <DialogDescription>{selectedCourse?.description}</DialogDescription>
            </DialogHeader>
            
            {selectedCourse && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge className={getDifficultyColor(selectedCourse.difficulty)}>
                      {selectedCourse.difficulty}
                    </Badge>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{selectedCourse.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{selectedCourse.rating}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Progress</div>
                    <div className="font-semibold">{getCompletionRate(selectedCourse)}%</div>
                  </div>
                </div>

                <div className="grid gap-4">
                  {selectedCourse.lessons.map((lesson, index) => {
                    const isCompleted = userProgress.completedLessons?.includes(lesson.id);
                    const isActive = currentLesson?.id === lesson.id;
                    
                    return (
                      <Card key={lesson.id} className={`hover:shadow-md transition-shadow ${isActive ? 'ring-2 ring-blue-500' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                                {isCompleted ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <span className="text-sm font-medium">{index + 1}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">{lesson.title}</h4>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  {getTypeIcon(lesson.type)}
                                  <span className="capitalize">{lesson.type}</span>
                                  <span>•</span>
                                  <Clock className="h-3 w-3" />
                                  <span>{lesson.duration}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => startLesson(lesson)}
                                variant={isCompleted ? "outline" : "default"}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                {isCompleted ? 'Review' : 'Start'}
                              </Button>
                              {!isCompleted && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => completeLesson(lesson.id)}
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Lesson Modal */}
        <Dialog open={showLessonModal} onOpenChange={setShowLessonModal}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{currentLesson?.title}</DialogTitle>
            </DialogHeader>
            
            {currentLesson && (
              <div className="space-y-4">
                {currentLesson.type === 'video' && (
                  <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <Video className="h-16 w-16 mx-auto mb-4" />
                      <p>Video Player</p>
                      <p className="text-sm text-gray-300">{currentLesson.video_url}</p>
                    </div>
                  </div>
                )}
                
                {currentLesson.type === 'interactive' && (
                  <div className="aspect-video bg-blue-50 rounded-lg flex items-center justify-center border-2 border-blue-200">
                    <div className="text-center">
                      <Monitor className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                      <p className="text-lg font-medium text-blue-800">Interactive Tutorial</p>
                      <p className="text-blue-600">{currentLesson.content}</p>
                    </div>
                  </div>
                )}
                
                {currentLesson.type === 'document' && (
                  <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center border-2 border-gray-200">
                    <div className="text-center">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-lg font-medium text-gray-800">Document Resource</p>
                      <p className="text-gray-600">{currentLesson.document_url}</p>
                      <Button className="mt-4">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4">
                  <div className="text-sm text-gray-600">
                    Duration: {currentLesson.duration}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setShowLessonModal(false)}>
                      Close
                    </Button>
                    <Button onClick={() => completeLesson(currentLesson.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default UserTrainingModule;