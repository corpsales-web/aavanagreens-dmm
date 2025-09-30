import React, { useState, useEffect } from 'react'
import { api } from '../api'

const ITEM_TYPES = [
  { id: 'campaign', label: 'Campaigns', icon: '📊' },
  { id: 'reel', label: 'Reels', icon: '🎬' },
  { id: 'ugc', label: 'UGC Content', icon: '👥' },
  { id: 'brand', label: 'Brand Content', icon: '🏢' },
  { id: 'influencer', label: 'Influencer Content', icon: '⭐' },
  { id: 'strategy', label: 'Strategies', icon: '🎯' }
]

const STATUS_COLORS = {
  'Pending Approval': '#f59e0b',
  'Approved': '#10b981',
  'Rejected': '#ef4444',
  'Generated': '#6366f1',
  'Optimized': '#8b5cf6'
}

export default function Approvals() {
  const [activeTab, setActiveTab] = useState('campaign')
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [approvalFilters, setApprovalFilters] = useState({
    geo: '',
    language: [],
    device: [],
    time: '',
    behavior: []
  })

  const loadItems = async (type) => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await api.get(`/api/marketing/list?type=${type}`)
      setItems(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load items')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadItems(activeTab)
  }, [activeTab])

  const approveItem = async (itemId, status = 'Approved') => {
    try {
      const approvalData = {
        item_type: activeTab,
        item_id: itemId,
        status: status,
        filters: approvalFilters,
        approved_by: 'user'
      }
      
      await api.post('/api/marketing/approve', approvalData)
      
      // Refresh the list
      await loadItems(activeTab)
      setSelectedItem(null)
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to approve item')
    }
  }

  const handleLanguageToggle = (lang) => {
    setApprovalFilters(prev => ({
      ...prev,
      language: prev.language.includes(lang)
        ? prev.language.filter(l => l !== lang)
        : [...prev.language, lang]
    }))
  }

  const handleDeviceToggle = (device) => {
    setApprovalFilters(prev => ({
      ...prev,
      device: prev.device.includes(device)
        ? prev.device.filter(d => d !== device)
        : [...prev.device, device]
    }))
  }

  const handleBehaviorToggle = (behavior) => {
    setApprovalFilters(prev => ({
      ...prev,
      behavior: prev.behavior.includes(behavior)
        ? prev.behavior.filter(b => b !== behavior)
        : [...prev.behavior, behavior]
    }))
  }

  const renderItemPreview = (item) => {
    return (
      <div className="item-preview">
        <div className="item-header">
          <h3>{item.name || item.campaign_name || item.company_name || item.brief || item.id}</h3>
          <span 
            className="status-badge"
            style={{ backgroundColor: STATUS_COLORS[item.status] }}
          >
            {item.status}
          </span>
        </div>
        
        <div className="item-details">
          {item.description && <p><strong>Description:</strong> {item.description}</p>}
          {item.target_audience && <p><strong>Target:</strong> {item.target_audience}</p>}
          {item.budget && <p><strong>Budget:</strong> ${item.budget}</p>}
          {item.platform && <p><strong>Platform:</strong> {item.platform}</p>}
          {item.objective && <p><strong>Objective:</strong> {item.objective}</p>}
          {item.industry && <p><strong>Industry:</strong> {item.industry}</p>}
          <p><strong>Created:</strong> {new Date(item.created_at).toLocaleString()}</p>
        </div>

        {(item.strategy_content || item.ai_content || item.ai_optimization) && (
          <div className="ai-content-preview">
            <strong>AI Generated Content:</strong>
            <div className="content-snippet">
              {(item.strategy_content || item.ai_content || item.ai_optimization)?.substring(0, 200)}...
            </div>
          </div>
        )}

        <div className="item-actions">
          <button 
            className="preview-btn"
            onClick={() => setSelectedItem(item)}
          >
            Review & Approve
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="approvals-page">
      <div className="page-header">
        <h1>Campaign Approvals</h1>
        <p>Review and approve AI-generated marketing content</p>
      </div>

      <div className="approval-tabs">
        {ITEM_TYPES.map(type => (
          <button
            key={type.id}
            className={`approval-tab ${activeTab === type.id ? 'active' : ''}`}
            onClick={() => setActiveTab(type.id)}
          >
            <span className="tab-icon">{type.icon}</span>
            <span className="tab-label">{type.label}</span>
          </button>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="items-container">
        {isLoading ? (
          <div className="loading">Loading items...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <p>No {ITEM_TYPES.find(t => t.id === activeTab)?.label.toLowerCase()} found</p>
          </div>
        ) : (
          <div className="items-grid">
            {items.map(item => (
              <div key={item.id} className="item-card">
                {renderItemPreview(item)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="approval-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Review & Approve</h2>
              <button className="close-btn" onClick={() => setSelectedItem(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="item-full-details">
                <h3>{selectedItem.name || selectedItem.campaign_name || selectedItem.company_name || selectedItem.brief || selectedItem.id}</h3>
                
                {selectedItem.strategy_content && (
                  <div className="content-section">
                    <h4>Marketing Strategy</h4>
                    <pre className="content-text">{selectedItem.strategy_content}</pre>
                  </div>
                )}
                
                {selectedItem.ai_content && (
                  <div className="content-section">
                    <h4>Content Ideas</h4>
                    <pre className="content-text">{selectedItem.ai_content}</pre>
                  </div>
                )}
                
                {selectedItem.ai_optimization && (
                  <div className="content-section">
                    <h4>Campaign Optimization</h4>
                    <pre className="content-text">{selectedItem.ai_optimization}</pre>
                  </div>
                )}
              </div>

              <div className="approval-filters">
                <h4>Targeting Filters (Optional)</h4>
                
                <div className="filter-group">
                  <label>Geographic Targeting</label>
                  <input
                    type="text"
                    value={approvalFilters.geo}
                    onChange={(e) => setApprovalFilters({...approvalFilters, geo: e.target.value})}
                    placeholder="e.g., New York, California, Global"
                  />
                </div>

                <div className="filter-group">
                  <label>Languages</label>
                  <div className="checkbox-group">
                    {['English', 'Spanish', 'Hindi', 'French', 'German'].map(lang => (
                      <label key={lang} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={approvalFilters.language.includes(lang)}
                          onChange={() => handleLanguageToggle(lang)}
                        />
                        <span>{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <label>Device Types</label>
                  <div className="checkbox-group">
                    {['Mobile', 'Desktop', 'Tablet'].map(device => (
                      <label key={device} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={approvalFilters.device.includes(device)}
                          onChange={() => handleDeviceToggle(device)}
                        />
                        <span>{device}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <label>Time Targeting</label>
                  <select
                    value={approvalFilters.time}
                    onChange={(e) => setApprovalFilters({...approvalFilters, time: e.target.value})}
                  >
                    <option value="">Any Time</option>
                    <option value="business_hours">Business Hours</option>
                    <option value="evenings">Evenings</option>
                    <option value="weekends">Weekends</option>
                    <option value="peak_hours">Peak Hours</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Behavioral Targeting</label>
                  <div className="checkbox-group">
                    {['High Intent', 'Lookalike Audience', 'Retargeting', 'New Customers', 'Returning Customers'].map(behavior => (
                      <label key={behavior} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={approvalFilters.behavior.includes(behavior)}
                          onChange={() => handleBehaviorToggle(behavior)}
                        />
                        <span>{behavior}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="reject-btn"
                onClick={() => approveItem(selectedItem.id, 'Rejected')}
              >
                Reject
              </button>
              <button 
                className="approve-btn"
                onClick={() => approveItem(selectedItem.id, 'Approved')}
              >
                Approve & Launch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}