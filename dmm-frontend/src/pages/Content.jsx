import React, { useState } from 'react'
import { api } from '../api'

const CONTENT_TYPES = [
  { id: 'reel', label: 'Instagram Reels', icon: '🎬' },
  { id: 'ugc', label: 'User Generated Content', icon: '👥' },
  { id: 'brand', label: 'Brand Content', icon: '🏢' },
  { id: 'influencer', label: 'Influencer Content', icon: '⭐' }
]

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter', 'LinkedIn']
const FESTIVALS = ['Diwali', 'Christmas', 'New Year', 'Valentine\'s Day', 'Holi', 'Eid', 'Independence Day']

export default function Content() {
  const [activeModal, setActiveModal] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [contentResult, setContentResult] = useState(null)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    content_type: '',
    brief: '',
    target_audience: '',
    platform: '',
    budget: '',
    festival: ''
  })

  const openModal = (contentType) => {
    setFormData({...formData, content_type: contentType})
    setActiveModal(contentType)
    setContentResult(null)
    setError('')
  }

  const closeModal = () => {
    setActiveModal(null)
    setFormData({
      content_type: '',
      brief: '',
      target_audience: '',
      platform: '',
      budget: '',
      festival: ''
    })
  }

  const generateContent = async () => {
    if (!formData.brief || !formData.target_audience || !formData.platform) {
      setError('Please fill in brief, target audience, and platform')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      const response = await api.post('/api/ai/generate-content', formData)
      setContentResult(response.data.content)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate content')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="content-page">
      <div className="page-header">
        <h1>AI Content Creation</h1>
        <p>Generate creative content ideas with GPT-5 beta</p>
      </div>

      <div className="content-types-grid">
        {CONTENT_TYPES.map(type => (
          <div 
            key={type.id}
            className="content-type-card"
            onClick={() => openModal(type.id)}
          >
            <div className="content-icon">{type.icon}</div>
            <h3>{type.label}</h3>
            <p>AI-powered content generation</p>
            <button className="create-btn">Create Content</button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {activeModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{CONTENT_TYPES.find(t => t.id === activeModal)?.label}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Content Brief *</label>
                <textarea
                  value={formData.brief}
                  onChange={(e) => setFormData({...formData, brief: e.target.value})}
                  placeholder="Describe what kind of content you want to create..."
                  rows={4}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Target Audience *</label>
                  <input
                    type="text"
                    value={formData.target_audience}
                    onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                    placeholder="Who is this content for?"
                  />
                </div>

                <div className="form-group">
                  <label>Platform *</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({...formData, platform: e.target.value})}
                  >
                    <option value="">Select Platform</option>
                    {PLATFORMS.map(platform => (
                      <option key={platform} value={platform}>{platform}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Budget Range</label>
                  <input
                    type="text"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    placeholder="e.g., $500 - $2,000"
                  />
                </div>

                <div className="form-group">
                  <label>Festival/Theme</label>
                  <select
                    value={formData.festival}
                    onChange={(e) => setFormData({...formData, festival: e.target.value})}
                  >
                    <option value="">No specific theme</option>
                    {FESTIVALS.map(festival => (
                      <option key={festival} value={festival}>{festival}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button 
                  onClick={generateContent}
                  disabled={isLoading}
                  className="generate-btn"
                >
                  {isLoading ? 'Generating...' : 'Generate Content Ideas'}
                </button>
              </div>

              {contentResult && (
                <div className="content-result">
                  <h3>Generated Content Ideas</h3>
                  <div className="content-details">
                    <div className="content-meta">
                      <p><strong>Type:</strong> {contentResult.content_type}</p>
                      <p><strong>Platform:</strong> {contentResult.platform}</p>
                      <p><strong>Generated:</strong> {new Date(contentResult.created_at).toLocaleString()}</p>
                    </div>
                    <div className="ai-content">
                      <pre>{contentResult.ai_content}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}