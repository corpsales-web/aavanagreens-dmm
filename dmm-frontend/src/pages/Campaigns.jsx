import React, { useState } from 'react'
import { api, AI_ENABLED } from '../api'

const CHANNELS = [
  { id: 'google_ads', label: 'Google Ads', icon: '🔍' },
  { id: 'facebook_ads', label: 'Facebook Ads', icon: '📘' },
  { id: 'instagram_ads', label: 'Instagram Ads', icon: '📸' },
  { id: 'youtube_ads', label: 'YouTube Ads', icon: '📺' },
  { id: 'linkedin_ads', label: 'LinkedIn Ads', icon: '💼' },
  { id: 'email_marketing', label: 'Email Marketing', icon: '📧' },
  { id: 'sms_marketing', label: 'SMS Marketing', icon: '💬' },
  { id: 'influencer_marketing', label: 'Influencer Marketing', icon: '⭐' }
]

export default function Campaigns() {
  const [isLoading, setIsLoading] = useState(false)
  const [campaign, setCampaign] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    campaign_name: '',
    objective: '',
    target_audience: '',
    budget: '',
    channels: [],
    duration_days: 30,
    utm: {
      base_url: '',
      source: '',
      medium: '',
      campaign: '',
      term: '',
      content: ''
    },
    targeting: {
      age_min: '',
      age_max: '',
      gender: [],
      country: '',
      states: [],
      cities: [],
      areas: [],
      interests: [],
      behaviors: [],
      devices: [],
      placements: [],
      schedule: { start_date: '', end_date: '', dayparts: [] },
      industries: [],
      job_titles: [],
      company_sizes: []
    }
  })
  const [budgetSplits, setBudgetSplits] = useState({})

  const computeTrackingUrl = () => {
    const { base_url, source, medium, campaign, term, content } = formData.utm || {}
    if (!base_url) return ''
    const params = new URLSearchParams()
    if (source) params.set('utm_source', source)
    if (medium) params.set('utm_medium', medium)
    if (campaign) params.set('utm_campaign', campaign)
    if (term) params.set('utm_term', term)
    if (content) params.set('utm_content', content)
    const sep = base_url.includes('?') ? '&' : '?'
    return base_url + (params.toString() ? sep + params.toString() : '')
  }

  const handleChannelToggle = (channelId) => {
    const isSelected = formData.channels.includes(channelId)
    const newChannels = isSelected
      ? formData.channels.filter(c => c !== channelId)
      : [...formData.channels, channelId]
    
    setFormData({...formData, channels: newChannels})
    
    // Auto-distribute budget equally among selected channels
    // Keep existing manual allocations; do NOT auto-split
    // If a channel is deselected, remove its split
    setBudgetSplits(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(k => {
        if (!newChannels.includes(k)) delete next[k]
      })
      return next
    })
  }

  const updateBudgetSplit = (channelId, amount) => {
    setBudgetSplits({...budgetSplits, [channelId]: amount})
  }

  const getTotalAllocated = () => {
    return Object.values(budgetSplits).reduce((sum, amount) => sum + parseFloat(amount || 0), 0)
  }

  const optimizeCampaign = async () => {
    // Intentionally left usable when AI is enabled. Disabled otherwise via UI.
    if (!formData.campaign_name || !formData.objective || !formData.target_audience || !formData.budget || formData.channels.length === 0) {
      setError('Please fill in all required fields and select at least one channel')
      return
    }

    const totalBudget = parseFloat(formData.budget)
    const allocatedBudget = getTotalAllocated()
    
    if (Math.abs(totalBudget - allocatedBudget) > 1) {
      setError(`Budget mismatch: Total budget $${totalBudget} but allocated $${allocatedBudget.toFixed(2)}`)
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      const campaignData = {
        ...formData,
        budget: totalBudget,
        budget_splits: budgetSplits
      }
      const response = await api.post('/api/ai/optimize-campaign', campaignData)
      setCampaign(response.data.campaign)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to optimize campaign')
    } finally {
      setIsLoading(false)
    }
  }

  const saveManual = async () => {
    if (!formData.campaign_name || !formData.objective || !formData.target_audience || !formData.budget || formData.channels.length === 0) {
      setError('Please fill in all required fields and select at least one channel')
      return
    }

    const totalBudget = parseFloat(formData.budget)
    const allocatedBudget = getTotalAllocated()
    if (Math.abs(totalBudget - allocatedBudget) > 1) {
      setError(`Budget mismatch: Total budget $${totalBudget} but allocated $${allocatedBudget.toFixed(2)}`)
      return
    }

    setIsLoading(true)
    setSuccess('')
    try {
      const payload = {
        item_type: 'campaign',
        data: {
          campaign_name: formData.campaign_name,
          objective: formData.objective,
          target_audience: formData.target_audience,
          budget: totalBudget,
          channels: formData.channels,
          duration_days: formData.duration_days,
          budget_splits: budgetSplits,
          targeting: formData.targeting,
          ai_optimization: '(AI pending — created manually)'
        }
      }
      const res = await api.post('/api/marketing/save', payload)
      setSuccess('Campaign saved for approval successfully.')
      setCampaign(res.data.item)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save campaign')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="campaigns-page">
      <div className="page-header">
        <h1>AI Campaign Manager</h1>
        <p>Optimize your marketing campaigns with GPT-5 beta intelligence</p>
      </div>

      <div className="campaign-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Campaign Name *</label>
            <input
              type="text"
              value={formData.campaign_name}
              onChange={(e) => setFormData({...formData, campaign_name: e.target.value})}
              placeholder="Enter campaign name"
            />
          </div>

          <div className="form-group">
            <label>Campaign Objective *</label>
            <select
              value={formData.objective}
              onChange={(e) => setFormData({...formData, objective: e.target.value})}
            >
              <option value="">Select Objective</option>
              <option value="brand_awareness">Brand Awareness</option>
              <option value="lead_generation">Lead Generation</option>
              <option value="sales_conversion">Sales Conversion</option>
              <option value="traffic_increase">Website Traffic</option>
              <option value="engagement">Engagement</option>
              <option value="app_installs">App Installs</option>
            </select>
          </div>

          <div className="form-group">
            <label>Target Audience *</label>
            <input
              type="text"
              value={formData.target_audience}
              onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
              placeholder="Describe your target audience"
            />
          </div>

          {/* Tracking & UTM */}
          <div className="form-group" style={{gridColumn:'1 / -1'}}>
            <label>Tracking & UTM</label>
            <div className="form-grid">
              <div className="form-group">
                <label>Base URL</label>
                <input type="url" placeholder="https://example.com/landing" value={formData.utm.base_url}
                  onChange={(e)=>setFormData({...formData, utm:{...formData.utm, base_url:e.target.value}})} />
              </div>
              <div className="form-group">
                <label>utm_source</label>
                <input type="text" placeholder="facebook, instagram, google" value={formData.utm.source}
                  onChange={(e)=>setFormData({...formData, utm:{...formData.utm, source:e.target.value}})} />
              </div>
              <div className="form-group">
                <label>utm_medium</label>
                <input type="text" placeholder="paid_social, cpc, organic_social" value={formData.utm.medium}
                  onChange={(e)=>setFormData({...formData, utm:{...formData.utm, medium:e.target.value}})} />
              </div>
              <div className="form-group">
                <label>utm_campaign</label>
                <input type="text" placeholder="brand_launch_oct2025" value={formData.utm.campaign}
                  onChange={(e)=>setFormData({...formData, utm:{...formData.utm, campaign:e.target.value}})} />
              </div>
              <div className="form-group">
                <label>utm_term (optional)</label>
                <input type="text" placeholder="keyword or audience" value={formData.utm.term}
                  onChange={(e)=>setFormData({...formData, utm:{...formData.utm, term:e.target.value}})} />
              </div>
              <div className="form-group">
                <label>utm_content (optional)</label>
                <input type="text" placeholder="creative or variant" value={formData.utm.content}
                  onChange={(e)=>setFormData({...formData, utm:{...formData.utm, content:e.target.value}})} />
              </div>
            </div>
            <div className="form-group">
              <label>Tracking URL</label>
              <div style={{display:'flex', gap:8}}>
                <input id="tracking-url-copy" type="text" readOnly value={computeTrackingUrl()} />
                <button className="preview-btn" type="button" onClick={()=>{
                  const val = computeTrackingUrl(); if (val) navigator.clipboard.writeText(val)
                }}>Copy</button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Total Budget ($) *</label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
              placeholder="Enter total budget"
            />
          </div>

          {/* Targeting Filters */}
        <div className="form-group">
          <label>Demographics</label>
          <div className="form-grid">
            <div className="form-group">
              <label>Age Min</label>
              <input type="number" value={formData.targeting.age_min}
                onChange={(e)=>setFormData({...formData, targeting:{...formData.targeting, age_min: e.target.value}})} placeholder="18" />
            </div>
            <div className="form-group">
              <label>Age Max</label>
              <input type="number" value={formData.targeting.age_max}
                onChange={(e)=>setFormData({...formData, targeting:{...formData.targeting, age_max: e.target.value}})} placeholder="65" />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select multiple value={formData.targeting.gender}
                onChange={(e)=>setFormData({...formData, targeting:{...formData.targeting, gender:[...e.target.selectedOptions].map(o=>o.value)}})}>
                {['Male','Female','Other'].map(g=> <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Geography</label>
          <div className="form-grid">
            <div className="form-group">
              <label>Country</label>
              <input type="text" value={formData.targeting.country}
                onChange={(e)=>setFormData({...formData, targeting:{...formData.targeting, country: e.target.value}})} placeholder="e.g., India" />
            </div>
            <div className="form-group">
              <label>States (comma separated)</label>
              <input type="text" value={formData.targeting.states.join(', ')}
                onChange={(e)=>setFormData({...formData, targeting:{...formData.targeting, states: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}})} />
            </div>
            <div className="form-group">
              <label>Cities (comma separated)</label>
              <input type="text" value={formData.targeting.cities.join(', ')}
                onChange={(e)=>setFormData({...formData, targeting:{...formData.targeting, cities: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}})} />
            </div>
            <div className="form-group">
              <label>Areas (comma separated)</label>
              <input type="text" value={formData.targeting.areas.join(', ')}
                onChange={(e)=>setFormData({...formData, targeting:{...formData.targeting, areas: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}})} />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Interests & Behaviors</label>
          <div className="form-grid">
            <div className="form-group">
              <label>Interests (comma separated)</label>
              <input type="text" value={formData.targeting.interests.join(', ')}
                onChange={(e)=>setFormData({...formData, targeting:{...formData.targeting, interests: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}})} />
            </div>
            <div className="form-group">
              <label>Behaviors (comma separated)</label>
              <input type="text" value={formData.targeting.behaviors.join(', ')}
                onChange={(e)=>setFormData({...formData, targeting:{...formData.targeting, behaviors: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}})} />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Devices & Placements</label>
          <div className="form-grid">
            <div className="form-group">
              <label>Devices (comma separated)</label>
              <input type="text" value={formData.targeting.devices.join(', ')}
                onChange={(e)=>setFormData({...formData, targeting:{...formData.targeting, devices: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}})} placeholder="Mobile, Desktop, Tablet" />
            </div>
            <div className="form-group">
              <label>Placements (comma separated)</label>
              <input type="text" value={formData.targeting.placements.join(', ')}
                onChange={(e)=>setFormData({...formData, targeting:{...formData.targeting, placements: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}})} placeholder="Feed, Stories, Search" />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Schedule</label>
          <div className="form-grid">
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" value={formData.targeting.schedule.start_date}
                onChange={(e)=>setFormData({...formData, targeting:{...formData.targeting, schedule:{...formData.targeting.schedule, start_date:e.target.value}}})} />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" value={formData.targeting.schedule.end_date}
                onChange={(e)=>setFormData({...formData, targeting:{...formData.targeting, schedule:{...formData.targeting.schedule, end_date:e.target.value}}})} />
            </div>
            <div className="form-group">
              <label>Dayparts</label>
              <select multiple value={formData.targeting.schedule.dayparts}
                onChange={(e)=>setFormData({...formData, targeting:{...formData.targeting, schedule:{...formData.targeting.schedule, dayparts:[...e.target.selectedOptions].map(o=>o.value)}}})}>
                {['business_hours','evenings','weekends','peak_hours'].map(d=> <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>B2B (Optional)</label>
          <div className="form-grid">
            <div className="form-group">
              <label>Industries</label>
              <input type="text" value={formData.targeting.industries.join(', ')}
                onChange={(e)=>setFormData({...formData, targeting:{...formData.targeting, industries: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}})} />
            </div>
            <div className="form-group">
              <label>Job Titles</label>
              <input type="text" value={formData.targeting.job_titles.join(', ')}
                onChange={(e)=>setFormData({...formData, targeting:{...formData.targeting, job_titles: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}})} />
          <div className="form-group">
            <label>Total Budget ($) *</label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
              placeholder="Enter total budget"
            />
          </div>

          <div className="form-group">
            <label>Duration (Days)</label>
            <input
              type="number"
              value={formData.duration_days}
              onChange={(e) => setFormData({...formData, duration_days: parseInt(e.target.value)})}
              placeholder="Campaign duration"
            />
          </div>
        </div>

            </div>
            <div className="form-group">
              <label>Company Sizes</label>
              <input type="text" value={formData.targeting.company_sizes.join(', ')}
                onChange={(e)=>setFormData({...formData, targeting:{...formData.targeting, company_sizes: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}})} placeholder="1-10, 11-50, 51-200" />
            </div>
          </div>
        </div>


        <div className="form-group">
          <label>Marketing Channels *</label>
          <div className="channels-grid">
            {CHANNELS.map(channel => (
              <div 
                key={channel.id}
                className={`channel-card ${formData.channels.includes(channel.id) ? 'selected' : ''}`}
                onClick={() => handleChannelToggle(channel.id)}
              >
                <span className="channel-icon">{channel.icon}</span>
                <span className="channel-label">{channel.label}</span>
                {formData.channels.includes(channel.id) && (
                  <div className="budget-input" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="number"
                      placeholder="Budget"
                      value={formData.channelBudgets[channel.id] || ''}
                      onChange={(e) => setFormData({...formData, channelBudgets: {...formData.channelBudgets, [channel.id]: e.target.value}})}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {formData.channels.length > 0 && formData.budget && (
          <div className="budget-summary">
            <p><strong>Total Budget:</strong> ${formData.budget}</p>
            <p><strong>Allocated:</strong> ${getTotalAllocated().toFixed(2)}</p>
            <p><strong>Remaining:</strong> ${(parseFloat(formData.budget) - getTotalAllocated()).toFixed(2)}</p>
          </div>
        )}

        {/* UTM Helper Tip */}
        <div className="error-message" style={{background:'#F0FDF4', border:'1px solid #10b98122', color:'#065F46'}}>
          Tip: Use utm_source (channel), utm_medium (paid_social/cpc/organic_social), utm_campaign (name), utm_term (keyword/audience), utm_content (creative/variant) to track performance in analytics.
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="error-message" style={{background:'rgba(16,185,129,0.12)', border:'1px solid #065f46', color:'#d1fae5'}}>{success}</div>}

        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <button 
            onClick={optimizeCampaign}
            disabled={!AI_ENABLED || isLoading}
            className="optimize-btn"
            title={!AI_ENABLED ? 'AI is disabled until top-up' : ''}
          >
            {AI_ENABLED ? (isLoading ? 'Optimizing Campaign...' : 'Optimize Campaign with AI') : 'Optimize with AI (disabled)'}
          </button>
          <button 
            onClick={saveManual}
            disabled={isLoading}
            className="generate-btn"
          >
            Save Campaign for Approval (No AI)
          </button>
        </div>
      </div>

      {campaign && (
        <div className="campaign-result">
          <h2>Saved Campaign</h2>
          <div className="campaign-content">
            <div className="campaign-meta">
              <p><strong>Campaign:</strong> {campaign.campaign_name}</p>
              <p><strong>Objective:</strong> {campaign.objective}</p>
              <p><strong>Budget:</strong> ${campaign.budget}</p>
              <p><strong>Duration:</strong> {campaign.duration_days} days</p>
              {campaign.created_at && <p><strong>Created:</strong> {new Date(campaign.created_at).toLocaleString()}</p>}
            </div>
            <div className="optimization-details">
              <pre>{campaign.ai_optimization || '(AI pending)'}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}