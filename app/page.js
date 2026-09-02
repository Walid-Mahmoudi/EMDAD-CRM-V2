'use client';

import { useState } from 'react';
import { LayoutDashboard, Users, Building2, Handshake, BriefcaseBusiness, CheckSquare, WalletCards, Mail, Plus } from 'lucide-react';

const modules = [
  ['dashboard','Dashboard',LayoutDashboard], ['leads','Leads',Users], ['accounts','Accounts',Building2],
  ['contacts','Contacts',Users], ['deals','Deals',Handshake], ['projects','Projects',BriefcaseBusiness],
  ['activities','Activities',CheckSquare], ['collections','Collections',WalletCards], ['inbox','Sales Inbox',Mail],
];

export default function Home(){
  const [active,setActive] = useState('dashboard');
  const [showAdd,setShowAdd] = useState(false);
  const title = modules.find(x=>x[0]===active)?.[1] || 'Dashboard';
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand">EMDAD <span style={{fontSize:12,color:'#8a93a3'}}>CRM</span></div>
      <button className="btn primary" onClick={()=>setShowAdd(true)}><Plus size={16}/> New Record</button>
      <nav className="nav">{modules.map(([id,label,Icon])=><button key={id} className={active===id?'active':''} onClick={()=>setActive(id)}><Icon size={16} style={{verticalAlign:'middle',marginRight:10}}/>{label}</button>)}</nav>
      <div style={{marginTop:'auto',fontSize:12,color:'#9aa2af',padding:'10px 12px'}}>EMDAD Sales Workspace</div>
    </aside>
    <main className="main">
      <header className="topbar"><input className="search" placeholder="Search CRM..."/><div style={{fontSize:13,color:'#687182'}}>Sales Workspace</div></header>
      <section className="content">
        <div className="page-head"><div><div className="page-title">{title}</div><div className="page-sub">Structured sales management for EMDAD.</div></div><button className="btn primary" onClick={()=>setShowAdd(true)}><Plus size={16}/> Add</button></div>
        {active==='dashboard' ? <Dashboard/> : <ModulePage label={title}/>} 
      </section>
    </main>
    {showAdd && <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,.35)',display:'grid',placeItems:'center',zIndex:20}} onClick={()=>setShowAdd(false)}><div className="card" style={{width:420,maxWidth:'calc(100vw - 32px)'}} onClick={e=>e.stopPropagation()}><div style={{fontSize:18,fontWeight:800,marginBottom:14}}>Create new record</div><input className="search" style={{maxWidth:'100%',width:'100%',marginBottom:10}} placeholder="Record name"/><input className="search" style={{maxWidth:'100%',width:'100%'}} placeholder="Company / Account"/><div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:16}}><button className="btn" onClick={()=>setShowAdd(false)}>Cancel</button><button className="btn primary" onClick={()=>setShowAdd(false)}>Create</button></div></div></div>}
  </div>
}

function Dashboard(){return <>
  <div className="grid stats">{[['Open Deals','0'],['Pipeline Value','EGP 0'],['Projects','0'],['Outstanding','EGP 0']].map(([l,v])=><div className="card" key={l}><div className="metric-label">{l}</div><div className="metric-value">{v}</div></div>)}</div>
  <div className="grid" style={{gridTemplateColumns:'1.4fr 1fr',marginTop:16}}><div className="card"><div style={{fontWeight:800,marginBottom:14}}>Sales Pipeline</div><div className="empty">No active opportunities yet.</div></div><div className="card"><div style={{fontWeight:800,marginBottom:14}}>Upcoming Activities</div><div className="empty">No activities scheduled.</div></div></div>
</>}
function ModulePage({label}){return <div className="table-wrap"><table className="table"><thead><tr><th>Name</th><th>Company</th><th>Status</th><th>Owner</th><th>Updated</th></tr></thead><tbody><tr><td colSpan="5"><div className="empty">No {label.toLowerCase()} yet.</div></td></tr></tbody></table></div>}
