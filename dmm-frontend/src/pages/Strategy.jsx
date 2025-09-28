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
      &lt;div className="page-header"&gt;
        &lt;h1&gt;AI Marketing Strategy Generator&lt;/h1&gt;
        &lt;p&gt;Get comprehensive marketing strategies powered by GPT-5 beta&lt;/p&gt;
      &lt;/div&gt;

      &lt;div className="strategy-form"&gt;
        &lt;div className="form-grid"&gt;
          &lt;div className="form-group"&gt;
            &lt;label&gt;Company Name *&lt;/label&gt;
            &lt;input
              type="text"
              value={formData.company_name}
              onChange={(e) =&gt; setFormData({...formData, company_name: e.target.value})}
              placeholder="Enter company name"
            /&gt;
          &lt;/div&gt;

          &lt;div className="form-group"&gt;
            &lt;label&gt;Industry *&lt;/label&gt;
            &lt;input
              type="text"
              value={formData.industry}
              onChange={(e) =&gt; setFormData({...formData, industry: e.target.value})}
              placeholder="e.g., Real Estate, Technology, Healthcare"
            /&gt;
          &lt;/div&gt;

          &lt;div className="form-group"&gt;
            &lt;label&gt;Target Audience *&lt;/label&gt;
            &lt;input
              type="text"
              value={formData.target_audience}
              onChange={(e) =&gt; setFormData({...formData, target_audience: e.target.value})}
              placeholder="Describe your target audience"
            /&gt;
          &lt;/div&gt;

          &lt;div className="form-group"&gt;
            &lt;label&gt;Monthly Budget&lt;/label&gt;
            &lt;input
              type="text"
              value={formData.budget}
              onChange={(e) =&gt; setFormData({...formData, budget: e.target.value})}
              placeholder="e.g., $5,000 - $10,000"
            /&gt;
          &lt;/div&gt;

          &lt;div className="form-group"&gt;
            &lt;label&gt;Website URL&lt;/label&gt;
            &lt;input
              type="url"
              value={formData.website_url}
              onChange={(e) =&gt; setFormData({...formData, website_url: e.target.value})}
              placeholder="https://yourwebsite.com"
            /&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div className="form-group"&gt;
          &lt;label&gt;Marketing Goals&lt;/label&gt;
          &lt;div className="goals-grid"&gt;
            {goalOptions.map(goal =&gt; (
              &lt;label key={goal} className="goal-checkbox"&gt;
                &lt;input
                  type="checkbox"
                  checked={formData.goals.includes(goal)}
                  onChange={() =&gt; handleGoalToggle(goal)}
                /&gt;
                &lt;span&gt;{goal}&lt;/span&gt;
              &lt;/label&gt;
            ))}
          &lt;/div&gt;
        &lt;/div&gt;

        {error &amp;&amp; &lt;div className="error-message"&gt;{error}&lt;/div&gt;}
        {success &amp;&amp; &lt;div className="error-message" style={{background:'rgba(16,185,129,0.12)', border:'1px solid #065f46', color:'#d1fae5'}}&gt;{success}&lt;/div&gt;}

        &lt;div style={{display:'flex', gap:8, flexWrap:'wrap'}}&gt;
          &lt;button 
            onClick={generateStrategy}
            disabled={!AI_ENABLED || isLoading}
            className="generate-btn"
            title={!AI_ENABLED ? 'AI is disabled until top-up' : ''}
          &gt;
            {AI_ENABLED ? (isLoading ? 'Generating Strategy...' : 'Generate AI Strategy') : 'Generate AI Strategy (disabled)'}
          &lt;/button&gt;

          &lt;button 
            onClick={saveManual}
            disabled={isLoading}
            className="optimize-btn"
          &gt;
            Save Strategy for Approval (No AI)
          &lt;/button&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      {strategy &amp;&amp; (
        &lt;div className="strategy-result"&gt;
          &lt;h2&gt;Strategy Item&lt;/h2&gt;
          &lt;div className="strategy-content"&gt;
            &lt;div className="strategy-meta"&gt;
              &lt;p&gt;&lt;strong&gt;Company:&lt;/strong&gt; {strategy.company_name}&lt;/p&gt;
              &lt;p&gt;&lt;strong&gt;Industry:&lt;/strong&gt; {strategy.industry}&lt;/p&gt;
              {strategy.created_at &amp;&amp; &lt;p&gt;&lt;strong&gt;Created:&lt;/strong&gt; {new Date(strategy.created_at).toLocaleString()}&lt;/p&gt;}
            &lt;/div&gt;
            &lt;div className="strategy-details"&gt;
              &lt;pre&gt;{strategy.strategy_content || '(AI pending)'}&lt;/pre&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      )}
    &lt;/div&gt;
  )
}