import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';

const API = process.env.REACT_APP_BACKEND_URL;

export default function TaskDelegationPanel() {
  const { toast } = useToast();
  const [form, setForm] = useState({ title: '', description: '', assigned_to: '', priority: 'Medium', due_date: '' });
  const [loading, setLoading] = useState(false);

  const suggestAI = async () => {
    try {
      setLoading(true);
      const prompt = `Create a clear, concise task title and a 2-3 sentence description for: ${form.description || form.title || 'Follow up with client'}. Return title on first line, then description.`;
      const res = await axios.post(`${API}/api/ai/chat`, { message: prompt, task_type: 'quick_response' });
      const text = (res.data?.response || '').trim();
      const [first, ...rest] = text.split('\n');
      const desc = rest.join('\n').trim() || text;
      setForm((f) => ({ ...f, title: f.title || first?.slice(0, 120) || 'AI Task', description: (f.description || desc).slice(0, 500) }));
      toast({ title: 'AI Suggestion', description: 'Title/description updated' });
    } catch (e) {
      toast({ title: 'AI Suggestion failed', description: e.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const createTask = async () => {
    try {
      setLoading(true);
      const body = {
        title: form.title || 'Task',
        description: form.description,
        priority: form.priority,
        assigned_to: form.assigned_to || undefined,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : undefined,
      };
      const t = await axios.post(`${API}/api/tasks`, body);
      toast({ title: 'Task Created', description: t.data?.title });
      if (form.due_date) {
        await axios.post(`${API}/api/calendar/events`, { title: form.title, start: new Date(form.due_date).toISOString(), linkTo: 'task', refId: t.data.id });
      }
      const subId = localStorage.getItem('pushSubId');
      if (subId) {
        await axios.post(`${API}/api/notifications/push`, { subscription_id: subId, title: `Task: ${form.title}`, body: 'Scheduled and saved', url: '/' });
      } else {
        await axios.post(`${API}/api/notifications/test`, { title: `Task: ${form.title}`, body: 'Queued locally' });
      }
    } catch (e) {
      toast({ title: 'Task creation failed', description: e.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <div className="panel">
      <div className="panel-title">Task Delegation</div>
      <div className="panel-body">
        <div className="row"><label>Title</label><input value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} placeholder="Call client about balcony design"/></div>
        <div className="row"><label>Description</label><textarea rows={3} value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} placeholder="Discuss requirements and schedule visit"/></div>
        <div className="row"><label>Assignee</label><input value={form.assigned_to} onChange={(e)=>setForm({...form,assigned_to:e.target.value})} placeholder="user@company.com"/></div>
        <div className="row"><label>Priority</label><select value={form.priority} onChange={(e)=>setForm({...form,priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select></div>
        <div className="row"><label>Due Date</label><input type="datetime-local" value={form.due_date} onChange={(e)=>setForm({...form,due_date:e.target.value})}/></div>
        <div className="row" style={{gap:8}}>
          <button className="ghost" onClick={suggestAI} disabled={loading}>AI Suggest</button>
          <button className="primary" onClick={createTask} disabled={loading}>Create Task</button>
        </div>
      </div>
    </div>
  );
}