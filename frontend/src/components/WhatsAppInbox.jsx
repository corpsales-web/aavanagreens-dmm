import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';

const API = process.env.REACT_APP_BACKEND_URL;

export default function WhatsAppInbox() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/whatsapp/messages?limit=20`);
      setItems(res.data || []);
    } catch (e) {
      toast({ title: 'Failed to load WhatsApp messages', description: e.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); },[]);

  const convertToLead = async (it) => {
    try {
      const phone = it?.raw?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from || '0000000000';
      const name = 'WhatsApp Contact';
      const res = await axios.post(`${API}/api/leads`, { name, phone, email: `${phone}@whatsapp.local` });
      toast({ title: 'Lead Created', description: res.data?.name });
    } catch (e) {
      toast({ title: 'Lead creation failed', description: e.message, variant: 'destructive' });
    }
  };

  const replyQueued = async (it) => {
    try {
      await axios.post(`${API}/api/whatsapp/send`, { to: it?.raw?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from, text: 'Thanks for contacting Aavana. Our team will get back shortly.' });
      toast({ title: 'Reply Queued', description: 'Approval-gated send stored' });
    } catch (e) {
      toast({ title: 'Reply failed', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="panel">
      <div className="panel-title">WhatsApp Inbox</div>
      <div className="panel-body">
        <div className="row" style={{justifyContent:'space-between'}}>
          <div>{loading? 'Loading...' : `Total: ${items.length}`}</div>
          <button className="ghost" onClick={load}>Refresh</button>
        </div>
        <div className="space-y-2">
          {(items||[]).map((it)=>{
            const msg = it?.raw?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
            const text = msg?.text?.body || msg?.button?.text || '(no text)';
            const from = msg?.from || it?.to || 'unknown';
            return (
              <div key={it.id} className="border rounded-lg p-3">
                <div className="flex justify-between"><div className="font-semibold">{from}</div><div className="text-xs text-gray-500">{new Date(it.received_at || it.created_at).toLocaleString()}</div></div>
                <div className="text-sm mt-1 whitespace-pre-wrap">{text}</div>
                <div className="flex gap-2 mt-2">
                  <button className="ghost" onClick={()=>convertToLead(it)}>Convert to Lead</button>
                  <button className="primary" onClick={()=>replyQueued(it)}>Reply (Queue)</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}