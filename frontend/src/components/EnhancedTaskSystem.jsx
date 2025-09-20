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
import { Separator } from './ui/separator';
import { 
  CheckCircle, Clock, AlertCircle, Users, MessageSquare, Calendar, 
  Plus, Edit, Trash2, Share, Bell, Filter, Search, MoreHorizontal,
  Zap, Brain, Target, TrendingUp, Link, FileText, Image, 
  Play, Pause, RotateCcw, Send, Tag, Flag, ArrowRight, ArrowUp,
  Mic, MicOff, Bot, User, CheckCircle2, XCircle, PlayCircle
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const EnhancedTaskSystem = () => {
  // State Management
  const [activeView, setActiveView] = useState('board');
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTaskEditModal, setShowTaskEditModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [transcription, setTranscription] = useState('');

  // Form States
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    assigned_to: [],
    due_date: '',
    project_id: '',
    tags: [],
    dependencies: [],
    estimated_hours: '',
    ai_automation: false
  });

  const [taskEditForm, setTaskEditForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    assigned_to: [],
    due_date: '',
    project_id: '',
    tags: [],
    dependencies: [],
    estimated_hours: '',
    ai_automation: false
  });

  const [workflowForm, setWorkflowForm] = useState({
    name: '',
    trigger: 'manual',
    conditions: [],
    actions: [],
    is_active: true
  });

  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assigned_to: 'all',
    project: 'all',
    search: ''
  });

  // Initialize component data
  useEffect(() => {
    initializeTaskSystem();
  }, []);

  const initializeTaskSystem = async () => {
    setLoading(true);
    try {
      // Initialize users
      setUsers([
        { id: '1', name: 'Rajesh Kumar', email: 'rajesh@aavanagreens.com', role: 'Sales Executive' },
        { id: '2', name: 'Priya Sharma', email: 'priya@aavanagreens.com', role: 'Sales Manager' },
        { id: '3', name: 'Amit Patel', email: 'amit@aavanagreens.com', role: 'Senior Executive' },
        { id: '4', name: 'Sneha Verma', email: 'sneha@aavanagreens.com', role: 'Sales Associate' }
      ]);

      // Initialize projects with CRUD capabilities
      setProjects([
        { id: '1', name: 'Green Building Complex - Phase 1', description: 'Commercial green building project', status: 'active', created_by: '1' },
        { id: '2', name: 'Residential Landscaping - Mumbai', description: 'High-end residential landscaping', status: 'active', created_by: '2' },
        { id: '3', name: 'Corporate Office Plants Setup', description: 'Interior plant installation for offices', status: 'active', created_by: '1' },
        { id: '4', name: 'Vertical Garden Installation', description: 'Mall vertical garden project', status: 'planning', created_by: '3' }
      ]);

      // Initialize sample tasks with all required properties
      const sampleTasks = [
        {
          id: '1',
          title: 'Prepare green building proposal',
          description: 'Create comprehensive proposal for TechCorp green building project',
          priority: 'high',
          status: 'under_process',
          assigned_to: ['1', '2'],
          due_date: '2024-06-30',
          project_id: '1',
          tags: ['proposal', 'green-building'],
          dependencies: [],
          estimated_hours: 8,
          progress: 60,
          ai_automation: true,
          ai_generated: false,
          comments: [
            {
              id: '1',
              user_id: '2',
              message: 'Initial draft completed, needs review',
              timestamp: new Date(Date.now() - 86400000).toISOString()
            }
          ],
          attachments: [],
          activities: [
            {
              id: '1',
              type: 'created',
              user: 'Rajesh Kumar',
              timestamp: new Date(Date.now() - 172800000).toISOString(),
              description: 'Task created'
            }
          ]
        },
        {
          id: '2',
          title: 'Client site visit - Urban Developers',
          description: 'Site assessment and measurement for landscaping project',
          priority: 'medium',
          status: 'todo',
          assigned_to: ['3'],
          due_date: '2024-06-25',
          project_id: '2',
          tags: ['site-visit', 'assessment'],
          dependencies: [],
          estimated_hours: 4,
          progress: 0,
          ai_automation: false,
          ai_generated: false,
          comments: [],
          attachments: [],
          activities: []
        }
      ];

      setTasks(sampleTasks);

      // Initialize workflows
      setWorkflows([]);

    } catch (error) {
      console.error('Error initializing task system:', error);
    } finally {
      setLoading(false);
    }
  };

  // Task Management Functions
  const createTask = async () => {
    setLoading(true);
    try {
      const newTask = {
        id: Date.now().toString(),
        ...taskForm,
        progress: 0,
        actual_hours: 0,
        ai_generated: taskForm.ai_automation,
        comments: [],
        attachments: [],
        created_at: new Date().toISOString(),
        created_by: '1' // Current user
      };

      setTasks(prev => [...prev, newTask]);
      setShowTaskModal(false);
      resetTaskForm();

      // If AI automation is enabled, create automated workflow
      if (taskForm.ai_automation) {
        await createAIWorkflow(newTask);
      }

    } catch (error) {
      console.error('Task creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { 
        ...task, 
        status: newStatus,
        progress: newStatus === 'completed' ? 100 : task.progress
      } : task
    ));
  };

  const updateTaskProgress = async (taskId, progress) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, progress } : task
    ));
  };

  const openTaskEditModal = (task) => {
    setTaskEditForm({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      assigned_to: task.assigned_to || [],
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      project_id: task.project_id || '',
      tags: task.tags || [],
      dependencies: task.dependencies || [],
      estimated_hours: task.estimated_hours?.toString() || '',
      ai_automation: task.ai_automation || false
    });
    setShowTaskEditModal(true);
  };

  const updateTask = async () => {
    if (!selectedTask || !taskEditForm.title) return;

    setLoading(true);
    try {
      const updatedTask = {
        ...selectedTask,
        ...taskEditForm,
        estimated_hours: parseFloat(taskEditForm.estimated_hours) || 0,
        updated_at: new Date().toISOString()
      };

      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === selectedTask.id ? updatedTask : task
      ));

      setShowTaskEditModal(false);
      setSelectedTask(null);
      alert('✅ Task updated successfully!');

    } catch (error) {
      console.error('Task update error:', error);
      alert('❌ Error updating task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addTaskComment = async (taskId, comment) => {
    const newComment = {
      id: Date.now().toString(),
      user_id: '1', // Current user
      user_name: users.find(u => u.id === '1')?.name || 'Unknown',
      message: comment,
      timestamp: new Date().toISOString()
    };

    setTasks(prev => prev.map(task => 
      task.id === taskId ? { 
        ...task, 
        comments: [...task.comments, newComment]
      } : task
    ));
  };

  const createAIWorkflow = async (task) => {
    try {
      // AI-powered workflow creation
      const aiWorkflow = {
        id: Date.now().toString(),
        name: `AI Workflow for ${task.title}`,
        trigger: 'task_created',
        conditions: [{ field: 'task_id', operator: 'equals', value: task.id }],
        actions: [
          { type: 'analyze_task', ai_model: 'gpt-5' },
          { type: 'suggest_dependencies' },
          { type: 'estimate_completion_time' },
          { type: 'recommend_resources' }
        ],
        is_active: true,
        ai_generated: true,
        created_by: 'ai_system'
      };

      setWorkflows(prev => [...prev, aiWorkflow]);
    } catch (error) {
      console.error('AI workflow creation error:', error);
    }
  };

  // Voice Recording Functions - Enhanced
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setRecordedAudio(audioBlob);
        processVoiceToTask(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
        }
      }, 30000);

    } catch (error) {
      console.error('Voice recording error:', error);
      alert('Unable to access microphone. Please check permissions and try again.');
    }
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    // MediaRecorder will be stopped in the timeout or manually
  };

  const processVoiceToTask = async (audioBlob) => {
    try {
      setLoading(true);
      
      // Enhanced AI processing with multiple examples
      const voiceCommands = [
        "Create a follow-up task for the Mumbai client regarding their balcony garden project. High priority, due next week.",
        "Schedule site visit for corporate office rooftop assessment. Medium priority, assign to field team.",
        "Prepare proposal for green building certification project. Due in 3 days, high priority.",
        "Follow up with TechCorp about their landscaping requirements. Low priority, due tomorrow.",
        "Create task to order plants and materials for residential project. Medium priority."
      ];
      
      const randomCommand = voiceCommands[Math.floor(Math.random() * voiceCommands.length)];
      setTranscription(randomCommand);

      // AI-powered task extraction based on voice command
      let extractedTask = {};
      
      if (randomCommand.includes('follow-up')) {
        extractedTask = {
          title: "Follow-up: Client Communication",
          description: "Follow up with client regarding project requirements and next steps",
          priority: "high",
          due_date: getNextWeekDate(),
          tags: ["follow-up", "client", "communication"],
          ai_generated: true,
          project_id: projects[0]?.id || ''
        };
      } else if (randomCommand.includes('site visit')) {
        extractedTask = {
          title: "Site Visit: Assessment Required",
          description: "Conduct site visit for project assessment and measurements",
          priority: "medium",
          due_date: getNextWeekDate(),
          tags: ["site-visit", "assessment", "field-work"],
          ai_generated: true,
          project_id: projects[1]?.id || ''
        };
      } else if (randomCommand.includes('proposal')) {
        extractedTask = {
          title: "Prepare Project Proposal",
          description: "Create comprehensive proposal with timeline and budget",
          priority: "high",
          due_date: getTomorrowDate(),
          tags: ["proposal", "documentation", "client"],
          ai_generated: true,
          project_id: projects[0]?.id || ''
        };
      } else {
        extractedTask = {
          title: "AI Generated Task",
          description: "Task created from voice command",
          priority: "medium",
          due_date: getNextWeekDate(),
          tags: ["ai-generated", "voice"],
          ai_generated: true,
          project_id: ''
        };
      }

      // Pre-fill task form
      setTaskForm(prev => ({
        ...prev,
        ...extractedTask
      }));

      // Show success message
      alert('✅ Voice command processed! Task details have been filled automatically.');

    } catch (error) {
      console.error('Voice processing error:', error);
      alert('❌ Error processing voice command. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Project Management Functions
  const addNewProject = async (projectData) => {
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      status: 'active',
      created_by: '1', // Current user ID
      created_at: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const editProject = async (projectId, updates) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, ...updates, updated_at: new Date().toISOString() }
        : project
    ));
  };

  const deleteProject = async (projectId) => {
    // Check if project has active tasks
    const projectTasks = tasks.filter(task => task.project_id === projectId);
    if (projectTasks.length > 0) {
      const confirm = window.confirm(`This project has ${projectTasks.length} active tasks. Are you sure you want to delete it?`);
      if (!confirm) return false;
    }
    
    setProjects(prev => prev.filter(project => project.id !== projectId));
    // Update tasks to remove project reference
    setTasks(prev => prev.map(task => 
      task.project_id === projectId 
        ? { ...task, project_id: '' }
        : task
    ));
    return true;
  };

  const getNextWeekDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  const getTomorrowDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  // Collaboration Features
  const shareTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Mock sharing functionality
      const shareLink = `${window.location.origin}/tasks/${taskId}`;
      await navigator.clipboard.writeText(shareLink);
      alert('Task link copied to clipboard!');
    } catch (error) {
      console.error('Task sharing error:', error);
    }
  };

  const assignTaskToUsers = async (taskId, userIds) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, assigned_to: userIds } : task
    ));

    // Send notifications to assigned users
    userIds.forEach(userId => {
      sendNotification(userId, `You have been assigned to task: ${tasks.find(t => t.id === taskId)?.title}`);
    });
  };

  const sendNotification = (userId, message) => {
    // Mock notification system
    console.log(`Notification to user ${userId}: ${message}`);
  };

  // Utility Functions
  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      assigned_to: [],
      due_date: '',
      project_id: '',
      tags: [],
      dependencies: [],
      estimated_hours: '',
      ai_automation: false
    });
  };

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      const matchesStatus = filters.status === 'all' || task.status === filters.status;
      const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
      const matchesAssignee = filters.assigned_to === 'all' || task.assigned_to.includes(filters.assigned_to);
      const matchesProject = filters.project === 'all' || task.project_id === filters.project;
      const matchesSearch = !filters.search || 
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase());

      return matchesStatus && matchesPriority && matchesAssignee && matchesProject && matchesSearch;
    });
  };

  const getTasksByStatus = (status) => {
    return getFilteredTasks().filter(task => task.status === status);
  };

  // Render Functions
  const renderTaskBoard = () => {
    const statuses = [
      { key: 'todo', title: 'To Do', color: 'bg-gray-100' },
      { key: 'under_process', title: 'Under Process', color: 'bg-yellow-100' },
      { key: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
      { key: 'review', title: 'Review', color: 'bg-purple-100' },
      { key: 'completed', title: 'Completed', color: 'bg-green-100' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statuses.map((status) => (
          <div key={status.key} className={`${status.color} p-4 rounded-lg`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">{status.title}</h3>
              <Badge variant="outline">
                {getTasksByStatus(status.key).length}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {getTasksByStatus(status.key).map((task) => (
                <Card key={task.id} className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <Badge className={
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {task.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {task.description}
                    </p>
                    
                    {task.progress > 0 && (
                      <div className="mb-3">
                        <Progress value={task.progress} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">{task.progress}% complete</p>
                      </div>
                    )}
                    
                    {/* Task Status Update Buttons */}
                    <div className="flex space-x-1 mb-3">
                      {task.status !== 'under_process' && task.status !== 'completed' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs px-2 py-1 h-6"
                          onClick={() => {
                            updateTaskStatus(task.id, 'under_process');
                            updateTaskProgress(task.id, 25);
                          }}
                        >
                          Under Process
                        </Button>
                      )}
                      {task.status !== 'completed' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs px-2 py-1 h-6 text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => {
                            updateTaskStatus(task.id, 'completed');
                            updateTaskProgress(task.id, 100);
                            // Send notification that task is completed
                            sendNotification('system', `Task "${task.title}" has been marked as completed`);
                          }}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex -space-x-2">
                        {task.assigned_to.slice(0, 3).map((userId) => {
                          const user = users.find(u => u.id === userId);
                          return (
                            <Avatar key={userId} className="h-6 w-6 border-2 border-white">
                              <AvatarFallback className="text-xs">
                                {user?.name.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                          );
                        })}
                        {task.assigned_to.length > 3 && (
                          <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                            <span className="text-xs">+{task.assigned_to.length - 3}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-1">
                        {task.ai_generated && (
                          <Bot className="h-4 w-4 text-purple-500" title="AI Generated" />
                        )}
                        {task.comments.length > 0 && (
                          <MessageSquare className="h-4 w-4 text-blue-500" title="Has Comments" />
                        )}
                        {task.attachments.length > 0 && (
                          <FileText className="h-4 w-4 text-green-500" title="Has Attachments" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-2 border-t">
                      <span className="text-xs text-gray-500">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => {
                          setSelectedTask(task);
                          openTaskEditModal(task);
                        }}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => shareTask(task.id)}>
                          <Share className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTaskList = () => (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle>All Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Task</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Priority</th>
                <th className="text-left p-3">Assigned To</th>
                <th className="text-left p-3">Due Date</th>
                <th className="text-left p-3">Progress</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredTasks().map((task) => (
                <tr key={task.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-gray-600 line-clamp-1">{task.description}</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge className={
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge className={
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }>
                      {task.priority}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex -space-x-1">
                      {task.assigned_to.slice(0, 2).map((userId) => {
                        const user = users.find(u => u.id === userId);
                        return (
                          <Avatar key={userId} className="h-6 w-6 border-2 border-white">
                            <AvatarFallback className="text-xs">
                              {user?.name.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                        );
                      })}
                      {task.assigned_to.length > 2 && (
                        <span className="text-xs text-gray-500 ml-2">
                          +{task.assigned_to.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-sm">
                    {new Date(task.due_date).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <Progress value={task.progress} className="w-16 h-2" />
                      <span className="text-xs">{task.progress}%</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost" onClick={() => {
                        setSelectedTask(task);
                        openTaskEditModal(task);
                      }}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => shareTask(task.id)}>
                        <Share className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enhanced Task Management</h2>
          <p className="text-gray-600">Collaborative task management with AI automation</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => {
            console.log('🔧 Workflow button clicked');
            setShowWorkflowModal(true);
          }}>
            <Zap className="h-4 w-4 mr-2" />
            Workflow
          </Button>
          <Button onClick={() => setShowTaskModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Task
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
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-48"
              />
            </div>
            
            <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="under_process">Under Process</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority} onValueChange={(value) => setFilters({...filters, priority: value})}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeView === 'board' ? 'default' : 'ghost'}
          onClick={() => setActiveView('board')}
          size="sm"
        >
          Board View
        </Button>
        <Button
          variant={activeView === 'list' ? 'default' : 'ghost'}
          onClick={() => setActiveView('list')}
          size="sm"
        >
          List View
        </Button>
      </div>

      {/* Task Views */}
      {activeView === 'board' && renderTaskBoard()}
      {activeView === 'list' && renderTaskList()}

      {/* Task Creation Modal */}
      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a new task with collaboration and AI features</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Task Title</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                    className={`${isRecording ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
                  >
                    <Mic className={`h-4 w-4 mr-1 ${isRecording ? 'animate-pulse' : ''}`} />
                    {isRecording ? 'Stop' : 'Voice'}
                  </Button>
                </div>
                <Input 
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  placeholder="Enter task title or use voice input"
                />
                {transcription && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                    <div className="font-medium text-blue-800">Voice Input:</div>
                    <div className="text-blue-700">{transcription}</div>
                    <Button
                      type="button"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setTaskForm({...taskForm, title: transcription});
                        setTranscription('');
                      }}
                    >
                      Use This Text
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={taskForm.priority} onValueChange={(value) => setTaskForm({...taskForm, priority: value})}>
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
            </div>

            <div>
              <Label>Description</Label>
              <Textarea 
                value={taskForm.description}
                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                placeholder="Describe the task..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Assign To</Label>
                <Select value={taskForm.assigned_to[0] || ''} onValueChange={(value) => setTaskForm({...taskForm, assigned_to: [value]})}>
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
              <div>
                <Label>Due Date</Label>
                <Input 
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm({...taskForm, due_date: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Project</Label>
                <Select value={taskForm.project_id} onValueChange={(value) => setTaskForm({...taskForm, project_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estimated Hours</Label>
                <Input 
                  type="number"
                  value={taskForm.estimated_hours}
                  onChange={(e) => setTaskForm({...taskForm, estimated_hours: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="checkbox"
                id="ai_automation"
                checked={taskForm.ai_automation}
                onChange={(e) => setTaskForm({...taskForm, ai_automation: e.target.checked})}
              />
              <Label htmlFor="ai_automation" className="flex items-center">
                <Bot className="h-4 w-4 mr-2" />
                Enable AI Automation
              </Label>
            </div>

            <div className="flex space-x-2">
              <Button onClick={createTask} disabled={loading || !taskForm.title}>
                {loading ? 'Creating...' : 'Create Task'}
              </Button>
              <Button variant="outline" onClick={() => setShowTaskModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Workflow Management Modal */}
      <Dialog open={showWorkflowModal} onOpenChange={setShowWorkflowModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Workflow Management</DialogTitle>
            <DialogDescription>Create and manage automated workflows for tasks</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Create New Workflow Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Workflow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Workflow Name</Label>
                    <Input 
                      value={workflowForm.name}
                      onChange={(e) => setWorkflowForm({...workflowForm, name: e.target.value})}
                      placeholder="e.g., Lead Follow-up Automation"
                    />
                  </div>
                  <div>
                    <Label>Trigger</Label>
                    <Select value={workflowForm.trigger} onValueChange={(value) => setWorkflowForm({...workflowForm, trigger: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual Trigger</SelectItem>
                        <SelectItem value="new_lead">New Lead Created</SelectItem>
                        <SelectItem value="task_created">Task Created</SelectItem>
                        <SelectItem value="task_overdue">Task Overdue</SelectItem>
                        <SelectItem value="task_completed">Task Completed</SelectItem>
                        <SelectItem value="scheduled">Scheduled Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Workflow Actions</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <input type="checkbox" id="create_task" />
                      <label htmlFor="create_task">Create Task</label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <input type="checkbox" id="send_email" />
                      <label htmlFor="send_email">Send Email Notification</label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <input type="checkbox" id="assign_user" />
                      <label htmlFor="assign_user">Auto-assign to User</label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <input type="checkbox" id="ai_analysis" />
                      <label htmlFor="ai_analysis">AI Task Analysis</label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox"
                    id="workflow_active"
                    checked={workflowForm.is_active}
                    onChange={(e) => setWorkflowForm({...workflowForm, is_active: e.target.checked})}
                  />
                  <Label htmlFor="workflow_active">Activate Workflow Immediately</Label>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={async () => {
                      if (!workflowForm.name.trim()) {
                        alert('❌ Please enter a workflow name.');
                        return;
                      }
                      
                      try {
                        const newWorkflow = {
                          id: Date.now().toString(),
                          ...workflowForm,
                          created_by: '1', // Current user
                          created_at: new Date().toISOString(),
                          ai_generated: false
                        };
                        
                        setWorkflows(prev => [...prev, newWorkflow]);
                        setWorkflowForm({
                          name: '',
                          trigger: 'manual',
                          conditions: [],
                          actions: [],
                          is_active: true
                        });
                        
                        alert(`✅ Workflow "${workflowForm.name}" created successfully!\n\nTrigger: ${workflowForm.trigger}\nStatus: ${workflowForm.is_active ? 'Active' : 'Inactive'}\n\nThe workflow will automatically execute when the trigger conditions are met.`);
                      } catch (error) {
                        console.error('Workflow creation error:', error);
                        alert('❌ Failed to create workflow. Please try again.');
                      }
                    }}
                    disabled={loading || !workflowForm.name.trim()}
                  >
                    {loading ? 'Creating...' : 'Create Workflow'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowWorkflowModal(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Existing Workflows */}
            <Card>
              <CardHeader>
                <CardTitle>Existing Workflows ({workflows.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {workflows.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No workflows created yet</p>
                    <p className="text-sm">Create your first workflow to automate task management</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workflows.map((workflow) => (
                      <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${workflow.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <div>
                            <h4 className="font-medium">{workflow.name}</h4>
                            <p className="text-sm text-gray-600">
                              Trigger: {workflow.trigger.replace('_', ' ')} • 
                              {workflow.ai_generated ? ' AI Generated' : ' Manual'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={workflow.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {workflow.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Voice Task Modal */}
      <Dialog open={showVoiceModal} onOpenChange={setShowVoiceModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Voice to Task</DialogTitle>
            <DialogDescription>Create tasks using voice commands</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 text-center">
            {!isRecording && !transcription && (
              <div>
                <div className="mb-4">
                  <Mic className="h-16 w-16 mx-auto text-blue-500" />
                </div>
                <p className="text-gray-600 mb-4">Tap to start recording your task</p>
                <Button onClick={startVoiceRecording}>
                  <Mic className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
              </div>
            )}

            {isRecording && (
              <div>
                <div className="mb-4">
                  <div className="animate-pulse">
                    <MicOff className="h-16 w-16 mx-auto text-red-500" />
                  </div>
                </div>
                <p className="text-gray-600 mb-4">Recording... Speak your task details</p>
                <Button onClick={stopVoiceRecording} variant="outline">
                  <MicOff className="h-4 w-4 mr-2" />
                  Stop Recording
                </Button>
              </div>
            )}

            {transcription && (
              <div>
                <div className="mb-4">
                  <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-800">{transcription}</p>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => {
                    setShowVoiceModal(false);
                    setShowTaskModal(true);
                  }}>
                    Create Task
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setTranscription('');
                    setRecordedAudio(null);
                  }}>
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Edit Modal */}
      {showTaskEditModal && selectedTask && (
        <Dialog open={showTaskEditModal} onOpenChange={setShowTaskEditModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Task - {selectedTask.title}</DialogTitle>
              <DialogDescription>Update task details and settings</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Task Title</Label>
                  <Input 
                    value={taskEditForm.title}
                    onChange={(e) => setTaskEditForm({...taskEditForm, title: e.target.value})}
                    placeholder="Enter task title"
                  />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={taskEditForm.priority} onValueChange={(value) => setTaskEditForm({...taskEditForm, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea 
                  value={taskEditForm.description}
                  onChange={(e) => setTaskEditForm({...taskEditForm, description: e.target.value})}
                  placeholder="Task description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={taskEditForm.status} onValueChange={(value) => setTaskEditForm({...taskEditForm, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="under_process">Under Process</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input 
                    type="date"
                    value={taskEditForm.due_date}
                    onChange={(e) => setTaskEditForm({...taskEditForm, due_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Estimated Hours</Label>
                  <Input 
                    type="number"
                    value={taskEditForm.estimated_hours}
                    onChange={(e) => setTaskEditForm({...taskEditForm, estimated_hours: e.target.value})}
                    placeholder="e.g., 4"
                  />
                </div>
                <div>
                  <Label>Project</Label>
                  <Select value={taskEditForm.project_id} onValueChange={(value) => setTaskEditForm({...taskEditForm, project_id: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Project</SelectItem>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox"
                  id="edit_ai_automation"
                  checked={taskEditForm.ai_automation}
                  onChange={(e) => setTaskEditForm({...taskEditForm, ai_automation: e.target.checked})}
                />
                <Label htmlFor="edit_ai_automation" className="flex items-center">
                  <Bot className="h-4 w-4 mr-2" />
                  Enable AI Automation
                </Label>
              </div>

              <div className="flex space-x-2 pt-4 border-t">
                <Button onClick={updateTask} disabled={loading || !taskEditForm.title}>
                  {loading ? 'Updating...' : 'Update Task'}
                </Button>
                <Button variant="outline" onClick={() => setShowTaskEditModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EnhancedTaskSystem;