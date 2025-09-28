import React, { useState } from 'react'
import { api, AI_ENABLED } from '../api'

export default function Strategy() {
  const [isLoading, setIsLoading] = useState(false)
  const [strategy, setStrategy] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    target_audience: '',
    budget: '',
    goals: [],
    website_url: ''
  })

  const goalOptions = [
    'Brand Awareness',
    'Lead Generation', 
    'Sales Growth',
    'Customer Retention',
    'Market Expansion',
    'Engagement Increase'
  ]

  const handleGoalToggle = (goal) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }))
  }

  const validate = () => {
    if (!formData.company_name || !formData.industry || !formData.target_audience) {
      setError('Please fill in company name, industry, and target audience')
      return false
    }
    setError('')
    return true
  }

  const generateStrategy = async () => {
    if (!validate()) return
    setIsLoading(true)
    setSuccess('')
    try {
      const response = await api.post('/api/ai/generate-strategy', formData)
      setStrategy(response.data.strategy)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate strategy')
    } finally {
      setIsLoading(false)
    }
  }

  const saveManual = async () => {
    if (!validate()) return
    setIsLoading(true)
    setSuccess('')
    try {
      const payload = {
        item_type: 'strategy',
        data: {
          company_name: formData.company_name,
          industry: formData.industry,
          target_audience: formData.target_audience,
          budget: formData.budget,
          goals: formData.goals,
          website_url: formData.website_url,
          strategy_content: '(AI pending — created manually)'
        }
      }
      const res = await api.post('/api/marketing/save', payload)
      setSuccess('Strategy saved for approval successfully.')
      setStrategy(res.data.item)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save strategy')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="strategy-page">
      <div className="page-header">
        <h1>AI Marketing Strategy Generator</h1>
        <p>Get comprehensive marketing strategies powered by GPT-5 beta</p>
      </div>

      <div className="strategy-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Company Name *</label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) => setFormData({...formData, company_name: e.target.value})}
              placeholder="Enter company name"
            />
          </div>

          <div className="form-group">
            <label>Industry *</label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({...formData, industry: e.target.value})}
              placeholder="e.g., Real Estate, Technology, Healthcare"
            />
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

          <div className="form-group">
            <label>Monthly Budget</label>
            <input
              type="text"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
              placeholder="e.g., $5,000 - $10,000"
            />
          </div>

          <div className="form-group">
            <label>Website URL</label>
            <input
              type="url"
              value={formData.website_url}
              onChange={(e) => setFormData({...formData, website_url: e.target.value})}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>

        &lt;div className="form-group"&gt;
          <label>Marketing Goals</label>
          <div className="goals-grid">
            {goalOptions.map(goal => (
              <label key={goal} className="goal-checkbox">
                <input
                  type="checkbox"
                  checked={formData.goals.includes(goal)}
                  onChange={() => handleGoalToggle(goal)}
                />
                <span>{goal}</span>
              </label>
            ))}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="error-message" style={{background:'rgba(16,185,129,0.12)', border:'1px solid #065f46', color:'#d1fae5'}}>{success}</div>}

        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <button 
            onClick={generateStrategy}
            disabled={!AI_ENABLED || isLoading}
            className="generate-btn"
            title={!AI_ENABLED ? 'AI is disabled until top-up' : ''}
          >
            {AI_ENABLED ? (isLoading ? 'Generating Strategy...' : 'Generate AI Strategy') : 'Generate AI Strategy (disabled)'}
          </button>

          <button 
            onClick={saveManual}
            disabled={isLoading}
            className="optimize-btn"
          >
            Save Strategy for Approval (No AI)
          </button>
        </div>
      </div>

      {strategy && (
        <div className="strategy-result">
          <h2>Strategy Item</h2>
          <div className="strategy-content">
            <div className="strategy-meta">
              <p><strong>Company:</strong> {strategy.company_name}</p>
              <p><strong>Industry:</strong> {strategy.industry}</p>
              {strategy.created_at && <p><strong>Created:</strong> {new Date(strategy.created_at).toLocaleString()}</p>}
            </div>
            <div className="strategy-details">
              <pre>{strategy.strategy_content || '(AI pending)'}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}