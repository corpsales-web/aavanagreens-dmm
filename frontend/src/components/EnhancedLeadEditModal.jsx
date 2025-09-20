import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { 
  User, Mail, Phone, MapPin, Building, Calendar, 
  CheckCircle, AlertCircle, Edit, Save, X
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const EnhancedLeadEditModal = ({ isOpen, onClose, leadData, onLeadUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    city: '',
    state: '',
    source: '',
    category: '',
    status: 'New',
    notes: '',
    budget: '',
    project_type: '',
    requirements: '',
    priority: 'Medium'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data when lead data changes
  useEffect(() => {
    if (leadData) {
      setFormData({
        name: leadData.name || '',
        email: leadData.email || '',
        phone: leadData.phone || '',
        company: leadData.company || '',
        location: leadData.location || '',
        city: leadData.city || '',
        state: leadData.state || '',
        source: leadData.source || '',
        category: leadData.category || '',
        status: leadData.status || 'New',
        notes: Array.isArray(leadData.notes) ? leadData.notes.join('\n') : (leadData.notes || ''),
        budget: leadData.budget || '',
        project_type: leadData.project_type || '',
        requirements: leadData.requirements || '',
        priority: leadData.priority || 'Medium'
      });
    }
  }, [leadData]);

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    try {
      // Validate required fields
      const requiredFields = ['name', 'email', 'phone'];
      const newErrors = {};
      
      requiredFields.forEach(field => {
        if (!formData[field]) {
          newErrors[field] = 'This field is required';
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      // Prepare update data
      const updateData = {
        ...formData,
        updated_at: new Date().toISOString(),
        notes: formData.notes ? formData.notes.split('\n').filter(note => note.trim()) : []
      };

      // Update lead via API
      const response = await axios.put(`${API}/api/leads/${leadData.id}`, updateData);
      
      if (response.data.success) {
        alert(`✅ Lead Updated Successfully!
        
📝 Name: ${formData.name}
📧 Email: ${formData.email}
📱 Phone: ${formData.phone}
🎯 Status: ${formData.status}

The lead information has been updated in your CRM system.`);
        
        // Callback to parent component
        if (onLeadUpdated) {
          onLeadUpdated(response.data.lead);
        }

        onClose();
        
      } else {
        throw new Error(response.data.error || 'Failed to update lead');
      }

    } catch (error) {
      console.error('Lead update error:', error);
      alert(`❌ Lead Update Failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5" />
            <span>Edit Lead - {leadData?.name}</span>
          </DialogTitle>
          <DialogDescription>
            Update lead information and manage lead qualification status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
                </div>
                
                <div>
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
                </div>
                
                <div>
                  <Label>Phone Number *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && <span className="text-red-500 text-sm">{errors.phone}</span>}
                </div>
                
                <div>
                  <Label>Company</Label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Project Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Location & Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Select value={formData.state} onValueChange={(value) => setFormData({...formData, state: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maharashtra">Maharashtra</SelectItem>
                      <SelectItem value="karnataka">Karnataka</SelectItem>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="gujarat">Gujarat</SelectItem>
                      <SelectItem value="rajasthan">Rajasthan</SelectItem>
                      <SelectItem value="tamilnadu">Tamil Nadu</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Project Type</Label>
                  <Select value={formData.project_type} onValueChange={(value) => setFormData({...formData, project_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential_landscaping">🌿 Residential Landscaping</SelectItem>
                      <SelectItem value="commercial_green_building">🏢 Commercial Green Building</SelectItem>
                      <SelectItem value="rooftop_garden">🏠 Rooftop Garden</SelectItem>
                      <SelectItem value="balcony_garden">🪴 Balcony Garden</SelectItem>
                      <SelectItem value="vertical_garden">🌱 Vertical Garden</SelectItem>
                      <SelectItem value="interior_plants">🌿 Interior Plants</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Budget Range</Label>
                  <Input
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    placeholder="e.g., ₹50,000 - ₹1,00,000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lead Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Lead Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Lead Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">🆕 New</SelectItem>
                      <SelectItem value="Contacted">📞 Contacted</SelectItem>
                      <SelectItem value="Qualified">✅ Qualified</SelectItem>
                      <SelectItem value="Proposal">📋 Proposal Sent</SelectItem>
                      <SelectItem value="Negotiation">💬 Negotiation</SelectItem>
                      <SelectItem value="Won">🎉 Won</SelectItem>
                      <SelectItem value="Lost">❌ Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Lead Source</Label>
                  <Select value={formData.source} onValueChange={(value) => setFormData({...formData, source: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Google Ads">Google Ads</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Cold Call">Cold Call</SelectItem>
                      <SelectItem value="Store Walk-in">Store Walk-in</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Manual Entry">Manual Entry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">🔴 High</SelectItem>
                      <SelectItem value="Medium">🟡 Medium</SelectItem>
                      <SelectItem value="Low">🟢 Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Requirements & Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Add any additional notes, requirements, or important information about this lead..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Badge className="bg-blue-100 text-blue-800">
              Lead ID: {leadData?.id}
            </Badge>
            {leadData?.created_at && (
              <Badge variant="outline">
                Created: {new Date(leadData.created_at).toLocaleDateString()}
              </Badge>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Lead
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedLeadEditModal;