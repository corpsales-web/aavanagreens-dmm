import React, { useState } from 'react'
import Strategy from './pages/Strategy'
import Content from './pages/Content'
import Campaigns from './pages/Campaigns'
import Approvals from './pages/Approvals'
import TopNav from './components/TopNav'
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