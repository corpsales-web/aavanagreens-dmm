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
    duration_days: 30
  })
  const [budgetSplits, setBudgetSplits] = useState({})

  const handleChannelToggle = (channelId) => {
    const isSelected = formData.channels.includes(channelId)
    const newChannels = isSelected
      ? formData.channels.filter(c =&gt; c !== channelId)
      : [...formData.channels, channelId]
    
    setFormData({...formData, channels: newChannels})
    
    // Auto-distribute budget equally among selected channels
    if (formData.budget &amp;&amp; newChannels.length &gt; 0) {
      const budgetPerChannel = parseFloat(formData.budget) / newChannels.length
      const newSplits = {}
      newChannels.forEach(channel =&gt; {
        newSplits[channel] = budgetPerChannel.toFixed(2)
      })
      setBudgetSplits(newSplits)
    }
  }

  const updateBudgetSplit = (channelId, amount) => {
    setBudgetSplits({...budgetSplits, [channelId]: amount})
  }

  const getTotalAllocated = () => {
    return Object.values(budgetSplits).reduce((sum, amount) =&gt; sum + parseFloat(amount || 0), 0)
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

  const saveManual = async () =&gt; {
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
    &lt;div className="campaigns-page"&gt;
      &lt;div className="page-header"&gt;
        &lt;h1&gt;AI Campaign Manager&lt;/h1&gt;
        &lt;p&gt;Optimize your marketing campaigns with GPT-5 beta intelligence&lt;/p&gt;
      &lt;/div&gt;

      &lt;div className="campaign-form"&gt;
        &lt;div className="form-grid"&gt;
          &lt;div className="form-group"&gt;
            &lt;label&gt;Campaign Name *&lt;/label&gt;
            &lt;input
              type="text"
              value={formData.campaign_name}
              onChange={(e) =&gt; setFormData({...formData, campaign_name: e.target.value})}
              placeholder="Enter campaign name"
            /&gt;
          &lt;/div&gt;

          &lt;div className="form-group"&gt;
            &lt;label&gt;Campaign Objective *&lt;/label&gt;
            &lt;select
              value={formData.objective}
              onChange={(e) =&gt; setFormData({...formData, objective: e.target.value})}
            &gt;
              &lt;option value=""&gt;Select Objective&lt;/option&gt;
              &lt;option value="brand_awareness"&gt;Brand Awareness&lt;/option&gt;
              &lt;option value="lead_generation"&gt;Lead Generation&lt;/option&gt;
              &lt;option value="sales_conversion"&gt;Sales Conversion&lt;/option&gt;
              &lt;option value="traffic_increase"&gt;Website Traffic&lt;/option&gt;
              &lt;option value="engagement"&gt;Engagement&lt;/option&gt;
              &lt;option value="app_installs"&gt;App Installs&lt;/option&gt;
            &lt;/select&gt;
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
            &lt;label&gt;Total Budget ($) *&lt;/label&gt;
            &lt;input
              type="number"
              value={formData.budget}
              onChange={(e) =&gt; setFormData({...formData, budget: e.target.value})}
              placeholder="Enter total budget"
            /&gt;
          &lt;/div&gt;

          &lt;div className="form-group"&gt;
            &lt;label&gt;Duration (Days)&lt;/label&gt;
            &lt;input
              type="number"
              value={formData.duration_days}
              onChange={(e) =&gt; setFormData({...formData, duration_days: parseInt(e.target.value)})}
              placeholder="Campaign duration"
            /&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div className="form-group"&gt;
          &lt;label&gt;Marketing Channels *&lt;/label&gt;
          &lt;div className="channels-grid"&gt;
            {CHANNELS.map(channel =&gt; (
              &lt;div 
                key={channel.id}
                className={`channel-card ${formData.channels.includes(channel.id) ? 'selected' : ''}`}
                onClick={() =&gt; handleChannelToggle(channel.id)}
              &gt;
                &lt;span className="channel-icon"&gt;{channel.icon}&lt;/span&gt;
                &lt;span className="channel-label"&gt;{channel.label}&lt;/span&gt;
                {formData.channels.includes(channel.id) &amp;&amp; (
                  &lt;div className="budget-input" onClick={(e) =&gt; e.stopPropagation()}&gt;
                    &lt;input
                      type="number"
                      value={budgetSplits[channel.id] || ''}
                      onChange={(e) =&gt; updateBudgetSplit(channel.id, e.target.value)}
                      placeholder="Budget"
                    /&gt;
                  &lt;/div&gt;
                )}
              &lt;/div&gt;
            ))}
          &lt;/div&gt;
        &lt;/div&gt;

        {formData.channels.length &gt; 0 &amp;&amp; formData.budget &amp;&amp; (
          &lt;div className="budget-summary"&gt;
            &lt;p&gt;&lt;strong&gt;Total Budget:&lt;/strong&gt; ${formData.budget}&lt;/p&gt;
            &lt;p&gt;&lt;strong&gt;Allocated:&lt;/strong&gt; ${getTotalAllocated().toFixed(2)}&lt;/p&gt;
            &lt;p&gt;&lt;strong&gt;Remaining:&lt;/strong&gt; ${(parseFloat(formData.budget) - getTotalAllocated()).toFixed(2)}&lt;/p&gt;
          &lt;/div&gt;
        )}

        {error &amp;&amp; &lt;div className="error-message"&gt;{error}&lt;/div&gt;}
        {success &amp;&amp; &lt;div className="error-message" style={{background:'rgba(16,185,129,0.12)', border:'1px solid #065f46', color:'#d1fae5'}}&gt;{success}&lt;/div&gt;}

        &lt;div style={{display:'flex', gap:8, flexWrap:'wrap'}}&gt;
          &lt;button 
            onClick={optimizeCampaign}
            disabled={!AI_ENABLED || isLoading}
            className="optimize-btn"
            title={!AI_ENABLED ? 'AI is disabled until top-up' : ''}
          &gt;
            {AI_ENABLED ? (isLoading ? 'Optimizing Campaign...' : 'Optimize Campaign with AI') : 'Optimize with AI (disabled)'}
          &lt;/button&gt;
          &lt;button 
            onClick={saveManual}
            disabled={isLoading}
            className="generate-btn"
          &gt;
            Save Campaign for Approval (No AI)
          &lt;/button&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      {campaign &amp;&amp; (
        &lt;div className="campaign-result"&gt;
          &lt;h2&gt;Saved Campaign&lt;/h2&gt;
          &lt;div className="campaign-content"&gt;
            &lt;div className="campaign-meta"&gt;
              &lt;p&gt;&lt;strong&gt;Campaign:&lt;/strong&gt; {campaign.campaign_name}&lt;/p&gt;
              &lt;p&gt;&lt;strong&gt;Objective:&lt;/strong&gt; {campaign.objective}&lt;/p&gt;
              &lt;p&gt;&lt;strong&gt;Budget:&lt;/strong&gt; ${campaign.budget}&lt;/p&gt;
              &lt;p&gt;&lt;strong&gt;Duration:&lt;/strong&gt; {campaign.duration_days} days&lt;/p&gt;
              {campaign.created_at &amp;&amp; &lt;p&gt;&lt;strong&gt;Created:&lt;/strong&gt; {new Date(campaign.created_at).toLocaleString()}&lt;/p&gt;}
            &lt;/div&gt;
            &lt;div className="optimization-details"&gt;
              &lt;pre&gt;{campaign.ai_optimization || '(AI pending)'}&lt;/pre&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      )}
    &lt;/div&gt;
  )
}