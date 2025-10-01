import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  Upload, File, Image, FileText, X, CheckCircle, AlertCircle, 
  Trash2, Eye, Download, Folder, Camera, Mic, Plus
} from 'lucide-react';

const EnhancedFileUploadHeader = ({ onFileUpload, maxFiles = 5, maxFileSize = 100 * 1024 * 1024 }) => {
  const [showModal, setShowModal] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [showCameraModal, setShowCameraModal] = useState(false);

  // Camera capture function
  const handleCameraCapture = async () => {
    try {
      console.log('📸 Attempting to open camera capture modal...');
      setShowCameraModal(true);
    } catch (error) {
      console.error('Camera capture error:', error);
      alert('Camera not available. Please try using the file browser instead.');
    }
  };

  // Handle camera photo captured
  const handleCameraPhoto = (dataURL) => {
    try {
      // Convert dataURL to File object
      const byteString = atob(dataURL.split(',')[1]);
      const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([ab], { type: mimeString });
      const file = new File([blob], `camera-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // Process the file
      handleFiles([file]);
      setShowCameraModal(false);
      
      console.log('✅ Camera photo processed successfully');
    } catch (error) {
      console.error('Error processing camera photo:', error);
      alert('Failed to process camera photo. Please try again.');
    }
  };

  // File handling functions
  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'pending', // pending, uploading, completed, error
      preview: null,
      error: null
    }));

    // Validate files
    const validFiles = newFiles.filter(fileObj => {
      if (fileObj.size > maxFileSize) {
        fileObj.status = 'error';
        fileObj.error = `File size exceeds ${maxFileSize / (1024 * 1024)}MB limit`;
        return false;
      }
      return true;
    });

    // Check total file limit
    if (files.length + validFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Generate previews for images
    validFiles.forEach(fileObj => {
      if (fileObj.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileObj.preview = e.target.result;
          setFiles(prev => [...prev]);
        };
        reader.readAsDataURL(fileObj.file);
      }
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

    try {
      for (const fileObj of files) {
        if (fileObj.status !== 'pending') continue;

        fileObj.status = 'uploading';
        setFiles(prev => [...prev]);

        const formData = new FormData();
        formData.append('file', fileObj.file);
        formData.append('category', 'general');
        formData.append('description', `Uploaded from header: ${fileObj.name}`);

        try {
          // Simulate upload progress
          const uploadPromise = new Promise((resolve, reject) => {
            let progress = 0;
            const interval = setInterval(() => {
              progress += Math.random() * 30;
              if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                resolve({ success: true, fileId: Date.now() });
              }
              
              fileObj.progress = Math.min(progress, 100);
              setFiles(prev => [...prev]);
            }, 200);
          });

          // In production, replace with actual API call:
          // const response = await fetch(`${API}/api/upload/file`, {
          //   method: 'POST',
          //   body: formData,
          //   onUploadProgress: (progressEvent) => {
          //     const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          //     fileObj.progress = progress;
          //     setFiles(prev => [...prev]);
          //   }
          // });

          await uploadPromise;

          fileObj.status = 'completed';
          fileObj.progress = 100;
          setFiles(prev => [...prev]);

          // Callback for parent component
          if (onFileUpload) {
            onFileUpload({
              id: fileObj.id,
              name: fileObj.name,
              size: fileObj.size,
              type: fileObj.type,
              url: `/uploads/${fileObj.name}` // Mock URL
            });
          }

        } catch (error) {
          fileObj.status = 'error';
          fileObj.error = error.message || 'Upload failed';
          setFiles(prev => [...prev]);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (fileType.includes('video/')) return <File className="h-4 w-4" />;
    if (fileType.includes('audio/')) return <Mic className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'uploading': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const clearCompleted = () => {
    setFiles(prev => prev.filter(file => file.status !== 'completed'));
  };

  const retryFailed = () => {
    setFiles(prev => prev.map(file => 
      file.status === 'error' ? { ...file, status: 'pending', error: null, progress: 0 } : file
    ));
  };

  return (
    <>
      {/* Header Upload Button */}
      <Button
        onClick={() => setShowModal(true)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center"
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload
        {files.length > 0 && (
          <Badge className="ml-2 bg-white text-emerald-600 text-xs">
            {files.filter(f => f.status === 'completed').length}/{files.length}
          </Badge>
        )}
      </Button>

      {/* Enhanced Upload Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Enhanced File Upload
            </DialogTitle>
            <DialogDescription>
              Upload files with drag & drop, progress tracking, and preview
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Upload className="h-12 w-12 text-gray-400" />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Drag and drop files here
                  </h3>
                  <p className="text-gray-600">
                    or click to browse from your device
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
                    onClick={handleCameraCapture}
                    variant="outline"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                </div>

                <div className="text-sm text-gray-500">
                  Maximum {maxFiles} files • Up to {maxFileSize / (1024 * 1024)}MB each
                  <br />
                  Supported: Images, Documents, Videos, Audio
                </div>
              </div>
            </div>

            {/* File Inputs */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
              accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.mp4,.mp3,.wav"
            />
            
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                console.log("📸 Camera input triggered, files:", e.target.files);
                if (e.target.files && e.target.files.length > 0) {
                  console.log("✅ Files selected from camera:", e.target.files.length);
                  handleFiles(e.target.files);
                } else {
                  console.log("❌ No files selected from camera");
                  // Fallback: try to open camera with proper constraints
                  handleCameraCapture();
                }
              }}
            />

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">
                    Files ({files.length})
                  </h4>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearCompleted}
                      disabled={!files.some(f => f.status === 'completed')}
                    >
                      Clear Completed
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={retryFailed}
                      disabled={!files.some(f => f.status === 'error')}
                    >
                      Retry Failed
                    </Button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {files.map((fileObj) => (
                    <div
                      key={fileObj.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      {/* File Preview/Icon */}
                      <div className="flex-shrink-0">
                        {fileObj.preview ? (
                          <img
                            src={fileObj.preview}
                            alt={fileObj.name}
                            className="h-10 w-10 object-cover rounded"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                            {getFileIcon(fileObj.type)}
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {fileObj.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(fileObj.size)}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-2">
                            <Badge className={getStatusColor(fileObj.status)}>
                              {fileObj.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {fileObj.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                              {fileObj.status}
                            </Badge>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFile(fileObj.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {fileObj.status === 'uploading' && (
                          <div className="mt-2">
                            <Progress value={fileObj.progress} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">
                              {fileObj.progress}% uploaded
                            </p>
                          </div>
                        )}

                        {/* Error Message */}
                        {fileObj.status === 'error' && fileObj.error && (
                          <p className="text-xs text-red-600 mt-1">
                            {fileObj.error}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-600">
                {files.filter(f => f.status === 'completed').length} of {files.length} files uploaded
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </Button>
                
                <Button
                  onClick={uploadFiles}
                  disabled={uploading || files.length === 0 || files.every(f => f.status !== 'pending')}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Camera Capture Modal - Using Proper Camera Interface */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">📸 Take Photo</h3>
                <button
                  onClick={() => setShowCameraModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center">
                <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">Camera Options</h4>
                <p className="text-gray-600 mb-6">Choose how you'd like to take a photo</p>
                
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      // Option 1: Use device camera capture
                      cameraInputRef.current?.click();
                      setShowCameraModal(false);
                    }}
                    className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-3"
                  >
                    <Camera className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-medium">Use Device Camera</div>
                      <div className="text-sm opacity-90">Direct camera access with live preview</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      // Option 2: File picker with camera preference
                      fileInputRef.current?.click();
                      setShowCameraModal(false);
                    }}
                    className="w-full bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-3"
                  >
                    <Folder className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-medium">Browse Photos</div>
                      <div className="text-sm opacity-90">Select from gallery or take new photo</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setShowCameraModal(false)}
                    className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
                
                <div className="mt-6 text-sm text-gray-500">
                  <p>💡 Your browser will ask for camera permission when using camera options</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedFileUploadHeader;