import React, { useState } from 'react'
import { api, AI_ENABLED } from '../api'

const CONTENT_TYPES = [
  { id: 'reel', label: 'Instagram Reels', icon: '🎬' },
  { id: 'ugc', label: 'User Generated Content', icon: '👥' },
  { id: 'brand', label: 'Brand Content', icon: '🏢' },
  { id: 'influencer', label: 'Influencer Content', icon: '⭐' }
]

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter', 'LinkedIn']
const FESTIVALS = ['Diwali', 'Christmas', 'New Year', "Valentine's Day", 'Holi', 'Eid', 'Independence Day']

export default function Content() {
  const [activeModal, setActiveModal] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [contentResult, setContentResult] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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
    setSuccess('')
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

  const validate = () => {
    if (!formData.brief || !formData.target_audience || !formData.platform) {
      setError('Please fill in brief, target audience, and platform')
      return false
    }
    setError('')
    return true
  }

  const generateContent = async () => {
    if (!validate()) return
    setIsLoading(true)
    try {
      const response = await api.post('/api/ai/generate-content', formData)
      setContentResult(response.data.content)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate content')
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
        item_type: formData.content_type || 'reel',
        data: {
          brief: formData.brief,
          target_audience: formData.target_audience,
          platform: formData.platform,
          budget: formData.budget,
          festival: formData.festival,
          ai_content: '(AI pending — created manually)'
        }
      }
      const res = await api.post('/api/marketing/save', payload)
      setSuccess('Content saved for approval successfully.')
      setContentResult(res.data.content || res.data.item)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save content')
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

      &lt;div className="content-types-grid"&gt;
        {CONTENT_TYPES.map(type =&gt; (
          &lt;div 
            key={type.id}
            className="content-type-card"
            onClick={() =&gt; openModal(type.id)}
          &gt;
            &lt;div className="content-icon"&gt;{type.icon}&lt;/div&gt;
            &lt;h3&gt;{type.label}&lt;/h3&gt;
            &lt;p&gt;AI-powered content generation&lt;/p&gt;
            &lt;button className="create-btn"&gt;Create Content&lt;/button&gt;
          </div>
        ))}
      </div>

      {/* Modal */}
      {activeModal && (
        &lt;div className="modal-overlay" onClick={closeModal}&gt;
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            &lt;div className="modal-header"&gt;
              &lt;h2&gt;{CONTENT_TYPES.find(t =&gt; t.id === activeModal)?.label}&lt;/h2&gt;
              &lt;button className="close-btn" onClick={closeModal}&gt;×&lt;/button&gt;
            </div>

            &lt;div className="modal-body"&gt;
              &lt;div className="form-group"&gt;
                &lt;label&gt;Content Brief *&lt;/label&gt;
                &lt;textarea
                  value={formData.brief}
                  onChange={(e) =&gt; setFormData({...formData, brief: e.target.value})}
                  placeholder="Describe what kind of content you want to create..."
                  rows={4}
                /&gt;
              </div>

              &lt;div className="form-grid"&gt;
                &lt;div className="form-group"&gt;
                  &lt;label&gt;Target Audience *&lt;/label&gt;
                  &lt;input
                    type="text"
                    value={formData.target_audience}
                    onChange={(e) =&gt; setFormData({...formData, target_audience: e.target.value})}
                    placeholder="Who is this content for?"
                  /&gt;
                </div>

                &lt;div className="form-group"&gt;
                  &lt;label&gt;Platform *&lt;/label&gt;
                  &lt;select
                    value={formData.platform}
                    onChange={(e) =&gt; setFormData({...formData, platform: e.target.value})}
                  &gt;
                    &lt;option value=""&gt;Select Platform&lt;/option&gt;
                    {PLATFORMS.map(platform =&gt; (
                      &lt;option key={platform} value={platform}&gt;{platform}&lt;/option&gt;
                    ))}
                  &lt;/select&gt;
                </div>

                &lt;div className="form-group"&gt;
                  &lt;label&gt;Budget Range&lt;/label&gt;
                  &lt;input
                    type="text"
                    value={formData.budget}
                    onChange={(e) =&gt; setFormData({...formData, budget: e.target.value})}
                    placeholder="e.g., $500 - $2,000"
                  /&gt;
                </div>

                &lt;div className="form-group"&gt;
                  &lt;label&gt;Festival/Theme&lt;/label&gt;
                  &lt;select
                    value={formData.festival}
                    onChange={(e) =&gt; setFormData({...formData, festival: e.target.value})}
                  &gt;
                    &lt;option value=""&gt;No specific theme&lt;/option&gt;
                    {FESTIVALS.map(festival =&gt; (
                      &lt;option key={festival} value={festival}&gt;{festival}&lt;/option&gt;
                    ))}
                  &lt;/select&gt;
                </div>
              </div>

              {error &amp;&amp; &lt;div className="error-message"&gt;{error}&lt;/div&gt;}
              {success &amp;&amp; &lt;div className="error-message" style={{background:'rgba(16,185,129,0.12)', border:'1px solid #065f46', color:'#d1fae5'}}&gt;{success}&lt;/div&gt;}

              &lt;div className="modal-actions" style={{display:'flex', gap:8, flexWrap:'wrap'}}&gt;
                <button 
                  onClick={generateContent}
                  disabled={!AI_ENABLED || isLoading}
                  className="generate-btn"
                  title={!AI_ENABLED ? 'AI is disabled until top-up' : ''}
                >
                  {AI_ENABLED ? (isLoading ? 'Generating...' : 'Generate Content Ideas') : 'Generate Content (disabled)'}
                </button>
                <button 
                  onClick={saveManual}
                  disabled={isLoading}
                  className="optimize-btn"
                >
                  Save for Approval (No AI)
                </button>
              </div>

              {contentResult &amp;&amp; (
                &lt;div className="content-result"&gt;
                  &lt;h3&gt;Saved Content&lt;/h3&gt;
                  &lt;div className="content-details"&gt;
                    &lt;div className="content-meta"&gt;
                      {contentResult.content_type &amp;&amp; &lt;p&gt;&lt;strong&gt;Type:&lt;/strong&gt; {contentResult.content_type}&lt;/p&gt;}
                      {contentResult.platform &amp;&amp; &lt;p&gt;&lt;strong&gt;Platform:&lt;/strong&gt; {contentResult.platform}&lt;/p&gt;}
                      {contentResult.created_at &amp;&amp; &lt;p&gt;&lt;strong&gt;Created:&lt;/strong&gt; {new Date(contentResult.created_at).toLocaleString()}&lt;/p&gt;}
                    </div>
                    &lt;div className="ai-content"&gt;
                      &lt;pre&gt;{contentResult.ai_content || '(AI pending)'}&lt;/pre&gt;
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    &lt;/div&gt;
  )
}