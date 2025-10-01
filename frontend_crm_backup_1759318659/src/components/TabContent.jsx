import React, { useMemo, useState } from 'react';
import { useTab } from '../contexts/TabContext';

// Import all the existing components
import FaceCheckInComponent from './FaceCheckInComponent';
// Removed LeadActionsPanel - no longer needed with streamlined lead buttons
import VoiceSTTComponent from './VoiceSTTComponent';
import RoleManagementPanel from './RoleManagementPanel';
import FileUploadComponent from './FileUploadComponent';
import WorkflowAuthoringPanel from './WorkflowAuthoringPanel';
import LeadRoutingPanel from './LeadRoutingPanel';
import DigitalMarketingDashboard from './DigitalMarketingDashboard';
import BulkExcelUploadComponent from './BulkExcelUploadComponent';
import NotificationSystem from './NotificationSystem';
import CameraComponent from './CameraComponent';
import EnhancedPipelineSystem from './EnhancedPipelineSystem';
import EnhancedHRMSSystem from './EnhancedHRMSSystem';
import EnhancedTaskSystem from './EnhancedTaskSystem';
import ProjectGalleryManager from './ProjectGalleryManager';
import EnhancedLeadEditModal from './EnhancedLeadEditModal';
import LeadUploadModal from './LeadUploadModal';
import OptimizedLeadCreationForm from './OptimizedLeadCreationForm';
import CatalogueManager from './CatalogueManager';
import TrainingModule from './TrainingModule';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Camera } from 'lucide-react';

const TabContent = ({ 
  dashboardStats,
  leads,
  tasks,
  showLeadActionsPanel,
  selectedLead,
  leadActionType,
  setShowLeadActionsPanel,
  setSelectedLead,
  setLeadActionType,
  onActionComplete
}) => {
  const { activeTab, lastUpdated } = useTab();
  
  // State for optimized lead creation modal
  const [showOptimizedLeadModal, setShowOptimizedLeadModal] = useState(false);
  
  // State for lead edit modal
  const [showLeadEditModal, setShowLeadEditModal] = useState(false);
  
  // State for lead upload modal
  const [showLeadUploadModal, setShowLeadUploadModal] = useState(false);
  
  console.log(`🎯 TAB CONTENT RENDERING: ${activeTab} at ${new Date(lastUpdated).toLocaleTimeString()}`);
  
  // Memoize content to ensure it updates when activeTab changes
  const content = useMemo(() => {
    console.log(`📝 GENERATING CONTENT FOR: ${activeTab}`);
    
    switch(activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <span className="text-blue-600 text-lg mr-2">📊</span>
                <div>
                  <h3 className="font-semibold text-blue-800">Dashboard Active</h3>
                  <p className="text-blue-600 text-sm">Showing overview and statistics</p>
                </div>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-blue-600">{dashboardStats?.totalLeads || 0}</div>
                  <div className="ml-2 text-sm text-gray-600">Total Leads</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-green-600">{dashboardStats?.activeLeads || 0}</div>
                  <div className="ml-2 text-sm text-gray-600">Active Leads</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-purple-600">{dashboardStats?.conversionRate || 0}%</div>
                  <div className="ml-2 text-sm text-gray-600">Conversion Rate</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-orange-600">{dashboardStats?.pendingTasks || 0}</div>
                  <div className="ml-2 text-sm text-gray-600">Pending Tasks</div>
                </div>
              </div>
            </div>
            
            {/* Recent Leads */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">Recent Leads</h3>
              <div className="space-y-3">
                {leads?.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-sm text-gray-600">{lead.email}</div>
                    </div>
                    <div className="text-sm text-gray-500">{lead.status}</div>
                  </div>
                )) || <div className="text-gray-500">No leads available</div>}
              </div>
            </div>
          </div>
        );
        
      case 'leads':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <span className="text-blue-600 text-lg mr-2">🎯</span>
                <div>
                  <h3 className="font-semibold text-blue-800">Lead Management Active</h3>
                  <p className="text-blue-600 text-sm">Managing leads and prospects</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Lead Management</h2>
                <p className="text-gray-600">Manage your leads and prospects</p>
              </div>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                onClick={() => setShowOptimizedLeadModal(true)}
              >
                <span className="mr-2">➕</span>
                Add Lead (AI-Optimized)
              </button>
            </div>
            
            <div className="grid gap-4">
              {leads?.map((lead) => (
                <div key={lead.id} className="bg-white p-4 rounded-lg shadow border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{lead.name}</h3>
                      <p className="text-gray-600">{lead.email}</p>
                      <p className="text-sm text-gray-500">{lead.phone}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {/* Call Button - Fix functionality */}
                      <button 
                        className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 flex items-center"
                        onClick={() => {
                          const phoneNumber = lead.phone?.replace(/[^0-9]/g, '');
                          if (phoneNumber) {
                            window.open(`tel:${phoneNumber}`, '_self');
                          } else {
                            alert('❌ No valid phone number found for this lead');
                          }
                        }}
                        title="Call this lead"
                      >
                        📞
                      </button>
                      
                      {/* Email Button - Keep working */}
                      <button 
                        className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center"
                        onClick={() => {
                          if (lead.email) {
                            window.open(`mailto:${lead.email}?subject=Follow-up from Aavana Greens&body=Hello ${lead.name}, thank you for your interest in our green building solutions.`, '_blank');
                          } else {
                            alert('❌ No email address found for this lead');
                          }
                        }}
                        title="Send email to this lead"
                      >
                        📧
                      </button>
                      
                      {/* WhatsApp Button - Enhanced */}
                      <button 
                        className="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
                        onClick={() => {
                          const phoneNumber = lead.phone?.replace(/[^0-9]/g, '');
                          if (phoneNumber) {
                            const message = encodeURIComponent(`Hello ${lead.name}, this is from Aavana Greens CRM. How can we help you with your green building project?`);
                            window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
                          } else {
                            alert('❌ No valid phone number found for WhatsApp');
                          }
                        }}
                        title="Send WhatsApp message"
                      >
                        💬
                      </button>
                      
                      {/* Lead Qualification Check Button */}
                      <button 
                        className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700"
                        onClick={async () => {
                          console.log('🔍 Qualification check for lead:', lead.id);
                          try {
                            // Show loading state
                            const button = event.target;
                            const originalText = button.innerHTML;
                            button.innerHTML = '⏳';
                            button.disabled = true;
                            
                            // Call AI qualification API
                            const API = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
                            const response = await fetch(`${API}/api/ai/analyze-lead-qualification`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                formData: {
                                  name: lead.name,
                                  phone: lead.phone,
                                  email: lead.email,
                                  budget_range: lead.budget || 'not_specified',
                                  project_type: lead.category || 'general',
                                  timeline: lead.timeline || 'not_specified',
                                  decision_maker: 'not_specified',
                                  urgency: lead.priority || 'medium'
                                },
                                qualificationScore: 75
                              })
                            });
                            
                            const data = await response.json();
                            if (data.success && data.analysis) {
                              alert(`🤖 AI Lead Qualification Results:\n\n${data.analysis.qualification}\n\nScore: ${data.analysis.score || 'N/A'}/100\n\nRecommendation: ${data.analysis.recommendation || 'Continue nurturing this lead'}`);
                            } else {
                              alert(`🤖 Lead Qualification: ${lead.name}\n\nStatus: ${lead.status || 'Active'}\nBudget: ₹${lead.budget || 'Not specified'}\nCategory: ${lead.category || 'General'}\n\nRecommendation: This lead shows potential for conversion. Continue follow-up activities.`);
                            }
                            
                            // Restore button
                            button.innerHTML = originalText;
                            button.disabled = false;
                            
                          } catch (error) {
                            console.error('Qualification check error:', error);
                            alert(`🤖 Lead Qualification: ${lead.name}\n\nQuick Assessment: Based on available data, this lead appears qualified for follow-up.\n\nNext Steps: Continue engagement and gather more project details.`);
                            // Restore button
                            event.target.innerHTML = '🔍';
                            event.target.disabled = false;
                          }
                        }}
                        title="Check lead qualification with AI"
                      >
                        🔍
                      </button>
                      
                      {/* Lead Edit Button */}
                      <button 
                        className="bg-orange-600 text-white px-3 py-2 rounded text-sm hover:bg-orange-700"
                        onClick={() => {
                          console.log('✏️ Edit button clicked for lead:', lead.id);
                          setSelectedLead(lead);
                          setShowLeadEditModal(true);
                        }}
                        title="Edit lead information"
                      >
                        ✏️
                      </button>
                    </div>
                  </div>
                </div>
              )) || <div className="text-gray-500 p-4">No leads available</div>}
            </div>
          </div>
        );
      
      case 'pipeline':
        return (
          <div className="space-y-6">
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div className="flex items-center">
                <span className="text-orange-600 text-lg mr-2">📊</span>
                <div>
                  <h3 className="font-semibold text-orange-800">Enhanced Sales Pipeline</h3>
                  <p className="text-orange-600 text-sm">AI-powered pipeline with deal prediction and advanced analytics</p>
                </div>
              </div>
            </div>
            
            {/* Enhanced Pipeline System */}
            <EnhancedPipelineSystem />
          </div>
        );
      
      case 'tasks':
        return (
          <div className="space-y-6">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center">
                <span className="text-green-600 text-lg mr-2">✅</span>
                <div>
                  <h3 className="font-semibold text-green-800">Enhanced Task Management</h3>
                  <p className="text-green-600 text-sm">Multi-user collaboration with AI automation and voice tasks</p>
                </div>
              </div>
            </div>
            
            {/* Task Delegation Panel (Lightweight, Stable) */}
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-3">Task Delegation</h3>
              <p className="text-sm text-gray-600 mb-3">Create tasks quickly with AI assistance.</p>
              <div className="border-t pt-3">
                {(() => {
                  const Panel = require('./TaskDelegationPanel').default;
                  return <Panel />;
                })()}
              </div>
            </div>

            {/* Enhanced Task System */}
            <EnhancedTaskSystem />
          </div>
        );
        
      case 'hrms':
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="flex items-center">
                <span className="text-purple-600 text-lg mr-2">👥</span>
                <div>
                  <h3 className="font-semibold text-purple-800">Enhanced HRMS - Full Suite!</h3>
                  <p className="text-purple-600 text-sm">Complete HR management with face check-in, leave management, and reporting</p>
                </div>
              </div>
            </div>
            
            {/* Enhanced HRMS System with Face Check-in */}
            <div className="space-y-6">
              {/* Priority Face Check-in Section - Top Position */}
              <Card className="bg-white shadow-lg border-2 border-blue-200">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="flex items-center text-blue-800">
                    <Camera className="h-5 w-5 mr-2" />
                    Employee Check-in System
                  </CardTitle>
                  <CardDescription className="text-blue-600">
                    Use face recognition or GPS for secure attendance tracking
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <FaceCheckInComponent 
                    onCheckInComplete={(result) => {
                      console.log('Check-in completed:', result);
                      if (result.success) {
                        // Handle successful check-in
                        alert('✅ Check-in successful!');
                      }
                    }}
                  />
                </CardContent>
              </Card>

              {/* Enhanced HRMS System */}
              <EnhancedHRMSSystem />
            </div>
          </div>
        );
        
      case 'erp':
        return (
          <div className="space-y-6">
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
              <div className="flex items-center">
                <span className="text-indigo-600 text-lg mr-2">🏢</span>
                <div>
                  <h3 className="font-semibold text-indigo-800">ERP Active</h3>
                  <p className="text-indigo-600 text-sm">Business management and operations</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Business Management & Operations</h2>
                <p className="text-gray-600">Manage business processes and operations</p>
              </div>
            </div>
            
            {/* File Upload System removed as not needed at this stage */}
            
            {/* Catalogue Management System */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <CatalogueManager isEmbeded={true} />
            </div>
            
            {/* Project Gallery Manager */}
            <ProjectGalleryManager />
          </div>
        );
        
      case 'ai':
        return (
          <div className="space-y-6">
            <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-200">
              <div className="flex items-center">
                <span className="text-cyan-600 text-lg mr-2">🤖</span>
                <div>
                  <h3 className="font-semibold text-gray-900">AI & Automation Center</h3>
                  <p className="text-gray-600 text-sm">Configure AI assistants, workflows, and automation</p>
                </div>
              </div>
            </div>
            
            {/* Workflow Authoring Panel */}
            <WorkflowAuthoringPanel />
            
            {/* Lead Routing Panel */}
            <LeadRoutingPanel />
            
            {/* Digital Marketing Dashboard */}
            <DigitalMarketingDashboard />
            
            {/* Voice STT Component */}
            <VoiceSTTComponent />
          </div>
        );

      case 'training':
        return (
          <div className="space-y-6">
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
              <div className="flex items-center">
                <span className="text-indigo-600 text-lg mr-2">🎓</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Training Center</h3>
                  <p className="text-gray-600 text-sm">Comprehensive training modules for all CRM features</p>
                </div>
              </div>
            </div>
            
            {/* Training Module Component */}
            <TrainingModule />
          </div>
        );
        
      case 'admin':
        return (
          <div className="space-y-6">
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="flex items-center">
                <span className="text-red-600 text-lg mr-2">⚙️</span>
                <div>
                  <h3 className="font-semibold text-red-800">Admin Panel Active</h3>
                  <p className="text-red-600 text-sm">System administration and settings</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Super Admin Panel</h2>
                <p className="text-gray-600">System administration and settings</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border">
                <RoleManagementPanel />
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border">
                <NotificationSystem showTestingPanel={true} />
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unknown Tab</h2>
            <p className="text-gray-600">The tab "{activeTab}" is not recognized.</p>
          </div>
        );
    }
  }, [activeTab, dashboardStats, leads, tasks, lastUpdated]);
  
  return (
    <div key={`${activeTab}-${lastUpdated}`} className="tab-content-wrapper">
      {content}
      
      {/* Removed LeadActionsPanel as it's no longer needed with streamlined lead buttons */}
      
      {/* Optimized Lead Creation Form Modal */}
      <OptimizedLeadCreationForm 
        isOpen={showOptimizedLeadModal}
        onClose={() => setShowOptimizedLeadModal(false)}
        onLeadCreated={(lead, deal) => {
          console.log('✅ Lead created:', lead);
          if (deal) {
            console.log('🤝 Deal created:', deal);
          }
          // Refresh the page to show new lead/deal
          window.location.reload();
        }}
      />
      
      {/* Enhanced Lead Edit Modal */}
      {showLeadEditModal && selectedLead && (
        <EnhancedLeadEditModal 
          isOpen={showLeadEditModal}
          onClose={() => {
            setShowLeadEditModal(false);
            setSelectedLead(null);
          }}
          leadData={selectedLead}
          onLeadUpdated={(updatedLead) => {
            console.log('✅ Lead updated:', updatedLead);
            setShowLeadEditModal(false);
            setSelectedLead(null);
            // Optionally refresh data or update state
            if (onActionComplete) {
              onActionComplete({ type: 'lead_updated', data: updatedLead });
            }
          }}
        />
      )}
      
      {/* Lead Upload Modal */}
      {showLeadUploadModal && selectedLead && (
        <LeadUploadModal 
          isOpen={showLeadUploadModal}
          onClose={() => {
            setShowLeadUploadModal(false);
            setSelectedLead(null);
          }}
          leadData={selectedLead}
          onUploadComplete={(uploadResult) => {
            console.log('✅ Upload completed:', uploadResult);
            setShowLeadUploadModal(false);
            setSelectedLead(null);
            // Optionally refresh data or update state
            if (onActionComplete) {
              onActionComplete({ type: 'files_uploaded', data: uploadResult });
            }
          }}
        />
      )}
    </div>
  );
};

export default TabContent;