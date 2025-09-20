import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import { Progress } from './components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Separator } from './components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Activity, Users, Target, CheckCircle, Package, UserCheck, Brain, Settings, Plus, Upload, Camera, Phone, MessageCircle, Mail, Image, FileText, Edit, MessageSquare, Star, MapPin, Calendar, Clock, DollarSign, TrendingUp, UserPlus, Download, Share, Heart, MoreHorizontal, Filter, Search, Bell, X, Mic, MicOff, Volume2, VolumeX, Play, Pause, RotateCcw, Send, Sparkles, Zap, RefreshCw, AlertCircle, CheckCircle2, Info, Globe, Smartphone, Monitor, Tablet, BookOpen } from 'lucide-react';
// Import responsive styles
import './styles/responsive.css';
import FileUploadComponent from './components/FileUploadComponent';
import LeadActionsPanel from './components/LeadActionsPanel';
import VoiceSTTComponent from './components/VoiceSTTComponent';
import RoleManagementPanel from './components/RoleManagementPanel';
import NotificationSystem from './components/NotificationSystem';
import FaceCheckInComponent from './components/FaceCheckInComponent';
import BulkExcelUploadComponent from './components/BulkExcelUploadComponent';
import DigitalMarketingDashboard from './components/DigitalMarketingDashboard';
import LeadRoutingPanel from './components/LeadRoutingPanel';
import WorkflowAuthoringPanel from './components/WorkflowAuthoringPanel';
import CameraComponent from './components/CameraComponent';
import EnhancedFileUploadHeader from './components/EnhancedFileUploadHeader';
import Aavana2Assistant from './components/Aavana2Assistant';
import GoalsManagementSystem from './components/GoalsManagementSystem';
import ComprehensiveDigitalMarketingManager from './components/ComprehensiveDigitalMarketingManager';
import notificationManager from './utils/notificationManager';
import FloatingChatbot from './components/FloatingChatbot';
import axios from 'axios';
import { useToast } from './hooks/use-toast';
import { toast } from './hooks/use-toast';
import indianCitiesStates from './data/indianCitiesStates';
// Import new tab system
import { TabProvider } from './contexts/TabContext';
import TabNavigation from './components/TabNavigation'; 
import TabContent from './components/TabContent';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const App = () => {
  // Core State Management
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [dashboardStats, setDashboardStats] = useState({
    totalLeads: 0,
    activeLeads: 0,
    conversion_rate: 0,
    totalRevenue: 0,
    pendingTasks: 0
  });
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  
  // UI States
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadActionType, setLeadActionType] = useState(null);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [showVoiceSTTModal, setShowVoiceSTTModal] = useState(false);
  const [showLeadActionsPanel, setShowLeadActionsPanel] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  
  // Admin States
  const [activeAdminPanel, setActiveAdminPanel] = useState('overview');
  const [currentUser, setCurrentUser] = useState(null);
  
  // AI States
  const [aiInsights, setAiInsights] = useState([]);
  
  // New Modal States
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showMarketingModal, setShowMarketingModal] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);

  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  
  // Notification State
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'New Lead Assigned',
      message: 'TechCorp Solutions lead has been assigned to you',
      type: 'lead',
      timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      read: false
    },
    {
      id: '2', 
      title: 'Deal Stage Updated',
      message: 'Green Building Complex deal moved to Contract stage',
      type: 'deal',
      timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
      read: false
    },
    {
      id: '3',
      title: 'Task Due Soon',
      message: 'Site visit task is due in 2 hours',
      type: 'task',
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      read: true
    }
  ]);

  // Form States
  const [newLead, setNewLead] = useState({
    name: '', phone: '', email: '', budget: '', space_size: '', location: '', source: '', category: '', notes: ''
  });
  const [newTask, setNewTask] = useState({
    title: '', description: '', assignee: '', priority: 'Medium', due_date: '', category: 'General'
  });

  // Initialize data on component mount
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchLeads(),
        fetchTasks(),
        checkAuthentication()
      ]);
    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      setLoading(false);
    }
  };
  // Dev Tools: easy seeding + AI chat sanity
  const seedGallery = async () => {
    try {
      const res = await axios.post(`${API}/api/gallery/seed`, { count: 6, reset: true });
      toast({ title: 'Gallery Seeded', description: `Inserted: ${res.data?.inserted ?? 0}` });
    } catch (e) {
      toast({ title: 'Gallery Seed Failed', description: e?.response?.data?.detail || e.message, variant: 'destructive' });
    }
  };

  const quickAiPing = async () => {
    try {
      const res = await axios.post(`${API}/api/ai/chat`, { messages: [{ role: 'user', content: 'Hello AI, quick ping' }] });
      const msg = res.data?.response?.slice(0, 180) || 'OK';
      toast({ title: 'AI Chat OK', description: msg });
    } catch (e) {
      toast({ title: 'AI Chat Failed', description: e?.response?.data?.detail || e.message, variant: 'destructive' });
    }
  };


  // API Functions
  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${API}/api/dashboard/stats`);
      setDashboardStats(response.data);
    } catch (error) {
      console.error('Dashboard stats error:', error);
      // Fallback data
      setDashboardStats({
        totalLeads: 26,
        activeLeads: 18,
        conversion_rate: 75,
        totalRevenue: 125000,
        pendingTasks: 12
      });
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API}/api/leads`);
      setLeads(response.data);
    } catch (error) {
      console.error('Leads fetch error:', error);
      // Fallback demo data
      setLeads([
        {
          id: '1',
          name: 'Rajesh Kumar',
          phone: '9876543210',
          email: 'rajesh@example.com',
          budget: 5000000,
          space_size: '3 BHK',
          location: 'Mumbai, Maharashtra',
          source: 'Website',
          category: 'Hot',
          status: 'New',
          notes: 'Interested in premium villa projects',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Priya Sharma',
          phone: '9876543211',
          email: 'priya@example.com',
          budget: 3500000,
          space_size: '2 BHK',
          location: 'Pune, Maharashtra',
          source: 'Referral',
          category: 'Warm',
          status: 'Contacted',
          notes: 'Looking for apartment near IT hub',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Amit Patel',
          phone: '9876543212',
          email: 'amit@example.com',
          budget: 7500000,
          space_size: '4 BHK',
          location: 'Bangalore, Karnataka',
          source: 'Social Media',
          category: 'Hot',
          status: 'Qualified',
          notes: 'Corporate executive, ready to invest',
          created_at: new Date().toISOString()
        }
      ]);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API}/api/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Tasks fetch error:', error);
      // Fallback demo data
      setTasks([
        {
          id: '1',
          title: 'Follow up with Rajesh Kumar',
          description: 'Schedule site visit for premium villa',
          assignee: 'Sales Team',
          priority: 'High',
          status: 'Pending',
          due_date: '2024-01-15',
          category: 'Sales',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Prepare proposal for Priya Sharma',
          description: 'Create customized apartment proposal',
          assignee: 'Marketing Team',
          priority: 'Medium',
          status: 'In Progress',
          due_date: '2024-01-12',
          category: 'Marketing',
          created_at: new Date().toISOString()
        }
      ]);
    }
  };

  // Notification Functions
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    ));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  const getUnreadNotificationCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const addNotification = (title, message, type = 'info') => {
    const newNotification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const checkAuthentication = () => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('current_user');
    if (token && user) {
      setCurrentUser(JSON.parse(user));
    }
  };

  // Legacy function - now handled by TabContext
  const showContent = (tabName) => {
    console.log(`🔄 LEGACY TAB SWITCH: ${tabName} - Now handled by TabContext`);
  };

  // Action completion handler for lead actions
  const handleActionComplete = (result) => {
    console.log('Action completed:', result);
    setShowLeadActionsPanel(false);
    // Refresh data if needed
    if (result.success) {
      fetchLeads();
    }
  };

  // Lead Management Functions
  const createLead = async (leadData) => {
    try {
      const response = await axios.post(`${API}/api/leads`, leadData);
      setLeads(prev => [...prev, response.data]);
      setShowAddLeadModal(false);
      setNewLead({ name: '', phone: '', email: '', budget: '', space_size: '', location: '', source: '', category: '', notes: '' });
      toast({ title: "Success", description: "Lead created successfully" });
    } catch (error) {
      console.error('Create lead error:', error);
      toast({ title: "Error", description: "Failed to create lead" });
    }
  };

  const updateLead = async (leadId, updates) => {
    try {
      const response = await axios.put(`${API}/api/leads/${leadId}`, updates);
      setLeads(prev => prev.map(lead => lead.id === leadId ? response.data : lead));
      toast({ title: "Success", description: "Lead updated successfully" });
    } catch (error) {
      console.error('Update lead error:', error);
      toast({ title: "Error", description: "Failed to update lead" });
    }
  };

  // Task Management Functions
  const createTask = async (taskData) => {
    try {
      const response = await axios.post(`${API}/api/tasks`, taskData);
      setTasks(prev => [...prev, response.data]);
      setShowAddTaskModal(false);
      setNewTask({ title: '', description: '', assignee: '', priority: 'Medium', due_date: '', category: 'General' });
      toast({ title: "Success", description: "Task created successfully" });
    } catch (error) {
      console.error('Create task error:', error);
      toast({ title: "Error", description: "Failed to create task" });
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const response = await axios.put(`${API}/api/tasks/${taskId}/status`, { status });
      setTasks(prev => prev.map(task => task.id === taskId ? { ...task, status } : task));
      toast({ title: "Success", description: "Task status updated" });
    } catch (error) {
      console.error('Update task status error:', error);
      toast({ title: "Error", description: "Failed to update task status" });
    }
  };

  // Authentication Functions
  const handleLogin = async (credentials) => {
    try {
      const response = await axios.post(`${API}/api/auth/login`, credentials);
      const { access_token, user } = response.data;
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('current_user', JSON.stringify(user));
      setCurrentUser(user);
      toast({ title: "Success", description: "Logged in successfully" });
    } catch (error) {
      console.error('Login error:', error);
      toast({ title: "Error", description: "Login failed" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    setCurrentUser(null);
    toast({ title: "Success", description: "Logged out successfully" });
  };

  // Legacy content rendering - replaced by TabContent component
  const renderContent = () => {
    console.log(`🎯 LEGACY RENDER - Now handled by TabContent component`);
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Content now handled by TabContent component</p>
      </div>
    );
  };

  // Initialize notification manager and task monitoring
  useEffect(() => {
    // Initialize notification system
    notificationManager.init();

    // Listen for task completion from notifications
    const handleTaskCompleteFromNotification = (event) => {
      const { taskId } = event.detail;
      console.log(`✅ Task ${taskId} completed from notification`);
      // Here you would typically update task status in your state/API
      alert(`✅ Task marked as complete: ${taskId}`);
    };

    // Listen for task navigation from notifications
    const handleNavigateToTask = (event) => {
      const { taskId } = event.detail;
      console.log(`🔍 Navigating to task: ${taskId}`);
      // Navigate to tasks tab - would need TabContext integration
      // You can add logic here to highlight specific task
    };

    // Add event listeners
    window.addEventListener('taskCompleteFromNotification', handleTaskCompleteFromNotification);
    window.addEventListener('navigateToTask', handleNavigateToTask);

    // Cleanup
    return () => {
      window.removeEventListener('taskCompleteFromNotification', handleTaskCompleteFromNotification);
      window.removeEventListener('navigateToTask', handleNavigateToTask);
    };
  }, []);

  // Simulate task data for notifications (replace with real task data)
  useEffect(() => {
    // Mock task data - replace with actual task fetching
    const mockTasks = [
      {
        id: '1',
        title: 'Follow up with Mumbai client',
        description: 'Call regarding balcony garden consultation',
        priority: 'high',
        status: 'in_progress',
        due_date: '2024-01-20'
      },
      {
        id: '2',
        title: 'Prepare proposal for Delhi client',
        description: 'Create detailed proposal for rooftop garden',
        priority: 'medium',
        status: 'todo',
        due_date: '2024-01-25'
      }
    ];

    // Make tasks available globally for notification manager
    window.appTasks = mockTasks;

    // Test catalogue notification (simulate catalogue upload)
    setTimeout(() => {
      notificationManager.sendCatalogueNotification({
        id: 'cat-1',
        name: 'Green Building Catalogue 2024',
        uploadDate: new Date().toISOString()
      });
    }, 5000); // Send catalogue notification after 5 seconds

  }, []);

  return (
    <TabProvider>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
        {/* Header - Fully Responsive */}
        <header className="bg-white shadow-lg border-b-2 border-emerald-200">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            <div className="flex justify-between items-center py-2 sm:py-4">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm sm:text-lg">A</span>
                  </div>
                  <h1 className="ml-2 sm:ml-3 text-lg sm:text-2xl font-bold text-gray-900 hidden xs:block">
                    Aavana Greens CRM
                  </h1>
                  <h1 className="ml-2 text-sm font-bold text-gray-900 xs:hidden">
                    Aavana
                  </h1>
                </div>
              </div>

              <div className="flex items-center space-x-1 sm:space-x-4">
                {/* Dev Tools Toggle */}
                <button
                  onClick={() => setShowDevTools(!showDevTools)}
                  className="bg-gray-100 text-gray-700 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg hover:bg-gray-200 text-xs sm:text-sm"
                  title="Developer Quick Tools"
                >
                  Dev
                </button>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => setShowGoalsModal(true)}
                    className="bg-green-600 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-green-700 flex items-center text-xs sm:text-sm"
                  >
                    <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Goals</span>
                  </button>
                  <button
                    onClick={() => setShowMarketingModal(true)}
                    className="bg-orange-600 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-orange-700 flex items-center text-xs sm:text-sm"
                  >
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Marketing</span>
                  </button>
                  <button 
                    onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                    className="relative bg-gray-100 text-gray-700 p-1 sm:p-2 rounded-lg hover:bg-gray-200"
                  >
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                    {getUnreadNotificationCount() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs">
                        {getUnreadNotificationCount()}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* New Tab Navigation */}
            <TabNavigation />

            {/* Content Area - New Tab System */}
            {showDevTools && (
              <div className="p-3 rounded-lg border bg-white/70">
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={seedGallery}>Seed Gallery (6)</Button>
                  <Button variant="secondary" onClick={quickAiPing}>AI Chat Ping</Button>
                </div>
              </div>
            )}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <span className="ml-2 text-gray-600">Loading...</span>
              </div>
            ) : (
              <TabContent
                dashboardStats={dashboardStats}
                leads={leads}
                tasks={tasks}
                showLeadActionsPanel={showLeadActionsPanel}
                selectedLead={selectedLead}
                leadActionType={leadActionType}
                setShowLeadActionsPanel={setShowLeadActionsPanel}
                setSelectedLead={setSelectedLead}
                setLeadActionType={setLeadActionType}
                onActionComplete={handleActionComplete}
              />
            )}
          </div>
        </main>

        {/* Face Check-In removed - now available only in HRMS tab */}

        {/* Floating Chatbot - Aavana 2.0 AI Assistant */}
        <FloatingChatbot />

        {/* Goals Management Modal */}
        <GoalsManagementSystem 
          isOpen={showGoalsModal}
          onClose={() => setShowGoalsModal(false)}
        />

        {/* Comprehensive Digital Marketing Manager Modal */}
        <ComprehensiveDigitalMarketingManager 
          isOpen={showMarketingModal}
          onClose={() => setShowMarketingModal(false)}
        />

        {/* Notification Panel */}
        {showNotificationPanel && (
          <div className="fixed top-16 right-4 w-80 bg-white rounded-lg shadow-lg border z-50">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={() => setShowNotificationPanel(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="ml-2">
                        {notification.type === 'lead' && '🎯'}
                        {notification.type === 'deal' && '💼'}
                        {notification.type === 'task' && '✅'}
                        {notification.type === 'info' && 'ℹ️'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <div className="p-3 border-t bg-gray-50">
                <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View All Notifications
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </TabProvider>
  );
};

export default App;
