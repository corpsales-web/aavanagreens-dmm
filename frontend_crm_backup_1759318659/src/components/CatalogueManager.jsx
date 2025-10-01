import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { CheckSquare, Square, Send, MessageSquare, Mail } from 'lucide-react';

const CatalogueManager = ({ isEmbeded = false }) => {
  const [catalogues, setCatalogues] = useState([]);
  const [categories, setCategories] = useState(['general']);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [selectedCatalogue, setSelectedCatalogue] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Batch Selection States
  const [selectedCatalogues, setSelectedCatalogues] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showBatchSendModal, setShowBatchSendModal] = useState(false);
  const [batchSendForm, setBatchSendForm] = useState({
    recipients: '',
    message: '',
    sendType: 'whatsapp'
  });
  const [isSending, setIsSending] = useState(false);
  
  // Upload form state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('general');
  const [uploadTags, setUploadTags] = useState('');
  
  // Send form state
  const [sendMethod, setSendMethod] = useState('whatsapp');
  const [contactInfo, setContactInfo] = useState('');

  const API = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    loadCatalogues();
    loadCategories();
  }, []);

  const loadCatalogues = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API}/api/erp/catalogue/list`);
      const data = await response.json();
      
      if (data.success) {
        setCatalogues(data.catalogues || []);
      }
    } catch (error) {
      console.error('Error loading catalogues:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API}/api/erp/catalogue/categories`);
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories || ['general']);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadFile) {
      alert('Please select a file to upload');
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('category', uploadCategory);
      formData.append('tags', uploadTags);

      const response = await fetch(`${API}/api/erp/catalogue/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Catalogue "${uploadFile.name}" uploaded successfully!\n\n📢 All users have been notified about the new catalogue.`);
        setUploadModalOpen(false);
        setUploadFile(null);
        setUploadCategory('general');
        setUploadTags('');
        loadCatalogues();
      } else {
        alert('❌ Upload failed: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Upload failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (catalogueId, catalogueName) => {
    if (!window.confirm(`Are you sure you want to delete "${catalogueName}"?`)) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`${API}/api/erp/catalogue/${catalogueId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Catalogue "${catalogueName}" deleted successfully!`);
        loadCatalogues();
      } else {
        alert('❌ Delete failed: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Delete failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!contactInfo.trim()) {
      alert('Please enter contact information');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`${API}/api/erp/catalogue/${selectedCatalogue.id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: sendMethod,
          contact: contactInfo.trim(),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Catalogue "${selectedCatalogue.name}" sent successfully via ${sendMethod}!`);
        setSendModalOpen(false);
        setContactInfo('');
      } else {
        alert('❌ Send failed: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Send error:', error);
      alert('❌ Send failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Batch Selection Functions
  const toggleCatalogueSelection = (catalogueId) => {
    setSelectedCatalogues(prev => 
      prev.includes(catalogueId) 
        ? prev.filter(id => id !== catalogueId)
        : [...prev, catalogueId]
    );
  };

  const selectAllCatalogues = () => {
    const filteredCatalogueIds = filteredCatalogues.map(cat => cat.id);
    setSelectedCatalogues(filteredCatalogueIds);
  };

  const clearSelection = () => {
    setSelectedCatalogues([]);
    setIsSelectionMode(false);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedCatalogues([]);
    }
  };

  // Batch Send Functions
  const openBatchSendModal = () => {
    if (selectedCatalogues.length === 0) {
      alert('Please select at least one catalogue to send.');
      return;
    }
    if (selectedCatalogues.length > 50) {
      alert('Maximum 50 catalogues can be sent at once.');
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

      console.log('🚀 Sending batch catalogue items:', {
        catalogueCount: selectedCatalogues.length,
        recipients: recipients.length,
        sendType: batchSendForm.sendType
      });

      const response = await fetch(`${API}/api/batch-send/catalogue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: selectedCatalogues,
          send_type: batchSendForm.sendType,
          recipients: recipients,
          message: batchSendForm.message,
          item_type: 'catalogue'
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Batch send completed!\n\n📊 Results:\n• Sent: ${data.total_sent}\n• Failed: ${data.failed.length}\n• Batch ID: ${data.batch_id}`);
        
        // Reset form and close modal
        setBatchSendForm({
          recipients: '',
          message: '',
          sendType: 'whatsapp'
        });
        setShowBatchSendModal(false);
        clearSelection();
      } else {
        alert('❌ Batch send failed. Please try again.');
      }
    } catch (error) {
      console.error('Batch send error:', error);
      alert(`❌ Error sending catalogues: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleCategoryAdd = async () => {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    if (categories.includes(newCategoryName.toLowerCase())) {
      alert('Category already exists');
      return;
    }

    try {
      // Add to local state
      const updatedCategories = [...categories, newCategoryName.toLowerCase()];
      setCategories(updatedCategories);
      
      // Here you would call API to save category
      // await saveCategory(newCategoryName);
      
      setNewCategoryName('');
      alert(`✅ Category "${newCategoryName}" added successfully!`);
      
    } catch (error) {
      console.error('Add category error:', error);
      alert('❌ Failed to add category: ' + error.message);
    }
  };

  const handleCategoryEdit = async (oldName, newName) => {
    if (!newName.trim()) {
      alert('Please enter a valid category name');
      return;
    }

    if (categories.includes(newName.toLowerCase()) && newName.toLowerCase() !== oldName) {
      alert('Category already exists');
      return;
    }

    try {
      // Update local state
      const updatedCategories = categories.map(cat => 
        cat === oldName ? newName.toLowerCase() : cat
      );
      setCategories(updatedCategories);
      
      // Here you would call API to update category
      // await updateCategory(oldName, newName);
      
      setEditingCategory(null);
      alert(`✅ Category updated from "${oldName}" to "${newName}"!`);
      
    } catch (error) {
      console.error('Edit category error:', error);
      alert('❌ Failed to update category: ' + error.message);
    }
  };

  const handleCategoryDelete = async (categoryName) => {
    if (categoryName === 'general') {
      alert('❌ Cannot delete the "general" category');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the "${categoryName}" category?\n\nAll catalogues in this category will be moved to "general".`)) {
      return;
    }

    try {
      // Remove from local state
      const updatedCategories = categories.filter(cat => cat !== categoryName);
      setCategories(updatedCategories);
      
      // Update catalogues in this category to 'general'
      const updatedCatalogues = catalogues.map(cat => 
        cat.category === categoryName ? { ...cat, category: 'general' } : cat
      );
      setCatalogues(updatedCatalogues);
      
      // Here you would call API to delete category
      // await deleteCategory(categoryName);
      
      alert(`✅ Category "${categoryName}" deleted successfully!\nAll catalogues moved to "general" category.`);
      
    } catch (error) {
      console.error('Delete category error:', error);
      alert('❌ Failed to delete category: ' + error.message);
    }
  };

  const filteredCatalogues = catalogues.filter(catalogue => {
    const matchesSearch = !searchQuery || 
      catalogue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      catalogue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      catalogue.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || catalogue.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {!isEmbeded && (
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="flex items-center">
            <span className="text-green-600 text-lg mr-2">📋</span>
            <div>
              <h3 className="font-semibold text-green-800">ERP Catalogue Management</h3>
              <p className="text-green-600 text-sm">Upload, manage, and send catalogues to contacts</p>
            </div>
          </div>
        </div>
      )}

      {/* Header with Upload Button and Category Management */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Catalogue Manager</h2>
          <p className="text-gray-600">Manage product catalogues and send to clients</p>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <span className="mr-2">🏷️</span>
                Manage Categories
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Category Management</DialogTitle>
                <DialogDescription>
                  Add, edit, or delete catalogue categories
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Add new category */}
                <div className="flex space-x-2">
                  <Input
                    placeholder="New category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCategoryAdd()}
                  />
                  <Button onClick={handleCategoryAdd}>Add</Button>
                </div>
                
                {/* Existing categories */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {categories.map(category => (
                    <div key={category} className="flex items-center justify-between p-2 border rounded">
                      {editingCategory === category ? (
                        <div className="flex space-x-2 flex-1">
                          <Input
                            defaultValue={category}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleCategoryEdit(category, e.target.value);
                              }
                            }}
                            onBlur={(e) => handleCategoryEdit(category, e.target.value)}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <>
                          <span className="capitalize">{category}</span>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingCategory(category)}
                            >
                              ✏️
                            </Button>
                            {category !== 'general' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCategoryDelete(category)}
                              >
                                🗑️
                              </Button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setCategoryModalOpen(false)}>Done</Button>
              </div>
            </DialogContent>
          </Dialog>
        
          <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <span className="mr-2">📤</span>
                Upload Catalogue
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload New Catalogue</DialogTitle>
                <DialogDescription>
                  Upload a new catalogue file. All users will be notified.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <Label htmlFor="file">Select File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={uploadCategory} onValueChange={setUploadCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    placeholder="e.g., plants, garden, tools"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setUploadModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || !uploadFile}>
                    {loading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search catalogues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Batch Selection Controls */}
      {filteredCatalogues.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <Button
              variant={isSelectionMode ? "default" : "outline"}
              size="sm"
              onClick={toggleSelectionMode}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              {isSelectionMode ? 'Exit Selection' : 'Select Catalogues'}
            </Button>
            
            {isSelectionMode && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllCatalogues}
                >
                  Select All ({filteredCatalogues.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                >
                  Clear ({selectedCatalogues.length})
                </Button>
              </>
            )}
          </div>

          {selectedCatalogues.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedCatalogues.length} catalogue{selectedCatalogues.length > 1 ? 's' : ''} selected
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
      )}

      {/* Catalogues Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">Loading catalogues...</div>
        </div>
      ) : filteredCatalogues.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <div className="text-lg text-gray-600 mb-2">No catalogues found</div>
          <div className="text-gray-500">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter'
              : 'Upload your first catalogue to get started'
            }
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCatalogues.map((catalogue) => (
            <Card 
              key={catalogue.id}
              className={`${
                isSelectionMode && selectedCatalogues.includes(catalogue.id)
                  ? 'ring-2 ring-green-500 bg-green-50'
                  : ''
              } ${isSelectionMode ? 'cursor-pointer' : ''}`}
              onClick={() => isSelectionMode && toggleCatalogueSelection(catalogue.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  {isSelectionMode && (
                    <div className="mr-3 mt-1">
                      {selectedCatalogues.includes(catalogue.id) ? (
                        <CheckSquare className="h-5 w-5 text-green-600" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-lg">{catalogue.name}</CardTitle>
                    <CardDescription>{catalogue.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">{catalogue.category}</Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <div>Size: {formatFileSize(catalogue.file_size)}</div>
                    <div>Uploaded: {formatDate(catalogue.upload_date)}</div>
                    <div>By: {catalogue.uploaded_by}</div>
                  </div>
                  
                  {catalogue.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {catalogue.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {!isSelectionMode && (
                    <div className="flex justify-between items-center pt-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedCatalogue(catalogue);
                          setSendModalOpen(true);
                        }}
                      >
                        📤 Send
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(catalogue.id, catalogue.name)}
                      >
                        🗑️ Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Send Modal */}
      <Dialog open={sendModalOpen} onOpenChange={setSendModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Catalogue</DialogTitle>
            <DialogDescription>
              Send "{selectedCatalogue?.name}" to a contact
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <Label htmlFor="sendMethod">Send Method</Label>
              <Select value={sendMethod} onValueChange={setSendMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                  <SelectItem value="email">📧 Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="contact">
                {sendMethod === 'whatsapp' ? 'Phone Number' : 'Email Address'}
              </Label>
              <Input
                id="contact"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder={sendMethod === 'whatsapp' ? '+1234567890' : 'example@email.com'}
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setSendModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending...' : `Send via ${sendMethod === 'whatsapp' ? 'WhatsApp' : 'Email'}`}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Batch Send Modal */}
      <Dialog open={showBatchSendModal} onOpenChange={setShowBatchSendModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Batch Catalogues</DialogTitle>
            <DialogDescription>
              Send {selectedCatalogues.length} selected catalogue{selectedCatalogues.length > 1 ? 's' : ''} to multiple recipients
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="batchSendType">Send Method</Label>
              <Select 
                value={batchSendForm.sendType} 
                onValueChange={(value) => setBatchSendForm(prev => ({ ...prev, sendType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      WhatsApp
                    </div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="batchRecipients">
                Recipients ({batchSendForm.sendType === 'whatsapp' ? 'Phone Numbers' : 'Email Addresses'})
              </Label>
              <Textarea
                id="batchRecipients"
                value={batchSendForm.recipients}
                onChange={(e) => setBatchSendForm(prev => ({ ...prev, recipients: e.target.value }))}
                placeholder={batchSendForm.sendType === 'whatsapp' 
                  ? '+1234567890, +0987654321, +1122334455' 
                  : 'user1@example.com, user2@example.com, user3@example.com'
                }
                rows={3}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple {batchSendForm.sendType === 'whatsapp' ? 'phone numbers' : 'email addresses'} with commas
              </p>
            </div>
            
            <div>
              <Label htmlFor="batchMessage">Custom Message (Optional)</Label>
              <Textarea
                id="batchMessage"
                value={batchSendForm.message}
                onChange={(e) => setBatchSendForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Add a custom message to accompany the catalogues..."
                rows={2}
              />
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center text-blue-800">
                <span className="text-lg mr-2">📊</span>
                <div>
                  <p className="font-medium">Batch Summary</p>
                  <p className="text-sm">
                    {selectedCatalogues.length} catalogue{selectedCatalogues.length > 1 ? 's' : ''} will be sent via {batchSendForm.sendType}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowBatchSendModal(false)}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleBatchSend}
                disabled={isSending || !batchSendForm.recipients.trim()}
                className="bg-green-600 hover:bg-green-700"
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
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default CatalogueManager;