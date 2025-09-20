import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  Upload, Camera, FileText, Image, X, Check, 
  AlertCircle, FolderOpen, Download
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const LeadUploadModal = ({ isOpen, onClose, leadData }) => {
  const [uploadMode, setUploadMode] = useState(null); // 'camera', 'files', or null
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileUpload = async (files) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      
      // Add lead information
      formData.append('lead_id', leadData.id);
      formData.append('lead_name', leadData.name);
      formData.append('upload_type', 'lead_documents');
      
      // Add files
      Array.from(files).forEach((file, index) => {
        formData.append(`files`, file);
      });

      // Upload with progress tracking
      const response = await axios.post(`${API}/api/leads/${leadData.id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        setUploadedFiles(response.data.files || []);
        alert(`✅ Files Uploaded Successfully!

📁 ${files.length} file(s) uploaded for ${leadData.name}
📂 Files are now linked to this lead
🔗 Available for sharing via WhatsApp/Email

Lead files have been securely stored and organized.`);
        
        // Reset upload mode
        setUploadMode(null);
      } else {
        throw new Error(response.data.error || 'Upload failed');
      }

    } catch (error) {
      console.error('Upload error:', error);
      alert(`❌ Upload Failed: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Create camera modal (simplified for now)
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // This would typically open a camera modal
      // For now, we'll simulate file selection
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
      
      // Stop camera stream
      stream.getTracks().forEach(track => track.stop());
      
    } catch (error) {
      console.error('Camera access error:', error);
      alert('❌ Unable to access camera. Please use file upload instead.');
    }
  };

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
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const renderUploadOptions = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Choose Upload Method</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={() => setUploadMode('camera')}
          className="h-24 bg-blue-600 hover:bg-blue-700"
        >
          <div className="text-center">
            <Camera className="h-8 w-8 mx-auto mb-2" />
            <div className="font-semibold">Take Photo</div>
            <div className="text-sm opacity-90">Site images, documents</div>
          </div>
        </Button>
        
        <Button
          onClick={() => setUploadMode('files')}
          className="h-24 bg-green-600 hover:bg-green-700"
        >
          <div className="text-center">
            <Upload className="h-8 w-8 mx-auto mb-2" />
            <div className="font-semibold">Upload Files</div>
            <div className="text-sm opacity-90">Images, PDFs, documents</div>
          </div>
        </Button>
      </div>
      
      <div className="text-sm text-gray-600 text-center">
        📋 Upload site images, floor plans, requirements, or any documents related to this lead
      </div>
    </div>
  );

  const renderCameraMode = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Camera Capture</h3>
        <Button variant="outline" onClick={() => setUploadMode(null)}>
          <X className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      
      <div className="text-center">
        <Camera className="h-16 w-16 mx-auto text-blue-500 mb-4" />
        <p className="text-gray-600 mb-4">
          Capture site images, floor plans, or documents using your camera
        </p>
        
        <Button 
          onClick={handleCameraCapture}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Camera className="h-4 w-4 mr-2" />
          Open Camera
        </Button>
        
        {/* Hidden file input for camera */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
              handleFileUpload(files);
            }
          }}
        />
      </div>
    </div>
  );

  const renderFileUploadMode = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">File Upload</h3>
        <Button variant="outline" onClick={() => setUploadMode(null)}>
          <X className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 mb-4">
          Drag and drop files here, or click to select
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Supported: Images (JPG, PNG), PDFs, Documents (DOC, DOCX)
        </p>
        
        <Button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-green-600 hover:bg-green-700"
        >
          {uploading ? 'Uploading...' : 'Select Files'}
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
              handleFileUpload(files);
            }
          }}
        />
      </div>
      
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading files...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
    </div>
  );

  const renderUploadedFiles = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <Check className="h-5 w-5 text-green-600 mr-2" />
        Files Uploaded Successfully
      </h3>
      
      <div className="space-y-2">
        {uploadedFiles.map((file, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              {file.type?.includes('image') ? 
                <Image className="h-5 w-5 text-green-600 mr-2" /> :
                <FileText className="h-5 w-5 text-green-600 mr-2" />
              }
              <span className="font-medium">{file.name}</span>
            </div>
            <Badge className="bg-green-100 text-green-800">
              {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Uploaded'}
            </Badge>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => {
          setUploadedFiles([]);
          setUploadMode(null);
        }}>
          Upload More
        </Button>
        <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
          Done
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Files - {leadData?.name}</span>
          </DialogTitle>
          <DialogDescription>
            Upload site images, documents, or any files related to this lead
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lead Information */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{leadData?.name}</h4>
                  <p className="text-sm text-gray-600">{leadData?.email}</p>
                  <p className="text-sm text-gray-600">{leadData?.phone}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  Lead ID: {leadData?.id}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Upload Interface */}
          {uploadedFiles.length > 0 ? renderUploadedFiles() :
           uploadMode === 'camera' ? renderCameraMode() :
           uploadMode === 'files' ? renderFileUploadMode() :
           renderUploadOptions()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadUploadModal;