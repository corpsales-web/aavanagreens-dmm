import { useEffect, useMemo, useState } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function StatCard({ label, value, help }) {
  return (
    <div className="card">
      <div className="card-label">{label}</div>
      <div className="card-value">{value}</div>
      {help && <div className="card-help">{help}</div>}
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function GallerySeeder() {
  const [count, setCount] = useState(9);
  const [reset, setReset] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const seed = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/gallery/seed`, { count, reset });
      setResult(res.data);
    } catch (e) {
      console.error(e);
      setResult({ error: e?.response?.data?.detail || e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-title">Gallery Batch Send - Seed Data</div>
      <div className="panel-body">
        <div className="row">
          <label>Count</label>
          <input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value || 0))}
          />
        </div>
        <div className="row">
          <label className="checkbox">
            <input type="checkbox" checked={reset} onChange={(e) => setReset(e.target.checked)} />
            &nbsp;Reset existing items
          </label>
        </div>
        <button className="primary" onClick={seed} disabled={loading}>
          {loading ? "Seeding..." : "Seed Gallery"}
        </button>
        {result && (
          <div className="result">
            {result.error ? (
              <span className="error">{result.error}</span>
            ) : (
              <span>Inserted: {result.inserted}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LeadQualification() {
  const [lead, setLead] = useState({ name: "", email: "", phone: "", notes: "", source: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (key) => (e) => setLead((l) => ({ ...l, [key]: e.target.value }));

  const submit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post(`${API}/leads/qualify`, { lead });
      setResult(res.data);
    } catch (e) {
      console.error(e);
      setResult({ error: e?.response?.data?.detail || e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-title">Lead Qualification (AI-ready)</div>
      <div className="panel-body grid-2">
        <div className="form">
          <div className="row">
            <label>Name</label>
            <input value={lead.name} onChange={onChange("name")} placeholder="Amit Patel" />
          </div>
          <div className="row">
            <label>Email</label>
            <input value={lead.email} onChange={onChange("email")} placeholder="amit@example.com" />
          </div>
          <div className="row">
            <label>Phone</label>
            <input value={lead.phone} onChange={onChange("phone")} placeholder="9876543210" />
          </div>
          <div className="row">
            <label>Source</label>
            <input value={lead.source} onChange={onChange("source")} placeholder="Website / Referral / Campaign" />
          </div>
          <div className="row">
            <label>Notes</label>
            <textarea value={lead.notes} onChange={onChange("notes")} rows={4} placeholder="Looking for a 3BHK in Sept, budget 80L" />
          </div>
          <button className="primary" onClick={submit} disabled={loading || !lead.name}>
            {loading ? "Scoring..." : "Qualify Lead"}
          </button>
        </div>
        <div className="result">
          {!result && <div className="muted">Result will appear here</div>}
          {result?.error && <div className="error">{result.error}</div>}
          {result && !result.error && (
            <div className="score-card">
              <div className="score">{result.score}</div>
              <div className="stage">{result.stage}</div>
              <div className="reasoning">{result.reasoning}</div>
              <div className="model">Model: {result.model_used}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [apiOk, setApiOk] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const helloWorldApi = async () => {
    try {
      const response = await axios.get(`${API}/`);
      console.log(response.data.message);
    } catch (e) {
      console.error(e, `errored out requesting / api`);
    }
  };

  const checkHealth = async () => {
    try {
      const res = await axios.get(`${API}/health`);
      setApiOk(res.status === 200 && res.data?.status === "ok");
    } catch (e) {
      setApiOk(false);
    }
  };

  useEffect(() => {
    helloWorldApi();
    checkHealth();
  }, []);

  return (
    <div className="page">
      <div className="topbar">
        <div className="brand">Aavana</div>
        <div className="actions">
          <button className="ghost" onClick={() => setOpenModal(true)}>Open Modal</button>
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
        <StatCard label="API" value={apiOk ? "Healthy" : "Down"} help={BACKEND_URL ? "Connected" : "Missing REACT_APP_BACKEND_URL"} />
        <StatCard label="Total Leads" value={26} />
        <StatCard label="Active Leads" value={18} />
        <StatCard label="Pending Tasks" value={12} />
      </div>

      <div className="grid">
        <GallerySeeder />
        <LeadQualification />
      </div>

      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Example Modal">
        <p>This modal uses a high z-index overlay and content to fix stacking issues.</p>
        <p>Use this pattern for all overlays in the app.</p>
      </Modal>
    </div>
  );
}

export default App;