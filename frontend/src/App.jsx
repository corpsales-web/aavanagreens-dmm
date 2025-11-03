import React, { useState } from 'react'
import Strategy from './pages/Strategy'
import Content from './pages/Content'
import Campaigns from './pages/Campaigns'
import Approvals from './pages/Approvals'
import TopNav from './components/TopNav'
import { AI_ENABLED } from './api'
import './App.css'

const TABS = [
  { id: 'strategy', label: 'AI Strategy' },
  { id: 'content', label: 'Content Creation' },
  { id: 'campaigns', label: 'Campaign Manager' },
  { id: 'approvals', label: 'Approvals' },
]

export default function App() {
  const [tab, setTab] = useState('strategy')
  return (
    <div className="app">
      <TopNav />
      {!AI_ENABLED && (
        <div className="error-message" style={{background:'rgba(124,92,255,0.12)', border:'1px solid #4c3bcc', color:'#d7c9ff'}}>
          AI is temporarily disabled. You can still create items manually and send them for approval. Once you top-up your Universal Key, AI features will automatically enable.
        </div>
      )}
      <div className="tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab ${tab===t.id?'active':''}`}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="page">
        {tab==='strategy' && <Strategy />}
        {tab==='content' && <Content />}
        {tab==='campaigns' && <Campaigns />}
        {tab==='approvals' && <Approvals />}
      </div>
    </div>
  )
}