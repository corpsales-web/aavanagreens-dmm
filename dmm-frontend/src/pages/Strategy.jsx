import React, { useState } from 'react'
import { api } from '../api'

export default function Strategy() {
  const [isLoading, setIsLoading] = useState(false)
  const [strategy, setStrategy] = useState(null)
  const [error, setError] = useState('')
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

  const generateStrategy = async () => {
    if (!formData.company_name || !formData.industry || !formData.target_audience) {
      setError('Please fill in company name, industry, and target audience')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      const response = await api.post('/api/ai/generate-strategy', formData)
      setStrategy(response.data.strategy)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate strategy')
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

        <div className="form-group">
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

        <button 
          onClick={generateStrategy}
          disabled={isLoading}
          className="generate-btn"
        >
          {isLoading ? 'Generating Strategy...' : 'Generate AI Strategy'}
        </button>
      </div>

      {strategy && (
        <div className="strategy-result">
          <h2>Generated Strategy</h2>
          <div className="strategy-content">
            <div className="strategy-meta">
              <p><strong>Company:</strong> {strategy.company_name}</p>
              <p><strong>Industry:</strong> {strategy.industry}</p>
              <p><strong>Generated:</strong> {new Date(strategy.created_at).toLocaleString()}</p>
            </div>
            <div className="strategy-details">
              <pre>{strategy.strategy_content}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}