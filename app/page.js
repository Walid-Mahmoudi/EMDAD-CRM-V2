'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LayoutDashboard, Users, Building2, Handshake, BriefcaseBusiness, CheckSquare, WalletCards, Mail, Plus, Search, Bell, ChevronDown, X, RefreshCw } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const modules = [
  ['dashboard','Dashboard',LayoutDashboard], ['leads','Leads',Users], ['accounts','Accounts',Building2],
  ['contacts','Contacts',Users], ['deals','Deals',Handshake], ['projects','Projects',BriefcaseBusiness],
  ['activities','Activities',CheckSquare], ['collections','Collections',WalletCards], ['inbox','Sales Inbox',Mail],
];

const config = {
  leads:{table:'leads', title:'Leads', columns:[['lead_name','Lead'],['source','Source'],['status','Status'],['estimated_value','Value'],['sales_probability','Probability']]},
  accounts:{table:'companies', title:'Accounts', columns:[['name','Account'],['industry','Industry'],['phone','Phone'],['email','Email']]},
  contacts:{table:'contacts', title:'Contacts', columns:[['first_name','First Name'],['last_name','Last Name'],['job_title','Job Title'],['phone','Phone'],['email','Email']]},
  deals:{table:'deals', title:'Deals', columns:[['name','Deal'],['stage','Stage'],['estimated_value','Value'],['sales_probability','Probability'],['expected_close_date','Expected Close']]},
  projects:{table:'projects', title:'Projects', columns:[['project_name','Project'],['project_type','Type'],['status','Status'],['contract_value','Contract Value']]},
  activities:{table:'activities', title:'Activities', columns:[['subject','Subject'],['activity_type','Type'],['status','Status'],['priority','Priority'],['due_at','Due']]},
  collections:{table:'collections', title:'Collections', columns:[['invoice_reference','Invoice'],['amount_due','Due'],['amount_collected','Collected'],['collection_status','Status'],['due_date','Due Date']]},
  inbox:{table:'sales_inbox', title:'Sales Inbox', columns:[['sender_name','Sender'],['subject','Subject'],['ai_status','AI Status'],['ai_probability','Probability'],['received_at','Received']]},
};

export default function Home(){
  const [active,setActive] = useState('dashboard');
  const [showAdd,setShowAdd] = useState(false);
  const [query,setQuery] = useState('');
  const [refresh,setRefresh] = useState(0);
  const title = modules.find(x=>x[0]===active)?.[1] || 'Dashboard';

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">E</span><div><strong>EMDAD</strong><small>CRM</small></div></div>
      <button className="btn primary new-record" onClick={()=>setShowAdd(true)}><Plus size={16}/> New Record</button>
      <div className="nav-label">WORKSPACE</div>
      <nav className="nav">{modules.map(([id,label,Icon])=><button key={id} className={active===id?'active':''} onClick={()=>setActive(id)}><Icon size={17}/><span>{label}</span></button>)}</nav>
      <div className="sidebar-foot">EMDAD Sales Workspace<br/><span>CRM V2</span></div>
    </aside>
    <main className="main">
      <header className="topbar">
        <div className="global-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search records..."/></div>
        <div className="top-actions"><button className="icon-btn"><Bell size={18}/></button><div className="workspace">Sales Workspace <ChevronDown size={14}/></div></div>
      </header>
      <section className="content">
        <div className="breadcrumb">Sales Workspace <span>/</span> {title}</div>
        <div className="page-head"><div><h1>{title}</h1><p>{active==='dashboard'?'Your sales command center.':`Manage and track your ${title.toLowerCase()} in one place.`}</p></div>{active!=='dashboard' && <button className="btn primary" onClick={()=>setShowAdd(true)}><Plus size={16}/> Add {title.slice(0,-1) || title}</button>}</div>
        {active==='dashboard' ? <Dashboard refresh={refresh}/> : <ModulePage module={active} query={query} refresh={refresh} onRefresh={()=>setRefresh(x=>x+1)}/>} 
      </section>
    </main>
    {showAdd && <CreateModal module={active} onClose={()=>setShowAdd(false)} onCreated={()=>{setShowAdd(false);setRefresh(x=>x+1)}}/>}
  </div>
}

function Dashboard({refresh}){
  const [data,setData]=useState({open_deals:0,pipeline_value:0,active_projects:0,outstanding:0});
  const [loading,setLoading]=useState(true);
  useEffect(()=>{let alive=true;(async()=>{if(!supabase){setLoading(false);return} const {data,error}=await supabase.from('crm_dashboard').select('*').single(); if(alive&&!error&&data)setData(data); setLoading(false)})();return()=>{alive=false}},[refresh]);
  const stats=[['Open Deals',data.open_deals, 'opportunities'],['Pipeline Value',money(data.pipeline_value), 'weighted pipeline'],['Active Projects',data.active_projects,'projects'],['Outstanding',money(data.outstanding),'to collect']];
  return <>
    <div className="grid stats">{stats.map(([l,v,s])=><div className="metric-card" key={l}><div className="metric-top"><span>{l}</span><span className="dot"/></div><div className="metric-value">{loading?'—':v}</div><div className="metric-sub">{s}</div></div>)}</div>
    <div className="dashboard-grid">
      <div className="panel"><div className="panel-head"><div><h3>Sales Pipeline</h3><span>Open opportunities by stage</span></div><button className="link-btn">View all</button></div><Pipeline/></div>
      <div className="panel"><div className="panel-head"><div><h3>Upcoming Activities</h3><span>Next actions and follow-ups</span></div><button className="link-btn">View all</button></div><Activities/></div>
    </div>
  </>
}

function Pipeline(){
 const [rows,setRows]=useState([]); useEffect(()=>{(async()=>{if(!supabase)return;const {data}=await supabase.from('pipeline_deals').select('*').order('estimated_value',{ascending:false}).limit(8);setRows(data||[])})()},[]);
 if(!rows.length)return <div className="empty">No opportunities in the pipeline yet.<br/><small>Deals with probability ≥ 50% appear here.</small></div>;
 return <div className="pipeline-list">{rows.map(r=><div className="pipeline-row" key={r.id}><div className="record-avatar">{(r.name||'D').slice(0,1).toUpperCase()}</div><div className="grow"><strong>{r.name}</strong><span>{r.company_name||'No account'} · {r.stage}</span></div><b>{money(r.estimated_value)}</b></div>)}</div>
}
function Activities(){
 const [rows,setRows]=useState([]); useEffect(()=>{(async()=>{if(!supabase)return;const {data}=await supabase.from('activities').select('*').eq('status','Open').order('due_at',{ascending:true}).limit(6);setRows(data||[])})()},[]);
 if(!rows.length)return <div className="empty">No activities scheduled.<br/><small>Create calls, meetings, and follow-ups here.</small></div>;
 return <div className="activity-list">{rows.map(r=><div className="activity-row" key={r.id}><div className="activity-icon"><CheckSquare size={15}/></div><div className="grow"><strong>{r.subject}</strong><span>{r.activity_type} · {formatDate(r.due_at)}</span></div><span className="status-pill">{r.priority}</span></div>)}</div>
}

function ModulePage({module,query,refresh,onRefresh}){
 const c=config[module]; const [rows,setRows]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
 useEffect(()=>{let alive=true;(async()=>{setLoading(true);setError(''); if(!supabase){setLoading(false);return} const {data,error}=await supabase.from(c.table).select('*').order('created_at',{ascending:false}).limit(100); if(alive){setRows(data||[]);if(error)setError(error.message);setLoading(false)}})();return()=>{alive=false}},[c.table,refresh]);
 const filtered=useMemo(()=>rows.filter(r=>!query||Object.values(r).some(v=>String(v??'').toLowerCase().includes(query.toLowerCase()))),[rows,query]);
 return <div className="panel table-panel"><div className="table-toolbar"><div><strong>{filtered.length} records</strong><span>{supabase?'Connected to Supabase':'Add environment variables to connect'}</span></div><button className="icon-text" onClick={onRefresh}><RefreshCw size={15}/> Refresh</button></div>{error?<div className="error">Could not load records: {error}</div>:loading?<div className="empty">Loading {c.title.toLowerCase()}...</div>:<div className="table-wrap"><table className="table"><thead><tr>{c.columns.map(([,label])=><th key={label}>{label}</th>)}</tr></thead><tbody>{filtered.map(r=><tr key={r.id}>{c.columns.map(([key])=><td key={key}>{formatCell(r[key],key)}</td>)}</tr>)}{!filtered.length&&<tr><td colSpan={c.columns.length}><div className="empty">No {c.title.toLowerCase()} found.</div></td></tr>}</tbody></table></div>}</div>
}

function CreateModal({module,onClose,onCreated}){
 const target=module==='dashboard'?'companies':config[module]?.table||'companies'; const [name,setName]=useState(''); const [value,setValue]=useState(''); const [saving,setSaving]=useState(false); const [error,setError]=useState('');
 const labels={companies:'Account Name',contacts:'First Name',leads:'Lead Name',deals:'Deal Name',projects:'Project Name',activities:'Subject',collections:'Invoice Reference',sales_inbox:'Subject'};
 async function save(){if(!supabase){setError('Supabase environment variables are not configured yet.');return} if(!name.trim()){setError('Name is required.');return} setSaving(true);setError(''); const payload={}; const key=target==='companies'?'name':target==='contacts'?'first_name':target==='leads'?'lead_name':target==='deals'?'name':target==='projects'?'project_name':target==='activities'?'subject':target==='collections'?'invoice_reference':'subject'; payload[key]=name.trim(); if(['leads','deals','projects'].includes(module)&&value) payload[module==='projects'?'contract_value':'estimated_value']=Number(value)||0; const {error}=await supabase.from(target).insert(payload); if(error)setError(error.message);else onCreated();setSaving(false)}
 return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><h2>New {config[module]?.title?.slice(0,-1)||'Account'}</h2><p>Create a record in your CRM.</p></div><button className="icon-btn" onClick={onClose}><X size={18}/></button></div><label>{labels[target]||'Name'}<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Enter name..."/></label>{['leads','deals','projects'].includes(module)&&<label>Estimated Value<input type="number" value={value} onChange={e=>setValue(e.target.value)} placeholder="0"/></label>}{error&&<div className="error">{error}</div>}<div className="modal-actions"><button className="btn" onClick={onClose}>Cancel</button><button className="btn primary" disabled={saving} onClick={save}>{saving?'Saving...':'Create Record'}</button></div></div></div>
}

function money(v){return `EGP ${Number(v||0).toLocaleString('en-US',{maximumFractionDigits:0})}`}
function formatDate(v){if(!v)return 'No date';return new Date(v).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}
function formatCell(v,key){if(v===null||v===undefined||v==='')return '—';if(key.includes('value')||key.includes('amount'))return money(v);if(key.includes('probability'))return `${v}%`;if(key.includes('date')||key.endsWith('_at'))return formatDate(v);return String(v)}
