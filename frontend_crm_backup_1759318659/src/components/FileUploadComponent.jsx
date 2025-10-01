import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const FileUploadComponent = ({ projectId, onUploadComplete, maxFiles = 10, acceptedTypes = {} }) => {
  const [uploads, setUploads] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [completedUploads, setCompletedUploads] = useState([]);
  const [errors, setErrors] = useState({});
  
  const abortControllers = useRef({});
  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  const defaultAcceptedTypes = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'],
    'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
    'application/pdf': ['.pdf'],
    'text/*': ['.txt', '.csv', '.json'],
    'application/zip': ['.zip'],
    'application/x-zip-compressed': ['.zip']
  };

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const newErrors = {};
      rejectedFiles.forEach(rejection => {
        const filename = rejection.file.name;
        newErrors[filename] = rejection.errors.map(err => err.message).join(', ');
      });
      setErrors(prev => ({ ...prev, ...newErrors }));
    }

    // Process accepted files
    for (const file of acceptedFiles) {
      await uploadFile(file);
    }
  }, []);

  const uploadFile = async (file) => {
    const fileId = `${file.name}-${Date.now()}`;
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', projectId || 'general');
      
      // Create AbortController for this upload
      const controller = new AbortController();
      abortControllers.current[fileId] = controller;
      
      // Initialize upload state
      setUploads(prev => ({ ...prev, [fileId]: { file, status: 'uploading' } }));
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[file.name];
        return newErrors;
      });

      // Upload file with progress tracking
      const response = await axios.post(
        `${API_BASE_URL}/api/upload`, 
        formData,
        {
          signal: controller.signal,
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
          }
        }
      );

      // Upload successful
      setUploads(prev => ({ ...prev, [fileId]: { file, status: 'completed', response: response.data } }));
      setCompletedUploads(prev => [...prev, { file, response: response.data }]);
      
      // Clean up
      delete abortControllers.current[fileId];
      
      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete({ file, response: response.data });
      }

    } catch (error) {
      if (error.name === 'CanceledError') {
        // Upload was cancelled
        setUploads(prev => ({ ...prev, [fileId]: { file, status: 'cancelled' } }));
      } else {
        // Upload failed
        setUploads(prev => ({ ...prev, [fileId]: { file, status: 'error' } }));
        setErrors(prev => ({ 
          ...prev, 
          [file.name]: error.response?.data?.detail || error.message || 'Upload failed' 
        }));
      }
      
      // Clean up
      delete abortControllers.current[fileId];
    }
  };

  const cancelUpload = (fileId) => {
    if (abortControllers.current[fileId]) {
      abortControllers.current[fileId].abort();
      delete abortControllers.current[fileId];
    }
  };

  const removeUpload = (fileId) => {
    setUploads(prev => {
      const newUploads = { ...prev };
      delete newUploads[fileId];
      return newUploads;
    });
    
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { ...defaultAcceptedTypes, ...acceptedTypes },
    maxFiles,
    maxSize: 50 * 1024 * 1024, // 50MB limit
  });

  const getFileIcon = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension)) return '🖼️';
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension)) return '🎥';
    if (extension === 'pdf') return '📄';
    if (['txt', 'csv', 'json'].includes(extension)) return '📝';
    if (extension === 'zip') return '📦';
    return '📁';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'uploading': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="file-upload-component space-y-4">
      {/* File Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <div className="text-4xl">📤</div>
          <div>
            {isDragActive ? (
              <p className="text-blue-600 font-medium">Drop files here...</p>
            ) : (
              <div>
                <p className="text-gray-600 font-medium">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Max {maxFiles} files, up to 50MB each
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Upload Progress */}
      {Object.keys(uploads).length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">File Uploads</h4>
          {Object.entries(uploads).map(([fileId, { file, status }]) => (
            <div key={fileId} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getFileIcon(file)}</span>
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(status)}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                  
                  {status === 'uploading' && (
                    <button
                      onClick={() => cancelUpload(fileId)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Cancel
                    </button>
                  )}
                  
                  {(status === 'completed' || status === 'error' || status === 'cancelled') && (
                    <button
                      onClick={() => removeUpload(fileId)}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              
              {/* Progress Bar */}
              {status === 'uploading' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress[fileId] || 0}%` }}
                  />
                </div>
              )}
              
              {/* Error Message */}
              {errors[file.name] && (
                <div className="mt-2 text-sm text-red-600">
                  {errors[file.name]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Completed Uploads Summary */}
      {completedUploads.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-green-800 font-medium mb-2">
            ✅ {completedUploads.length} file{completedUploads.length !== 1 ? 's' : ''} uploaded successfully
          </h4>
          <div className="text-sm text-green-700 space-y-1">
            {completedUploads.map((upload, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span>{getFileIcon(upload.file)}</span>
                <span>{upload.file.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadComponent;