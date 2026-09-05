'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, FileSearch, Mail, RefreshCw, Sparkles, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const statusLabels = { New: 'New', Reviewing: 'Reviewing', Approved: 'Approved' };

export default function SalesInboxPage() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  async function load() {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.from('sales_inbox').select('*').order('received_at', { ascending: false }).limit(200);
    if (error) setMessage(error.message);
    else setRows(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => rows.filter(r => {
    const matchesFilter = filter === 'all' || String(r.ai_status || '').toLowerCase() === filter;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [r.sender_name, r.sender_email, r.subject, r.extracted_company, r.extracted_project].some(v => String(v || '').toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  }), [rows, filter, search]);

  async function analyze(row) {
    setBusy(true); setMessage('');
    const { data, error } = await supabase.from('sales_inbox').update({ ai_status: 'Reviewing' }).eq('id', row.id).select().single();
    if (error) { setMessage(error.message); setBusy(false); return; }
    setRows(x => x.map(r => r.id === row.id ? data : r));
    setSelected(data);
    try {
      const res = await fetch('/api/sales-inbox/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: row.id, subject: row.subject, sender_name: row.sender_name, sender_email: row.sender_email, body: row.body }) });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'AI analysis failed');
      setRows(x => x.map(r => r.id === row.id ? payload.record : r));
      setSelected(payload.record);
    } catch (e) {
      setMessage(e.message);
      await supabase.from('sales_inbox').update({ ai_status: 'New' }).eq('id', row.id);
      await load();
    }
    setBusy(false);
  }

  async function approve(row) {
    setBusy(true); setMessage('');
    const { data, error } = await supabase.rpc('approve_sales_inbox', { p_inbox_id: row.id });
    if (error) setMessage(error.message);
    else { setMessage(data?.entered_pipeline ? 'Approved: Lead + Deal created.' : 'Approved: Lead created.'); await load(); setSelected(null); }
    setBusy(false);
  }

  async function reject(row) {
    setBusy(true);
    const { error } = await supabase.from('sales_inbox').update({ ai_status: 'Rejected' }).eq('id', row.id);
    if (error) setMessage(error.message); else { await load(); setSelected(null); }
    setBusy(false);
  }

  return <main className="content" style={{ minHeight: '100vh' }}>
    <div className="module-head">
      <div>
        <div className="crumb"><a href="/">Home</a> <span>/</span> Sales Inbox</div>
        <h1>Sales Inbox</h1>
        <p>Review incoming sales emails, let AI extract the opportunity, then approve it into CRM.</p>
      </div>
      <button className="zoho-add" onClick={load}><RefreshCw size={16}/> Refresh</button>
    </div>

    <div className="module-panel">
      <div className="module-toolbar">
        <div className="inbox-tabs">
          {['all','new','reviewing','approved'].map(x => <button key={x} className={filter===x?'sel':''} onClick={()=>setFilter(x)}>{x==='all'?'All':statusLabels[x[0].toUpperCase()+x.slice(1)] || x} <b>{x==='all'?rows.length:rows.filter(r=>String(r.ai_status||'').toLowerCase()===x).length}</b></button>)}
        </div>
        <input className="inbox-search" placeholder="Search sender, subject, company..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      {message && <div className="error">{message}</div>}
      {loading ? <div className="loading">Loading Sales Inbox...</div> : <div className="inbox-list">
        {filtered.map(row => <button className="inbox-row" key={row.id} onClick={()=>setSelected(row)}>
          <div className="inbox-icon"><Mail size={18}/></div>
          <div className="inbox-main"><strong>{row.subject || '(No subject)'}</strong><span>{row.sender_name || row.sender_email || 'Unknown sender'} · {row.sender_email || ''}</span><small>{row.ai_summary || (row.body || '').slice(0, 150)}</small></div>
          <div className="inbox-meta"><span className={'status-badge status-'+String(row.ai_status||'New').toLowerCase()}>{row.ai_status || 'New'}</span><b>{row.ai_probability != null ? `${Math.round(Number(row.ai_probability))}%` : '—'}</b><time>{formatDate(row.received_at)}</time></div>
        </button>)}
        {!filtered.length && <div className="empty">No Sales Inbox records found.</div>}
      </div>}
    </div>

    {selected && <div className="drawer-backdrop" onClick={()=>setSelected(null)}><aside className="record-drawer inbox-drawer" onClick={e=>e.stopPropagation()}>
      <div className="drawer-head"><div><span>Sales Inbox</span><h2>{selected.subject || '(No subject)'}</h2></div><button onClick={()=>setSelected(null)}><XCircle size={20}/></button></div>
      <div className="drawer-actions"><button onClick={()=>analyze(selected)} disabled={busy}><Sparkles size={16}/> Analyze with AI</button><button className="primary" onClick={()=>approve(selected)} disabled={busy || !selected.ai_summary}><CheckCircle2 size={16}/> Approve to CRM</button><button className="danger-btn" onClick={()=>reject(selected)} disabled={busy}><XCircle size={16}/> Reject</button></div>
      <div className="inbox-detail"><div><label>From</label><p>{selected.sender_name || '—'} {selected.sender_email ? `<${selected.sender_email}>` : ''}</p></div><div><label>Received</label><p>{formatDate(selected.received_at, true)}</p></div><div><label>AI Probability</label><p className="probability">{selected.ai_probability != null ? `${Math.round(Number(selected.ai_probability))}%` : 'Not analyzed'}</p></div><div><label>AI Summary</label><p>{selected.ai_summary || 'Not analyzed yet.'}</p></div><div className="extract-grid"><div><label>Company</label><p>{selected.extracted_company || '—'}</p></div><div><label>Contact</label><p>{selected.extracted_contact || '—'}</p></div><div><label>Project</label><p>{selected.extracted_project || '—'}</p></div><div><label>Project Type</label><p>{selected.extracted_project_type || '—'}</p></div><div><label>Estimated Value</label><p>{selected.extracted_value != null ? Number(selected.extracted_value).toLocaleString('en-EG') + ' EGP' : '—'}</p></div></div><div><label>Email Body</label><pre>{selected.body || 'No body available.'}</pre></div></div>
    </aside></div>}
  </main>
}

function formatDate(v, detailed=false) { if (!v) return '—'; const d = new Date(v); return detailed ? d.toLocaleString('en-GB') : d.toLocaleDateString('en-GB'); }
