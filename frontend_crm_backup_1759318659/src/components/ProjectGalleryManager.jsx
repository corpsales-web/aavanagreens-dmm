import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Upload, Camera, FolderPlus, Image, Trash2, Download, Eye, Tag, Filter, Search, Grid, List, ArrowUp, Send, Mail, MessageSquare, CheckSquare, Square, Users, Wifi, WifiOff, CloudOff, Cloud } from 'lucide-react';
import axios from 'axios';
import { offlineStorage } from '../utils/offlineStorage';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const ProjectGalleryManager = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadMode, setUploadMode] = useState(null); // 'file', 'camera', or null
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  // Batch Selection States
  const [selectedImages, setSelectedImages] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showBatchSendModal, setShowBatchSendModal] = useState(false);
  const [batchSendForm, setBatchSendForm] = useState({
    recipients: '',
    message: '',
    sendType: 'whatsapp' // 'whatsapp' or 'email'
  });
  const [isSending, setIsSending] = useState(false);
  
  // Offline Support States
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineModeEnabled, setOfflineModeEnabled] = useState(offlineStorage.isOfflineModeEnabled());
  const [storageStats, setStorageStats] = useState({ gallery: 0, catalogue: 0, projects: 0, queueItems: 0 });
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Online/Offline event listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 Connection restored');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log('📵 Connection lost');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load storage statistics
  useEffect(() => {
    const loadStorageStats = async () => {
      try {
        const stats = await offlineStorage.getStorageStats();
        setStorageStats(stats);
      } catch (error) {
        console.error('Error loading storage stats:', error);
      }
    };
    
    loadStorageStats();
    const interval = setInterval(loadStorageStats, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Initialize with sample projects and images (with offline caching)
  useEffect(() => {
    const loadProjects = async () => {
      let sampleProjects = [];

      // Try to load from offline storage first
      if (offlineModeEnabled || !isOnline) {
        try {
          const cachedProjects = await offlineStorage.getProjects();
          if (cachedProjects.length > 0) {
            console.log('📱 Loaded projects from offline storage');
            sampleProjects = cachedProjects;
            setProjects(sampleProjects);
            setSelectedProject(sampleProjects[0]);
            return;
          }
        } catch (error) {
          console.error('Error loading from offline storage:', error);
        }
      }

      // Fallback to sample data (or load from API when implemented)
      sampleProjects = [
        {
          id: '1',
          name: 'Green Building Complex - Phase 1',
          description: 'Sustainable residential complex with 50 units',
          createdAt: '2024-01-15',
          imageCount: 15,
          status: 'in_progress',
          location: 'Mumbai, Maharashtra',
          images: [
            {
              id: '1',
              filename: 'construction_progress_001.jpg',
              category: 'progress',
              description: 'Foundation work completion',
              uploadDate: '2024-01-20',
              tags: ['foundation', 'construction', 'progress'],
              aiCategory: 'construction_progress',
              confidence: 0.95
            },
            {
              id: '2', 
              filename: 'landscape_design_001.jpg',
              category: 'design',
              description: 'Landscape architecture plan',
              uploadDate: '2024-01-22',
              tags: ['landscape', 'design', 'garden'],
              aiCategory: 'landscape_design',
              confidence: 0.88
            },
            {
              id: '3',
              filename: 'before_site_001.jpg', 
              category: 'before',
              description: 'Site condition before construction',
              uploadDate: '2024-01-18',
              tags: ['before', 'site', 'raw'],
              aiCategory: 'site_before',
              confidence: 0.92
            }
          ]
        },
        {
          id: '2',
          name: 'Eco-Friendly Office Campus',
          description: 'LEED certified office complex with solar panels',
          createdAt: '2024-02-01',
          imageCount: 22,
          status: 'completed',
          location: 'Pune, Maharashtra',
          images: [
            {
              id: '4',
              filename: 'solar_installation_001.jpg',
              category: 'solar',
              description: 'Solar panel installation on rooftop',
              uploadDate: '2024-02-10',
              tags: ['solar', 'renewable', 'rooftop'],
              aiCategory: 'renewable_energy',
              confidence: 0.97
            },
            {
              id: '5',
              filename: 'interior_sustainable_001.jpg',
              category: 'interior',
              description: 'Sustainable interior design features',
              uploadDate: '2024-02-15',
              tags: ['interior', 'sustainable', 'design'],
              aiCategory: 'interior_design',
              confidence: 0.91
            }
          ]
        },
        {
          id: '3',
          name: 'Urban Vertical Garden',
          description: 'Vertical gardening system for urban spaces',
          createdAt: '2024-03-01', 
          imageCount: 8,
          status: 'planning',
          location: 'Bangalore, Karnataka',
          images: [
            {
              id: '6',
              filename: 'vertical_garden_design.jpg',
              category: 'design',
              description: 'Vertical garden concept design',
              uploadDate: '2024-03-05',
              tags: ['vertical', 'garden', 'urban'],
              aiCategory: 'garden_design',
              confidence: 0.89
            }
          ]
        }
      ];

      setProjects(sampleProjects);
      setSelectedProject(sampleProjects[0]);

      // Cache for offline use if online and offline mode is enabled
      if (isOnline && offlineModeEnabled) {
        try {
          await offlineStorage.storeProjects(sampleProjects);
          for (const project of sampleProjects) {
            if (project.images && project.images.length > 0) {
              await offlineStorage.storeGalleryData(project.id, project.images);
            }
          }
        } catch (error) {
          console.error('Error caching projects for offline use:', error);
        }
      }
    };

    loadProjects();
  }, [offlineModeEnabled, isOnline]);

  // Handle image deletion
  const handleDeleteImage = (projectId, imageId, imageName) => {
    if (window.confirm(`Are you sure you want to delete "${imageName}"?\n\nThis action cannot be undone.`)) {
      setProjects(prevProjects => 
        prevProjects.map(project => {
          if (project.id === projectId) {
            const updatedImages = project.images.filter(img => img.id !== imageId);
            return {
              ...project,
              images: updatedImages,
              imageCount: updatedImages.length
            };
          }
          return project;
        })
      );
      
      alert(`✅ Image "${imageName}" deleted successfully!`);
    }
  };

  // AI-powered image classification simulation
  const classifyImage = async (file) => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const filename = file.name.toLowerCase();
    let category = 'general';
    let confidence = 0.75;
    let tags = [];

    // Simple keyword-based classification (in real app, this would be AI)
    if (filename.includes('before') || filename.includes('site')) {
      category = 'site_before';
      tags = ['before', 'site', 'raw'];
      confidence = 0.92;
    } else if (filename.includes('progress') || filename.includes('construction')) {
      category = 'construction_progress';
      tags = ['progress', 'construction', 'building'];
      confidence = 0.95;
    } else if (filename.includes('after') || filename.includes('complete')) {
      category = 'site_after';
      tags = ['after', 'completed', 'finished'];
      confidence = 0.93;
    } else if (filename.includes('landscape') || filename.includes('garden')) {
      category = 'landscape_design';
      tags = ['landscape', 'garden', 'green'];
      confidence = 0.88;
    } else if (filename.includes('interior') || filename.includes('inside')) {
      category = 'interior_design';
      tags = ['interior', 'design', 'indoor'];
      confidence = 0.91;
    } else if (filename.includes('solar') || filename.includes('panel')) {
      category = 'renewable_energy';
      tags = ['solar', 'renewable', 'energy'];
      confidence = 0.97;
    }

    return { category, confidence, tags };
  };

  // Batch Selection Functions
  const toggleImageSelection = (imageId) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const selectAllImages = () => {
    if (!selectedProject) return;
    const allImageIds = selectedProject.images.map(img => img.id);
    setSelectedImages(allImageIds);
  };

  const clearSelection = () => {
    setSelectedImages([]);
    setIsSelectionMode(false);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedImages([]);
    }
  };

  // Batch Send Functions
  const openBatchSendModal = () => {
    if (selectedImages.length === 0) {
      alert('Please select at least one image to send.');
      return;
    }
    if (selectedImages.length > 50) {
      alert('Maximum 50 images can be sent at once.');
      return;
    }
    setShowBatchSendModal(true);
  };

  const handleBatchSend = async () => {
    if (!batchSendForm.recipients.trim()) {
      alert('Please enter at least one recipient.');
      return;
    }

    setIsSending(true);
    try {
      const recipients = batchSendForm.recipients
        .split(',')
        .map(r => r.trim())
        .filter(r => r.length > 0);

      const batchData = {
        items: selectedImages,
        send_type: batchSendForm.sendType,
        recipients: recipients,
        message: batchSendForm.message,
        item_type: 'gallery'
      };

      console.log('🚀 Sending batch gallery images:', {
        imageCount: selectedImages.length,
        recipients: recipients.length,
        sendType: batchSendForm.sendType,
        isOnline: isOnline
      });

      if (!isOnline) {
        // Queue for offline processing
        await offlineStorage.queueAction('batch_send_gallery', batchData);
        alert(`📵 Offline Mode: Batch send queued!\n\n📊 Details:\n• Images: ${selectedImages.length}\n• Recipients: ${recipients.length}\n• Will send when connection is restored`);
      } else {
        // Send immediately
        const response = await axios.post(`${API}/api/batch-send/gallery`, batchData);

        if (response.data.success) {
          alert(`✅ Batch send completed!\n\n📊 Results:\n• Sent: ${response.data.total_sent}\n• Failed: ${response.data.failed.length}\n• Batch ID: ${response.data.batch_id}`);
        } else {
          alert('❌ Batch send failed. Please try again.');
        }
      }
      
      // Reset form and close modal
      setBatchSendForm({
        recipients: '',
        message: '',
        sendType: 'whatsapp'
      });
      setShowBatchSendModal(false);
      clearSelection();
      
    } catch (error) {
      console.error('Batch send error:', error);
      if (!isOnline) {
        // Still queue the action even if there's an error in processing
        try {
          await offlineStorage.queueAction('batch_send_gallery', {
            items: selectedImages,
            send_type: batchSendForm.sendType,
            recipients: batchSendForm.recipients.split(',').map(r => r.trim()).filter(r => r.length > 0),
            message: batchSendForm.message,
            item_type: 'gallery'
          });
          alert('📵 Offline: Queued for sending when online');
        } catch (queueError) {
          alert(`❌ Error queuing batch send: ${queueError.message}`);
        }
      } else {
        alert(`❌ Error sending images: ${error.response?.data?.detail || error.message}`);
      }
    } finally {
      setIsSending(false);
    }
  };

  // Handle file uploads
  const handleFileUpload = async (files) => {
    if (!selectedProject || !files.length) return;
    
    setIsUploading(true);
    
    try {
      for (const file of files) {
        // Classify image using AI
        const classification = await classifyImage(file);
        
        // Simulate file upload
        const newImage = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          filename: file.name,
          category: classification.category === 'general' ? 'misc' : classification.category.split('_')[0],
          description: `Auto-uploaded: ${file.name}`,
          uploadDate: new Date().toISOString().split('T')[0],
          tags: classification.tags,
          aiCategory: classification.category,
          confidence: classification.confidence,
          file: file,
          url: URL.createObjectURL(file)
        };

        // Add to selected project
        setProjects(prev => prev.map(project => 
          project.id === selectedProject.id 
            ? { 
                ...project, 
                images: [...project.images, newImage],
                imageCount: project.imageCount + 1
              }
            : project
        ));

        // Update selected project
        setSelectedProject(prev => ({
          ...prev,
          images: [...prev.images, newImage],
          imageCount: prev.imageCount + 1
        }));
      }
      
      console.log('✅ Images uploaded and classified successfully');
    } catch (error) {
      console.error('❌ Error uploading images:', error);
    } finally {
      setIsUploading(false);
      setUploadMode(null);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // Filter images based on category and search
  const filteredImages = selectedProject?.images?.filter(image => {
    const matchesCategory = filterCategory === 'all' || image.category === filterCategory;
    const matchesSearch = searchTerm === '' || 
      image.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  }) || [];

  // Get unique categories from all images
  const categories = ['all', ...new Set(selectedProject?.images?.map(img => img.category) || [])];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">Project Gallery Manager</h2>
            {/* Connection Status Indicator */}
            <div className={`flex items-center px-2 py-1 rounded-full text-xs ${
              isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
              {isOnline ? 'Online' : 'Offline'}
            </div>
            {/* Offline Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newState = !offlineModeEnabled;
                setOfflineModeEnabled(newState);
                offlineStorage.setOfflineMode(newState);
              }}
              className={`${offlineModeEnabled ? 'text-blue-600' : 'text-gray-500'}`}
              title={`${offlineModeEnabled ? 'Disable' : 'Enable'} offline mode`}
            >
              {offlineModeEnabled ? <CloudOff className="h-4 w-4" /> : <Cloud className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-gray-600">AI-powered image organization and management</p>
          {/* Storage Stats */}
          {offlineModeEnabled && (
            <div className="flex items-center text-xs text-gray-500 mt-1 gap-4">
              <span>📱 Cached: {storageStats.projects} projects, {storageStats.gallery} images</span>
              {storageStats.queueItems > 0 && (
                <span className="text-orange-600">📥 Queue: {storageStats.queueItems} pending</span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setUploadMode('file')}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!isOnline && !offlineModeEnabled}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
          <Button
            onClick={() => setUploadMode('camera')}
            className="bg-green-600 hover:bg-green-700"
            disabled={!isOnline && !offlineModeEnabled}
          >
            <Camera className="h-4 w-4 mr-2" />
            Take Photo
          </Button>
          <Button
            onClick={() => {
              const newProject = {
                id: Date.now().toString(),
                name: `New Project ${projects.length + 1}`,
                description: 'New project description',
                createdAt: new Date().toISOString().split('T')[0],
                imageCount: 0,
                status: 'planning',
                location: 'Location TBD',
                images: []
              };
              setProjects([...projects, newProject]);
              setSelectedProject(newProject);
            }}
            variant="outline"
            disabled={!isOnline && !offlineModeEnabled}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Project List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {projects.map(project => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedProject?.id === project.id 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <h4 className="font-medium text-sm">{project.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{project.imageCount} images</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      project.status === 'completed' ? 'bg-green-100 text-green-700' :
                      project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Image Gallery */}
        <div className="lg:col-span-3">
          {selectedProject && (
            <Card>
              <CardHeader>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div>
                    <CardTitle>{selectedProject.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{selectedProject.description}</p>
                    <p className="text-xs text-gray-500 mt-1">📍 {selectedProject.location}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Search */}
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search images..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Category Filter */}
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>

                    {/* View Mode Toggle */}
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        title="Grid View"
                      >
                        <Grid className="h-4 w-4" />
                      </button>
                      <div className="w-px bg-gray-300"></div>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        title="List View"
                      >
                        <List className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Batch Selection Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant={isSelectionMode ? "default" : "outline"}
                      size="sm"
                      onClick={toggleSelectionMode}
                    >
                      <CheckSquare className="h-4 w-4 mr-2" />
                      {isSelectionMode ? 'Exit Selection' : 'Select Images'}
                    </Button>
                    
                    {isSelectionMode && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={selectAllImages}
                        >
                          Select All ({filteredImages.length})
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearSelection}
                        >
                          Clear ({selectedImages.length})
                        </Button>
                      </>
                    )}
                  </div>

                  {selectedImages.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''} selected
                      </span>
                      <Button
                        onClick={openBatchSendModal}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Batch
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Upload Area */}
                {uploadMode && (
                  <div 
                    className={`mb-6 p-8 border-2 border-dashed rounded-lg text-center transition-colors ${
                      dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}  
                    onDrop={handleDrop}
                  >
                    {isUploading ? (
                      <div>
                        <ArrowUp className="h-8 w-8 text-blue-600 mx-auto mb-2 animate-bounce" />
                        <p className="text-blue-600 font-medium">Processing and classifying images...</p>
                        <p className="text-sm text-gray-600">AI is analyzing and organizing your images</p>
                      </div>
                    ) : (
                      <div>
                        {uploadMode === 'file' ? (
                          <>
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 mb-2">Drag and drop images here, or click to browse</p>
                            <Button 
                              onClick={() => fileInputRef.current?.click()}
                              variant="outline"
                            >
                              Select Files
                            </Button>
                            <input
                              ref={fileInputRef}
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(Array.from(e.target.files))}
                            />
                          </>
                        ) : (
                          <>
                            <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 mb-2">Take a photo using your device camera</p>
                            <Button 
                              onClick={() => cameraInputRef.current?.click()}
                              variant="outline"
                            >
                              Open Camera
                            </Button>
                            <input
                              ref={cameraInputRef}
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={(e) => handleFileUpload(Array.from(e.target.files))}
                            />
                          </>
                        )}
                        <Button 
                          onClick={() => setUploadMode(null)}
                          variant="ghost"
                          className="ml-2"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Images Display */}
                {filteredImages.length === 0 ? (
                  <div className="text-center py-12">
                    <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Images Found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm || filterCategory !== 'all' 
                        ? 'No images match your current filters.' 
                        : 'Start by uploading some images to this project.'}
                    </p>
                    <Button onClick={() => setUploadMode('file')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Images
                    </Button>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' 
                    ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' 
                    : 'space-y-4'
                  }>
                    {filteredImages.map(image => {
                      const isSelected = selectedImages.includes(image.id);
                      return (
                        <div 
                          key={image.id} 
                          className={`border rounded-lg overflow-hidden hover:shadow-md transition-all ${
                            viewMode === 'list' ? 'flex items-center p-4' : 'bg-white'
                          } ${isSelected ? 'ring-2 ring-green-500 shadow-lg' : ''} ${
                            isSelectionMode ? 'cursor-pointer' : ''
                          }`}
                          onClick={() => isSelectionMode && toggleImageSelection(image.id)}
                        >
                          {/* Selection Checkbox */}
                          {isSelectionMode && (
                            <div className="absolute top-2 left-2 z-10">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                isSelected ? 'bg-green-500 text-white' : 'bg-white border-2 border-gray-300'
                              }`}>
                                {isSelected ? (
                                  <CheckSquare className="h-4 w-4" />
                                ) : (
                                  <Square className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            </div>
                          )}

                          {viewMode === 'grid' ? (
                            <>
                              <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                                {image.url ? (
                                  <img 
                                    src={image.url} 
                                    alt={image.filename}
                                    className={`w-full h-full object-cover ${isSelectionMode ? 'opacity-80' : ''}`}
                                  />
                                ) : (
                                  <Image className="h-8 w-8 text-gray-400" />
                                )}
                              </div>
                            <div className="p-3">
                              <h4 className="font-medium text-sm truncate">{image.filename}</h4>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{image.description}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  image.category === 'progress' ? 'bg-blue-100 text-blue-700' :
                                  image.category === 'before' ? 'bg-gray-100 text-gray-700' :
                                  image.category === 'design' ? 'bg-purple-100 text-purple-700' :
                                  image.category === 'solar' ? 'bg-yellow-100 text-yellow-700' :
                                  image.category === 'interior' ? 'bg-indigo-100 text-indigo-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {image.category}
                                </span>
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs text-blue-600 font-medium">
                                    🤖 AI: {Math.round(image.confidence * 100)}%
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2">
                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
                                  {image.aiCategory.replace('_', ' ')}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {image.tags.slice(0, 2).map(tag => (
                                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              
                              {/* Action Buttons */}
                              {!isSelectionMode && (
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center space-x-1">
                                    <Button size="sm" variant="ghost">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost">
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-red-600 hover:text-red-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteImage(selectedProject.id, image.id, image.filename);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                              {image.url ? (
                                <img 
                                  src={image.url} 
                                  alt={image.filename}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Image className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{image.filename}</h4>
                              <p className="text-sm text-gray-600 mt-1">{image.description}</p>
                              <div className="flex items-center flex-wrap gap-2 mt-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  image.category === 'progress' ? 'bg-blue-100 text-blue-700' :
                                  image.category === 'before' ? 'bg-gray-100 text-gray-700' :
                                  image.category === 'design' ? 'bg-purple-100 text-purple-700' :
                                  image.category === 'solar' ? 'bg-yellow-100 text-yellow-700' :
                                  image.category === 'interior' ? 'bg-indigo-100 text-indigo-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {image.category}
                                </span>
                                <span className="text-xs text-blue-600 font-medium">
                                  🤖 AI: {Math.round(image.confidence * 100)}%
                                </span>
                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
                                  {image.aiCategory.replace('_', ' ')}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {image.uploadDate}
                                </span>
                              </div>
                            </div>
                            {!isSelectionMode && (
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="ghost">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="text-red-600 hover:text-red-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteImage(selectedProject.id, image.id, image.filename);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Camera Modal */}
      {uploadMode === 'camera' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Take Photo</h3>
            <CameraCapture
              onCapture={(imageData) => {
                console.log('📸 Photo captured:', imageData);
                // Convert captured image to file-like object for processing
                const blob = dataURLtoBlob(imageData);
                const file = new File([blob], `camera_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
                handleFileUpload([file]);
                setUploadMode(null);
              }}
              onCancel={() => setUploadMode(null)}
            />
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {uploadMode === 'file' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Upload Files</h3>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                Drag and drop images here, or click to select files
              </p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Select Files'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) {
                    handleFileUpload(files);
                  }
                }}
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setUploadMode(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {!selectedProject && (
        <Card>
          <CardContent className="text-center py-12">
            <FolderPlus className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Project Selected</h3>
            <p className="text-gray-600 mb-4">Select a project from the list or create a new one to start managing images</p>
            <Button
              onClick={() => {
                const newProject = {
                  id: Date.now().toString(),
                  name: `New Project ${projects.length + 1}`,
                  description: 'New project description',
                  createdAt: new Date().toISOString().split('T')[0],
                  imageCount: 0,
                  status: 'planning',
                  location: 'Location TBD',
                  images: []
                };
                setProjects([...projects, newProject]);
                setSelectedProject(newProject);
              }}
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              Create New Project
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Batch Send Modal */}
      {showBatchSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Send Gallery Images</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBatchSendModal(false)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              {/* Send Type Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Send Via</label>
                <div className="flex space-x-2">
                  <Button
                    variant={batchSendForm.sendType === 'whatsapp' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBatchSendForm(prev => ({...prev, sendType: 'whatsapp'}))}
                    className="flex-1"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button
                    variant={batchSendForm.sendType === 'email' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBatchSendForm(prev => ({...prev, sendType: 'email'}))}
                    className="flex-1"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>

              {/* Recipients */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Recipients ({batchSendForm.sendType === 'whatsapp' ? 'Phone Numbers' : 'Email Addresses'})
                </label>
                <textarea
                  value={batchSendForm.recipients}
                  onChange={(e) => setBatchSendForm(prev => ({...prev, recipients: e.target.value}))}
                  placeholder={batchSendForm.sendType === 'whatsapp' 
                    ? '+91 98765 43210, +91 98765 43211' 
                    : 'client1@email.com, client2@email.com'}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate multiple recipients with commas
                </p>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium mb-2">Message (Optional)</label>
                <textarea
                  value={batchSendForm.message}
                  onChange={(e) => setBatchSendForm(prev => ({...prev, message: e.target.value}))}
                  placeholder="Add a personal message..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Images to send:</span>
                  <span className="font-medium">{selectedImages.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Send via:</span>
                  <span className="font-medium capitalize">{batchSendForm.sendType}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowBatchSendModal(false)}
                  disabled={isSending}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBatchSend}
                  disabled={isSending || !batchSendForm.recipients.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Batch
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Camera Capture Component
const CameraCapture = ({ onCapture, onCancel }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera on mobile
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
        };
      }
      setStream(mediaStream);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('❌ Unable to access camera. Please check permissions and try again.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setPreviewImage(imageData);
  };

  const confirmCapture = () => {
    if (previewImage) {
      onCapture(previewImage);
    }
  };

  const retakePhoto = () => {
    setPreviewImage(null);
  };

  return (
    <div className="space-y-4">
      {!previewImage ? (
        <>
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 bg-black rounded-lg object-cover"
            />
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Starting camera...</p>
                </div>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex justify-between">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={capturePhoto}
              disabled={!cameraReady}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Camera className="h-4 w-4 mr-2" />
              Capture Photo
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-4">
            <h4 className="font-medium">Photo Preview</h4>
            <img 
              src={previewImage} 
              alt="Captured photo" 
              className="w-full h-64 object-cover rounded-lg border"
            />
            <div className="flex justify-between">
              <Button variant="outline" onClick={retakePhoto}>
                Retake
              </Button>
              <Button 
                onClick={confirmCapture}
                className="bg-green-600 hover:bg-green-700"
              >
                Save Photo
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Utility function to convert data URL to blob
const dataURLtoBlob = (dataURL) => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

export default ProjectGalleryManager;