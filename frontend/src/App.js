import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useToast } from "./hooks/use-toast";
import TaskDelegationPanel from './components/TaskDelegationPanel';
import WhatsAppInbox from './components/WhatsAppInbox';
import { ensurePushSubscription } from './utils/push';

const API = process.env.REACT_APP_BACKEND_URL;

function App() {
  const { toast } = useToast();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Subscribe to push on first load
    ensurePushSubscription().then((id)=>{
      if (id) toast({ title: 'Notifications enabled', description: 'You will receive desktop/mobile alerts' });
    });
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/dashboard/stats`);
      setStats(res.data || {});
    } catch (e) {
      // ignore
    } finally { setLoading(false); }
  };

  useEffect(()=>{ loadStats(); },[]);

  return (
    <div className="page">
      <div className="topbar">
        <div className="brand">Aavana</div>
        <div className="actions">
          <a className="badge" href="https://emergent.sh" target="_blank" rel="noreferrer">Made with Emergent</a>
        </div>
      </div>

      <div className="tabs">
        <div className={`tab active`}>Dashboard</div>
        <div className="tab">Leads</div>
        <div className="tab">Pipeline</div>
        <div className="tab">Tasks</div>
        <div className="tab">ERP</div>
        <div className="tab">HRMS</div>
        <div className="tab">AI</div>
        <div className="tab">Training</div>
      </div>

      <div className="stats">
        <div className="card"><div className="card-label">Total Leads</div><div className="card-value">{stats.total_leads || 0}</div></div>
        <div className="card"><div className="card-label">Qualified</div><div className="card-value">{stats.qualified_leads || 0}</div></div>
        <div className="card"><div className="card-label">Pending Tasks</div><div className="card-value">{stats.pending_tasks || 0}</div></div>
        <div className="card"><div className="card-label">Conversion Rate</div><div className="card-value">{stats.conversion_rate || 0}%</div></div>
      </div>

      <div className="grid">
        <TaskDelegationPanel />
        <WhatsAppInbox />
      </div>
    </div>
  );
}

export default App;