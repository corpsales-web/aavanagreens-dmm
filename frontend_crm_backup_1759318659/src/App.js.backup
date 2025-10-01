import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";
import "./styles/badgeVisibilityFix.css"; // Badge visibility fix
import { autoSaveManager } from './utils/autosave';

// Import new components
import FileUploadComponent from './components/FileUploadComponent';
import LeadActionsPanel from './components/LeadActionsPanel';
import VoiceSTTComponent from './components/VoiceSTTComponent';
import RoleManagementPanel from './components/RoleManagementPanel';
import OfflineSyncStatus from './components/OfflineSyncStatus';
import FaceCheckInComponent from './components/FaceCheckInComponent';
import DigitalMarketingDashboard from './components/DigitalMarketingDashboard';
import LeadRoutingPanel from './components/LeadRoutingPanel';
import WorkflowAuthoringPanel from './components/WorkflowAuthoringPanel';

import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Progress } from "./components/ui/progress";
import { Toaster } from "./components/ui/toaster";
import { useToast } from "./hooks/use-toast";
// Removed redundant ResizeObserver imports - now using unified handler
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  Plus, 
  Phone, 
  Mail, 
  MapPin,
  Target,
  Calendar,
  Activity,
  Leaf,
  Mic,
  MicOff,
  Brain,
  Sparkles,
  Bot,
  Lightbulb,
  Zap,
  Edit,
  Trash2,
  Settings,
  Package,
  FileText,
  BarChart3,
  UserCheck,
  MessageSquare,
  Camera,
  Download,
  Upload,
  Archive,
  Clock2,
  AlertTriangle,
  Award,
  AlertCircle
} from "lucide-react";

// Import location and category data
import { 
  INDIAN_STATES, 
  CITIES_BY_STATE, 
  LEAD_CATEGORIES, 
  LEAD_SOURCES 
} from "./data/indianCitiesStates";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const App = () => {
  // ResizeObserver error handling now unified in comprehensive useEffect below

  const [dashboardStats, setDashboardStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedLead, setSelectedLead] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceInput, setVoiceInput] = useState("");
  const [aiInsights, setAiInsights] = useState([]);
  const [generatedContent, setGeneratedContent] = useState("");
  
  // Location and Category Management
  const [customCategories, setCustomCategories] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [isCustomLocation, setIsCustomLocation] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [newCustomCategory, setNewCustomCategory] = useState("");
  
  // ERP & Business Management
  const [products, setProducts] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [executiveDashboard, setExecutiveDashboard] = useState(null);
  
  // HRMS Data
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [payrollReport, setPayrollReport] = useState(null);
  
  // User Management & Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [users, setUsers] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    phone: "",
    full_name: "",
    role: "Employee",
    department: "",
    password: ""
  });
  const [loginData, setLoginData] = useState({
    identifier: "",
    password: ""
  });
  
  // Project Types Management State
  const [projectTypes, setProjectTypes] = useState([]);
  const [showAddProjectTypeModal, setShowAddProjectTypeModal] = useState(false);
  const [newProjectType, setNewProjectType] = useState({
    name: "",
    description: "",
    category: "Residential",
    is_active: true,
    sort_order: 0
  });

  // Enhanced File Upload State
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Lead Actions State
  const [showLeadActionsPanel, setShowLeadActionsPanel] = useState(false);
  const [selectedLeadForActions, setSelectedLeadForActions] = useState(null);
  const [actionType, setActionType] = useState(null);
  
  // Voice STT State
  const [showVoiceSTTModal, setShowVoiceSTTModal] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState([]);
  
  // Role Management State
  const [showRoleManagementPanel, setShowRoleManagementPanel] = useState(false);
  
  // Face Check-in State
  const [showFaceCheckInModal, setShowFaceCheckInModal] = useState(false);
  const [lastCheckInTime, setLastCheckInTime] = useState(null);
  
  // New Dashboard Components State
  const [showDigitalMarketingDashboard, setShowDigitalMarketingDashboard] = useState(false);
  const [showLeadRoutingPanel, setShowLeadRoutingPanel] = useState(false);
  const [showWorkflowAuthoringPanel, setShowWorkflowAuthoringPanel] = useState(false);
  
  // Lead Edit State
  const [showLeadEditModal, setShowLeadEditModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [leadEditForm, setLeadEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    designation: "",
    location: "",
    budget: "",
    requirements: "",
    notes: "",
    source: "",
    assigned_to: ""
  });
  // Task Management State
  const [showTaskRemarkModal, setShowTaskRemarkModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskRemarkStage, setTaskRemarkStage] = useState(null);
  const [taskRemark, setTaskRemark] = useState("");
  const [showTaskUploadModal, setShowTaskUploadModal] = useState(false);

  // Task Management Functions
  const updateTaskStatus = async (taskId, newStatus, defaultRemark = "") => {
    try {
      const token = localStorage.getItem('token');
      const updateData = {
        status: newStatus,
        remark: defaultRemark,
        timestamp: new Date().toISOString()
      };

      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/tasks/${taskId}/status`,
        updateData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      await fetchTasks();
      
      toast({
        title: "Task Updated",
        description: `Task marked as ${newStatus}`,
      });

      // Trigger notification
      triggerNotification("Task Update", `Task marked as ${newStatus}`, "task_update");

    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Update Failed",
        description: error.response?.data?.detail || "Failed to update task status.",
        variant: "destructive",
      });
    }
  };

  const openTaskRemarkModal = (task, stage) => {
    setSelectedTask(task);
    setTaskRemarkStage(stage);
    setTaskRemark("");
    setShowTaskRemarkModal(true);
  };

  const openTaskUploadModal = (task) => {
    setSelectedTask(task);
    setShowTaskUploadModal(true);
  };

  const submitTaskRemark = async () => {
    if (!taskRemark.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const remarkData = {
        content: taskRemark,
        stage: taskRemarkStage,
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/tasks/${selectedTask.id}/remarks`,
        remarkData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      await fetchTasks();
      setShowTaskRemarkModal(false);
      setTaskRemark("");

      toast({
        title: "Remark Added",
        description: "Task remark has been saved successfully.",
      });

    } catch (error) {
      console.error('Error adding task remark:', error);
      toast({
        title: "Remark Failed",
        description: error.response?.data?.detail || "Failed to add remark.",
        variant: "destructive",
      });
    }
  };

  const getTaskStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'text-orange-700 bg-orange-100';
      case 'in progress': return 'text-blue-700 bg-blue-100';
      case 'completed': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  // Notification System
  const triggerNotification = async (title, message, type) => {
    try {
      // On-screen notification (toast)
      toast({
        title: title,
        description: message,
      });

      // Push notification (if supported)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico'
        });
      }

      // WhatsApp notification (via API)
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/notifications/send`,
          {
            title,
            message,
            type,
            channels: ['whatsapp', 'push']
          },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      }

    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  // Request notification permission on load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Initialize autosave for lead edit form
  useEffect(() => {
    if (showLeadEditModal && editingLead && currentUser) {
      const getFormData = () => leadEditForm;
      autoSaveManager.startAutosave('lead', editingLead.id, getFormData, currentUser.id);
      
      return () => {
        autoSaveManager.stopAutosave(`lead_${editingLead.id}`);
      };
    }
  }, [showLeadEditModal, editingLead, leadEditForm, currentUser]);

  // Load draft when editing lead
  useEffect(() => {
    if (showLeadEditModal && editingLead && currentUser) {
      const loadDraft = async () => {
        try {
          const draft = await autoSaveManager.loadDraft('lead', editingLead.id, currentUser.id);
          if (draft && draft.data) {
            setLeadEditForm(prev => ({ ...prev, ...draft.data }));
            console.log('Loaded draft for lead:', editingLead.id);
          }
        } catch (error) {
          console.log('No draft found or error loading draft:', error);
        }
      };
      loadDraft();
    }
  }, [showLeadEditModal, editingLead, currentUser]);
  
  const mediaRecorder = useRef(null);
  const { toast } = useToast();

  // Form states
  const [newLead, setNewLead] = useState({
    name: "",
    phone: "",
    email: "",
    budget: "",
    space_size: "",
    city: "",
    state: "",
    source: "",
    category: "",
    notes: "",
    tags: "",
    assigned_to: ""
  });

  // Category Management Functions
  const addCustomCategory = () => {
    if (newCustomCategory.trim() && !customCategories.includes(newCustomCategory.trim())) {
      setCustomCategories([...customCategories, newCustomCategory.trim()]);
      setNewCustomCategory("");
      toast({
        title: "Category Added",
        description: `"${newCustomCategory.trim()}" has been added to categories`
      });
    }
  };

  const deleteCustomCategory = (categoryToDelete) => {
    setCustomCategories(customCategories.filter(cat => cat !== categoryToDelete));
    toast({
      title: "Category Deleted",
      description: `"${categoryToDelete}" has been removed`
    });
  };

  // Authentication & User Management Functions
  const login = async (credentials) => {
    try {
      const response = await axios.post(`${API}/auth/login`, credentials);
      const { access_token, user } = response.data;
      
      setAuthToken(access_token);
      setCurrentUser(user);
      localStorage.setItem('authToken', access_token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.full_name}!`
      });
      
      setShowLoginModal(false);
      setLoginData({ identifier: "", password: "" });
      
      // Load users if admin
      if (user.role === 'Super Admin' || user.role === 'Admin' || user.role === 'HR Manager') {
        loadUsers();
      }
      
      return true;
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.detail || "Invalid credentials",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setUsers([]);
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out"
    });
  };

  const loadUsers = async () => {
    if (!authToken) return;
    
    try {
      const response = await axios.get(`${API}/users`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  const createUser = async (userData) => {
    if (!authToken) return false;
    
    try {
      const response = await axios.post(`${API}/users`, userData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      toast({
        title: "User Created",
        description: `${userData.full_name} has been successfully created`
      });
      
      setShowAddUserModal(false);
      setNewUser({
        username: "",
        email: "",
        phone: "",
        full_name: "",
        role: "Employee",
        department: "",
        password: ""
      });
      
      // Reload users list
      loadUsers();
      return true;
    } catch (error) {
      toast({
        title: "Failed to Create User",
        description: error.response?.data?.detail || "User creation failed",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteUser = async (userId, userName) => {
    if (!authToken) return false;
    
    try {
      await axios.delete(`${API}/users/${userId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      toast({
        title: "User Deleted",
        description: `${userName} has been successfully deleted`
      });
      
      // Reload users list
      loadUsers();
      return true;
    } catch (error) {
      toast({
        title: "Failed to Delete User",
        description: error.response?.data?.detail || "User deletion failed",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateUserStatus = async (userId, newStatus) => {
    if (!authToken) return false;
    
    try {
      await axios.put(`${API}/users/${userId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      toast({
        title: "User Status Updated",
        description: `Status changed to ${newStatus}`
      });
      
      // Reload users list
      loadUsers();
      return true;
    } catch (error) {
      toast({
        title: "Failed to Update Status",
        description: error.response?.data?.detail || "Status update failed",
        variant: "destructive"
      });
      return false;
    }
  };

  // Project Types Management Functions
  const loadProjectTypes = async () => {
    if (!authToken) return;
    
    try {
      const response = await axios.get(`${API}/project-types`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setProjectTypes(response.data);
    } catch (error) {
      console.error('Failed to load project types:', error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  const createProjectType = async (projectTypeData) => {
    if (!authToken) return false;
    
    try {
      const response = await axios.post(`${API}/project-types`, projectTypeData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      toast({
        title: "Project Type Created",
        description: `${projectTypeData.name} has been successfully created`
      });
      
      setShowAddProjectTypeModal(false);
      setNewProjectType({
        name: "",
        description: "",
        category: "Residential",
        is_active: true,
        sort_order: 0
      });
      
      // Reload project types list
      loadProjectTypes();
      return true;
    } catch (error) {
      toast({
        title: "Failed to Create Project Type",
        description: error.response?.data?.detail || "Project type creation failed",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteProjectType = async (projectTypeId, projectTypeName) => {
    if (!authToken) return false;
    
    try {
      await axios.delete(`${API}/project-types/${projectTypeId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      toast({
        title: "Project Type Deleted",
        description: `${projectTypeName} has been successfully deleted`
      });
      
      // Reload project types list
      loadProjectTypes();
      return true;
    } catch (error) {
      toast({
        title: "Failed to Delete Project Type",
        description: error.response?.data?.detail || "Project type deletion failed",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateProjectTypeStatus = async (projectTypeId, newStatus) => {
    if (!authToken) return false;
    
    try {
      await axios.put(`${API}/project-types/${projectTypeId}`, { is_active: newStatus }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      toast({
        title: "Project Type Status Updated",
        description: `Status changed to ${newStatus ? 'Active' : 'Inactive'}`
      });
      
      // Reload project types list
      loadProjectTypes();
      return true;
    } catch (error) {
      toast({
        title: "Failed to Update Status",
        description: error.response?.data?.detail || "Status update failed",
        variant: "destructive"
      });
      return false;
    }
  };

  // Load current user from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('authToken');
    
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setAuthToken(storedToken);
        
        // Load users if admin
        if (user.role === 'Super Admin' || user.role === 'Admin' || user.role === 'HR Manager') {
          loadUsers();
          loadProjectTypes();
        }
      } catch (error) {
        // Clear invalid stored data
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  // Permission checking functions
  const hasAIPermission = (user) => {
    if (!user) return false;
    
    // Super Admin and Admin always have access
    if (user.role === 'Super Admin' || user.role === 'Admin') {
      return true;
    }
    
    // Check role-based permissions
    const aiRoles = ['Sales Manager', 'Marketing Manager'];
    if (aiRoles.includes(user.role)) {
      return true;
    }
    
    // Check custom permissions
    if (user.permissions && Array.isArray(user.permissions)) {
      return user.permissions.some(perm => 
        perm.startsWith('ai:') || perm === 'ai:view' || perm === 'ai:use_basic'
      );
    }
    
    return false;
  };

  const hasPermission = (user, permission) => {
    if (!user) return false;
    
    // Super Admin always has access
    if (user.role === 'Super Admin') {
      return true;
    }
    
    // Check custom permissions
    if (user.permissions && Array.isArray(user.permissions)) {
      return user.permissions.includes(permission);
    }
    
    return false;
  };

  const hasAdminAccess = (user) => {
    if (!user) return false;
    return ['Super Admin', 'Admin', 'HR Manager'].includes(user.role);
  };

  // Location Management
  const handleLocationChange = () => {
    if (selectedState && selectedCity) {
      const location = `${selectedCity}, ${selectedState}`;
      setNewLead({...newLead, city: selectedCity, state: selectedState});
    }
  };

  useEffect(() => {
    handleLocationChange();
  }, [selectedState, selectedCity]);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Medium",
    assigned_to: "",
    lead_id: "",
    due_date: ""
  });

  // ERP Form states
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "Indoor Plants",
    price: "",
    cost_price: "",
    stock_quantity: "",
    min_stock_level: "5",
    unit: "piece",
    description: "",
    supplier: ""
  });

  const [newInvoice, setNewInvoice] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    items: [],
    tax_percentage: 18,
    discount_percentage: 0,
    notes: ""
  });

  const [newProject, setNewProject] = useState({
    project_name: "",
    client_name: "",
    location: "",
    project_type: "Balcony Garden",
    budget_range: "",
    description: "",
    testimonial: ""
  });

  // HRMS states
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [aiChatMessage, setAiChatMessage] = useState("");
  const [aiChatHistory, setAiChatHistory] = useState([]);
  
  // Fetch data functions
  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setDashboardStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard statistics",
        variant: "destructive"
      });
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API}/leads`);
      setLeads(response.data);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast({
        title: "Error",
        description: "Failed to fetch leads",
        variant: "destructive"
      });
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive"
      });
    }
  };

  // ERP Data Fetching
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/erp/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchInventoryAlerts = async () => {
    try {
      const response = await axios.get(`${API}/erp/inventory-alerts`);
      setInventoryAlerts(response.data);
    } catch (error) {
      console.error("Error fetching inventory alerts:", error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${API}/erp/invoices`);
      setInvoices(response.data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/erp/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchExecutiveDashboard = async () => {
    try {
      const response = await axios.get(`${API}/analytics/executive-dashboard`);
      setExecutiveDashboard(response.data);
    } catch (error) {
      console.error("Error fetching executive dashboard:", error);
    }
  };

  // HRMS Data Fetching
  const fetchPayrollReport = async () => {
    try {
      const currentDate = new Date();
      const response = await axios.get(`${API}/hrms/payroll-report?month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`);
      setPayrollReport(response.data);
    } catch (error) {
      console.error("Error fetching payroll report:", error);
    }
  };

  // Create lead function
  const createLead = async (e) => {
    e.preventDefault();
    try {
      const location = isCustomLocation ? 
        customLocation : 
        (selectedCity && selectedState ? `${selectedCity}, ${selectedState}` : "");
      
      const leadData = {
        ...newLead,
        location: location,
        budget: newLead.budget ? parseFloat(newLead.budget) : null,
        tags: newLead.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      await axios.post(`${API}/leads`, leadData);
      toast({
        title: "Success",
        description: "Lead created successfully"
      });
      
      // Reset form
      setNewLead({
        name: "",
        phone: "",
        email: "",
        budget: "",
        space_size: "",
        city: "",
        state: "",
        source: "",
        category: "",
        notes: "",
        tags: "",
        assigned_to: ""
      });
      
      setSelectedState("");
      setSelectedCity("");
      setCustomLocation("");
      setIsCustomLocation(false);
      setIsCustomCategory(false);
      
      fetchLeads();
      fetchDashboardStats();
    } catch (error) {
      console.error("Error creating lead:", error);
      toast({
        title: "Error",
        description: "Failed to create lead",
        variant: "destructive"
      });
    }
  };

  // Update lead status
  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      await axios.put(`${API}/leads/${leadId}`, { status: newStatus });
      toast({
        title: "Success",
        description: "Lead status updated successfully"
      });
      fetchLeads();
      fetchDashboardStats();
    } catch (error) {
      console.error("Error updating lead:", error);
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive"
      });
    }
  };

  // Voice-to-Task functions
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      let audioChunks = [];
      
      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        // For demo purposes, we'll use a text input instead of actual speech recognition
        // In production, you would integrate with speech-to-text service
        setVoiceInput("Visit Mr. Sharma tomorrow 3 PM for balcony garden proposal");
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.current.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak your task requirements..."
      });
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive"
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      
      toast({
        title: "Recording Stopped",
        description: "Processing your voice input..."
      });
    }
  };

  const processVoiceToTask = async () => {
    if (!voiceInput.trim()) return;
    
    try {
      const response = await axios.post(`${API}/ai/voice-to-task`, {
        voice_input: voiceInput,
        context: {
          user_role: "sales_manager",
          current_time: new Date().toISOString()
        }
      });
      
      toast({
        title: "✨ AI Task Created",
        description: `Task "${response.data.task_breakdown.title}" has been created successfully!`
      });
      
      // Clear voice input and refresh tasks
      setVoiceInput("");
      fetchTasks();
      
    } catch (error) {
      console.error("Error processing voice input:", error);
      toast({
        title: "Error",
        description: "Failed to process voice input",
        variant: "destructive"
      });
    }
  };

  // AI Insights function
  const generateAIInsights = async (type = "leads") => {
    try {
      const response = await axios.post(`${API}/ai/insights`, {
        type: type,
        timeframe: "current"
      });
      
      setAiInsights(response.data.insights);
      
      toast({
        title: "🧠 AI Insights Generated",
        description: "Fresh business insights are ready!"
      });
      
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Error",
        description: "Failed to generate AI insights",
        variant: "destructive"
      });
    }
  };

  // AI Content Generation
  const generateContent = async (type = "social_post") => {
    try {
      const response = await axios.post(`${API}/ai/generate-content`, {
        type: type,
        topic: "Green building solutions and sustainable living",
        brand_context: "Aavana Greens - Your partner in sustainable green solutions",
        target_audience: "Homeowners and businesses interested in eco-friendly living"
      });
      
      setGeneratedContent(response.data.content);
      
      toast({
        title: "🎨 Content Generated",
        description: "AI has created marketing content for you!"
      });
      
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Error",
        description: "Failed to generate content",
        variant: "destructive"
      });
    }
  };

  // Comprehensive AI Feature Handler
  const handleAIFeature = async (featureType) => {
    try {
      let endpoint = '';
      let payload = {};
      
      switch (featureType) {
        case 'lead-scoring':
          // For demo, use first lead or create sample
          const firstLead = leads.length > 0 ? leads[0] : null;
          if (!firstLead) {
            toast({
              title: "No Leads Available",
              description: "Add some leads first to use AI lead scoring",
              variant: "destructive"
            });
            return;
          }
          endpoint = `/ai/crm/smart-lead-scoring?lead_id=${firstLead.id}`;
          break;
          
        case 'conversation-analysis':
          endpoint = '/ai/crm/conversation-analysis';
          payload = {
            conversation: "Sample customer conversation for analysis",
            customer_id: "sample_id",
            timestamp: new Date().toISOString()
          };
          break;
          
        case 'client-context':
          endpoint = `/ai/recall-context/sample_client_id?query=Complete client history`;
          break;
          
        case 'deal-prediction':
          endpoint = '/ai/sales/deal-prediction';
          break;
          
        case 'proposal-generator':
          const leadForProposal = leads.length > 0 ? leads[0] : null;
          if (!leadForProposal) {
            toast({
              title: "No Leads Available",
              description: "Add leads first to generate proposals",
              variant: "destructive"
            });
            return;
          }
          endpoint = `/ai/sales/smart-proposal-generator?lead_id=${leadForProposal.id}&service_type=balcony_garden`;
          break;
          
        case 'campaign-optimizer':
          endpoint = '/ai/marketing/campaign-optimizer';
          payload = {
            campaign_type: "google_ads",
            target_audience: "homeowners",
            budget: 50000,
            objective: "lead_generation"
          };
          break;
          
        case 'competitor-analysis':
          endpoint = '/ai/marketing/competitor-analysis?location=Mumbai';
          break;
          
        case 'smart-catalog':
          endpoint = '/ai/product/smart-catalog';
          break;
          
        case 'design-suggestions':
          endpoint = '/ai/project/design-suggestions';
          payload = {
            space_type: "balcony",
            size: "200_sq_ft",
            budget: 25000,
            preferences: ["low_maintenance", "colorful_flowers"]
          };
          break;
          
        case 'business-intelligence':
          endpoint = '/ai/analytics/business-intelligence';
          break;
          
        case 'predictive-forecasting':
          endpoint = '/ai/analytics/predictive-forecasting?forecast_type=revenue';
          break;
          
        case 'performance-analysis':
          endpoint = '/ai/hr/performance-analysis';
          break;
          
        case 'smart-scheduling':
          endpoint = '/ai/hr/smart-scheduling';
          payload = {
            department: "sales",
            requirements: "site_visits",
            timeframe: "next_week"
          };
          break;
          
        default:
          toast({
            title: "Feature Coming Soon",
            description: `${featureType} is being implemented`,
          });
          return;
      }
      
      // Make API call
      const response = payload && Object.keys(payload).length > 0 
        ? await axios.post(`${API}${endpoint}`, payload)
        : await axios.post(`${API}${endpoint}`);
      
      // Handle response
      const result = response.data;
      let displayContent = '';
      
      if (typeof result === 'string') {
        displayContent = result;
      } else if (result.lead_scoring) {
        displayContent = result.lead_scoring;
      } else if (result.conversation_analysis) {
        displayContent = result.conversation_analysis;
      } else if (result.deal_predictions) {
        displayContent = result.deal_predictions;
      } else if (result.proposal) {
        displayContent = result.proposal;
      } else if (result.campaign_optimization) {
        displayContent = result.campaign_optimization;
      } else if (result.competitor_analysis) {
        displayContent = result.competitor_analysis;
      } else if (result.catalog_optimization) {
        displayContent = result.catalog_optimization;
      } else if (result.design_suggestions) {
        displayContent = result.design_suggestions;
      } else if (result.business_intelligence) {
        displayContent = result.business_intelligence;
      } else if (result.predictive_forecast) {
        displayContent = result.predictive_forecast;
      } else if (result.performance_analysis) {
        displayContent = result.performance_analysis;
      } else if (result.smart_schedule) {
        displayContent = result.smart_schedule;
      } else {
        displayContent = JSON.stringify(result, null, 2);
      }
      
      // Update state with AI result
      setGeneratedContent(displayContent);
      
      toast({
        title: "🤖 AI Analysis Complete",
        description: `${featureType.replace('-', ' ')} has been processed successfully!`
      });
      
    } catch (error) {
      console.error(`Error with AI feature ${featureType}:`, error);
      toast({
        title: "AI Feature Error",
        description: `Failed to process ${featureType}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  // Create task function
  const createTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...newTask,
        due_date: newTask.due_date ? new Date(newTask.due_date).toISOString() : null
      };
      
      await axios.post(`${API}/tasks`, taskData);
      toast({
        title: "Success",
        description: "Task created successfully"
      });
      
      setNewTask({
        title: "",
        description: "",
        priority: "Medium",
        assigned_to: "",
        lead_id: "",
        due_date: ""
      });
      
      fetchTasks();
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
    }
  };

  // ERP Functions
  const createProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        cost_price: newProduct.cost_price ? parseFloat(newProduct.cost_price) : null,
        stock_quantity: parseInt(newProduct.stock_quantity),
        min_stock_level: parseInt(newProduct.min_stock_level)
      };
      
      await axios.post(`${API}/erp/products`, productData);
      toast({
        title: "Success",
        description: "Product added successfully"
      });
      
      setNewProduct({
        name: "",
        category: "Indoor Plants",
        price: "",
        cost_price: "",
        stock_quantity: "",
        min_stock_level: "5",
        unit: "piece",
        description: "",
        supplier: ""
      });
      
      fetchProducts();
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive"
      });
    }
  };

  const createInvoice = async (e) => {
    e.preventDefault();
    try {
      const invoiceData = {
        ...newInvoice,
        items: [
          {
            name: "Sample Service",
            quantity: 1,
            price: 1000,
            total: 1000
          }
        ]
      };
      
      await axios.post(`${API}/erp/invoices`, invoiceData);
      toast({
        title: "Success",
        description: "Invoice created successfully"
      });
      
      setNewInvoice({
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        items: [],
        tax_percentage: 18,
        discount_percentage: 0,
        notes: ""
      });
      
      fetchInvoices();
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive"
      });
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    try {
      const projectData = {
        ...newProject,
        completion_date: new Date().toISOString(),
        before_images: [],
        after_images: [],
        tags: []
      };
      
      await axios.post(`${API}/erp/projects`, projectData);
      toast({
        title: "Success",
        description: "Project added to gallery successfully"
      });
      
      setNewProject({
        project_name: "",
        client_name: "",
        location: "",
        project_type: "Balcony Garden",
        budget_range: "",
        description: "",
        testimonial: ""
      });
      
      fetchProjects();
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to add project",
        variant: "destructive"
      });
    }
  };

  // HRMS Functions - Enhanced with Real Camera Capture
  const [cameraStream, setCameraStream] = useState(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFaceCheckin = async () => {
    setShowCameraModal(true);
    await startCamera();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user' // Front camera for selfie
        } 
      });
      setCameraStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
    } catch (error) {
      console.error("Camera access denied:", error);
      
      // For demo/testing purposes, show modal anyway with simulated camera
      if (error.name === 'NotAllowedError' || error.name === 'NotFoundError') {
        toast({
          title: "Demo Mode",
          description: "Camera access not available. Using demo mode for face check-in.",
          variant: "default"
        });
        
        // Set a flag for demo mode
        setCameraStream('demo_mode');
        
        // Simulate camera with a placeholder
        if (videoRef.current) {
          videoRef.current.style.backgroundColor = '#f0f0f0';
          videoRef.current.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 200 150\'%3E%3Crect width=\'200\' height=\'150\' fill=\'%23e5e7eb\'/%3E%3Ctext x=\'100\' y=\'75\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%23374151\' font-family=\'Arial\' font-size=\'14\'%3EDemo Camera View%3C/text%3E%3C/svg%3E")';
          videoRef.current.style.backgroundSize = 'cover';
        }
      } else {
        toast({
          title: "Camera Access Required",
          description: "Please allow camera access for face check-in. This is required for attendance verification.",
          variant: "destructive"
        });
        setShowCameraModal(false);
      }
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      toast({
        title: "Error",
        description: "Camera not ready. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setIsCheckingIn(true);
    
    try {
      // Get current location for background validation
      const location = await getCurrentLocation();
      
      let imageData;
      
      if (cameraStream === 'demo_mode') {
        // Create demo image data for testing
        const canvas = canvasRef.current;
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        
        // Create a demo face image
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 640, 480);
        ctx.fillStyle = '#374151';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Demo Face Check-in', 320, 200);
        ctx.fillText('Employee: EMP001', 320, 240);
        ctx.fillText(new Date().toLocaleString(), 320, 280);
        
        imageData = canvas.toDataURL('image/jpeg', 0.8);
      } else {
        // Capture image from video (real camera)
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        imageData = canvas.toDataURL('image/jpeg', 0.8);
      }
      
      // Stop camera
      stopCamera();
      
      // Send to backend with real image data
      const response = await axios.post(`${API}/hrms/face-checkin`, {
        employee_id: currentUser?.id || "DEMO_USER",
        face_image: imageData,
        location: location,
        timestamp: new Date().toISOString(),
        device_info: {
          user_agent: navigator.userAgent,
          platform: navigator.platform,
          demo_mode: cameraStream === 'demo_mode'
        }
      });
      
      if (response.data.status === 'success') {
        toast({
          title: "✅ Face Check-in Successful!",
          description: `Welcome to work! Location: ${location.address || 'Office'}`
        });
      } else {
        throw new Error(response.data.message || 'Face check-in failed');
      }
      
      setShowCameraModal(false);
      
    } catch (error) {
      console.error("Error with face check-in:", error);
      toast({
        title: "Face Check-in Failed",
        description: "Unable to process face check-in. Please try again or use GPS check-in.",
        variant: "destructive"
      });
    }
    
    setIsCheckingIn(false);
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        resolve({ lat: 0, lng: 0, address: "Location unavailable" });
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Try to get address (simplified - would use Google Maps API in production)
          try {
            const address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            resolve({
              lat: latitude,
              lng: longitude,
              address: address,
              accuracy: position.coords.accuracy
            });
          } catch (error) {
            resolve({
              lat: latitude,
              lng: longitude,
              address: "Location detected",
              accuracy: position.coords.accuracy
            });
          }
        },
        (error) => {
          console.error("Location error:", error);
          resolve({ lat: 0, lng: 0, address: "Location unavailable" });
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 60000 
        }
      );
    });
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const cancelFaceCheckin = () => {
    stopCamera();
    setShowCameraModal(false);
    setIsCheckingIn(false);
  };

  const handleGpsCheckin = async () => {
    setIsCheckingIn(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          try {
            const location = `${position.coords.latitude},${position.coords.longitude}`;
            await axios.post(`${API}/hrms/check-in?employee_id=EMP001&location=${location}`);
            toast({
              title: "Success",
              description: "GPS check-in successful! Location verified."
            });
          } catch (error) {
            toast({
              title: "Error",
              description: "GPS check-in failed.",
              variant: "destructive"
            });
          }
          setIsCheckingIn(false);
        });
      } else {
        toast({
          title: "Error",
          description: "GPS not supported by this browser.",
          variant: "destructive"
        });
        setIsCheckingIn(false);
      }
    } catch (error) {
      console.error("Error with GPS check-in:", error);
      setIsCheckingIn(false);
    }
  };

  const handleProcessPayroll = async () => {
    try {
      toast({
        title: "Processing",
        description: "Payroll processing initiated. This may take a few minutes."
      });
      
      // Simulate payroll processing
      setTimeout(() => {
        toast({
          title: "Success",
          description: "Payroll processed successfully for all employees."
        });
        fetchPayrollReport();
      }, 3000);
    } catch (error) {
      console.error("Error processing payroll:", error);
      toast({
        title: "Error",
        description: "Payroll processing failed.",
        variant: "destructive"
      });
    }
  };

  // Leave Management State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    type: "Sick Leave",
    start_date: "",
    end_date: "",
    reason: ""
  });

  const handleApplyLeave = async () => {
    try {
      const leaveData = {
        employee_id: currentUser?.id || "DEMO_USER",
        type: leaveForm.type,
        start_date: leaveForm.start_date,
        end_date: leaveForm.end_date,
        reason: leaveForm.reason || "Personal work"
      };
      
      const response = await axios.post(`${API}/hrms/apply-leave`, leaveData);
      
      toast({
        title: "✅ Leave Application Submitted",
        description: `${leaveForm.type} request from ${leaveForm.start_date} to ${leaveForm.end_date} has been submitted for approval.`
      });
      
      // Reset form and close modal
      setLeaveForm({
        type: "Sick Leave",
        start_date: "",
        end_date: "",
        reason: ""
      });
      setShowLeaveModal(false);
      
    } catch (error) {
      console.error("Error applying leave:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to submit leave application.",
        variant: "destructive"
      });
    }
  };

  // Targets & Progress State
  const [showTargets, setShowTargets] = useState(false);
  const [showCreateTargetModal, setShowCreateTargetModal] = useState(false);
  const [targets, setTargets] = useState({
    daily: { sales: 10000, leads: 5, tasks: 10 },
    weekly: { sales: 70000, leads: 35, tasks: 70 },
    monthly: { sales: 300000, leads: 150, tasks: 300 }
  });
  const [progress, setProgress] = useState({
    daily: { sales: 0, leads: 0, tasks: 0 },
    weekly: { sales: 0, leads: 0, tasks: 0 },
    monthly: { sales: 0, leads: 0, tasks: 0 }
  });
  const [newTargetForm, setNewTargetForm] = useState({
    target_type: "sales_amount",
    period: "daily",
    target_value: "",
    deadline: "",
    reminder_frequency: "daily"
  });

  // Aavana 2.0 Chat Functions
  const [aavana2Message, setAavana2Message] = useState("");
  const [aavana2History, setAavana2History] = useState([]);
  const [aavana2Language, setAavana2Language] = useState("auto");
  const [showAavana2, setShowAavana2] = useState(false);
  const [aavana2SessionId, setAavana2SessionId] = useState("");

  const sendAavana2Message = async () => {
    if (!aavana2Message.trim()) return;
    
    const userMessage = aavana2Message;
    setAavana2History(prev => [...prev, { 
      type: 'user', 
      message: userMessage, 
      timestamp: new Date().toLocaleTimeString(),
      language: aavana2Language 
    }]);
    setAavana2Message("");
    
    try {
      const response = await axios.post(`${API}/aavana/conversation`, {
        message: userMessage,
        channel: "in_app_chat",
        user_id: "frontend_user",
        language: aavana2Language === "auto" ? null : aavana2Language,
        session_id: aavana2SessionId || null,
        context: {
          source: "frontend_chat",
          user_agent: navigator.userAgent
        }
      });
      
      // Update session ID
      if (response.data.session_id) {
        setAavana2SessionId(response.data.session_id);
      }
      
      const aavanaResponse = {
        type: 'aavana',
        message: response.data.response,
        timestamp: new Date().toLocaleTimeString(),
        language: response.data.language,
        intent: response.data.intent,
        confidence: response.data.confidence,
        suggested_replies: response.data.suggested_replies || [],
        cached_audio_url: response.data.cached_audio_url,
        processing_time_ms: response.data.processing_time_ms
      };
      
      setAavana2History(prev => [...prev, aavanaResponse]);
      
      toast({
        title: `🤖 Aavana 2.0 (${response.data.language})`,
        description: `Intent: ${response.data.intent} (${Math.round(response.data.confidence * 100)}% confidence)`
      });
      
    } catch (error) {
      console.error("Error with Aavana 2.0:", error);
      setAavana2History(prev => [...prev, { 
        type: 'error', 
        message: `Error: Unable to process your message. Please try again or call 8447475761 for assistance.`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  const testLanguageDetection = async (testText) => {
    try {
      const response = await axios.post(`${API}/aavana/language-detect`, { text: testText });
      toast({
        title: "🔍 Language Detection",
        description: `Detected: ${response.data.detected_language} | Text: "${testText}"`
      });
    } catch (error) {
      console.error("Language detection error:", error);
    }
  };

  const useSuggestedReply = (reply) => {
    setAavana2Message(reply);
  };

  const playAavanaAudio = (audioUrl) => {
    if (audioUrl) {
      // In Phase 1, we use device TTS since server TTS is deferred
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance("Audio playback via device TTS");
        speechSynthesis.speak(utterance);
      }
      toast({
        title: "🔊 Audio",
        description: "Playing cached audio template (device TTS)"
      });
    }
  };

  // Targets & Progress Functions
  const [targetsData, setTargetsData] = useState({
    daily: { sales: { target: 10000, achieved: 2500 }, leads: { target: 5, achieved: 2 }, tasks: { target: 10, achieved: 4 } },
    weekly: { sales: { target: 70000, achieved: 18000 }, leads: { target: 35, achieved: 12 }, tasks: { target: 70, achieved: 28 } },
    monthly: { sales: { target: 300000, achieved: 75000 }, leads: { target: 150, achieved: 45 }, tasks: { target: 300, achieved: 120 } }
  });

  const createTarget = async (targetData = null) => {
    try {
      // Use form data if no targetData provided
      const data = targetData || newTargetForm;
      
      // Validate required fields
      if (!data.target_type || !data.period || !data.target_value) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return false;
      }

      const headers = {};
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      // Prepare target creation payload
      const targetPayload = {
        user_id: currentUser?.id || "current_user",
        target_type: data.target_type,
        period: data.period,
        target_value: parseFloat(data.target_value),
        deadline: data.deadline || null,
        reminder_frequency: data.reminder_frequency || "daily",
        created_by: currentUser?.username || "frontend_user",
        metadata: {
          created_from: "frontend",
          browser: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      };

      // Try online creation first
      let response;
      let isOnline = navigator.onLine;
      
      if (isOnline) {
        try {
          // Convert to query parameters as expected by backend
          const queryParams = new URLSearchParams({
            user_id: targetPayload.user_id,
            target_type: targetPayload.target_type,
            period: targetPayload.period,
            target_value: targetPayload.target_value.toString(),
            created_by: targetPayload.created_by
          });
          
          response = await axios.post(`${API}/targets/create?${queryParams}`, {}, { headers });
          
          // Success - clear any offline queue for this target type
          await clearOfflineTargetQueue(data.target_type, data.period);
          
          toast({
            title: "🎯 Target Created Successfully",
            description: `${data.target_type.charAt(0).toUpperCase() + data.target_type.slice(1)} target set for ${data.period}: ${data.target_value}${data.target_type === 'sales' ? ' ₹' : ''}`
          });

          // Create reminder entry
          await scheduleTargetReminder(response.data);
          
        } catch (networkError) {
          console.warn("Network error, falling back to offline queue:", networkError);
          isOnline = false; // Treat as offline
        }
      }

      // Handle offline scenario
      if (!isOnline) {
        await queueTargetOffline(targetPayload);
        
        toast({
          title: "🎯 Target Queued (Offline)",
          description: `Target saved locally and will be created when connection is restored`,
          variant: "warning"
        });
      }

      // Reset form and close modal
      setNewTargetForm({
        target_type: "sales_amount",
        period: "daily", 
        target_value: "",
        deadline: "",
        reminder_frequency: "daily"
      });
      setShowCreateTargetModal(false);
      
      // Refresh targets data
      await fetchTargetsData();
      return true;
      
    } catch (error) {
      console.error("Error creating target:", error);
      toast({
        title: "Target Creation Failed",
        description: error.response?.data?.detail || error.message || "Failed to create target. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Offline queueing functions
  const queueTargetOffline = async (targetData) => {
    try {
      const offlineQueue = JSON.parse(localStorage.getItem('aavana_offline_targets') || '[]');
      const queueItem = {
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...targetData,
        queued_at: new Date().toISOString(),
        status: 'pending'
      };
      
      offlineQueue.push(queueItem);
      localStorage.setItem('aavana_offline_targets', JSON.stringify(offlineQueue));
      
      console.log('Target queued offline:', queueItem);
    } catch (error) {
      console.error('Failed to queue target offline:', error);
    }
  };

  const clearOfflineTargetQueue = async (targetType, period) => {
    try {
      const offlineQueue = JSON.parse(localStorage.getItem('aavana_offline_targets') || '[]');
      const filteredQueue = offlineQueue.filter(item => 
        !(item.target_type === targetType && item.period === period)
      );
      localStorage.setItem('aavana_offline_targets', JSON.stringify(filteredQueue));
    } catch (error) {
      console.error('Failed to clear offline queue:', error);
    }
  };

  const processOfflineTargetQueue = async () => {
    if (!navigator.onLine || !authToken) return;

    try {
      const offlineQueue = JSON.parse(localStorage.getItem('aavana_offline_targets') || '[]');
      const pendingTargets = offlineQueue.filter(item => item.status === 'pending');
      
      if (pendingTargets.length === 0) return;

      console.log(`Processing ${pendingTargets.length} offline targets...`);
      
      for (const target of pendingTargets) {
        try {
          const headers = { Authorization: `Bearer ${authToken}` };
          const response = await axios.post(`${API}/targets/create`, target, { headers });
          
          // Mark as processed
          target.status = 'completed';
          target.processed_at = new Date().toISOString();
          target.server_id = response.data.id;
          
          console.log('Offline target processed:', target.id);
          
        } catch (error) {
          console.warn('Failed to process offline target:', target.id, error);
          target.status = 'failed';
          target.error = error.message;
        }
      }
      
      // Update offline queue
      localStorage.setItem('aavana_offline_targets', JSON.stringify(offlineQueue));
      
      // Show success message
      const completedCount = pendingTargets.filter(t => t.status === 'completed').length;
      if (completedCount > 0) {
        toast({
          title: "📡 Offline Targets Synced",
          description: `${completedCount} targets synchronized with server`
        });
      }
      
    } catch (error) {
      console.error('Failed to process offline target queue:', error);
    }
  };

  const scheduleTargetReminder = async (targetData) => {
    try {
      if (!targetData || !authToken) return;

      const headers = { Authorization: `Bearer ${authToken}` };
      const reminderPayload = {
        target_id: targetData.id,
        user_id: currentUser?.id || "current_user",
        frequency: targetData.reminder_frequency || "daily",
        next_reminder: calculateNextReminder(targetData.reminder_frequency),
        message: `Reminder: Your ${targetData.target_type} target for ${targetData.period} is ${targetData.target_value}`,
        is_active: true
      };

      await axios.post(`${API}/targets/schedule-reminder`, reminderPayload, { headers });
      
      console.log('Target reminder scheduled:', reminderPayload);
      
    } catch (error) {
      console.warn('Failed to schedule reminder:', error);
      // Don't show error to user as this is non-critical
    }
  };

  const calculateNextReminder = (frequency) => {
    const now = new Date();
    switch (frequency) {
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000);
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  };

  const fetchTargetsData = async () => {
    try {
      const headers = {};
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      
      const response = await axios.get(`${API}/targets/dashboard/current_user`, { headers });
      setTargetsData(response.data);
    } catch (error) {
      console.error("Error fetching targets:", error);
      // Set default data if fetch fails
      setTargetsData({
        daily: { sales: { target: 10000, achieved: 2500 }, leads: { target: 5, achieved: 2 }, tasks: { target: 10, achieved: 4 } },
        weekly: { sales: { target: 70000, achieved: 15000 }, leads: { target: 35, achieved: 12 }, tasks: { target: 70, achieved: 28 } },
        monthly: { sales: { target: 300000, achieved: 75000 }, leads: { target: 150, achieved: 45 }, tasks: { target: 300, achieved: 120 } }
      });
    }
  };

  const updateProgress = async (targetType, period, increment) => {
    try {
      // This would find the target ID and update it
      const response = await axios.post(`${API}/targets/update-progress`, {
        target_id: "demo_target_id",
        increment_value: increment,
        source: "manual",
        updated_by: "frontend_user",
        notes: `Manual update: +${increment}`
      });
      
      toast({
        title: "📈 Progress Updated",
        description: `Added ${increment} to ${targetType} ${period} target`
      });
      
      await fetchTargetsData();
      
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const sendTargetReminders = async () => {
    try {
      const response = await axios.post(`${API}/targets/send-reminders`);
      
      toast({
        title: "📱 Reminders Sent", 
        description: `Sent progress reminders to ${response.data.reminders_sent} users`
      });
      
    } catch (error) {
      console.error("Error sending reminders:", error);
    }
  };

  // AI Chat Functions
  const sendAiMessage = async () => {
    if (!aiChatMessage.trim()) return;
    
    const userMessage = aiChatMessage;
    setAiChatHistory(prev => [...prev, { type: 'user', message: userMessage }]);
    setAiChatMessage("");
    
    try {
      const response = await axios.post(`${API}/ai/insights`, {
        type: "general",
        data: { query: userMessage }
      });
      
      const aiResponse = response.data.insights?.[0] || "I can help you with lead management, task creation, business insights, and marketing content. What would you like to know?";
      
      setAiChatHistory(prev => [...prev, { type: 'ai', message: aiResponse }]);
    } catch (error) {
      console.error("Error with AI chat:", error);
      setAiChatHistory(prev => [...prev, { 
        type: 'ai', 
        message: "I'm here to help! You can ask me about:\n• Lead management and conversion\n• Task creation and automation\n• Business insights and analytics\n• Marketing content generation\n• Sales strategies\n\nWhat would you like assistance with?" 
      }]);
    }
  };

  // Enhanced error handling and data fetching
  useEffect(() => {
    // Note: ResizeObserver error handling is now managed by unified handler in index.js
    // This ensures consistent error suppression across all browsers and environments
    
    // Set up online/offline listeners for target queue processing
    const handleOnline = () => {
      console.log('Application back online - processing offline target queue');
      if (authToken) {
        processOfflineTargetQueue();
      }
    };
    
    const handleOffline = () => {
      console.log('Application offline - targets will be queued locally');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      // Cleanup listeners on unmount
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [authToken]); // Re-run when auth token changes

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load only core data that we know works
        await fetchDashboardStats();
        await fetchLeads();
        await fetchTasks();
        
        console.log("Core data loaded successfully");
        
        // Process offline targets queue if online and authenticated
        if (navigator.onLine && authToken) {
          processOfflineTargetQueue();
        }
        
        // Set default data for ERP and HRMS to make tabs work immediately
        setProducts([{
          id: "default-1",
          name: "Sample Plant",
          category: "Indoor Plants", 
          price: 899,
          stock_quantity: 25
        }]);
        
        setExecutiveDashboard({
          business_overview: {
            total_revenue_ytd: 2450000,
            growth_rate: 25.5,
            active_customers: 245,
            customer_satisfaction: 4.8
          },
          sales_metrics: {
            conversion_rate: 22.5,
            sales_cycle_days: 14
          },
          financial_health: {
            profit_margin: 18.5
          }
        });
        
        setPayrollReport({
          month: 9,
          year: 2025,
          total_payroll: 95274,
          total_employees: 3,
          employees: [
            { name: "Rajesh Kumar", department: "Sales", net_salary: 35000, days_worked: 20 },
            { name: "Priya Sharma", department: "Design", net_salary: 32000, days_worked: 22 },
            { name: "Amit Patel", department: "Operations", net_salary: 28274, days_worked: 19 }
          ]
        });
        
        // Load additional data in background (non-blocking)
        setTimeout(async () => {
          try {
            await fetchProducts();
            await fetchExecutiveDashboard();
            await fetchPayrollReport();
            console.log("Additional data loaded in background");
          } catch (error) {
            console.log("Background data loading failed, using defaults");
          }
        }, 1000);
        
      } catch (error) {
        console.error("Critical data loading error:", error);
        toast({
          title: "Loading Error", 
          description: "Some data failed to load. Please refresh the page.",
          variant: "destructive"
        });
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      "New": "bg-blue-100 text-blue-800 border-blue-200",
      "Qualified": "bg-green-100 text-green-800 border-green-200",
      "Proposal": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Negotiation": "bg-orange-100 text-orange-800 border-orange-200",
      "Won": "bg-emerald-100 text-emerald-800 border-emerald-200",
      "Lost": "bg-red-100 text-red-800 border-red-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      "Low": "bg-gray-100 text-gray-800",
      "Medium": "bg-blue-100 text-blue-800",
      "High": "bg-orange-100 text-orange-800",
      "Urgent": "bg-red-100 text-red-800"
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700 font-medium">Loading Aavana Greens CRM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-600 p-2 rounded-lg">
                <Leaf className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Aavana Greens</h1>
                <p className="text-sm text-emerald-600 font-medium">CRM & Business Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Offline Sync Status */}
              <div className="relative">
                <OfflineSyncStatus />
              </div>
              
              {/* Enhanced Actions - Always visible for demo purposes */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFileUploadModal(true)}
                  className="flex items-center"
                >
                  📎 Upload
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVoiceSTTModal(true)}
                  className="flex items-center"
                >
                  🎤 Voice
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFaceCheckInModal(true)}
                  className="flex items-center"
                >
                  📷 Check-In
                </Button>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500">Business Number</p>
                <p className="font-medium text-gray-900">8447475761</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-white shadow-sm border border-emerald-100 text-xs">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
              <Activity className="h-3 w-3 mr-1" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="leads" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
              <Users className="h-3 w-3 mr-1" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
              <Target className="h-3 w-3 mr-1" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="erp" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
              <Package className="h-3 w-3 mr-1" />
              ERP
            </TabsTrigger>
            <TabsTrigger value="hrms" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
              <UserCheck className="h-3 w-3 mr-1" />
              HRMS
            </TabsTrigger>
            {/* AI Tab - Show to all users, with enhanced features for authenticated users */}
            <TabsTrigger value="ai" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
              <Brain className="h-3 w-3 mr-1" />
              AI
            </TabsTrigger>
            {/* Admin Tab - Show to all users, but functionality requires authentication */}
            <TabsTrigger value="admin" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
              <Settings className="h-3 w-3 mr-1" />
              Admin
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {dashboardStats && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-white shadow-lg border-emerald-100 hover:shadow-xl transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
                      <Users className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{dashboardStats.total_leads}</div>
                      <p className="text-xs text-emerald-600 mt-1">
                        +{dashboardStats.new_leads} new this period
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-lg border-emerald-100 hover:shadow-xl transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{dashboardStats.conversion_rate}%</div>
                      <Progress value={dashboardStats.conversion_rate} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-lg border-emerald-100 hover:shadow-xl transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">
                        ₹{dashboardStats.total_revenue.toLocaleString('en-IN')}
                      </div>
                      <p className="text-xs text-emerald-600 mt-1">
                        {dashboardStats.won_deals} deals closed
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-lg border-emerald-100 hover:shadow-xl transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Pending Tasks</CardTitle>
                      <Clock className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{dashboardStats.pending_tasks}</div>
                      <p className="text-xs text-emerald-600 mt-1">Action required</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white shadow-lg border-emerald-100">
                    <CardHeader>
                      <CardTitle className="text-gray-900">Recent Leads</CardTitle>
                      <CardDescription>Latest potential customers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {leads.slice(0, 5).map((lead) => (
                          <div key={lead.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{lead.name}</p>
                              <p className="text-sm text-gray-600">{lead.location}</p>
                            </div>
                            <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-lg border-emerald-100">
                    <CardHeader>
                      <CardTitle className="text-gray-900">Pipeline Overview</CardTitle>
                      <CardDescription>Leads by stage</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">New</span>
                          <span className="text-sm font-bold text-blue-600">{dashboardStats.new_leads}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Qualified</span>
                          <span className="text-sm font-bold text-green-600">{dashboardStats.qualified_leads}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Won</span>
                          <span className="text-sm font-bold text-emerald-600">{dashboardStats.won_deals}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Lost</span>
                          <span className="text-sm font-bold text-red-600">{dashboardStats.lost_deals}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Lead Management</h2>
              <div className="flex gap-2">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white" 
                  onClick={() => {
                    setSelectedProject(null);
                    setShowFileUploadModal(true);
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lead
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl sm:max-w-lg md:max-w-2xl w-[95vw] max-h-[95vh] overflow-y-auto pointer-events-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Lead</DialogTitle>
                      <DialogDescription>Create a new lead with comprehensive information</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={createLead} className="space-y-4 pointer-events-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={newLead.name}
                          onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                          id="phone"
                          value={newLead.phone}
                          onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newLead.email}
                        onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                      />
                    </div>

                    {/* Lead Source */}
                    <div>
                      <Label htmlFor="source">Lead Source *</Label>
                      <Select value={newLead.source} onValueChange={(value) => setNewLead({...newLead, source: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lead source" />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_SOURCES.map((source) => (
                            <SelectItem key={source} value={source}>{source}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Client Category */}
                    <div>
                      <Label htmlFor="category">Client Category *</Label>
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Select 
                            value={newLead.category} 
                            onValueChange={(value) => setNewLead({...newLead, category: value})}
                            disabled={isCustomCategory}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select client category" />
                            </SelectTrigger>
                            <SelectContent>
                              {LEAD_CATEGORIES.concat(customCategories).map((category) => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={() => setIsCustomCategory(!isCustomCategory)}
                            className="sm:w-auto w-full"
                          >
                            {isCustomCategory ? "Select" : "Custom"}
                          </Button>
                        </div>
                        
                        {isCustomCategory && (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Input
                              placeholder="Enter custom category"
                              value={newCustomCategory}
                              onChange={(e) => setNewCustomCategory(e.target.value)}
                              className="flex-1"
                            />
                            <Button 
                              type="button" 
                              size="sm" 
                              onClick={addCustomCategory}
                              className="bg-emerald-600 hover:bg-emerald-700 sm:w-auto w-full"
                            >
                              Add
                            </Button>
                          </div>
                        )}
                        
                        {/* Custom Categories Management */}
                        {customCategories.length > 0 && (
                          <div className="bg-emerald-50 p-3 rounded-lg">
                            <Label className="text-sm font-medium text-emerald-800">Custom Categories:</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {customCategories.map((category) => (
                                <div key={category} className="flex items-center bg-white px-2 py-1 rounded border">
                                  <span className="text-sm">{category}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteCustomCategory(category)}
                                    className="ml-1 h-4 w-4 p-0 hover:bg-red-100"
                                  >
                                    <Trash2 className="h-3 w-3 text-red-600" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Location Management */}
                    <div>
                      <Label>Location *</Label>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            type="button"
                            variant={!isCustomLocation ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsCustomLocation(false)}
                            className="flex-1"
                          >
                            Select from List
                          </Button>
                          <Button
                            type="button"
                            variant={isCustomLocation ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsCustomLocation(true)}
                            className="flex-1"
                          >
                            Enter Manually
                          </Button>
                        </div>

                        {!isCustomLocation ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="state">State</Label>
                              <Select value={selectedState} onValueChange={setSelectedState}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                                <SelectContent>
                                  {INDIAN_STATES.map((state) => (
                                    <SelectItem key={state} value={state}>{state}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="city">City</Label>
                              <Select 
                                value={selectedCity} 
                                onValueChange={setSelectedCity}
                                disabled={!selectedState}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select city" />
                                </SelectTrigger>
                                <SelectContent>
                                  {selectedState && CITIES_BY_STATE[selectedState]?.map((city) => (
                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Label htmlFor="customLocation">Custom Location</Label>
                            <Input
                              id="customLocation"
                              placeholder="Enter city, state (e.g., Noida, Uttar Pradesh)"
                              value={customLocation}
                              onChange={(e) => setCustomLocation(e.target.value)}
                            />
                          </div>
                        )}

                        {/* Display selected location */}
                        {((selectedCity && selectedState) || customLocation) && (
                          <div className="bg-emerald-50 p-2 rounded border border-emerald-200">
                            <span className="text-sm text-emerald-700">
                              📍 Location: {isCustomLocation ? customLocation : `${selectedCity}, ${selectedState}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="budget">Budget (₹)</Label>
                        <Input
                          id="budget"
                          type="number"
                          placeholder="e.g., 50000"
                          value={newLead.budget}
                          onChange={(e) => setNewLead({...newLead, budget: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="space_size">Space Size</Label>
                        <Input
                          id="space_size"
                          placeholder="e.g., 2 BHK, 1000 sq ft"
                          value={newLead.space_size}
                          onChange={(e) => setNewLead({...newLead, space_size: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="assigned_to">Assigned To</Label>
                      <Select value={newLead.assigned_to} onValueChange={(value) => setNewLead({...newLead, assigned_to: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team member" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sales Team A">Sales Team A</SelectItem>
                          <SelectItem value="Sales Team B">Sales Team B</SelectItem>
                          <SelectItem value="Design Team">Design Team</SelectItem>
                          <SelectItem value="Senior Consultant">Senior Consultant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional information about the lead..."
                        value={newLead.notes}
                        onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        placeholder="e.g., urgent, high-value, balcony"
                        value={newLead.tags}
                        onChange={(e) => setNewLead({...newLead, tags: e.target.value})}
                      />
                    </div>

                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                      Create Lead
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leads.map((lead) => (
                <Card key={lead.id} className="bg-white shadow-lg border-emerald-100 hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-gray-900">{lead.name}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Phone className="h-3 w-3 mr-1" />
                          {lead.phone}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {lead.email && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {lead.email}
                        </p>
                      )}
                      {lead.location && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {lead.location}
                        </p>
                      )}
                      {lead.budget && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ₹{lead.budget.toLocaleString('en-IN')}
                        </p>
                      )}
                      {lead.notes && (
                        <p className="text-sm text-gray-600 mt-2">{lead.notes}</p>
                      )}
                    </div>
                    <div className="mt-4 space-y-3">
                      {/* Individual Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {lead.phone && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedLeadForActions(lead);
                              setActionType('call');
                              setShowLeadActionsPanel(true);
                            }}
                            className="bg-blue-50 border-blue-200 hover:bg-blue-100 text-xs flex items-center"
                          >
                            📞 Call
                          </Button>
                        )}
                        
                        {lead.phone && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedLeadForActions(lead);
                              setActionType('whatsapp');
                              setShowLeadActionsPanel(true);
                            }}
                            className="bg-green-50 border-green-200 hover:bg-green-100 text-xs flex items-center"
                          >
                            💬 WhatsApp
                          </Button>
                        )}
                        
                        {lead.email && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedLeadForActions(lead);
                              setActionType('email');
                              setShowLeadActionsPanel(true);
                            }}
                            className="bg-red-50 border-red-200 hover:bg-red-100 text-xs flex items-center"
                          >
                            📧 Email
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedLeadForActions(lead);
                            setActionType('send_images');
                            setShowLeadActionsPanel(true);
                          }}
                          className="bg-purple-50 border-purple-200 hover:bg-purple-100 text-xs flex items-center"
                        >
                          🖼️ Images
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedLeadForActions(lead);
                            setActionType('send_catalogue');
                            setShowLeadActionsPanel(true);
                          }}
                          className="bg-orange-50 border-orange-200 hover:bg-orange-100 text-xs flex items-center"
                        >
                          📋 Catalogue
                        </Button>
                      </div>
                      
                      {/* Status Update and More Actions */}
                      <div className="flex gap-2">
                        <Select onValueChange={(value) => updateLeadStatus(lead.id, value)}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Qualified">Qualified</SelectItem>
                            <SelectItem value="Proposal">Proposal</SelectItem>
                            <SelectItem value="Negotiation">Negotiation</SelectItem>
                            <SelectItem value="Won">Won</SelectItem>
                            <SelectItem value="Lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedLeadForActions(lead);
                            setShowLeadActionsPanel(true);
                          }}
                          className="bg-blue-50 border-blue-200 hover:bg-blue-100"
                        >
                          🔧 More
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingLead(lead);
                            setLeadEditForm({
                              name: lead.name || "",
                              email: lead.email || "",
                              phone: lead.phone || "",
                              company: lead.company || "",
                              designation: lead.designation || "",
                              location: lead.location || "",
                              budget: lead.budget || "",
                              requirements: lead.requirements || "",
                              notes: lead.notes || "",
                              source: lead.source || "",
                              assigned_to: lead.assigned_to || ""
                            });
                            setShowLeadEditModal(true);
                          }}
                          className="bg-gray-50 border-gray-200 hover:bg-gray-100"
                        >
                          ✏️ Edit
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedLeadForActions(lead);
                            setActionType('remark');
                            setShowLeadActionsPanel(true);
                          }}
                          className="bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                        >
                          💭 Remark
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Sales Pipeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {["New", "Qualified", "Proposal", "Negotiation", "Won"].map((status) => {
                const statusLeads = leads.filter(lead => lead.status === status);
                return (
                  <Card key={status} className="bg-white shadow-lg border-emerald-100">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-gray-900 flex items-center justify-between">
                        {status}
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                          {statusLeads.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {statusLeads.map((lead) => (
                          <div
                            key={lead.id}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-emerald-50 transition-colors cursor-pointer"
                            onClick={() => setSelectedLead(lead)}
                          >
                            <p className="font-medium text-gray-900 text-sm">{lead.name}</p>
                            <p className="text-xs text-gray-600">{lead.phone}</p>
                            {lead.budget && (
                              <p className="text-xs text-emerald-600 font-medium mt-1">
                                ₹{lead.budget.toLocaleString('en-IN')}
                              </p>
                            )}
                          </div>
                        ))}
                        {statusLeads.length === 0 && (
                          <p className="text-sm text-gray-500 italic text-center py-4">
                            No leads in this stage
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
              <div className="flex gap-2">
                {/* Voice-to-Task Feature */}
                <div className="flex items-center gap-2 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <Button
                    onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                    variant={isRecording ? "destructive" : "outline"}
                    size="sm"
                    className={isRecording ? "bg-red-500 hover:bg-red-600" : "border-emerald-300 hover:bg-emerald-100"}
                  >
                    {isRecording ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                    {isRecording ? "Stop" : "Voice Task"}
                  </Button>
                  {voiceInput && (
                    <Button
                      onClick={processVoiceToTask}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Create AI Task
                    </Button>
                  )}
                </div>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white" 
                  onClick={() => {
                    setSelectedProject(null);
                    setShowFileUploadModal(true);
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Task</DialogTitle>
                      <DialogDescription>Add a new task to your workflow</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={createTask} className="space-y-4">
                      {/* Voice Input Integration */}
                      <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                        <Label className="text-emerald-800 font-medium">🎤 Voice Input</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            type="button"
                            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                            variant={isRecording ? "destructive" : "outline"}
                            size="sm"
                            className="flex-shrink-0"
                          >
                            {isRecording ? <MicOff className="h-4 w-4 mr-1" /> : <Mic className="h-4 w-4 mr-1" />}
                            {isRecording ? "Stop" : "Record"}
                          </Button>
                          {voiceInput && (
                            <Button
                              type="button"
                              onClick={() => {
                                // Auto-populate task fields from voice input
                                const words = voiceInput.split(' ');
                                const title = words.slice(0, 5).join(' '); // First 5 words as title
                                const description = voiceInput; // Full voice input as description
                                setNewTask({
                                  ...newTask,
                                  title: title || newTask.title,
                                  description: description || newTask.description
                                });
                                setVoiceInput(""); // Clear voice input after use
                              }}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0"
                            >
                              Use Voice
                            </Button>
                          )}
                        </div>
                        {voiceInput && (
                          <div className="mt-2 p-2 bg-white rounded border text-sm text-gray-700">
                            <strong>Voice Input:</strong> {voiceInput}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="task-title">Title *</Label>
                        <Input
                          id="task-title"
                          value={newTask.title}
                          onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="task-description">Description</Label>
                        <Textarea
                          id="task-description"
                          value={newTask.description}
                          onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="task-priority">Priority</Label>
                        <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="task-due-date">Due Date</Label>
                        <Input
                          id="task-due-date"
                          type="datetime-local"
                          value={newTask.due_date}
                          onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                        />
                      </div>
                      <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                        Create Task
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Voice Input Display */}
            {voiceInput && (
              <Card className="bg-emerald-50 border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-emerald-800 flex items-center">
                    <Mic className="h-5 w-5 mr-2" />
                    Voice Input Captured
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-emerald-700 italic">"{voiceInput}"</p>
                  <div className="mt-3 flex gap-2">
                    <Button 
                      onClick={processVoiceToTask}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Convert to Task
                    </Button>
                    <Button 
                      onClick={() => setVoiceInput("")}
                      variant="outline"
                      size="sm"
                    >
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <Card key={task.id} className="bg-white shadow-lg border-emerald-100 hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-gray-900">{task.title}</CardTitle>
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    </div>
                    {task.description && (
                      <CardDescription>{task.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <Badge variant="outline" className={getTaskStatusColor(task.status)}>{task.status}</Badge>
                      </div>
                      {task.due_date && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Due:</span>
                          <span className="text-sm text-gray-900">
                            {new Date(task.due_date).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Created:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(task.created_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      
                      {/* Enhanced Task Actions */}
                      <div className="mt-4 space-y-2">
                        {task.status === "Pending" && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                              onClick={() => updateTaskStatus(task.id, "In Progress", "Started working on task")}
                            >
                              ▶️ Start
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openTaskRemarkModal(task, "start")}
                            >
                              💭 Remark
                            </Button>
                          </div>
                        )}
                        
                        {task.status === "In Progress" && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => updateTaskStatus(task.id, "Completed", "Task completed successfully")}
                            >
                              ✅ Complete
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openTaskRemarkModal(task, "progress")}
                            >
                              💭 Update
                            </Button>
                          </div>
                        )}
                        
                        {task.status === "Completed" && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openTaskRemarkModal(task, "completed")}
                            >
                              📝 View Remarks
                            </Button>
                          </div>
                        )}
                        
                        {/* Upload Button for Individual Tasks */}
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full bg-purple-50 border-purple-200 hover:bg-purple-100"
                          onClick={() => openTaskUploadModal(task)}
                        >
                          📎 Upload Files
                        </Button>
                      </div>
                      
                      {/* Task Remarks Preview */}
                      {task.remarks && task.remarks.length > 0 && (
                        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">Latest Remark:</div>
                          <div className="text-sm text-gray-800 italic">
                            "{task.remarks[task.remarks.length - 1].content.substring(0, 100)}..."
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(task.remarks[task.remarks.length - 1].timestamp).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ERP Tab */}
          <TabsContent value="erp" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Package className="h-8 w-8 mr-3 text-emerald-600" />
                ERP Management
              </h2>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                Inventory • Invoicing • Projects
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Inventory Management */}
              <Card className="bg-white border-emerald-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-emerald-800 flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Inventory Management
                  </CardTitle>
                  <CardDescription>Products, stock levels, and alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-600">Total Products</p>
                      <p className="text-2xl font-bold text-blue-800">{products.length}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-red-600">Low Stock</p>
                      <p className="text-2xl font-bold text-red-800">{inventoryAlerts.length}</p>
                    </div>
                  </div>

                  {inventoryAlerts.length > 0 && (
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                        <span className="font-medium text-red-800">Stock Alerts</span>
                      </div>
                      {inventoryAlerts.slice(0, 3).map((alert, index) => (
                        <div key={index} className="text-sm text-red-700 mb-1">
                          • {alert.message}
                        </div>
                      ))}
                    </div>
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                        <DialogDescription>Add product to inventory</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={createProduct} className="space-y-4">
                        <div>
                          <Label htmlFor="product-name">Product Name *</Label>
                          <Input
                            id="product-name"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="product-category">Category</Label>
                          <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Indoor Plants">Indoor Plants</SelectItem>
                              <SelectItem value="Outdoor Plants">Outdoor Plants</SelectItem>
                              <SelectItem value="Garden Tools">Garden Tools</SelectItem>
                              <SelectItem value="Fertilizers">Fertilizers</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="product-price">Price (₹) *</Label>
                            <Input
                              id="product-price"
                              type="number"
                              value={newProduct.price}
                              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="product-stock">Stock Qty *</Label>
                            <Input
                              id="product-stock"
                              type="number"
                              value={newProduct.stock_quantity}
                              onChange={(e) => setNewProduct({...newProduct, stock_quantity: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="product-supplier">Supplier</Label>
                          <Input
                            id="product-supplier"
                            value={newProduct.supplier}
                            onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
                          />
                        </div>
                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                          Add Product
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* Invoice Management */}
              <Card className="bg-white border-emerald-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-emerald-800 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Invoice Management
                  </CardTitle>
                  <CardDescription>Billing, payments, and receipts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-600">Total Invoices</p>
                      <p className="text-2xl font-bold text-green-800">{invoices.length}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm text-yellow-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-800">
                        {invoices.filter(inv => inv.payment_status === 'Pending').length}
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-50 p-3 rounded-lg">
                    <h4 className="font-medium text-emerald-800 mb-2">Recent Invoices</h4>
                    {invoices.slice(0, 3).map((invoice, index) => (
                      <div key={index} className="flex justify-between items-center text-sm mb-1">
                        <span className="text-emerald-700">{invoice.invoice_number}</span>
                        <span className="font-medium text-emerald-800">₹{invoice.total_amount?.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Invoice
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New Invoice</DialogTitle>
                        <DialogDescription>Generate invoice for customer</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={createInvoice} className="space-y-4">
                        <div>
                          <Label htmlFor="invoice-customer">Customer Name *</Label>
                          <Input
                            id="invoice-customer"
                            value={newInvoice.customer_name}
                            onChange={(e) => setNewInvoice({...newInvoice, customer_name: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="invoice-phone">Customer Phone *</Label>
                          <Input
                            id="invoice-phone"
                            value={newInvoice.customer_phone}
                            onChange={(e) => setNewInvoice({...newInvoice, customer_phone: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="invoice-email">Customer Email</Label>
                          <Input
                            id="invoice-email"
                            type="email"
                            value={newInvoice.customer_email}
                            onChange={(e) => setNewInvoice({...newInvoice, customer_email: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="invoice-notes">Notes</Label>
                          <Textarea
                            id="invoice-notes"
                            value={newInvoice.notes}
                            onChange={(e) => setNewInvoice({...newInvoice, notes: e.target.value})}
                            rows={2}
                          />
                        </div>
                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                          Create Invoice
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* Project Gallery */}
              <Card className="bg-white border-emerald-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-emerald-800 flex items-center">
                    <Camera className="h-5 w-5 mr-2" />
                    Project Gallery
                  </CardTitle>
                  <CardDescription>Portfolio and client testimonials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm text-purple-600">Projects</p>
                      <p className="text-2xl font-bold text-purple-800">{projects.length}</p>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <p className="text-sm text-indigo-600">Featured</p>
                      <p className="text-2xl font-bold text-indigo-800">
                        {projects.filter(proj => proj.is_featured).length}
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-50 p-3 rounded-lg">
                    <h4 className="font-medium text-emerald-800 mb-2">Recent Projects</h4>
                    {projects.slice(0, 3).map((project, index) => (
                      <div key={index} className="text-sm text-emerald-700 mb-1">
                        • {project.project_name} - {project.location}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Project
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Project to Gallery</DialogTitle>
                        <DialogDescription>Showcase your completed project</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={createProject} className="space-y-4">
                        <div>
                          <Label htmlFor="project-name">Project Name *</Label>
                          <Input
                            id="project-name"
                            value={newProject.project_name}
                            onChange={(e) => setNewProject({...newProject, project_name: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="project-client">Client Name *</Label>
                          <Input
                            id="project-client"
                            value={newProject.client_name}
                            onChange={(e) => setNewProject({...newProject, client_name: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="project-location">Location *</Label>
                          <Input
                            id="project-location"
                            value={newProject.location}
                            onChange={(e) => setNewProject({...newProject, location: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="project-type">Project Type</Label>
                          <Select value={newProject.project_type} onValueChange={(value) => setNewProject({...newProject, project_type: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Balcony Garden">Balcony Garden</SelectItem>
                              <SelectItem value="Terrace Garden">Terrace Garden</SelectItem>
                              <SelectItem value="Indoor Plants">Indoor Plants</SelectItem>
                              <SelectItem value="Vertical Garden">Vertical Garden</SelectItem>
                              <SelectItem value="Landscape Design">Landscape Design</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="project-budget">Budget Range</Label>
                          <Input
                            id="project-budget"
                            value={newProject.budget_range}
                            onChange={(e) => setNewProject({...newProject, budget_range: e.target.value})}
                            placeholder="e.g., ₹25,000 - ₹50,000"
                          />
                        </div>
                        <div>
                          <Label htmlFor="project-description">Description</Label>
                          <Textarea
                            id="project-description"
                            value={newProject.description}
                            onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="project-testimonial">Client Testimonial</Label>
                          <Textarea
                            id="project-testimonial"
                            value={newProject.testimonial}
                            onChange={(e) => setNewProject({...newProject, testimonial: e.target.value})}
                            rows={2}
                            placeholder="What did the client say about this project?"
                          />
                        </div>
                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                          Add to Gallery
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                    
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700" 
                    size="sm"
                    onClick={() => {
                      setSelectedProject(null);
                      setShowFileUploadModal(true);
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </div>
                </CardContent>
              </Card>
            </div>

            {/* Executive Dashboard Summary */}
            {executiveDashboard && (
              <Card className="bg-gradient-to-r from-emerald-50 to-green-100 border-emerald-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-emerald-800 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Business Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-emerald-800">
                        ₹{(executiveDashboard.business_overview.total_revenue_ytd / 100000).toFixed(1)}L
                      </p>
                      <p className="text-sm text-emerald-600">Revenue YTD</p>
                      <Badge className="bg-green-100 text-green-800 mt-1">
                        +{executiveDashboard.business_overview.growth_rate}%
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-emerald-800">
                        {executiveDashboard.business_overview.active_customers}
                      </p>
                      <p className="text-sm text-emerald-600">Active Customers</p>
                      <Badge className="bg-emerald-100 text-emerald-800 mt-1">
                        {executiveDashboard.business_overview.customer_satisfaction}/5 ⭐
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-emerald-800">
                        {executiveDashboard.sales_metrics.conversion_rate}%
                      </p>
                      <p className="text-sm text-emerald-600">Conversion Rate</p>
                      <Badge className="bg-blue-100 text-blue-800 mt-1">
                        {executiveDashboard.sales_metrics.sales_cycle_days} days cycle
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-emerald-800">
                        {executiveDashboard.financial_health.profit_margin}%
                      </p>
                      <p className="text-sm text-emerald-600">Profit Margin</p>
                      <Badge className="bg-purple-100 text-purple-800 mt-1">
                        Healthy
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* HRMS Tab */}
          <TabsContent value="hrms" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <UserCheck className="h-8 w-8 mr-3 text-emerald-600" />
                HRMS - Human Resource Management
              </h2>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                Attendance • Payroll • Leave Management
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Attendance Management */}
              <Card className="bg-white border-emerald-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-emerald-800 flex items-center">
                    <Clock2 className="h-5 w-5 mr-2" />
                    Smart Attendance System
                  </CardTitle>
                  <CardDescription>Face recognition + GPS tracking</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-green-800">Today's Attendance</h4>
                      <Badge className="bg-green-100 text-green-800">
                        {new Date().toLocaleDateString('en-IN')}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-800">8</p>
                        <p className="text-xs text-green-600">Present</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-800">1</p>
                        <p className="text-xs text-red-600">Absent</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-800">1</p>
                        <p className="text-xs text-yellow-600">Late</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700" 
                      size="sm"
                      onClick={() => setShowFaceCheckInModal(true)}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Face Check-In
                    </Button>
                    
                    {lastCheckInTime && (
                      <div className="text-xs text-gray-600 text-center">
                        Last check-in: {new Date(lastCheckInTime).toLocaleString()}
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full border-emerald-300 hover:bg-emerald-50" 
                      size="sm"
                      onClick={handleGpsCheckin}
                      disabled={isCheckingIn}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {isCheckingIn ? "Locating..." : "GPS Check-In"}
                    </Button>
                  </div>

                  <div className="bg-emerald-50 p-3 rounded-lg">
                    <h5 className="font-medium text-emerald-800 mb-2">Recent Check-ins</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-emerald-700">Rajesh Kumar</span>
                        <span className="text-emerald-600">09:15 AM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-700">Priya Sharma</span>
                        <span className="text-emerald-600">09:22 AM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-700">Amit Patel</span>
                        <span className="text-emerald-600">09:45 AM</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payroll Management */}
              <Card className="bg-white border-emerald-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-emerald-800 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Payroll Management
                  </CardTitle>
                  <CardDescription>Salary calculations and reports</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {payrollReport && (
                    <>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-blue-800">Monthly Payroll</h4>
                          <Badge className="bg-blue-100 text-blue-800">
                            {payrollReport.month}/{payrollReport.year}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-800">
                              ₹{(payrollReport.total_payroll / 1000).toFixed(0)}K
                            </p>
                            <p className="text-xs text-blue-600">Total Payroll</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-800">{payrollReport.total_employees}</p>
                            <p className="text-xs text-blue-600">Employees</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-emerald-50 p-3 rounded-lg">
                        <h5 className="font-medium text-emerald-800 mb-2">Employee Salaries</h5>
                        <div className="space-y-2">
                          {payrollReport.employees?.slice(0, 3).map((emp, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <div>
                                <span className="text-emerald-700 font-medium">{emp.name}</span>
                                <br />
                                <span className="text-emerald-600 text-xs">{emp.department}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-emerald-800 font-medium">
                                  ₹{emp.net_salary?.toLocaleString('en-IN')}
                                </span>
                                <br />
                                <span className="text-emerald-600 text-xs">
                                  {emp.days_worked || 0} days
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="border-emerald-300 hover:bg-emerald-50" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700" 
                      size="sm"
                      onClick={handleProcessPayroll}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Process
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Leave Management */}
              <Card className="bg-white border-emerald-200 shadow-lg lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-emerald-800 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Leave Management System
                  </CardTitle>
                  <CardDescription>Apply, approve, and track employee leaves</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-orange-800">5</p>
                      <p className="text-sm text-orange-600">Pending Requests</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-800">12</p>
                      <p className="text-sm text-green-600">Approved</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-red-800">2</p>
                      <p className="text-sm text-red-600">Rejected</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-800">15</p>
                      <p className="text-sm text-blue-600">Avg Days/Month</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => setShowLeaveModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Apply Leave
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-emerald-300 hover:bg-emerald-50"
                      onClick={() => {
                        toast({
                          title: "Leave Requests",
                          description: "Feature coming soon - will show all leave requests"
                        });
                      }}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      View Requests
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Assistant Tab - Comprehensive AI Stack */}
          <TabsContent value="ai" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Brain className="h-8 w-8 mr-3 text-emerald-600" />
                Comprehensive AI Stack
              </h2>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                GPT-5 + Claude Sonnet 4 + Gemini 2.5 Pro
              </Badge>
            </div>

            {/* AI Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Button 
                onClick={() => generateAIInsights("leads")}
                className="bg-blue-600 hover:bg-blue-700 text-white h-20 flex flex-col items-center justify-center"
              >
                <Users className="h-6 w-6 mb-1" />
                <span className="text-xs">CRM AI</span>
              </Button>
              <Button 
                onClick={() => generateAIInsights("performance")}
                className="bg-green-600 hover:bg-green-700 text-white h-20 flex flex-col items-center justify-center"
              >
                <TrendingUp className="h-6 w-6 mb-1" />
                <span className="text-xs">Sales AI</span>
              </Button>
              <Button 
                onClick={() => generateContent("social_post")}
                className="bg-purple-600 hover:bg-purple-700 text-white h-20 flex flex-col items-center justify-center"
              >
                <MessageSquare className="h-6 w-6 mb-1" />
                <span className="text-xs">Marketing AI</span>
              </Button>
              <Button 
                onClick={() => generateContent("strategic_plan")}
                className="bg-orange-600 hover:bg-orange-700 text-white h-20 flex flex-col items-center justify-center"
              >
                <Package className="h-6 w-6 mb-1" />
                <span className="text-xs">Product AI</span>
              </Button>
              <Button 
                onClick={() => generateAIInsights("opportunities")}
                className="bg-red-600 hover:bg-red-700 text-white h-20 flex flex-col items-center justify-center"
              >
                <BarChart3 className="h-6 w-6 mb-1" />
                <span className="text-xs">Analytics AI</span>
              </Button>
              <Button 
                onClick={() => generateContent("offline_marketing")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white h-20 flex flex-col items-center justify-center"
              >
                <UserCheck className="h-6 w-6 mb-1" />
                <span className="text-xs">HR AI</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Conversational CRM AI */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-blue-800 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Conversational CRM AI
                  </CardTitle>
                  <CardDescription>
                    AI-powered lead scoring, conversation analysis, and client insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => handleAIFeature('lead-scoring')}
                    size="sm"
                    variant="outline"
                    className="w-full border-blue-300 hover:bg-blue-50"
                  >
                    Smart Lead Scoring
                  </Button>
                  <Button 
                    onClick={() => handleAIFeature('conversation-analysis')}
                    size="sm"
                    variant="outline"
                    className="w-full border-blue-300 hover:bg-blue-50"
                  >
                    Conversation Analysis
                  </Button>
                  <Button 
                    onClick={() => handleAIFeature('client-context')}
                    size="sm"
                    variant="outline"
                    className="w-full border-blue-300 hover:bg-blue-50"
                  >
                    Client Context Recall
                  </Button>
                </CardContent>
              </Card>

              {/* Sales & Pipeline AI */}
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Sales & Pipeline AI
                  </CardTitle>
                  <CardDescription>
                    Deal prediction, proposal generation, and sales optimization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => handleAIFeature('deal-prediction')}
                    size="sm"
                    variant="outline"
                    className="w-full border-green-300 hover:bg-green-50"
                  >
                    Deal Predictions
                  </Button>
                  <Button 
                    onClick={() => handleAIFeature('proposal-generator')}
                    size="sm"
                    variant="outline"
                    className="w-full border-green-300 hover:bg-green-50"
                  >
                    Smart Proposals
                  </Button>
                  <Button 
                    onClick={() => handleAIFeature('pipeline-analysis')}
                    size="sm"
                    variant="outline"
                    className="w-full border-green-300 hover:bg-green-50"
                  >
                    Pipeline Health
                  </Button>
                </CardContent>
              </Card>

              {/* Marketing & Growth AI */}
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-purple-800 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Marketing & Growth AI
                  </CardTitle>
                  <CardDescription>
                    Campaign optimization, competitor analysis, and content creation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => handleAIFeature('campaign-optimizer')}
                    size="sm"
                    variant="outline"
                    className="w-full border-purple-300 hover:bg-purple-50"
                  >
                    Campaign Optimizer
                  </Button>
                  <Button 
                    onClick={() => handleAIFeature('competitor-analysis')}
                    size="sm"
                    variant="outline"
                    className="w-full border-purple-300 hover:bg-purple-50"
                  >
                    Competitor Analysis
                  </Button>
                  <Button 
                    onClick={() => generateContent("social_post")}
                    size="sm"
                    variant="outline"
                    className="w-full border-purple-300 hover:bg-purple-50"
                  >
                    Content Creation
                  </Button>
                </CardContent>
              </Card>

              {/* Product/Project/Gallery AI */}
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-orange-800 flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Product & Project AI
                  </CardTitle>
                  <CardDescription>
                    Smart cataloging, design suggestions, and project optimization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => handleAIFeature('smart-catalog')}
                    size="sm"
                    variant="outline"
                    className="w-full border-orange-300 hover:bg-orange-50"
                  >
                    Smart Product Catalog
                  </Button>
                  <Button 
                    onClick={() => handleAIFeature('design-suggestions')}
                    size="sm"
                    variant="outline"
                    className="w-full border-orange-300 hover:bg-orange-50"
                  >
                    AI Design Suggestions
                  </Button>
                  <Button 
                    onClick={() => handleAIFeature('project-optimizer')}
                    size="sm"
                    variant="outline"
                    className="w-full border-orange-300 hover:bg-orange-50"
                  >
                    Project Optimization
                  </Button>
                </CardContent>
              </Card>

              {/* Analytics & Admin AI */}
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Analytics & Admin AI
                  </CardTitle>
                  <CardDescription>
                    Business intelligence, forecasting, and strategic insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => handleAIFeature('business-intelligence')}
                    size="sm"
                    variant="outline"
                    className="w-full border-red-300 hover:bg-red-50"
                  >
                    Business Intelligence
                  </Button>
                  <Button 
                    onClick={() => handleAIFeature('predictive-forecasting')}
                    size="sm"
                    variant="outline"
                    className="w-full border-red-300 hover:bg-red-50"
                  >
                    Predictive Forecasting
                  </Button>
                  <Button 
                    onClick={() => handleAIFeature('performance-analytics')}
                    size="sm"
                    variant="outline"
                    className="w-full border-red-300 hover:bg-red-50"
                  >
                    Performance Analytics
                  </Button>
                </CardContent>
              </Card>

              {/* HR & Team Operations AI */}
              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-indigo-800 flex items-center">
                    <UserCheck className="h-5 w-5 mr-2" />
                    HR & Team Operations AI
                  </CardTitle>
                  <CardDescription>
                    Performance analysis, smart scheduling, and team optimization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => handleAIFeature('performance-analysis')}
                    size="sm"
                    variant="outline"
                    className="w-full border-indigo-300 hover:bg-indigo-50"
                  >
                    Performance Analysis
                  </Button>
                  <Button 
                    onClick={() => handleAIFeature('smart-scheduling')}
                    size="sm"
                    variant="outline"
                    className="w-full border-indigo-300 hover:bg-indigo-50"
                  >
                    Smart Scheduling
                  </Button>
                  <Button 
                    onClick={() => handleAIFeature('team-optimization')}
                    size="sm"
                    variant="outline"
                    className="w-full border-indigo-300 hover:bg-indigo-50"
                  >
                    Team Optimization
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Voice-to-Task AI Panel */}
            <Card className="bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-emerald-800 flex items-center">
                  <Mic className="h-5 w-5 mr-2" />
                  Voice-to-Task AI (GPT-5 Powered)
                </CardTitle>
                <CardDescription>
                  Speak naturally and AI will create structured tasks with intelligent automation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {voiceInput ? (
                  <div className="bg-white p-4 rounded-lg border border-emerald-200">
                    <p className="text-sm text-gray-600 mb-2">Captured Voice Input:</p>
                    <p className="text-emerald-700 font-medium italic">"{voiceInput}"</p>
                    <div className="mt-3 flex gap-2">
                      <Button 
                        onClick={processVoiceToTask}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Process with AI
                      </Button>
                      <Button 
                        onClick={() => setVoiceInput("")}
                        variant="outline"
                        size="sm"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Button
                      onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                      size="lg"
                      variant={isRecording ? "destructive" : "default"}
                      className={isRecording ? 
                        "bg-red-500 hover:bg-red-600 text-white animate-pulse" : 
                        "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="h-6 w-6 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="h-6 w-6 mr-2" />
                          Start Voice Command
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-gray-600 mt-2">
                      {isRecording ? "🎤 Listening... Speak your business requirements" : "Click to start intelligent voice command"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Results Panel */}
            {(aiInsights.length > 0 || generatedContent) && (
              <Card className="bg-white border-emerald-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-emerald-800 flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    AI Results & Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiInsights.length > 0 && (
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                      <h4 className="font-medium text-emerald-800 mb-3">🧠 AI Business Insights:</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {aiInsights.map((insight, index) => (
                          <div key={index} className="text-sm text-emerald-700 flex items-start bg-white p-2 rounded border">
                            <Bot className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-emerald-600" />
                            {insight}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {generatedContent && (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h4 className="font-medium text-purple-800 mb-3">✨ AI Generated Content:</h4>
                      <div className="bg-white p-3 rounded border text-sm text-purple-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
                        {generatedContent}
                      </div>
                      <Button 
                        onClick={() => navigator.clipboard.writeText(generatedContent)}
                        size="sm"
                        variant="outline"
                        className="mt-2 border-purple-300 hover:bg-purple-100"
                      >
                        📋 Copy Content
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* AI System Status */}
            <Card className="bg-white border-emerald-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-emerald-800 flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Hybrid AI System Status
                </CardTitle>
                <CardDescription>
                  Multi-model AI orchestration for optimal business performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <p className="font-semibold text-green-800">OpenAI GPT-5</p>
                      <p className="text-xs text-green-600">Primary Engine</p>
                      <p className="text-xs text-gray-500">Task automation, workflows, insights</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">🟢 Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <p className="font-semibold text-blue-800">Claude Sonnet 4</p>
                      <p className="text-xs text-blue-600">Memory Layer</p>
                      <p className="text-xs text-gray-500">Context, history, complex reasoning</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">🟢 Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div>
                      <p className="font-semibold text-purple-800">Gemini 2.5 Pro</p>
                      <p className="text-xs text-purple-600">Multimodal</p>
                      <p className="text-xs text-gray-500">Creative, visual, Google integration</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">🟢 Active</Badge>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Zap className="h-4 w-4 mr-1 text-emerald-600" />
                      Intelligent Task Routing
                    </span>
                    <span className="flex items-center">
                      <Brain className="h-4 w-4 mr-1 text-emerald-600" />
                      Contextual Memory
                    </span>
                    <span className="flex items-center">
                      <Sparkles className="h-4 w-4 mr-1 text-emerald-600" />
                      Creative Optimization
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Panel Tab */}
          <TabsContent value="admin" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Settings className="h-8 w-8 mr-3 text-emerald-600" />
                Super Admin Panel
              </h2>
              <div className="flex items-center space-x-2">
                <Badge className="bg-red-100 text-red-800 border-red-300">
                  Full Access Mode
                </Badge>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDigitalMarketingDashboard(!showDigitalMarketingDashboard)}
                  className="bg-purple-50 border-purple-200 hover:bg-purple-100"
                >
                  📊 Marketing Manager
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLeadRoutingPanel(!showLeadRoutingPanel)}
                  className="bg-green-50 border-green-200 hover:bg-green-100"
                >
                  🔀 Lead Routing
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWorkflowAuthoringPanel(!showWorkflowAuthoringPanel)}
                  className="bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
                >
                  ⚡ Workflow Authoring
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRoleManagementPanel(!showRoleManagementPanel)}
                  className="bg-blue-50 border-blue-200 hover:bg-blue-100"
                >
                  👥 Role Management
                </Button>
              </div>
            </div>

            {/* Digital Marketing Dashboard */}
            {showDigitalMarketingDashboard && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <DigitalMarketingDashboard isVisible={showDigitalMarketingDashboard} />
              </div>
            )}

            {/* Lead Routing Panel */}
            {showLeadRoutingPanel && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <LeadRoutingPanel isVisible={showLeadRoutingPanel} />
              </div>
            )}

            {/* Workflow Authoring Panel */}
            {showWorkflowAuthoringPanel && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <WorkflowAuthoringPanel isVisible={showWorkflowAuthoringPanel} />
              </div>
            )}

            {/* Role Management Panel */}
            {showRoleManagementPanel && currentUser && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <RoleManagementPanel currentUser={currentUser} />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Management */}
              <Card className="bg-white border-emerald-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-emerald-800 flex items-center">
                    <Edit className="h-5 w-5 mr-2" />
                    Lead Categories Management
                  </CardTitle>
                  <CardDescription>
                    Add, edit, or delete lead categories for better organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add New Category */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter new category name"
                      value={newCustomCategory}
                      onChange={(e) => setNewCustomCategory(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={addCustomCategory}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>

                  {/* Default Categories */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Default Categories:</Label>
                    <div className="bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto">
                      <div className="grid grid-cols-1 gap-1">
                        {LEAD_CATEGORIES.map((category) => (
                          <div key={category} className="text-sm text-gray-600 px-2 py-1 bg-white rounded border">
                            {category}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Custom Categories */}
                  {customCategories.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-emerald-700 mb-2 block">Custom Categories:</Label>
                      <div className="space-y-2">
                        {customCategories.map((category) => (
                          <div key={category} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                            <span className="font-medium text-emerald-800">{category}</span>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-emerald-300 hover:bg-emerald-100"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteCustomCategory(category)}
                                className="border-red-300 hover:bg-red-100 text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* System Statistics */}
              <Card className="bg-white border-emerald-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-emerald-800 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    System Statistics
                  </CardTitle>
                  <CardDescription>
                    Comprehensive system performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardStats && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-600">Total Records</p>
                          <p className="text-2xl font-bold text-blue-800">{dashboardStats.total_leads + (dashboardStats.pending_tasks || 0)}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-green-600">Conversion Rate</p>
                          <p className="text-2xl font-bold text-green-800">{dashboardStats.conversion_rate}%</p>
                        </div>
                      </div>

                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <h4 className="font-medium text-emerald-800 mb-2">Lead Sources Analysis</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-emerald-700">Website Sources</span>
                            <span className="text-sm font-medium text-emerald-800">45%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-emerald-700">Referrals</span>
                            <span className="text-sm font-medium text-emerald-800">30%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-emerald-700">Social Media</span>
                            <span className="text-sm font-medium text-emerald-800">25%</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="font-medium text-purple-800 mb-2">AI System Status</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-purple-700">AI Tasks Generated</span>
                            <span className="text-sm font-medium text-purple-800">{dashboardStats.ai_tasks_generated || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-purple-700">Models Active</span>
                            <Badge className="bg-purple-100 text-purple-800">3 Models</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* User Management */}
              <Card className="bg-white border-emerald-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-emerald-800 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    User & Role Management
                  </CardTitle>
                  <CardDescription>
                    Manage user access and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Authentication Status */}
                  {!currentUser ? (
                    <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-yellow-800 mb-3">Please login to manage users</p>
                      <Button 
                        onClick={() => setShowLoginModal(true)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        Login as Admin
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Current User Info */}
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-emerald-800">{currentUser.full_name}</p>
                            <p className="text-xs text-emerald-600">{currentUser.role} - {currentUser.department}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className="bg-emerald-100 text-emerald-800">Logged In</Badge>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={logout}
                              className="text-red-600 hover:text-red-700"
                            >
                              Logout
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Users List */}
                      {(currentUser.role === 'Super Admin' || currentUser.role === 'Admin' || currentUser.role === 'HR Manager') ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-800">System Users ({users.length})</h4>
                            <Button 
                              size="sm"
                              onClick={() => setShowAddUserModal(true)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add User
                            </Button>
                          </div>
                          
                          <div className="max-h-60 overflow-y-auto space-y-2">
                            {users.length === 0 ? (
                              <div className="text-center p-4 text-gray-500">
                                No users found. Click "Add User" to create the first user.
                              </div>
                            ) : (
                              users.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-800">{user.full_name}</p>
                                    <p className="text-xs text-gray-600">{user.role} - {user.email}</p>
                                    <p className="text-xs text-gray-500">{user.department || 'No Department'}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      className={
                                        user.status === 'Active' ? 'bg-green-100 text-green-800' :
                                        user.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                      }
                                    >
                                      {user.status}
                                    </Badge>
                                    {user.id !== currentUser.id && (
                                      <div className="flex gap-1">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => updateUserStatus(user.id, user.status === 'Active' ? 'Inactive' : 'Active')}
                                          className="text-xs"
                                        >
                                          {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                                        </Button>
                                        {currentUser.role === 'Super Admin' && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => deleteUser(user.id, user.full_name)}
                                            className="text-red-600 hover:text-red-700 text-xs"
                                          >
                                            Delete
                                          </Button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-yellow-800">Insufficient permissions to manage users</p>
                          <p className="text-xs text-yellow-600 mt-1">Admin or HR Manager access required</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* System Configuration */}
              <Card className="bg-white border-emerald-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-emerald-800 flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    System Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure system settings and integrations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="font-medium text-green-800">Telephony (Twilio)</p>
                        <p className="text-xs text-green-600">8447475761 - Active</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="font-medium text-green-800">WhatsApp Business</p>
                        <p className="text-xs text-green-600">360 Dialog Integration</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="font-medium text-green-800">AI Models</p>
                        <p className="text-xs text-green-600">GPT-5 + Claude + Gemini</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div>
                        <p className="font-medium text-yellow-800">Database Backup</p>
                        <p className="text-xs text-yellow-600">Last backup: 2 hours ago</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="border-emerald-300 hover:bg-emerald-50">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                    <Button variant="outline" className="border-emerald-300 hover:bg-emerald-50">
                      Backup Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Aavana 2.0 Floating Chat Interface */}
        {showAavana2 && (
          <div className="fixed bottom-20 right-20 w-96 h-[500px] bg-white border-2 border-emerald-200 rounded-lg shadow-2xl z-[60] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-4 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    Aavana 2.0
                  </h3>
                  <p className="text-xs opacity-90">Multilingual AI Assistant</p>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Language Selector */}
                  <select 
                    value={aavana2Language} 
                    onChange={(e) => setAavana2Language(e.target.value)}
                    className="text-xs bg-emerald-700 text-white border-0 rounded px-2 py-1"
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="en">English</option>
                    <option value="hi">हिंदी</option>
                    <option value="hi-en">Hinglish</option>
                    <option value="ta">தமிழ்</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAavana2(false)}
                    className="text-white hover:bg-emerald-700 h-6 w-6 p-0"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50">
              {aavana2History.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Brain className="h-12 w-12 mx-auto mb-3 text-emerald-300" />
                  <p className="text-sm">Start chatting with Aavana 2.0!</p>
                  <p className="text-xs">Supports Hindi, English, Hinglish & Tamil</p>
                  
                  {/* Language Test Buttons */}
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium">Test Language Detection:</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => testLanguageDetection("Hello, how are you?")}
                        className="text-xs px-2 py-1"
                      >
                        English
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => testLanguageDetection("kya haal hai?")}
                        className="text-xs px-2 py-1"
                      >
                        Hinglish
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => testLanguageDetection("नमस्ते कैसे हैं आप?")}
                        className="text-xs px-2 py-1"
                      >
                        हिंदी
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {aavana2History.map((msg, index) => (
                <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    msg.type === 'user' 
                      ? 'bg-emerald-600 text-white' 
                      : msg.type === 'error'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}>
                    <div className="text-sm">{msg.message}</div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-xs opacity-70">{msg.timestamp}</div>
                      {msg.language && (
                        <div className="text-xs bg-black bg-opacity-10 px-1 rounded">
                          {msg.language}
                        </div>
                      )}
                    </div>
                    
                    {/* Aavana 2.0 specific features */}
                    {msg.type === 'aavana' && (
                      <div className="mt-2 space-y-1">
                        {msg.intent && (
                          <div className="text-xs text-gray-600">
                            🎯 Intent: {msg.intent} ({Math.round(msg.confidence * 100)}%)
                          </div>
                        )}
                        
                        {msg.cached_audio_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => playAavanaAudio(msg.cached_audio_url)}
                            className="text-xs px-2 py-1 h-6"
                          >
                            🔊 Play Audio
                          </Button>
                        )}
                        
                        {msg.suggested_replies && msg.suggested_replies.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-xs text-gray-600">Quick replies:</div>
                            <div className="flex flex-wrap gap-1">
                              {msg.suggested_replies.map((reply, i) => (
                                <Button
                                  key={i}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => useSuggestedReply(reply)}
                                  className="text-xs px-2 py-1 h-6 border-emerald-300 hover:bg-emerald-50"
                                >
                                  {reply}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {msg.processing_time_ms && (
                          <div className="text-xs text-gray-500">
                            ⚡ {msg.processing_time_ms}ms
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
              <div className="flex space-x-2">
                <Input
                  value={aavana2Message}
                  onChange={(e) => setAavana2Message(e.target.value)}
                  placeholder={
                    aavana2Language === "hi" ? "अपना संदेश लिखें..." :
                    aavana2Language === "hi-en" ? "Apna message likhiye..." :
                    aavana2Language === "ta" ? "உங்கள் செய்தியை எழுதுங்கள்..." :
                    "Type your message..."
                  }
                  className="flex-1 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && sendAavana2Message()}
                />
                <Button 
                  onClick={sendAavana2Message}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 px-3"
                >
                  <span className="text-xs">Send</span>
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                🤖 Powered by GPT-5 + Claude + Gemini | Session: {aavana2SessionId ? aavana2SessionId.slice(-8) : 'New'}
              </div>
            </div>
          </div>
        )}

        {/* Aavana 2.0 Floating Button - Moved to LEFT side */}
        <Button
          onClick={() => setShowAavana2(!showAavana2)}
          className={`fixed bottom-6 left-6 w-16 h-16 rounded-full shadow-xl z-[9999] transition-all border-2 border-white ${
            showAavana2 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 hover:scale-110'
          }`}
          title="Aavana 2.0 - Multilingual AI Assistant"
          style={{ zIndex: 9999 }}
        >
          {showAavana2 ? (
            <span className="text-white text-xl font-bold">✕</span>
          ) : (
            <div className="flex flex-col items-center">
              <Brain className="h-7 w-7 text-white mb-1" />
              <span className="text-xs text-white font-medium">AI 2.0</span>
            </div>
          )}
        </Button>

        {/* Targets & Progress Floating Button - LEFT side */}
        <Button
          onClick={() => setShowTargets(!showTargets)}
          className={`fixed bottom-6 left-24 w-16 h-16 rounded-full shadow-xl z-[9999] transition-all border-2 border-white ${
            showTargets 
              ? 'bg-blue-500 hover:bg-blue-600 animate-pulse' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-110'
          }`}
          title="Targets & Progress Tracker"
          style={{ zIndex: 9999 }}
        >
          {showTargets ? (
            <span className="text-white text-xl font-bold">✕</span>
          ) : (
            <div className="flex flex-col items-center">
              <Target className="h-7 w-7 text-white mb-1" />
              <span className="text-xs text-white font-medium">Goals</span>
            </div>
          )}
        </Button>

        {/* Targets & Progress Panel */}
        {showTargets && (
          <div className="fixed bottom-24 left-6 w-96 h-[500px] bg-white border-2 border-blue-200 rounded-lg shadow-2xl z-[9998] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Targets & Progress
                  </h3>
                  <p className="text-xs opacity-90">Track your goals and achievements</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTargets(false)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => setShowCreateTargetModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create Target
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => fetchTargetsData()}
                    className="border-blue-300 hover:bg-blue-50"
                  >
                    <Award className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                </div>

                {/* Targets Display */}
                {Object.entries(targetsData).map(([period, data]) => (
                  <div key={period} className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-800 mb-3 capitalize flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {period} Targets
                    </h4>
                    
                    <div className="space-y-2">
                      {Object.entries(data).map(([type, metrics]) => {
                        const progress = metrics.achieved || 0;
                        const target = metrics.target || 0;
                        const percentage = target > 0 ? Math.round((progress / target) * 100) : 0;
                        
                        return (
                          <div key={type} className="bg-white rounded p-2 border">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium capitalize text-gray-700">
                                {type === 'sales' ? '💰 Sales' : type === 'leads' ? '👤 Leads' : '✅ Tasks'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {progress} / {target} ({percentage}%)
                              </span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                            <div className="flex justify-between mt-1">
                              <span className="text-xs text-gray-600">
                                {type === 'sales' ? `₹${progress.toLocaleString()}` : progress}
                              </span>
                              <span className="text-xs text-gray-600">
                                {type === 'sales' ? `₹${target.toLocaleString()}` : target}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Offline Queue Status */}
                {(() => {
                  const offlineQueue = JSON.parse(localStorage.getItem('aavana_offline_targets') || '[]');
                  const pendingCount = offlineQueue.filter(item => item.status === 'pending').length;
                  
                  if (pendingCount > 0) {
                    return (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                          <span className="text-sm text-yellow-800">
                            {pendingCount} target{pendingCount > 1 ? 's' : ''} queued offline
                          </span>
                        </div>
                        {!navigator.onLine && (
                          <p className="text-xs text-yellow-700 mt-1">
                            Will sync when connection is restored
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Create Target Modal */}
        {showCreateTargetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Create New Target
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateTargetModal(false)}
                  className="text-gray-500"
                >
                  ✕
                </Button>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const success = await createTarget();
                if (success) {
                  console.log('Target created successfully');
                }
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="target-type">Target Type *</Label>
                    <Select
                      value={newTargetForm.target_type}
                      onValueChange={(value) => setNewTargetForm({...newTargetForm, target_type: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="z-[10000]">
                        <SelectItem value="sales_amount">💰 Sales Revenue</SelectItem>
                        <SelectItem value="leads_count">👤 New Leads</SelectItem>
                        <SelectItem value="tasks_count">✅ Tasks Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="period">Period *</Label>
                    <Select
                      value={newTargetForm.period}
                      onValueChange={(value) => setNewTargetForm({...newTargetForm, period: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent className="z-[10000]">
                        <SelectItem value="daily">📅 Daily</SelectItem>
                        <SelectItem value="weekly">📊 Weekly</SelectItem>
                        <SelectItem value="monthly">📈 Monthly</SelectItem>
                        <SelectItem value="quarterly">📋 Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="target-value">Target Value *</Label>
                  <Input
                    id="target-value"
                    type="number"
                    value={newTargetForm.target_value}
                    onChange={(e) => setNewTargetForm({...newTargetForm, target_value: e.target.value})}
                    placeholder={newTargetForm.target_type === 'sales' ? 'Enter amount (₹)' : 'Enter quantity'}
                    className="mt-1"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="deadline">Deadline (Optional)</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newTargetForm.deadline}
                    onChange={(e) => setNewTargetForm({...newTargetForm, deadline: e.target.value})}
                    className="mt-1"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <Label htmlFor="reminder-frequency">Reminder Frequency</Label>
                  <Select
                    value={newTargetForm.reminder_frequency}
                    onValueChange={(value) => setNewTargetForm({...newTargetForm, reminder_frequency: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent className="z-[10000]">
                      <SelectItem value="hourly">⏰ Hourly</SelectItem>
                      <SelectItem value="daily">📅 Daily</SelectItem>
                      <SelectItem value="weekly">📊 Weekly</SelectItem>
                      <SelectItem value="monthly">📈 Monthly</SelectItem>
                      <SelectItem value="none">🔕 No Reminders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowCreateTargetModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={!newTargetForm.target_type || !newTargetForm.period || !newTargetForm.target_value}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Create Target
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      
      {/* Leave Application Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Apply for Leave</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLeaveModal(false)}
                className="text-gray-500"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="leave-type">Leave Type</Label>
                <Select
                  value={leaveForm.type}
                  onValueChange={(value) => setLeaveForm({...leaveForm, type: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                    <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                    <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                    <SelectItem value="Emergency Leave">Emergency Leave</SelectItem>
                    <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
                    <SelectItem value="Paternity Leave">Paternity Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={leaveForm.start_date}
                    onChange={(e) => setLeaveForm({...leaveForm, start_date: e.target.value})}
                    className="mt-1"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={leaveForm.end_date}
                    onChange={(e) => setLeaveForm({...leaveForm, end_date: e.target.value})}
                    className="mt-1"
                    min={leaveForm.start_date || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                  placeholder="Please provide reason for leave..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setShowLeaveModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApplyLeave}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  disabled={!leaveForm.start_date || !leaveForm.end_date}
                >
                  Submit Application
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Admin Login</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLoginModal(false)}
                className="text-gray-500"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="identifier">Username, Email, or Phone</Label>
                <Input
                  id="identifier"
                  type="text"
                  value={loginData.identifier}
                  onChange={(e) => setLoginData({...loginData, identifier: e.target.value})}
                  placeholder="Enter your username, email, or phone"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  placeholder="Enter your password"
                  className="mt-1"
                />
              </div>
              
              {/* Master Login Quick Access */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700 font-medium mb-2">Quick Master Access:</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLoginData({identifier: "master", password: "master123"});
                    }}
                    className="text-xs border-blue-300 hover:bg-blue-100"
                  >
                    Master Login
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLoginData({identifier: "admin", password: "admin123"});
                    }}
                    className="text-xs border-green-300 hover:bg-green-100"
                  >
                    Admin Login
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowLoginModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => login(loginData)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  disabled={!loginData.identifier || !loginData.password}
                >
                  Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddUserModal(false)}
                className="text-gray-500"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    placeholder="Enter username"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                    placeholder="Enter full name"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="Enter email address"
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    placeholder="Enter phone number"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={newUser.department}
                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                    placeholder="Enter department"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({...newUser, role: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Employee">Employee</SelectItem>
                    <SelectItem value="Sales Executive">Sales Executive</SelectItem>
                    <SelectItem value="Sales Manager">Sales Manager</SelectItem>
                    <SelectItem value="Marketing Manager">Marketing Manager</SelectItem>
                    <SelectItem value="HR Manager">HR Manager</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    {currentUser?.role === 'Super Admin' && (
                      <SelectItem value="Super Admin">Super Admin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Enter password"
                  className="mt-1"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setShowAddUserModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createUser(newUser)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  disabled={!newUser.username || !newUser.full_name || !newUser.email || !newUser.password}
                >
                  Create User
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced File Upload Modal */}
      {showFileUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">📎 File Upload Manager</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFileUploadModal(false)}
                  className="text-gray-500"
                >
                  ✕
                </Button>
              </div>
              
              <FileUploadComponent
                projectId={selectedProject?.id}
                onUploadComplete={(result) => {
                  console.log('File uploaded:', result);
                  // You can add logic here to refresh project files, etc.
                }}
                maxFiles={10}
              />
            </div>
          </div>
        </div>
      )}

      {/* Lead Actions Panel Modal */}
      {showLeadActionsPanel && selectedLeadForActions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  🔧 Lead Actions - {selectedLeadForActions.name}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowLeadActionsPanel(false);
                    setSelectedLeadForActions(null);
                  }}
                  className="text-gray-500"
                >
                  ✕
                </Button>
              </div>
              
              <LeadActionsPanel
                leadId={selectedLeadForActions.id}
                leadData={selectedLeadForActions}
                initialActionType={actionType}
                onActionComplete={(result) => {
                  console.log('Lead action completed:', result);
                  // Refresh leads data
                  fetchLeads();
                  // Reset action type
                  setActionType(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Voice STT Modal */}
      {showVoiceSTTModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">🎤 Voice Processing</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVoiceSTTModal(false)}
                  className="text-gray-500"
                >
                  ✕
                </Button>
              </div>
              
              <VoiceSTTComponent
                leadId={selectedLeadForActions?.id}
                onTasksExtracted={(tasks) => {
                  setExtractedTasks(tasks);
                  console.log('Tasks extracted:', tasks);
                }}
                onRemarkAdded={(remark) => {
                  console.log('Voice remark added:', remark);
                  // Refresh lead data if applicable
                  if (selectedLeadForActions) {
                    fetchLeads();
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Face Check-In Modal */}
      {showFaceCheckInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">📷 Face Check-In</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFaceCheckInModal(false)}
                  className="text-gray-500"
                >
                  ✕
                </Button>
              </div>
              
              <FaceCheckInComponent
                onCheckInComplete={(result) => {
                  console.log('Check-in completed:', result);
                  setLastCheckInTime(new Date().toISOString());
                  setShowFaceCheckInModal(false);
                  
                  toast({
                    title: "Check-in Successful",
                    description: "Your attendance has been recorded.",
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Lead Edit Modal */}
      {showLeadEditModal && editingLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">✏️ Edit Lead - {editingLead.name}</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowLeadEditModal(false);
                    setEditingLead(null);
                  }}
                  className="text-gray-500"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Full Name *</Label>
                    <Input
                      id="edit-name"
                      value={leadEditForm.name}
                      onChange={(e) => setLeadEditForm({ ...leadEditForm, name: e.target.value })}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-phone">Phone Number *</Label>
                    <Input
                      id="edit-phone"
                      value={leadEditForm.phone}
                      onChange={(e) => setLeadEditForm({ ...leadEditForm, phone: e.target.value })}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-email">Email Address</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={leadEditForm.email}
                      onChange={(e) => setLeadEditForm({ ...leadEditForm, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-company">Company</Label>
                    <Input
                      id="edit-company"
                      value={leadEditForm.company}
                      onChange={(e) => setLeadEditForm({ ...leadEditForm, company: e.target.value })}
                      placeholder="Enter company name"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-designation">Designation</Label>
                    <Input
                      id="edit-designation"
                      value={leadEditForm.designation}
                      onChange={(e) => setLeadEditForm({ ...leadEditForm, designation: e.target.value })}
                      placeholder="Enter designation"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-budget">Budget (₹)</Label>
                    <Input
                      id="edit-budget"
                      type="number"
                      value={leadEditForm.budget}
                      onChange={(e) => setLeadEditForm({ ...leadEditForm, budget: e.target.value })}
                      placeholder="Enter budget amount"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={leadEditForm.location}
                    onChange={(e) => setLeadEditForm({ ...leadEditForm, location: e.target.value })}
                    placeholder="Enter location"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-source">Lead Source</Label>
                  <Select value={leadEditForm.source} onValueChange={(value) => setLeadEditForm({ ...leadEditForm, source: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lead source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Cold Call">Cold Call</SelectItem>
                      <SelectItem value="Social Media">Social Media</SelectItem>
                      <SelectItem value="Advertisement">Advertisement</SelectItem>
                      <SelectItem value="Trade Show">Trade Show</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="edit-requirements">Requirements</Label>
                  <Textarea
                    id="edit-requirements"
                    value={leadEditForm.requirements}
                    onChange={(e) => setLeadEditForm({ ...leadEditForm, requirements: e.target.value })}
                    placeholder="Enter requirements"
                    rows="3"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    value={leadEditForm.notes}
                    onChange={(e) => setLeadEditForm({ ...leadEditForm, notes: e.target.value })}
                    placeholder="Enter additional notes"
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowLeadEditModal(false);
                    setEditingLead(null);
                  }}
                >
                  Cancel
                </Button>
                
                <Button
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token');
                      await axios.put(
                        `${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/leads/${editingLead.id}`,
                        leadEditForm,
                        { headers: { 'Authorization': `Bearer ${token}` } }
                      );
                      
                      await fetchLeads();
                      setShowLeadEditModal(false);
                      setEditingLead(null);
                      
                      toast({
                        title: "Lead Updated",
                        description: "Lead information has been updated successfully.",
                      });
                    } catch (error) {
                      console.error('Error updating lead:', error);
                      toast({
                        title: "Update Failed",
                        description: error.response?.data?.detail || "Failed to update lead.",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Update Lead
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Task Remark Modal */}
      {showTaskRemarkModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  💭 Task Remark - {selectedTask.title}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTaskRemarkModal(false)}
                  className="text-gray-500"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Stage: {taskRemarkStage}</Label>
                  <div className="text-sm text-gray-600 mt-1">
                    Adding remark for task at {taskRemarkStage} stage
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="task-remark">Remark *</Label>
                  <Textarea
                    id="task-remark"
                    value={taskRemark}
                    onChange={(e) => setTaskRemark(e.target.value)}
                    placeholder="Enter your remark about this task..."
                    rows="4"
                    required
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setShowVoiceSTTModal(true)}
                    variant="outline"
                    className="bg-purple-50 border-purple-200 hover:bg-purple-100"
                  >
                    🎤 Voice Remark
                  </Button>
                </div>
                
                {/* Show existing task remarks */}
                {selectedTask.remarks && selectedTask.remarks.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Previous Remarks</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedTask.remarks.map((remark, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-800">{remark.content}</div>
                          <div className="text-xs text-gray-500 mt-1 flex justify-between">
                            <span>Stage: {remark.stage}</span>
                            <span>{new Date(remark.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowTaskRemarkModal(false)}
                >
                  Cancel
                </Button>
                
                <Button
                  onClick={submitTaskRemark}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={!taskRemark.trim()}
                >
                  Save Remark
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Upload Modal */}
      {showTaskUploadModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  📎 Upload Files for Task: {selectedTask.title}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTaskUploadModal(false)}
                  className="text-gray-500"
                >
                  ✕
                </Button>
              </div>
              
              <FileUploadComponent
                projectId={`task_${selectedTask.id}`}
                onUploadComplete={(result) => {
                  console.log('Task file uploaded:', result);
                  toast({
                    title: "Files Uploaded",
                    description: `Files uploaded successfully for task: ${selectedTask.title}`,
                  });
                }}
                maxFiles={10}
                acceptedTypes={{
                  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
                  'application/pdf': ['.pdf'],
                  'text/*': ['.txt', '.csv', '.json'],
                  'application/vnd.ms-excel': ['.xls', '.xlsx'],
                  'application/msword': ['.doc', '.docx']
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      <Toaster />
    </div>
  );
};

export default App;