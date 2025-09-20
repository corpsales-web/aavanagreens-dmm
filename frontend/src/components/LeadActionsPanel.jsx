import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Camera, Info, X } from 'lucide-react';
import { initializeCamera, capturePhoto, stopCameraStream, checkCameraAvailability } from '../utils/cameraUtils';
import ClientGalleryManager from './ClientGalleryManager';

const LeadActionsPanel = ({ leadId, leadData, onActionComplete, initialActionType }) => {
  const [actions, setActions] = useState([]);
  const [actionHistory, setActionHistory] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [actionData, setActionData] = useState({});
  
  // Camera functionality states
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    if (leadId) {
      fetchAvailableActions();
      fetchActionHistory();
    }
  }, [leadId]);

  useEffect(() => {
    // If initialActionType is provided, auto-open the action modal
    if (initialActionType && actions.length > 0) {
      const action = actions.find(a => a.type === initialActionType);
      if (action) {
        handleActionClick(action);
      }
    }
  }, [initialActionType, actions]);

  // Cleanup camera stream when component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      // Cleanup any created URLs
      capturedImages.forEach(image => {
        URL.revokeObjectURL(image.url);
      });
    };
  }, [cameraStream, capturedImages]);

  // Stop camera when modal is closed
  useEffect(() => {
    if (!showActionModal && cameraStream) {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      setShowCameraCapture(false);
      setCapturedImages([]);
      setCameraError(null);
    }
  }, [showActionModal, cameraStream]);

  const fetchAvailableActions = () => {
    // Get available actions based on lead data
    const availableActions = [];

    // Call action - always available if phone exists
    if (leadData?.phone) {
      availableActions.push({
        type: 'call',
        label: 'Call',
        icon: '📞',
        color: 'blue',
        enabled: true
      });
    }

    // WhatsApp action - available if phone exists
    if (leadData?.phone) {
      availableActions.push({
        type: 'whatsapp',
        label: 'WhatsApp',
        icon: '💬',
        color: 'green',
        enabled: true
      });
    }

    // Email action - available if email exists
    if (leadData?.email) {
      availableActions.push({
        type: 'email',
        label: 'Send Email',
        icon: '📧',
        color: 'red',
        enabled: true
      });
    }

    // Send Images with Camera - always available
    availableActions.push({
      type: 'capture_and_send_images',
      label: '📸 Camera',
      icon: '📸',
      color: 'green',
      enabled: true,
      description: 'Capture photos with camera and send to lead'
    });

    // Send Images from Gallery - always available
    availableActions.push({
      type: 'send_gallery_images',
      label: '🖼️ Gallery',
      icon: '🖼️',
      color: 'purple',
      enabled: true,
      description: 'Send project images and catalogues from gallery'
    });

    // Send Catalogue - always available
    availableActions.push({
      type: 'send_catalogue',
      label: 'Send Catalogue',
      icon: '📋',
      color: 'orange',
      enabled: true
    });

    // Meeting - available for qualified leads
    if (leadData?.status && ['qualified', 'proposal', 'negotiation'].includes(leadData.status)) {
      availableActions.push({
        type: 'meeting',
        label: 'Schedule Meeting',
        icon: '🤝',
        color: 'teal',
        enabled: true
      });
    }

    // Follow-up - always available
    availableActions.push({
      type: 'follow_up',
      label: 'Follow Up',
      icon: '🔄',
      color: 'gray',
      enabled: true
    });

    // Add Remark - always available
    availableActions.push({
      type: 'remark',
      label: 'Add Remark',
      icon: '💭',
      color: 'yellow',
      enabled: true
    });

    setActions(availableActions);
  };

  // Camera functionality methods
  const startCamera = useCallback(async () => {
    setIsInitializingCamera(true);
    setCameraError(null);
    
    try {
      // Stop any existing stream first
      if (cameraStream) {
        stopCameraStream(cameraStream);
        setCameraStream(null);
      }

      // Initialize camera with comprehensive error handling
      const result = await initializeCamera({
        video: { 
          width: { ideal: 1280, max: 1920 }, 
          height: { ideal: 720, max: 1080 },
          facingMode: 'environment' // Use back camera if available for better quality
        }
      });

      if (result.success) {
        setCameraStream(result.stream);
        if (videoRef.current) {
          videoRef.current.srcObject = result.stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(err => {
              console.error('Video play failed:', err);
              setCameraError('📷 Video preview failed but camera may still work for capture.');
            });
          };
        }
        setShowCameraCapture(true);
        setCameraError(null);
        console.log('✅ Lead Actions camera initialized successfully');
        
      } else {
        setCameraError(result.message);
        setShowCameraCapture(false);
        console.error('Camera initialization failed:', result.error);
      }
      
    } catch (error) {
      console.error('Unexpected camera error:', error);
      setCameraError('📷 Unexpected camera error. Please try again or use file upload instead.');
      setShowCameraCapture(false);
    } finally {
      setIsInitializingCamera(false);
    }
  }, [cameraStream]);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      stopCameraStream(cameraStream);
      setCameraStream(null);
    }
    setShowCameraCapture(false);
    setCameraError(null);
  }, [cameraStream]);

  const handleCapturePhoto = useCallback(() => {
    if (!videoRef.current || !cameraStream) {
      setCameraError('Camera not ready for capture');
      return;
    }

    try {
      // Use the comprehensive capture utility
      const result = capturePhoto(videoRef.current, 0.8);
      
      if (result.success) {
        const imageUrl = URL.createObjectURL(result.blob);
        const newImage = {
          id: Date.now(),
          blob: result.blob,
          dataURL: result.dataURL,
          url: imageUrl,
          timestamp: new Date(),
          leadId: leadId,
          leadName: leadData.name,
          dimensions: result.dimensions
        };
        
        setCapturedImages(prev => [...prev, newImage]);
        
        // Update action data with captured image
        setActionData(prev => ({
          ...prev,
          images: [...(prev.images || []), newImage],
          capture_mode: 'camera',
          lead_specific: true,
          lead_id: leadId,
          lead_name: leadData.name
        }));

        setCameraError(null);
        console.log('✅ Photo captured successfully for lead:', leadData.name, result.dimensions);
        
      } else {
        setCameraError(result.message);
        console.error('Photo capture failed:', result.error);
      }
      
    } catch (error) {
      console.error('Unexpected capture error:', error);
      setCameraError('📷 Failed to capture photo. Please try again or use file upload.');
    }
  }, [leadId, leadData.name, cameraStream]);

  const removeImage = useCallback((imageId) => {
    setCapturedImages(prev => {
      const updated = prev.filter(img => img.id !== imageId);
      // Clean up URL
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return updated;
    });
    
    setActionData(prev => ({
      ...prev,
      images: (prev.images || []).filter(img => img.id !== imageId)
    }));
  }, []);

  const fetchActionHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/api/leads/${leadId}/actions`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setActionHistory(response.data.actions || []);
    } catch (error) {
      console.error('Error fetching action history:', error);
    }
  };

  const handleActionClick = (action) => {
    setSelectedAction(action);
    setActionData({});
    setShowActionModal(true);
  };

  const executeAction = async () => {
    if (!selectedAction) return;

    setIsExecuting(true);
    try {
      const token = localStorage.getItem('token');
      
      const requestData = {
        action_type: selectedAction.type,
        ...actionData
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/leads/${leadId}/actions`,
        requestData,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      // Refresh action history
      await fetchActionHistory();
      
      setShowActionModal(false);
      setSelectedAction(null);
      setActionData({});

      if (onActionComplete) {
        onActionComplete(response.data);
      }

      // Show success message
      alert(`${selectedAction.label} executed successfully!`);

    } catch (error) {
      console.error('Error executing action:', error);
      alert(`Error executing ${selectedAction.label}: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const renderActionForm = () => {
    if (!selectedAction) return null;

    switch (selectedAction.type) {
      case 'call':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Call Duration (minutes)
              </label>
              <input
                type="number"
                min="0"
                value={actionData.duration || ''}
                onChange={(e) => setActionData({ ...actionData, duration: parseInt(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Duration in minutes"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Call Outcome
              </label>
              <select
                value={actionData.outcome || ''}
                onChange={(e) => setActionData({ ...actionData, outcome: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select outcome</option>
                <option value="answered">Answered</option>
                <option value="no_answer">No Answer</option>
                <option value="busy">Busy</option>
                <option value="voicemail">Voicemail</option>
                <option value="wrong_number">Wrong Number</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={actionData.notes || ''}
                onChange={(e) => setActionData({ ...actionData, notes: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder="Call notes..."
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={actionData.follow_up_required || false}
                onChange={(e) => setActionData({ ...actionData, follow_up_required: e.target.checked })}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">Follow-up required</label>
            </div>
          </div>
        );

      case 'whatsapp':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                value={actionData.message || ''}
                onChange={(e) => setActionData({ ...actionData, message: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="4"
                placeholder="WhatsApp message..."
                required
              />
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <input
                type="text"
                value={actionData.subject || ''}
                onChange={(e) => setActionData({ ...actionData, subject: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Email subject"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                value={actionData.message || ''}
                onChange={(e) => setActionData({ ...actionData, message: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="6"
                placeholder="Email message..."
                required
              />
            </div>
          </div>
        );

      case 'capture_and_send_images':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">📸 Camera Capture for {leadData.name}</h4>
              <p className="text-sm text-green-600">Capture photos directly and send them to this specific lead</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Method
              </label>
              <select
                value={actionData.method || 'whatsapp'}
                onChange={(e) => setActionData({ ...actionData, method: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="whatsapp">📱 WhatsApp ({leadData.phone})</option>
                <option value="email">📧 Email ({leadData.email})</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Camera Capture
              </label>
              <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center bg-green-50">
                <div className="mb-4">
                  <Camera className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <p className="text-green-700 font-medium">Lead-Specific Camera Capture</p>
                  <p className="text-sm text-green-600">Photos will be automatically tagged for {leadData.name}</p>
                </div>
                
                <div className="space-y-3">
                  {!showCameraCapture ? (
                    <button
                      type="button"
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center mx-auto disabled:bg-gray-400"
                      onClick={startCamera}
                      disabled={isInitializingCamera}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {isInitializingCamera ? 'Starting Camera...' : '📸 Open Camera'}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative bg-black rounded-lg overflow-hidden">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full max-w-sm mx-auto"
                          style={{ transform: 'scaleX(-1)' }}
                        />
                        <canvas ref={canvasRef} className="hidden" />
                      </div>
                      
                      <div className="flex justify-center space-x-2">
                        <button
                          type="button"
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                          onClick={handleCapturePhoto}
                        >
                          📸 Capture Photo
                        </button>
                        <button
                          type="button"
                          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                          onClick={stopCamera}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Close Camera
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {cameraError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm">{cameraError}</p>
                    </div>
                  )}
                  
                  {/* Display captured images */}
                  {capturedImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Captured Images ({capturedImages.length})
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {capturedImages.map((image) => (
                          <div key={image.id} className="relative">
                            <img
                              src={image.url}
                              alt="Captured"
                              className="w-full h-20 object-cover rounded border"
                            />
                            <button
                              type="button"
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                              onClick={() => removeImage(image.id)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Or choose existing images:
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      type="button"
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                      onClick={() => setActionData({ ...actionData, images: ['garden-sample-1.jpg'], source: 'gallery' })}
                    >
                      🌿 Garden Designs
                    </button>
                    <button
                      type="button"
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                      onClick={() => setActionData({ ...actionData, images: ['plant-care-guide.jpg'], source: 'gallery' })}
                    >
                      📖 Care Guides
                    </button>
                    <button
                      type="button"
                      className="bg-purple-500 text-white px-3 py-1 rounded text-sm"
                      onClick={() => setActionData({ ...actionData, images: ['testimonial-photos.jpg'], source: 'gallery' })}
                    >
                      ⭐ Testimonials
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personal Message for {leadData.name}
              </label>
              <textarea
                value={actionData.message || `Hi ${leadData.name}, here are some images related to your ${leadData.requirements || 'garden project'}. Let me know if you have any questions!`}
                onChange={(e) => setActionData({ ...actionData, message: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder={`Personal message for ${leadData.name}...`}
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center text-blue-800">
                <Info className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Lead-Specific Features:</span>
              </div>
              <ul className="text-sm text-blue-700 mt-1 ml-6 list-disc">
                <li>Photos tagged with {leadData.name}</li>
                <li>Delivery to {leadData.phone} or {leadData.email}</li>
                <li>Automatic follow-up tracking</li>
                <li>Budget-appropriate content ({leadData.budget ? `₹${Number(leadData.budget).toLocaleString()}` : 'Custom budget'})</li>
              </ul>
            </div>
          </div>
        );

      case 'send_gallery_images':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600">Click the button below to open the gallery and select images/catalogues to send to this client.</p>
              <button 
                onClick={() => {
                  setShowGalleryModal(true);
                  setShowActionModal(false);
                }}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
              >
                🖼️ Open Gallery & Catalogues
              </button>
            </div>
          </div>
        );
        
      case 'send_catalogue':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catalogue Type
              </label>
              <select
                value={actionData.catalogue_type || 'general'}
                onChange={(e) => setActionData({ ...actionData, catalogue_type: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="general">General Catalogue</option>
                <option value="residential">Residential Projects</option>
                <option value="commercial">Commercial Projects</option>
                <option value="luxury">Luxury Collection</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Method
              </label>
              <select
                value={actionData.method || 'email'}
                onChange={(e) => setActionData({ ...actionData, method: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="both">Both</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={actionData.message || 'Please find our product catalogue attached'}
                onChange={(e) => setActionData({ ...actionData, message: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder="Message to accompany catalogue..."
              />
            </div>
          </div>
        );

      case 'meeting':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Title *
              </label>
              <input
                type="text"
                value={actionData.title || `Meeting with ${leadData?.name || 'Client'}`}
                onChange={(e) => setActionData({ ...actionData, title: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Meeting title"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={actionData.date || ''}
                  onChange={(e) => setActionData({ ...actionData, date: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  value={actionData.time || ''}
                  onChange={(e) => setActionData({ ...actionData, time: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={actionData.duration || 60}
                onChange={(e) => setActionData({ ...actionData, duration: parseInt(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Duration in minutes"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Type
              </label>
              <select
                value={actionData.type || 'online'}
                onChange={(e) => setActionData({ ...actionData, type: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="online">Online</option>
                <option value="offline">In-Person</option>
              </select>
            </div>
            
            {actionData.type === 'offline' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={actionData.location || ''}
                  onChange={(e) => setActionData({ ...actionData, location: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Meeting location"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agenda
              </label>
              <textarea
                value={actionData.agenda || ''}
                onChange={(e) => setActionData({ ...actionData, agenda: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder="Meeting agenda..."
              />
            </div>
          </div>
        );

      case 'follow_up':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Follow-up Type
              </label>
              <select
                value={actionData.type || 'general'}
                onChange={(e) => setActionData({ ...actionData, type: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="general">General Follow-up</option>
                <option value="quotation">Quotation Follow-up</option>
                <option value="meeting">Meeting Follow-up</option>
                <option value="payment">Payment Follow-up</option>
                <option value="documentation">Documentation</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={actionData.priority || 'medium'}
                onChange={(e) => setActionData({ ...actionData, priority: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={actionData.due_date || ''}
                onChange={(e) => setActionData({ ...actionData, due_date: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={actionData.notes || ''}
                onChange={(e) => setActionData({ ...actionData, notes: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="4"
                placeholder="Follow-up notes..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reminder (minutes before due date)
              </label>
              <select
                value={actionData.reminder_before || 60}
                onChange={(e) => setActionData({ ...actionData, reminder_before: parseInt(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={1440}>1 day</option>
              </select>
            </div>
          </div>
        );

      case 'remark':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remark Type
              </label>
              <select
                value={actionData.type || 'general'}
                onChange={(e) => setActionData({ ...actionData, type: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="general">General Remark</option>
                <option value="call_summary">Call Summary</option>
                <option value="meeting_notes">Meeting Notes</option>
                <option value="follow_up_note">Follow-up Note</option>
                <option value="concern">Concern/Issue</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remark Content *
              </label>
              <textarea
                value={actionData.content || ''}
                onChange={(e) => setActionData({ ...actionData, content: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="4"
                placeholder="Enter your remark..."
                required
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={actionData.is_private || false}
                onChange={(e) => setActionData({ ...actionData, is_private: e.target.checked })}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">Private remark (visible only to you)</label>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 Tip: You can also use voice remarks by clicking the Voice button in the header and selecting "Voice Remark" mode.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-4">
            <p className="text-gray-500">Action form not implemented yet</p>
          </div>
        );
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    try {
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      return 'Invalid time';
    }
  };

  const getActionIcon = (actionType) => {
    const iconMap = {
      call: '📞',
      whatsapp: '💬',
      email: '📧',
      send_images: '🖼️',
      capture_and_send_images: '📸',
      send_catalogue: '📋',
      meeting: '🤝',
      follow_up: '🔄',
      remark_added: '💭',
      update: '✏️'
    };
    return iconMap[actionType] || '📝';
  };

  return (
    <div className="lead-actions-panel">
      {/* Available Actions */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Available Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {actions.map((action) => (
            <button
              key={action.type}
              onClick={() => handleActionClick(action)}
              disabled={!action.enabled}
              className={`
                p-3 rounded-lg text-center transition-all duration-200 border-2
                ${action.enabled
                  ? `bg-${action.color}-50 border-${action.color}-200 hover:bg-${action.color}-100 hover:border-${action.color}-300 text-${action.color}-700`
                  : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <div className="text-2xl mb-1">{action.icon}</div>
              <div className="text-sm font-medium">{action.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Action History */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Actions</h3>
        {actionHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p>No actions recorded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {actionHistory.slice(0, 10).map((action) => (
              <div key={action.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{getActionIcon(action.action_type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 capitalize">
                          {action.action_type.replace('_', ' ')}
                        </span>
                        <span className={`
                          px-2 py-1 text-xs rounded-full
                          ${action.status === 'completed' ? 'bg-green-100 text-green-800' :
                            action.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'}
                        `}>
                          {action.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDateTime(action.timestamp)}
                      </p>
                      {action.user && (
                        <p className="text-xs text-gray-500">
                          by {action.user.full_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {actionHistory.length > 10 && (
              <div className="text-center py-2">
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  View all actions ({actionHistory.length})
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedAction.icon} {selectedAction.label}
                </h3>
                <button
                  onClick={() => setShowActionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                {renderActionForm()}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                
                <button
                  onClick={executeAction}
                  disabled={isExecuting}
                  className={`
                    px-4 py-2 text-sm font-medium text-white rounded-md
                    ${isExecuting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : `bg-${selectedAction.color}-600 hover:bg-${selectedAction.color}-700`
                    }
                  `}
                >
                  {isExecuting ? 'Executing...' : `Execute ${selectedAction.label}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Gallery Manager Modal */}
      <ClientGalleryManager 
        isOpen={showGalleryModal}
        onClose={() => setShowGalleryModal(false)}
        selectedLead={leadData}
      />
    </div>
  );
};

export default LeadActionsPanel;