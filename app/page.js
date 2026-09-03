'use client';
import { useEffect, useMemo, useState } from 'react';
import { Home, BarChart3, Users, UserRound, Building2, Handshake, CheckSquare, CalendarDays, Phone, Megaphone, BriefcaseBusiness, FileText, MapPin, Headphones, Search, Plus, Bell, Calendar, Store, Settings, Grid3X3, ChevronDown, PanelLeftClose, RefreshCw, List, KanbanSquare, Pencil, Trash2, X, Trophy, CircleDollarSign, Target, Clock, ArrowUpRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

const modules=[
 ['home','Home',Home],['reports','Reports',BarChart3],
 ['leads','Leads',Users],['contacts','Contacts',UserRound],['accounts','Accounts',Building2],['deals','Deals',Handshake],
 ['tasks','Tasks',CheckSquare],['meetings','Meetings',CalendarDays],['calls','Calls',Phone],['campaigns','Campaigns',Megaphone],
 ['projects','Projects',BriefcaseBusiness],['documents','Documents',FileText],['visits','Visits',MapPin],['desk','Desk',Headphones]
];
const configs={
 leads:{table:'leads',title:'Leads',columns:[['lead_name','Lead Name'],['source','Lead Source'],['status','Status'],['estimated_value','Value'],['sales_probability','Probability']]},
 contacts:{table:'contacts',title:'Contacts',columns:[['first_name','First Name'],['last_name','Last Name'],['job_title','Job Title'],['phone','Phone'],['email','Email']]},
 accounts:{table:'companies',title:'Accounts',columns:[['name','Account Name'],['industry','Industry'],['phone','Phone'],['email','Email']]},
 deals:{table:'deals',title:'Deals',columns:[['name','Deal Name'],['stage','Stage'],['estimated_value','Amount'],['sales_probability','Probability'],['expected_close_date','Closing Date']]},
 projects:{table:'projects',title:'Projects',columns:[['project_name','Project Name'],['project_type','Type'],['status','Status'],['contract_value','Contract Value']]},
 tasks:{table:'activities',title:'Tasks',filter:'task',columns:[['subject','Subject'],['due_at','Due Date'],['status','Status'],['priority','Priority']]},
 meetings:{table:'activities',title:'Meetings',filter:'meeting',columns:[['subject','Title'],['due_at','From'],['end_at','To'],['status','Status']]},
 calls:{table:'activities',title:'Calls',filter:'call',columns:[['subject','Subject'],['due_at','Date'],['status','Status'],['result','Result']]}
};

export default function HomePage(){
 const [active,setActive]=useState('home'),[query,setQuery]=useState(''),[collapsed,setCollapsed]=useState(false),[showAdd,setShowAdd]=useState(false),[selected,setSelected]=useState(null),[refresh,setRefresh]=useState(0);
 const label=modules.find(x=>x[0]===active)?.[1]||'Home';
 return <div className={collapsed?'app-shell collapsed':'app-shell'}>
  <aside className="sidebar">
   <div className="brand"><div className="brand-logo">M</div><div className="brand-name">Moza CRM</div><button className="sidebar-collapse" onClick={()=>setCollapsed(!collapsed)} title="Collapse sidebar"><PanelLeftClose size={18}/></button></div>
   <nav className="primary-nav">
    <button className={active==='home'?'active':''} onClick={()=>setActive('home')}><Home size={18}/><span>Home</span></button>
    <button className={active==='reports'?'active':''} onClick={()=>setActive('reports')}><BarChart3 size={18}/><span>Reports</span></button>
   </nav>
   <div className="modules-title">Modules</div>
   <div className="side-search"><Search size={17}/><input placeholder="Search" onChange={e=>setQuery(e.target.value)}/></div>
   <nav className="module-nav">{modules.slice(2).map(([id,text,Icon])=><button key={id} className={active===id?'active':''} onClick={()=>{setActive(id);setQuery('')}}><Icon size={18}/><span>{text}</span></button>)}</nav>
  </aside>
  <main className="main">
   <header className="topbar"><div className="global-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search records"/></div><div className="top-icons"><button><Plus size={21}/></button><button><Calendar size={20}/></button><button><Store size={20}/></button><button><Settings size={20}/></button><div className="avatar">W</div><button><Grid3X3 size={21}/></button></div></header>
   <section className="content">{active==='home'?<Dashboard refresh={refresh} onNavigate={setActive}/>:active==='reports'?<Reports refresh={refresh}/>:<ModulePage module={active} query={query} refresh={refresh} onRefresh={()=>setRefresh(v=>v+1)} onSelect={setSelected}/>}</section>
  </main>
  {showAdd&&<CreateModal module={active} onClose={()=>setShowAdd(false)} onCreated={()=>{setShowAdd(false);setRefresh(v=>v+1)}}/>}
  {selected&&<RecordDrawer module={active} record={selected} onClose={()=>setSelected(null)} onSaved={()=>{setSelected(null);setRefresh(v=>v+1)}}/>}
 </div>
}

function Dashboard({refresh,onNavigate}){
 const [deals,setDeals]=useState([]),[activities,setActivities]=useState([]),[leads,setLeads]=useState([]),[loading,setLoading]=useState(true);
 useEffect(()=>{let alive=true;(async()=>{if(!supabase){setLoading(false);return}const [d,a,l]=await Promise.all([supabase.from('deals').select('*').order('created_at',{ascending:false}).limit(100),supabase.from('activities').select('*').order('due_at',{ascending:true}).limit(100),supabase.from('leads').select('*').order('created_at',{ascending:false}).limit(100)]);if(alive){setDeals(d.data||[]);setActivities(a.data||[]);setLeads(l.data||[]);setLoading(false)}})();return()=>{alive=false}},[refresh]);
 const now=new Date(),day=now.toISOString().slice(0,10),month=now.getMonth(),year=now.getFullYear();
 const tasks=activities.filter(a=>['task','tasks'].includes(String(a.activity_type||'').toLowerCase())||(!a.activity_type&&a.status!=='Completed')); const meetings=activities.filter(a=>String(a.activity_type||'').toLowerCase().includes('meeting')&&String(a.due_at||'').slice(0,10)===day); const todayLeads=leads.filter(x=>String(x.created_at||'').slice(0,10)===day).slice(0,5); const closing=deals.filter(d=>d.expected_close_date&&new Date(d.expected_close_date).getMonth()===month&&new Date(d.expected_close_date).getFullYear()===year&&!['Won','Lost'].includes(d.stage)).slice(0,5);
 const openDeals=deals.filter(d=>!['Won','Lost'].includes(d.stage)); const weighted=openDeals.reduce((s,d)=>s+Number(d.estimated_value||0)*Number(d.sales_probability||0)/100,0); const won=deals.filter(d=>d.stage==='Won');
 const stats=[['Open Deals',openDeals.length,Handshake],['Pipeline Value',money(weighted),CircleDollarSign],['Won Deals',won.length,Trophy],['Open Tasks',tasks.filter(x=>x.status!=='Completed').length,CheckSquare]];
 return <div className="zoho-home">
  <div className="home-head"><div className="home-title"><div className="home-building"><Building2 size={29}/></div><div><h1>Welcome Walid Mahmoudy</h1><span>{now.toLocaleDateString('en-GB',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}</span></div></div><button className="refresh-btn" onClick={()=>location.reload()}><RefreshCw size={16}/></button></div>
  <div className="home-grid">
   <Widget title="My Open Tasks" headers={['Subject','Due Date','Status']} footer="View All Tasks" count={tasks.length} onClick={()=>onNavigate('tasks')}>
    {tasks.slice(0,5).map(x=><div className="home-row" key={x.id}><span className="subject"><CheckSquare size={15}/>{x.subject||'Untitled task'}</span><span>{formatDate(x.due_at)}</span><span className="pill">{x.status||'Open'}</span></div>)}{!tasks.length&&<Empty text="No Tasks found"/>}
   </Widget>
   <Widget title="My Meetings" headers={['Title','From','To']} footer="View All Meetings" count={meetings.length} onClick={()=>onNavigate('meetings')}>
    {meetings.slice(0,5).map(x=><div className="home-row" key={x.id}><span className="subject"><CalendarDays size={15}/>{x.subject||'Meeting'}</span><span>{timeOnly(x.due_at)}</span><span>{timeOnly(x.end_at)||'—'}</span></div>)}{!meetings.length&&<Empty text="No Meetings found"/>}
   </Widget>
   <Widget title="Today's Leads" headers={['Lead Name','Source','Status']} footer="View All Leads" count={todayLeads.length} onClick={()=>onNavigate('leads')}>
    {todayLeads.map(x=><div className="home-row" key={x.id}><span className="link">{x.lead_name||'Unnamed lead'}</span><span>{x.source||'—'}</span><span>{x.status||'New'}</span></div>)}{!todayLeads.length&&<Empty text="No Leads found"/>}
   </Widget>
   <Widget title="My Deals Closing This Month" headers={['Deal Name','Amount','Stage']} footer="View All Deals" count={closing.length} onClick={()=>onNavigate('deals')}>
    {closing.map(x=><div className="home-row" key={x.id}><span className="link">{x.name}</span><span>{money(x.estimated_value)}</span><span className="pill">{x.stage}</span></div>)}{!closing.length&&<Empty text="No Deals found"/>}
   </Widget>
  </div>
  <div className="kpi-strip">{stats.map(([name,val,Icon])=><div className="kpi" key={name}><div className="kpi-icon"><Icon size={19}/></div><div><span>{name}</span><strong>{loading?'—':val}</strong></div></div>)}</div>
  <div className="dashboard-panels"><div className="mini-panel"><h3>Deals by Stage</h3>{['New','Qualified','Proposition','Proposal sent','Follow-up','Negotiation','Won'].map(s=>{const n=deals.filter(d=>d.stage===s).length;return <div className="bar-row" key={s}><span>{s}</span><div><i style={{width:`${Math.min(100,Math.max(3,n/(Math.max(1,deals.length))*100))}%`}}/></div><b>{n}</b></div>})}</div><div className="mini-panel"><h3>Sales Snapshot</h3><div className="snapshot"><div><span>Open Pipeline</span><b>{money(openDeals.reduce((s,d)=>s+Number(d.estimated_value||0),0))}</b></div><div><span>Weighted Pipeline</span><b>{money(weighted)}</b></div><div><span>Average Probability</span><b>{openDeals.length?Math.round(openDeals.reduce((s,d)=>s+Number(d.sales_probability||0),0)/openDeals.length):0}%</b></div></div></div></div>
 </div>
}
function Widget({title,headers,children,footer,count,onClick}){return <div className="zoho-widget"><div className="widget-title"><h2>{title}</h2><button onClick={onClick}>•••</button></div><div className="sort-row"><span>↕ Sort</span></div><div className="home-table-head">{headers.map(h=><span key={h}>{h}</span>)}<span className="filter">☷</span></div><div className="home-table-body">{children}</div><div className="widget-footer"><button onClick={onClick}>{footer}</button><span>Total Records {count}</span></div></div>}
function Empty({text}){return <div className="home-empty">{text}</div>}

function ModulePage({module,query,refresh,onRefresh,onSelect}){
 const c=configs[module]; const [view,setView]=useState(module==='deals'?'list':'list'),[rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{let alive=true;(async()=>{setLoading(true);if(!c||!supabase){setRows([]);setLoading(false);return}let q=supabase.from(c.table).select('*').order('created_at',{ascending:false}).limit(100);if(c.filter)q=q.ilike('activity_type',`%${c.filter}%`);const r=await q;if(alive){setRows(r.data||[]);setError(r.error?.message||'');setLoading(false)}})();return()=>{alive=false}},[module,refresh]);
 const filtered=useMemo(()=>rows.filter(r=>!query||Object.values(r).some(v=>String(v??'').toLowerCase().includes(query.toLowerCase()))),[rows,query]);
 if(!c)return <div className="placeholder"><Headphones size={34}/><h1>{titleCase(module)}</h1><p>This module is ready for integration. Connect its data source when you want to activate it.</p></div>;
 async function remove(id){if(!window.confirm('Delete this record?'))return;const r=await supabase.from(c.table).delete().eq('id',id);if(r.error)setError(r.error.message);else setRows(x=>x.filter(y=>y.id!==id))}
 return <div><div className="module-head"><div><div className="crumb">Home <span>/</span> {c.title}</div><h1>{c.title}</h1><p>Manage and track your {c.title.toLowerCase()}.</p></div><button className="zoho-add" onClick={()=>onSelect({__new:true,__module:module})}><Plus size={16}/> New {c.title.endsWith('s')?c.title.slice(0,-1):c.title}</button></div><div className="module-panel"><div className="module-toolbar"><div><strong>{filtered.length}</strong> records</div><div className="toolbar-right"><button onClick={onRefresh}><RefreshCw size={15}/> Refresh</button>{module==='deals'&&<div className="view-toggle"><button className={view==='list'?'sel':''} onClick={()=>setView('list')}><List size={15}/></button><button className={view==='kanban'?'sel':''} onClick={()=>setView('kanban')}><KanbanSquare size={15}/></button></div>}</div></div>{error&&<div className="error">{error}</div>}{loading?<div className="loading">Loading...</div>:view==='kanban'?<DealKanban rows={filtered} onSelect={onSelect}/>:<div className="table-scroll"><table><thead><tr>{c.columns.map(([,h])=><th key={h}>{h}</th>)}<th/></tr></thead><tbody>{filtered.map(r=><tr key={r.id}><td className="first-cell" onClick={()=>onSelect(r)}>{formatCell(r[c.columns[0][0]],c.columns[0][0])}</td>{c.columns.slice(1).map(([k])=><td key={k}>{formatCell(r[k],k)}</td>)}<td><button className="table-action" onClick={()=>onSelect(r)}><Pencil size={14}/></button><button className="table-action danger" onClick={()=>remove(r.id)}><Trash2 size={14}/></button></td></tr>)}</tbody></table>{!filtered.length&&<div className="empty">No records found</div>}</div>}</div></div>
}
function DealKanban({rows,onSelect}){const stages=['New','Qualified','Proposition','Proposal sent','Follow-up','Negotiation','Won','Lost'];return <div className="kanban">{stages.map(s=>{const items=rows.filter(r=>r.stage===s);return <div className="kanban-col" key={s}><div className="kanban-head"><b>{s}</b><span>{items.length}</span></div>{items.map(r=><button className="deal-card" key={r.id} onClick={()=>onSelect(r)}><strong>{r.name}</strong><span>{money(r.estimated_value)}</span><small>{r.sales_probability||0}% probability</small></button>)}</div>})}</div>}

function Reports({refresh}){return <div><div className="module-head"><div><div className="crumb">Home <span>/</span> Reports</div><h1>Reports</h1><p>Sales performance and pipeline overview.</p></div></div><div className="report-grid"><div className="report-card"><Trophy size={21}/><span>Deal Performance</span><b>Track Won / Lost / Open</b></div><div className="report-card"><CircleDollarSign size={21}/><span>Pipeline Analysis</span><b>Value by stage and probability</b></div><div className="report-card"><Target size={21}/><span>Activity Report</span><b>Tasks, meetings and calls</b></div><div className="report-card"><Clock size={21}/><span>Collection Report</span><b>Outstanding and collected amounts</b></div></div></div>}

function CreateModal({module,onClose,onCreated}){const c=configs[module];const [form,setForm]=useState({}),[saving,setSaving]=useState(false),[error,setError]=useState('');if(!c)return null;const fields=c.columns.slice(0,4);async function save(e){e.preventDefault();setSaving(true);const payload={...form};if(module==='deals'&&!payload.stage)payload.stage='New';if(module==='leads'&&!payload.status)payload.status='New';if(c.filter)payload.activity_type=c.filter==='meeting'?'Meeting':c.filter==='call'?'Call':'Task';const r=await supabase.from(c.table).insert(payload);if(r.error)setError(r.error.message);else onCreated();setSaving(false)}return <div className="modal-backdrop"><form className="modal" onSubmit={save}><div className="modal-head"><div><h2>New {c.title}</h2><p>Create a record in Moza CRM</p></div><button type="button" onClick={onClose}><X size={18}/></button></div>{fields.map(([k,h])=><label key={k}>{h}<input value={form[k]??''} onChange={e=>setForm({...form,[k]:e.target.value})}/></label>)}{error&&<div className="error">{error}</div>}<div className="modal-actions"><button type="button" onClick={onClose}>Cancel</button><button className="primary" disabled={saving}>{saving?'Saving...':'Save'}</button></div></form></div>}

function RecordDrawer({module,record,onClose,onSaved}){const c=configs[module];const [form,setForm]=useState(record),[saving,setSaving]=useState(false),[error,setError]=useState('');if(!c)return null;async function save(){setSaving(true);const payload={...form};delete payload.__new;delete payload.__module;const r=record.__new?await supabase.from(c.table).insert(payload):await supabase.from(c.table).update(payload).eq('id',record.id);if(r.error)setError(r.error.message);else onSaved();setSaving(false)}return <div className="drawer-backdrop"><aside className="drawer"><div className="drawer-head"><div><small>{c.title}</small><h2>{record.__new?'New Record':formatCell(record[c.columns[0][0]],c.columns[0][0])}</h2></div><button onClick={onClose}><X size={19}/></button></div><div className="drawer-body"><div className="drawer-grid">{c.columns.map(([k,h])=><label key={k}>{h}<input value={form[k]??''} onChange={e=>setForm({...form,[k]:e.target.value})}/></label>)}</div><div className="drawer-section"><h3>Record Information</h3><div className="system-info"><span>Module</span><b>{c.title}</b><span>ID</span><b>{record.id||'New'}</b></div></div>{error&&<div className="error">{error}</div>}</div><div className="drawer-actions"><button onClick={onClose}>Cancel</button><button className="primary" onClick={save} disabled={saving}>{saving?'Saving...':'Save Changes'}</button></div></aside></div>}

function money(v){const n=Number(v||0);return new Intl.NumberFormat('en-EG',{maximumFractionDigits:0}).format(n)+' EGP'}
function formatDate(v){if(!v)return '—';const d=new Date(v);return isNaN(d)?String(v):d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}
function timeOnly(v){if(!v)return '';const d=new Date(v);return isNaN(d)?'':d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}
function formatCell(v,k){if(v===null||v===undefined||v==='')return '—';if(k.includes('date')||k==='due_at'||k==='end_at'||k==='received_at')return formatDate(v);if(k.includes('value')||k.includes('amount'))return money(v);if(k.includes('probability'))return `${v}%`;return String(v)}
function titleCase(v){return v.charAt(0).toUpperCase()+v.slice(1)}
