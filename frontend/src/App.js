import React, { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "./hooks/use-toast";
import TaskDelegationPanel from './components/TaskDelegationPanel';
import WhatsAppInbox from './components/WhatsAppInbox';
import NoAccess from './components/NoAccess';
import { ensurePushSubscription } from './utils/push';
import { getCurrentUser, hasPermission } from './utils/permissions';

const API = process.env.REACT_APP_BACKEND_URL;

const NAV = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'tasks', label: 'Tasks', required: ['tasks:view'] },
  { key: 'crm', label: 'CRM', required: ['messaging:whatsapp_inbox:view'] },
];

export default function App() {
  const { toast } = useToast();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState('dashboard');
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    ensurePushSubscription().then((id)=>{
      if (id) toast({ title: 'Notifications enabled', description: 'You will receive desktop/mobile alerts' });
    });
  }, []);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/dashboard/stats`);
      setStats(res.data || {});
    } catch (e) {
      // ignore
    } finally { setLoading(false); }
  };

  const visibleTabs = NAV.filter((item) => hasPermission(user, item.required));

  return (
    <div className="page">
      <div className="topbar">
        <div className="brand">Aavana</div>
        <div className="actions">
          <a className="badge" href="https://emergent.sh" target="_blank" rel="noreferrer">Made with Emergent</a>
        </div>
      </div>

      <div className="tabs">
        {visibleTabs.map((t) => (
          <div key={t.key} className={`tab ${active === t.key ? 'active' : ''}`} onClick={() => setActive(t.key)}>{t.label}</div>
        ))}
      </div>

      {active === 'dashboard' && (
        <>
          <div className="stats">
            <div className="card"><div className="card-label">Total Leads</div><div className="card-value">{stats.total_leads || 0}</div></div>
            <div className="card"><div className="card-label">Qualified</div><div className="card-value">{stats.qualified_leads || 0}</div></div>
            <div className="card"><div className="card-label">Pending Tasks</div><div className="card-value">{stats.pending_tasks || 0}</div></div>
            <div className="card"><div className="card-label">Conversion Rate</div><div className="card-value">{stats.conversion_rate || 0}%</div></div>
          </div>
        </>
      )}

      {active === 'tasks' && (
        hasPermission(user, ['tasks:delegate']) ? (
          <div className="grid"><TaskDelegationPanel /></div>
        ) : (
          <NoAccess title="Tasks" message="You do not have permission to delegate tasks." />
        )
      )}

      {active === 'crm' && (
        hasPermission(user, ['messaging:whatsapp_inbox:view']) ? (
          <div className="grid"><WhatsAppInbox /></div>
        ) : (
          <NoAccess title="CRM" message="You do not have permission to view WhatsApp Inbox." />
        )
      )}
    </div>
  );
}