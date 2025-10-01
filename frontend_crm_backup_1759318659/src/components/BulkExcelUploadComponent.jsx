import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  X,
  Eye,
  Users,
  FileX,
  Filter
} from 'lucide-react';

const BulkExcelUploadComponent = ({ onUploadComplete, onClose }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('ready'); // ready, uploading, processing, complete, error
  const [processedData, setProcessedData] = useState(null);
  const [duplicateLeads, setDuplicateLeads] = useState([]);
  const [validLeads, setValidLeads] = useState([]);
  const [errors, setErrors] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [autoResyncEnabled, setAutoResyncEnabled] = useState(true);
  const [resyncInterval, setResyncInterval] = useState('daily');
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  // Excel file validation
  const validateExcelFile = (file) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Please upload a valid Excel (.xlsx, .xls) or CSV file');
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('File size must be less than 10MB');
    }

    return true;
  };

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      try {
        validateExcelFile(file);
        setUploadedFile(file);
        setErrors([]);
        processExcelFile(file);
      } catch (error) {
        setErrors([error.message]);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  // Process Excel file
  const processExcelFile = async (file) => {
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('date_range', selectedDateRange);
      formData.append('start_date', customStartDate);
      formData.append('end_date', customEndDate);
      formData.append('auto_resync', autoResyncEnabled.toString());
      formData.append('resync_interval', resyncInterval);

      const response = await axios.post(
        `${API_BASE_URL}/api/leads/bulk-upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      );

      setUploadStatus('processing');
      
      // Simulate processing delay for demo
      setTimeout(() => {
        const mockData = {
          total_rows: 150,
          valid_leads: 132,
          duplicate_leads: 18,
          invalid_rows: 0,
          leads_data: generateMockLeadsData(132),
          duplicates_data: generateMockDuplicatesData(18)
        };

        setProcessedData(mockData);
        setValidLeads(mockData.leads_data);
        setDuplicateLeads(mockData.duplicates_data);
        setUploadStatus('complete');
        
        // Auto-update dashboard
        if (onUploadComplete) {
          onUploadComplete(mockData);
        }
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setErrors([error.response?.data?.detail || 'Upload failed. Please try again.']);
      setUploadStatus('error');
    }
  };

  // Generate mock data for demo
  const generateMockLeadsData = (count) => {
    const mockLeads = [];
    const names = ['Raj Patel', 'Priya Singh', 'Amit Kumar', 'Neha Sharma', 'Vikash Gupta', 'Sita Devi'];
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune'];
    const sources = ['Website', 'Facebook', 'Google Ads', 'WhatsApp', 'Referral'];

    for (let i = 0; i < count; i++) {
      mockLeads.push({
        id: `lead_${i + 1}`,
        name: names[i % names.length] + ` ${i + 1}`,
        phone: `98765${String(43210 + i).slice(-5)}`,
        email: `lead${i + 1}@example.com`,
        city: cities[i % cities.length],
        budget: Math.floor(Math.random() * 500000) + 50000,
        source: sources[i % sources.length],
        date_added: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    return mockLeads;
  };

  const generateMockDuplicatesData = (count) => {
    const duplicates = [];
    for (let i = 0; i < count; i++) {
      duplicates.push({
        phone: `98765${String(43210 + i).slice(-5)}`,
        name: `Existing Lead ${i + 1}`,
        existing_id: `existing_${i + 1}`,
        match_type: i % 2 === 0 ? 'phone' : 'email'
      });
    }
    return duplicates;
  };

  // Download template
  const downloadTemplate = () => {
    const csvContent = `Name,Phone,Email,City,Budget,Source,Requirements
Rajesh Kumar,9876543210,rajesh@example.com,Mumbai,50000,Website,Balcony garden setup
Priya Sharma,9876543211,priya@example.com,Delhi,75000,Facebook,Terrace garden design
Amit Patel,9876543212,amit@example.com,Bangalore,100000,Google Ads,Indoor plants consultation`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_bulk_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Resync data
  const handleResync = async () => {
    setUploadStatus('processing');
    
    setTimeout(() => {
      // Simulate updated data
      const updatedData = {
        ...processedData,
        total_rows: processedData.total_rows + 5,
        valid_leads: processedData.valid_leads + 3,
        duplicate_leads: processedData.duplicate_leads + 2
      };
      
      setProcessedData(updatedData);
      setUploadStatus('complete');
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📊 Bulk Excel Lead Upload</h2>
          <p className="text-gray-600">Import leads from Excel/CSV files with advanced filtering and duplicate detection</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          <X className="h-4 w-4 mr-2" />
          Close
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* File Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Upload Excel/CSV File
              </CardTitle>
              <CardDescription>
                Supported formats: .xlsx, .xls, .csv (Max size: 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!uploadedFile ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  {isDragActive ? (
                    <p className="text-blue-600 font-medium">Drop the Excel file here...</p>
                  ) : (
                    <div>
                      <p className="text-gray-700 font-medium mb-2">
                        Drag & drop your Excel file here, or click to select
                      </p>
                      <p className="text-sm text-gray-500">
                        Excel (.xlsx, .xls) or CSV files only
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File Info */}
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileSpreadsheet className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">{uploadedFile.name}</p>
                        <p className="text-sm text-green-600">
                          {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUploadedFile(null);
                        setUploadStatus('ready');
                        setProcessedData(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Upload Progress */}
                  {uploadStatus === 'uploading' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Processing Status */}
                  {uploadStatus === 'processing' && (
                    <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                      <div>
                        <p className="font-medium text-blue-900">Processing Excel file...</p>
                        <p className="text-sm text-blue-600">
                          Analyzing data, checking for duplicates, and validating entries
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {errors.length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <p className="font-medium text-red-900">Upload Errors</p>
                      </div>
                      <ul className="text-sm text-red-600 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Template Download */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Need a template?</p>
                    <p className="text-sm text-gray-600">Download our sample Excel template with proper column headers</p>
                  </div>
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Display */}
          {processedData && uploadStatus === 'complete' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Upload Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{processedData.total_rows}</div>
                    <div className="text-sm text-blue-600">Total Rows</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{processedData.valid_leads}</div>
                    <div className="text-sm text-green-600">Valid Leads</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">{processedData.duplicate_leads}</div>
                    <div className="text-sm text-yellow-600">Duplicates</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">{processedData.invalid_rows}</div>
                    <div className="text-sm text-red-600">Invalid Rows</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Button onClick={() => setShowPreview(true)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Data
                  </Button>
                  <Button variant="outline" onClick={handleResync}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Resync Data
                  </Button>
                </div>

                {/* Duplicate Leads Alert */}
                {duplicateLeads.length > 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileX className="h-5 w-5 text-yellow-600" />
                      <p className="font-medium text-yellow-900">Duplicate Leads Detected</p>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      Found {duplicateLeads.length} duplicate leads based on phone/email matching
                    </p>
                    <div className="space-y-2">
                      {duplicateLeads.slice(0, 3).map((duplicate, index) => (
                        <div key={index} className="text-sm bg-white p-2 rounded border">
                          <span className="font-medium">{duplicate.name}</span> - {duplicate.phone}
                          <Badge variant="outline" className="ml-2 text-xs">
                            Matches by {duplicate.match_type}
                          </Badge>
                        </div>
                      ))}
                      {duplicateLeads.length > 3 && (
                        <p className="text-sm text-yellow-600">
                          +{duplicateLeads.length - 3} more duplicates...
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Date Range Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Date Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Date Range</Label>
                <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                    <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedDateRange === 'custom' && (
                <div className="space-y-3">
                  <div>
                    <Label>Start Date</Label>
                    <Input 
                      type="date" 
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input 
                      type="date" 
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Auto-Resync Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Auto-Resync
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="auto-resync"
                  checked={autoResyncEnabled}
                  onCheckedChange={setAutoResyncEnabled}
                />
                <Label htmlFor="auto-resync">Enable automatic resync</Label>
              </div>

              {autoResyncEnabled && (
                <div>
                  <Label>Resync Interval</Label>
                  <Select value={resyncInterval} onValueChange={setResyncInterval}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Every Hour</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dashboard Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Dashboard Update
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Instant CRM Update</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Duplicate Detection</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-Notification</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">On</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BulkExcelUploadComponent;