import React, { useState, useEffect, useRef } from 'react';
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
  Upload, Camera, Image, FileText, Folder, Send, Share, 
  Plus, Eye, Edit, Trash2, Download, Filter, Search,
  Grid, List, Tag, Calendar, User, MessageSquare, Mail,
  Smartphone, CheckCircle, Clock, AlertCircle, Star
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const ClientGalleryManager = ({ isOpen, onClose, selectedLead }) => {
  // State Management
  const [activeView, setActiveView] = useState('gallery');
  const [galleries, setGalleries] = useState([]);
  const [catalogues, setCatalogues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

  // Form States
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    project_id: '',
    category: 'project_image',
    tags: '',
    client_visible: true
  });

  const [sendForm, setSendForm] = useState({
    client_id: selectedLead?.id || '',
    client_name: selectedLead?.name || '',
    client_email: selectedLead?.email || '',
    client_phone: selectedLead?.phone || '',
    message: '',
    send_method: 'email',
    selected_items: []
  });

  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    client_name: '',
    project_type: 'balcony_garden',
    status: 'planning',
    budget: '',
    start_date: '',
    end_date: ''
  });

  // File References
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Initialize data
  useEffect(() => {
    if (isOpen) {
      initializeGalleryData();
    }
    if (selectedLead) {
      setSendForm(prev => ({
        ...prev,
        client_id: selectedLead.id,
        client_name: selectedLead.name,
        client_email: selectedLead.email,
        client_phone: selectedLead.phone
      }));
    }
  }, [isOpen, selectedLead]);

  const initializeGalleryData = async () => {
    setLoading(true);
    try {
      // Initialize projects
      setProjects([
        {
          id: '1',
          name: 'Mumbai Balcony Garden - Premium Villa',
          description: 'Complete balcony transformation with automated irrigation',
          client_name: 'Rajesh Kumar',
          project_type: 'balcony_garden',
          status: 'completed',
          budget: 75000,
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          image_count: 12,
          created_date: '2024-01-01'
        },
        {
          id: '2',
          name: 'Corporate Office Green Wall',
          description: 'Vertical garden installation for IT office',
          client_name: 'Priya Sharma',
          project_type: 'green_wall',
          status: 'in_progress',
          budget: 150000,
          start_date: '2024-01-15',
          end_date: '2024-02-28',
          image_count: 8,
          created_date: '2024-01-15'
        },
        {
          id: '3',
          name: 'Rooftop Garden - Residential Complex',
          description: 'Community rooftop garden with seating area',
          client_name: 'Amit Patel',
          project_type: 'rooftop_garden',
          status: 'planning',
          budget: 250000,
          start_date: '2024-02-01',
          end_date: '2024-03-15',
          image_count: 3,
          created_date: '2024-01-20'
        }
      ]);

      // Initialize project galleries
      setGalleries([
        {
          id: '1',
          title: 'Before - Mumbai Balcony Raw Space',
          description: 'Initial balcony condition before transformation',
          project_id: '1',
          project_name: 'Mumbai Balcony Garden - Premium Villa',
          category: 'before_image',
          file_type: 'image',
          file_url: '/images/gallery/balcony-before-1.jpg',
          file_size: '2.4 MB',
          upload_date: '2024-01-01',
          uploaded_by: 'Site Engineer',
          tags: ['before', 'balcony', 'mumbai', 'raw-space'],
          client_visible: true,
          ai_analyzed: true,
          ai_tags: ['empty-space', 'concrete-floor', 'basic-railing'],
          views: 15,
          client_feedback: 'Excited to see the transformation!'
        },
        {
          id: '2',
          title: 'During - Plant Installation Process',
          description: 'Installing vertical garden structures and planters',
          project_id: '1',
          project_name: 'Mumbai Balcony Garden - Premium Villa',
          category: 'progress_image',
          file_type: 'image',
          file_url: '/images/gallery/balcony-progress-1.jpg',
          file_size: '3.1 MB',
          upload_date: '2024-01-15',
          uploaded_by: 'Installation Team',
          tags: ['progress', 'installation', 'plants', 'vertical-garden'],
          client_visible: true,
          ai_analyzed: true,
          ai_tags: ['plant-installation', 'vertical-structure', 'work-in-progress'],
          views: 12,
          client_feedback: null
        },
        {
          id: '3',
          title: 'After - Complete Balcony Garden',
          description: 'Finished balcony garden with full greenery and seating',
          project_id: '1',
          project_name: 'Mumbai Balcony Garden - Premium Villa',
          category: 'after_image',
          file_type: 'image',
          file_url: '/images/gallery/balcony-after-1.jpg',
          file_size: '2.8 MB',
          upload_date: '2024-01-31',
          uploaded_by: 'Project Manager',
          tags: ['after', 'completed', 'lush-green', 'seating-area'],
          client_visible: true,
          ai_analyzed: true,
          ai_tags: ['lush-greenery', 'seating-furniture', 'completed-project'],
          views: 28,
          client_feedback: 'Absolutely beautiful! Exceeded expectations!'
        },
        {
          id: '4',
          title: 'Corporate Green Wall - Phase 1',
          description: 'Initial installation of modular green wall system',
          project_id: '2',
          project_name: 'Corporate Office Green Wall',
          category: 'progress_image',
          file_type: 'image',
          file_url: '/images/gallery/green-wall-progress.jpg',
          file_size: '4.2 MB',
          upload_date: '2024-01-20',
          uploaded_by: 'Installation Specialist',
          tags: ['green-wall', 'corporate', 'modular-system', 'phase-1'],
          client_visible: true,
          ai_analyzed: true,
          ai_tags: ['modular-panels', 'vertical-installation', 'office-environment'],
          views: 8,
          client_feedback: null
        },
        {
          id: '5',
          title: 'Plant Selection Guide',
          description: 'Recommended plants for indoor balcony gardens',
          project_id: null,
          project_name: 'General Gallery',
          category: 'catalogue_image',
          file_type: 'image',
          file_url: '/images/gallery/plant-selection-guide.jpg',
          file_size: '1.9 MB',
          upload_date: '2024-01-10',
          uploaded_by: 'Horticulturist',
          tags: ['plants', 'selection-guide', 'indoor', 'balcony'],
          client_visible: true,
          ai_analyzed: true,
          ai_tags: ['plant-varieties', 'care-instructions', 'selection-criteria'],
          views: 45,
          client_feedback: null
        }
      ]);

      // Initialize catalogues
      setCatalogues([
        {
          id: '1',
          title: 'Balcony Garden Solutions Catalogue',
          description: 'Complete guide to balcony garden designs and packages',
          category: 'product_catalogue',
          file_type: 'pdf',
          file_url: '/catalogues/balcony-garden-catalogue.pdf',
          file_size: '8.5 MB',
          pages: 24,
          created_date: '2024-01-05',
          updated_date: '2024-01-15',
          version: '2.1',
          tags: ['balcony', 'garden', 'packages', 'pricing'],
          download_count: 156,
          client_shared_count: 23
        },
        {
          id: '2',
          title: 'Green Building Certification Guide',
          description: 'Step-by-step guide for green building certification',
          category: 'service_catalogue',
          file_type: 'pdf',
          file_url: '/catalogues/green-building-guide.pdf',
          file_size: '12.3 MB',
          pages: 36,
          created_date: '2024-01-08',
          updated_date: '2024-01-20',
          version: '1.3',
          tags: ['green-building', 'certification', 'consultancy', 'standards'],
          download_count: 89,
          client_shared_count: 12
        },
        {
          id: '3',
          title: 'Corporate Landscaping Portfolio',
          description: 'Portfolio of completed corporate landscaping projects',
          category: 'portfolio',
          file_type: 'pdf',
          file_url: '/catalogues/corporate-portfolio.pdf',
          file_size: '15.7 MB',
          pages: 48,
          created_date: '2024-01-12',
          updated_date: '2024-01-25',
          version: '3.0',
          tags: ['corporate', 'portfolio', 'landscaping', 'case-studies'],
          download_count: 234,
          client_shared_count: 45
        }
      ]);

    } catch (error) {
      console.error('Gallery initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  // File Upload Functions
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setLoading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', uploadForm.title || file.name);
        formData.append('description', uploadForm.description);
        formData.append('project_id', uploadForm.project_id);
        formData.append('category', uploadForm.category);
        formData.append('tags', uploadForm.tags);
        formData.append('client_visible', uploadForm.client_visible);

        // Simulate upload with AI analysis
        const newGalleryItem = {
          id: Date.now().toString() + Math.random(),
          title: uploadForm.title || file.name,
          description: uploadForm.description,
          project_id: uploadForm.project_id,
          project_name: projects.find(p => p.id === uploadForm.project_id)?.name || 'General Gallery',
          category: uploadForm.category,
          file_type: file.type.startsWith('image/') ? 'image' : 'document',
          file_url: URL.createObjectURL(file),
          file_size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          upload_date: new Date().toISOString().split('T')[0],
          uploaded_by: 'Current User',
          tags: uploadForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          client_visible: uploadForm.client_visible,
          ai_analyzed: true,
          ai_tags: await generateAITags(file, uploadForm.category),
          views: 0,
          client_feedback: null
        };

        setGalleries(prev => [...prev, newGalleryItem]);

        // In production, make API call
        // await axios.post(`${API}/api/gallery/upload`, formData);
      }

      setShowUploadModal(false);
      resetUploadForm();

    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAITags = async (file, category) => {
    // Simulate AI image analysis
    const aiTags = {
      'before_image': ['raw-space', 'initial-condition', 'needs-transformation'],
      'progress_image': ['work-in-progress', 'installation-phase', 'construction'],
      'after_image': ['completed-project', 'finished-result', 'final-outcome'],
      'catalogue_image': ['product-showcase', 'design-reference', 'inspiration'],
      'project_image': ['project-work', 'implementation', 'execution']
    };

    return aiTags[category] || ['general-image', 'uploaded-content', 'gallery-item'];
  };

  // Client Sharing Functions
  const sendToClient = async () => {
    setLoading(true);
    try {
      const selectedItems = [...selectedImages];
      
      if (selectedItems.length === 0) {
        alert('Please select at least one image or catalogue to send');
        return;
      }

      const messageData = {
        client_id: sendForm.client_id,
        client_name: sendForm.client_name,
        client_email: sendForm.client_email,
        client_phone: sendForm.client_phone,
        message: sendForm.message,
        send_method: sendForm.send_method,
        items: selectedItems.map(item => ({
          id: item.id,
          title: item.title,
          type: item.file_type,
          url: item.file_url
        })),
        sent_date: new Date().toISOString()
      };

      // Simulate sending based on method
      if (sendForm.send_method === 'email') {
        // Email sending simulation
        console.log('Sending email to:', sendForm.client_email);
        alert(`✅ Successfully sent ${selectedItems.length} items via email to ${sendForm.client_name}`);
      } else if (sendForm.send_method === 'whatsapp') {
        // WhatsApp sharing simulation
        const whatsappMessage = `Hi ${sendForm.client_name}! ${sendForm.message} Here are the images/catalogues: ${selectedItems.map(item => item.title).join(', ')}`;
        const whatsappUrl = `https://wa.me/${sendForm.client_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');
        alert(`✅ WhatsApp message prepared for ${sendForm.client_name}`);
      } else if (sendForm.send_method === 'sms') {
        // SMS sending simulation
        console.log('Sending SMS to:', sendForm.client_phone);
        alert(`✅ SMS sent to ${sendForm.client_name} with ${selectedItems.length} items`);
      }

      // Clear selections and close modal
      setSelectedImages([]);
      setShowSendModal(false);
      resetSendForm();

      // In production, make API call
      // await axios.post(`${API}/api/client/send-gallery`, messageData);

    } catch (error) {
      console.error('Client sending error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Project Management Functions
  const createProject = async () => {
    setLoading(true);
    try {
      const newProject = {
        id: Date.now().toString(),
        ...projectForm,
        image_count: 0,
        created_date: new Date().toISOString().split('T')[0]
      };

      setProjects(prev => [...prev, newProject]);
      setShowCreateProjectModal(false);
      resetProjectForm();

    } catch (error) {
      console.error('Project creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Utility Functions
  const resetUploadForm = () => {
    setUploadForm({
      title: '',
      description: '',
      project_id: '',
      category: 'project_image',
      tags: '',
      client_visible: true
    });
  };

  const resetSendForm = () => {
    setSendForm({
      client_id: selectedLead?.id || '',
      client_name: selectedLead?.name || '',
      client_email: selectedLead?.email || '',
      client_phone: selectedLead?.phone || '',
      message: '',
      send_method: 'email',
      selected_items: []
    });
  };

  const resetProjectForm = () => {
    setProjectForm({
      name: '',
      description: '',
      client_name: '',
      project_type: 'balcony_garden',
      status: 'planning',
      budget: '',
      start_date: '',
      end_date: ''
    });
  };

  const toggleImageSelection = (item) => {
    setSelectedImages(prev => {
      const isSelected = prev.find(img => img.id === item.id);
      if (isSelected) {
        return prev.filter(img => img.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'before_image': 'bg-red-100 text-red-800',
      'progress_image': 'bg-yellow-100 text-yellow-800',
      'after_image': 'bg-green-100 text-green-800',
      'catalogue_image': 'bg-blue-100 text-blue-800',
      'project_image': 'bg-purple-100 text-purple-800',
      'product_catalogue': 'bg-indigo-100 text-indigo-800',
      'service_catalogue': 'bg-cyan-100 text-cyan-800',
      'portfolio': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Render Functions
  const renderGallery = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Project Gallery</h3>
          <p className="text-gray-600">Manage project images and share with clients</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowCreateProjectModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Images
          </Button>
        </div>
      </div>

      {/* Project Filter */}
      <div className="flex items-center space-x-4">
        <Select>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="before_image">Before Images</SelectItem>
            <SelectItem value="progress_image">Progress Images</SelectItem>
            <SelectItem value="after_image">After Images</SelectItem>
            <SelectItem value="catalogue_image">Catalogue Images</SelectItem>
          </SelectContent>
        </Select>

        {selectedImages.length > 0 && (
          <Button onClick={() => setShowSendModal(true)} className="bg-green-600 hover:bg-green-700">
            <Send className="h-4 w-4 mr-2" />
            Send to Client ({selectedImages.length})
          </Button>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {galleries.map((item) => (
          <Card 
            key={item.id} 
            className={`hover:shadow-md transition-shadow cursor-pointer ${
              selectedImages.find(img => img.id === item.id) ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => toggleImageSelection(item)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge className={getCategoryColor(item.category)}>
                  {item.category.replace('_', ' ')}
                </Badge>
                {selectedImages.find(img => img.id === item.id) && (
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                )}
              </div>
              
              <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                {item.file_type === 'image' ? (
                  <Image className="h-8 w-8 text-gray-400" />
                ) : (
                  <FileText className="h-8 w-8 text-gray-400" />
                )}
              </div>
              
              <h4 className="font-semibold text-sm mb-1 line-clamp-1">{item.title}</h4>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description}</p>
              
              <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                <span>{item.project_name}</span>
                <span>{item.file_size}</span>
              </div>
              
              {item.ai_tags && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.ai_tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Eye className="h-3 w-3" />
                  <span>{item.views}</span>
                </div>
                {item.client_feedback && (
                  <Star className="h-4 w-4 text-yellow-500" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCatalogues = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Catalogues & Documents</h3>
          <p className="text-gray-600">Manage and share service catalogues with clients</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Catalogue
        </Button>
      </div>

      <div className="grid gap-4">
        {catalogues.map((catalogue) => (
          <Card key={catalogue.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-lg font-semibold">{catalogue.title}</h4>
                    <Badge className={getCategoryColor(catalogue.category)}>
                      {catalogue.category.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">v{catalogue.version}</Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{catalogue.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">File Size</p>
                      <p className="font-medium">{catalogue.file_size}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pages</p>
                      <p className="font-medium">{catalogue.pages}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Downloads</p>
                      <p className="font-medium">{catalogue.download_count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Shared</p>
                      <p className="font-medium">{catalogue.client_shared_count}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {catalogue.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="text-xs text-gray-500">
                    Updated: {new Date(catalogue.updated_date).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setSelectedImages([catalogue]);
                    setShowSendModal(true);
                  }}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Folder className="h-5 w-5" />
            <span>Client Gallery & Catalogue Manager</span>
            {selectedLead && (
              <Badge className="bg-blue-100 text-blue-800">
                Client: {selectedLead.name}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Upload, organize, and share project images and catalogues with clients
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-[80vh]">
          {/* Sidebar Navigation */}
          <div className="w-56 border-r p-4">
            <div className="space-y-1">
              <Button
                variant={activeView === 'gallery' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveView('gallery')}
              >
                <Image className="h-4 w-4 mr-2" />
                Project Gallery
              </Button>
              <Button
                variant={activeView === 'catalogues' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveView('catalogues')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Catalogues
              </Button>
              <Button
                variant={activeView === 'projects' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveView('projects')}
              >
                <Folder className="h-4 w-4 mr-2" />
                Projects
              </Button>
            </div>

            {selectedImages.length > 0 && (
              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-2">
                  {selectedImages.length} items selected
                </div>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => setShowSendModal(true)}
                >
                  <Send className="h-3 w-3 mr-1" />
                  Send to Client
                </Button>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading gallery...</span>
              </div>
            )}

            {!loading && activeView === 'gallery' && renderGallery()}
            {!loading && activeView === 'catalogues' && renderCatalogues()}
            {!loading && activeView === 'projects' && (
              <div className="text-center py-12">
                <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Project Management</h3>
                <p className="text-gray-600">Detailed project management coming soon</p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Modal */}
        <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload to Gallery</DialogTitle>
              <DialogDescription>Upload images or documents to the client gallery</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input 
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                    placeholder="Enter title..."
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={uploadForm.category} onValueChange={(value) => setUploadForm({...uploadForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before_image">Before Image</SelectItem>
                      <SelectItem value="progress_image">Progress Image</SelectItem>
                      <SelectItem value="after_image">After Image</SelectItem>
                      <SelectItem value="catalogue_image">Catalogue Image</SelectItem>
                      <SelectItem value="project_image">Project Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea 
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  placeholder="Describe the image or document..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Project</Label>
                  <Select value={uploadForm.project_id} onValueChange={(value) => setUploadForm({...uploadForm, project_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">General Gallery</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tags (comma separated)</Label>
                  <Input 
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox"
                  id="client_visible"
                  checked={uploadForm.client_visible}
                  onChange={(e) => setUploadForm({...uploadForm, client_visible: e.target.checked})}
                />
                <Label htmlFor="client_visible">Visible to client</Label>
              </div>

              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Upload className="h-12 w-12 text-gray-400" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Upload Files
                    </h3>
                    <p className="text-gray-600">
                      Drag and drop files or click to browse
                    </p>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                    >
                      <Folder className="h-4 w-4 mr-2" />
                      Browse Files
                    </Button>
                    
                    <Button
                      onClick={() => cameraInputRef.current?.click()}
                      variant="outline"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
                accept="image/*,.pdf,.doc,.docx"
              />
              
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />

              <div className="flex space-x-2 pt-4">
                <Button onClick={() => setShowUploadModal(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Send to Client Modal */}
        <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send to Client</DialogTitle>
              <DialogDescription>Share selected images and catalogues with client</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client Name</Label>
                  <Input 
                    value={sendForm.client_name}
                    onChange={(e) => setSendForm({...sendForm, client_name: e.target.value})}
                    placeholder="Client name..."
                  />
                </div>
                <div>
                  <Label>Send Method</Label>
                  <Select value={sendForm.send_method} onValueChange={(value) => setSendForm({...sendForm, send_method: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={sendForm.client_email}
                    onChange={(e) => setSendForm({...sendForm, client_email: e.target.value})}
                    placeholder="client@email.com"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input 
                    value={sendForm.client_phone}
                    onChange={(e) => setSendForm({...sendForm, client_phone: e.target.value})}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <Label>Message</Label>
                <Textarea 
                  value={sendForm.message}
                  onChange={(e) => setSendForm({...sendForm, message: e.target.value})}
                  placeholder="Hi! Here are the images and catalogues for your project..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Selected Items ({selectedImages.length})</Label>
                <div className="max-h-32 overflow-y-auto border rounded p-2">
                  {selectedImages.map((item, index) => (
                    <div key={item.id} className="flex justify-between items-center py-1">
                      <span className="text-sm">{item.title}</span>
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category?.replace('_', ' ') || item.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={sendToClient} disabled={loading || selectedImages.length === 0}>
                  {loading ? 'Sending...' : `Send ${selectedImages.length} items`}
                </Button>
                <Button variant="outline" onClick={() => setShowSendModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Project Modal */}
        <Dialog open={showCreateProjectModal} onOpenChange={setShowCreateProjectModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Set up a new project for organizing gallery images</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Project Name</Label>
                  <Input 
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                    placeholder="Enter project name..."
                  />
                </div>
                <div>
                  <Label>Client Name</Label>
                  <Input 
                    value={projectForm.client_name}
                    onChange={(e) => setProjectForm({...projectForm, client_name: e.target.value})}
                    placeholder="Client name..."
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea 
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                  placeholder="Describe the project..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Project Type</Label>
                  <Select value={projectForm.project_type} onValueChange={(value) => setProjectForm({...projectForm, project_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balcony_garden">Balcony Garden</SelectItem>
                      <SelectItem value="green_wall">Green Wall</SelectItem>
                      <SelectItem value="rooftop_garden">Rooftop Garden</SelectItem>
                      <SelectItem value="corporate_landscaping">Corporate Landscaping</SelectItem>
                      <SelectItem value="green_building">Green Building</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={projectForm.status} onValueChange={(value) => setProjectForm({...projectForm, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Budget (₹)</Label>
                  <Input 
                    type="number"
                    value={projectForm.budget}
                    onChange={(e) => setProjectForm({...projectForm, budget: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input 
                    type="date"
                    value={projectForm.start_date}
                    onChange={(e) => setProjectForm({...projectForm, start_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input 
                    type="date"
                    value={projectForm.end_date}
                    onChange={(e) => setProjectForm({...projectForm, end_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={createProject} disabled={loading || !projectForm.name}>
                  {loading ? 'Creating...' : 'Create Project'}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateProjectModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default ClientGalleryManager;