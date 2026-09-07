export const dynamic = 'force-dynamic';

export async function GET() {
  const source = 'https://raw.githubusercontent.com/Walid-Mahmoudi/EMDAD-CRM-V2/main/crm-v3.html';
  const response = await fetch(source, { cache: 'no-store' });
  if (!response.ok) return new Response('EMDAD CRM V3 is temporarily unavailable.', { status: 502 });
  let html = await response.text();

  const oldBoot = "let r=await db.from('profiles').select('*').eq('id',u.id).maybeSingle();me=r.data||{id:u.id,full_name:u.email,role:'sales'};";
  const newBoot = "let r=await db.rpc('get_my_profile');if(r.error||!r.data){let rr=await db.rpc('get_my_role');if(rr.error||!rr.data){console.error('Profile load failed',r.error,rr.error);return msg('تعذر تحميل صلاحيات الحساب. تواصل مع المدير.',true)}me={id:u.id,full_name:u.email,role:rr.data}}else me=r.data;";
  html = html.replace(oldBoot, newBoot);

  const oldNav = "let items=[['dashboard','Dashboard'],['projects','Projects'],['companies','Customers'],['followups','Follow-ups'],['meetings','Meetings']];";
  const newNav = "let items=[['dashboard','Dashboard'],['projects','Projects'],['companies','Customers'],['followups','Follow-ups'],['meetings','Meetings']];if(isAdmin())items.push(['users','Users']);";
  html = html.replace(oldNav, newNav);

  const marker = "function go(p){state.page=p;nav();({dashboard:dashboard,projects:projects,companies:companiesPage,followups:followupsPage,meetings:meetingsPage}[p]||dashboard)()}";
  const replacement = `async function usersPage(){if(!isAdmin())return dashboard();let r=await db.rpc('admin_list_profiles');if(r.error)return pageError(r.error);let rows=r.data||[];$('page').innerHTML=\`<div class="toolbar"><h2>User Management</h2><span class="right"></span></div><div class="card"><div class="hint">Admin only — manage role, active status and user details.</div><div class="tablewrap"><table><tr><th>Name</th><th>Phone</th><th>Role</th><th>Status</th><th>Created</th><th></th></tr>\${rows.map(x=>\`<tr><td><input id="un-\${x.id}" value="\${esc(x.full_name||'')}"></td><td><input id="up-\${x.id}" value="\${esc(x.phone||'')}"></td><td><select id="ur-\${x.id}">\${['admin','sales','technical_support','management'].map(z=>\`<option value="\${z}" \${x.role===z?'selected':''}>\${z}</option>\`).join('')}</select></td><td><select id="ua-\${x.id}"><option value="true" \${x.is_active?'selected':''}>Active</option><option value="false" \${!x.is_active?'selected':''}>Inactive</option></select></td><td>\${dt(x.created_at)}</td><td><button onclick="saveUserProfile('\${x.id}')">Save</button></td></tr>\`).join('')}</table></div></div>\`}
async function saveUserProfile(id){if(!isAdmin())return;let r=await db.rpc('admin_update_profile',{p_id:id,p_role:$('ur-'+id).value,p_is_active:$('ua-'+id).value==='true',p_full_name:$('un-'+id).value,p_phone:$('up-'+id).value});if(r.error)return alert(r.error.message);usersPage()}
${marker.replace("meetings:meetingsPage", "meetings:meetingsPage,users:usersPage")}`;
  html = html.replace(marker, replacement);

  const stylePatch = `<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
:root{--red:#c83535;--red-dark:#a92d2d;--charcoal:#20252b;--ink:#30363d;--muted:#727982;--bg:#f5f6f8;--surface:#fff;--line:#e3e6e9;--soft:#f1f3f5;--shadow:0 8px 28px rgba(24,30,36,.07);--shadow-lg:0 22px 60px rgba(18,24,30,.16)}
*{box-sizing:border-box}html{background:var(--bg)}body{margin:0;font-family:Inter,Arial,Tahoma,sans-serif;background:#f5f6f8;color:var(--ink);letter-spacing:-.12px}body:before{content:'';position:fixed;inset:0;pointer-events:none;background:linear-gradient(135deg,transparent 0 48%,rgba(200,53,53,.022) 48.2% 49%,transparent 49.2%),linear-gradient(315deg,transparent 0 72%,rgba(32,37,43,.018) 72.2% 73%,transparent 73.2%);z-index:0}
button{appearance:none;border:0;border-radius:9px;min-height:42px;padding:10px 16px;background:var(--red);color:#fff;box-shadow:0 4px 12px rgba(200,53,53,.16);font:600 13px Inter,Arial,sans-serif;cursor:pointer;transition:transform .16s,background .16s,box-shadow .16s}button:hover{background:var(--red-dark);transform:translateY(-1px);box-shadow:0 7px 18px rgba(200,53,53,.2)}button:active{transform:translateY(0);box-shadow:none}button.secondary{background:#fff;color:var(--charcoal);border:1px solid #dfe3e7;box-shadow:0 1px 2px rgba(0,0,0,.03)}button.secondary:hover{background:#f7f8f9;border-color:#cfd4d8;box-shadow:none}button.danger{background:#7f1d1d}
.top{position:sticky;top:0;z-index:20;display:flex;justify-content:space-between;align-items:center;gap:20px;background:rgba(32,37,43,.98);color:#fff;padding:14px 24px;border-bottom:3px solid var(--red);box-shadow:0 5px 22px rgba(0,0,0,.14)}.top:after{content:'';position:absolute;right:24px;top:0;width:72px;height:3px;background:var(--red)}.brand{font-size:18px;font-weight:800;letter-spacing:.2px}.brand:before{content:'EMDAD';letter-spacing:3px;margin-right:12px;color:#fff}.brand:after{content:' Engineering Solutions';font-size:11px;color:#bfc5ca;font-weight:500;letter-spacing:.6px}.top small{display:block;color:#b8bec4;margin-top:4px;font-size:11px}
.wrap{position:relative;z-index:1;max-width:1480px;margin:auto;padding:22px}.nav{display:flex;gap:4px;flex-wrap:wrap;padding:5px;margin-bottom:18px;background:rgba(255,255,255,.96);border:1px solid var(--line);border-radius:12px;box-shadow:var(--shadow)}.nav button{position:relative;background:transparent;color:#60676e;border:0;box-shadow:none;border-radius:8px;min-height:40px;padding:9px 14px;font-size:12.5px}.nav button:hover{background:#f3f5f6;color:var(--charcoal);transform:none;box-shadow:none}.nav button.on{background:var(--charcoal);color:#fff;box-shadow:0 4px 12px rgba(32,37,43,.18)}
.card{background:rgba(255,255,255,.98);border:1px solid var(--line);border-radius:14px;padding:18px;box-shadow:var(--shadow)}.kpi{position:relative;overflow:hidden;transition:transform .18s,box-shadow .18s}.kpi:hover{transform:translateY(-2px);box-shadow:0 14px 34px rgba(24,30,36,.1)}.kpi:before{content:'';position:absolute;right:0;top:0;bottom:0;width:4px;background:var(--red)}.kpi small{color:var(--muted);font-weight:600}.kpi h2{font-size:24px;margin:8px 0 0;font-weight:800;color:var(--charcoal)}.toolbar{gap:8px}.toolbar h2,.sectionTitle h3{font-weight:800;color:var(--charcoal);letter-spacing:-.4px}.sectionTitle{margin-bottom:10px}
input,select,textarea{width:100%;padding:11px 12px;border:1px solid #d5d9dd;border-radius:9px;background:#fff;color:var(--ink);font:400 14px Inter,Arial,Tahoma,sans-serif;outline:none;transition:border-color .15s,box-shadow .15s}input:focus,select:focus,textarea:focus{border-color:var(--red);box-shadow:0 0 0 3px rgba(200,53,53,.09)}label{color:#3e454c;font-weight:600;font-size:12px;margin:11px 0 6px}.hint{color:var(--muted);line-height:1.55}th{background:#f3f4f5;color:#3c434a;font-weight:700;border-bottom:2px solid #e0e3e6}td{color:#454c53}tr.click:hover{background:#fff8f8}.badge{font-weight:700;border-radius:999px;padding:5px 9px}.modalbox{border:1px solid var(--line);box-shadow:var(--shadow-lg);border-radius:16px}
.auth{position:relative;isolation:isolate;min-height:100vh;display:grid;place-items:center;padding:24px;overflow:hidden;background:radial-gradient(ellipse at 50% -10%,#3d454d 0,#252b31 44%,#171b1f 100%)}.auth:before{content:'';position:absolute;inset:-20%;pointer-events:none;z-index:-1;background:linear-gradient(135deg,transparent 46%,rgba(200,53,53,.13) 46.3%,rgba(200,53,53,.025) 48%,transparent 48.5%),linear-gradient(315deg,transparent 69%,rgba(255,255,255,.035) 69.2%,transparent 69.7%)}.authbox{position:relative;z-index:2;width:min(455px,100%);padding:38px 36px 30px;border:1px solid rgba(255,255,255,.55);border-top:4px solid var(--red);border-radius:18px;background:rgba(255,255,255,.985);box-shadow:0 30px 90px rgba(0,0,0,.4)}.authbox:before{content:'E';display:grid;place-items:center;width:48px;height:48px;border-radius:50%;margin:0 auto 17px;background:var(--red);color:#fff;font-size:23px;font-weight:800;box-shadow:0 8px 22px rgba(200,53,53,.25)}.authbox h1{margin:0;text-align:center;font-size:31px;line-height:1.08;color:var(--charcoal);font-weight:800;letter-spacing:-1.3px}.authbox h1:before{content:'EMDAD';display:block;margin-bottom:8px;color:var(--red);font-size:12px;letter-spacing:4px}.authbox h1:after{content:'Engineering Solutions';display:block;margin-top:8px;color:#7a8188;font-size:11px;font-weight:500;letter-spacing:1.5px}.authbox>p.muted{text-align:center;margin:13px 0 28px;color:#697078;font-size:13px}.authbox label{text-align:left;direction:ltr;margin-top:15px}.authbox input{height:49px;font-size:15px;direction:ltr;text-align:left;position:relative;z-index:3}.authbox .toolbar{display:flex;flex-direction:column;gap:10px;margin-top:20px}.authbox .toolbar button{width:100%;height:48px;font-size:14px;margin:0}.authbox .toolbar button:before{content:none!important}.authbox .hint{text-align:center;margin-top:15px;line-height:1.65}.auth:before,.authbox,.authbox input,.authbox button{pointer-events:auto}.auth:before{pointer-events:none}
/* Premium line-icon system: SVGs are injected into navigation/actions, avoiding bulky icon fonts. */
.emdad-icon{width:17px;height:17px;display:inline-flex;vertical-align:-4px;margin-inline-end:8px;flex:none;stroke:currentColor;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round}.nav button .emdad-icon{width:16px;height:16px;vertical-align:-3px;margin-inline-end:7px}.toolbar button .emdad-icon{width:15px;height:15px;vertical-align:-3px}.nav button.on .emdad-icon{stroke-width:2}
.nav button,.toolbar button{display:inline-flex;align-items:center;justify-content:center;gap:0}.right{margin-right:auto}
@media(max-width:900px){.grid{grid-template-columns:repeat(2,1fr)}.formgrid,.grid2{grid-template-columns:1fr}}
@media(max-width:700px){.wrap{padding:10px}.top{padding:12px 14px}.brand{font-size:16px}.brand:after{display:none}.nav{overflow-x:auto;flex-wrap:nowrap;border-radius:10px;margin-bottom:12px}.nav button{white-space:nowrap;padding:9px 12px}.card{padding:14px}.toolbar>*{max-width:100%;width:100%}.grid{gap:8px}.kpi h2{font-size:20px}.auth{padding:14px}.authbox{width:min(430px,100%);padding:30px 22px 24px;border-radius:16px}.authbox h1{font-size:27px}}
@media(prefers-reduced-motion:reduce){button,.kpi{transition:none!important}}
</style>`;
  html = html.replace('</head>', stylePatch + '</head>');

  const uiScript = `<script>
(function(){
  const icons={
    dashboard:'<path d="M3 3h7v7H3zM14 3h7v4h-7zM14 11h7v10h-7zM3 14h7v7H3z"/>',
    projects:'<path d="M4 5h16v15H4z"/><path d="M8 5V3h8v2M8 10h8M8 14h5"/>',
    companies:'<path d="M4 21V5l8-3 8 3v16M8 9h2M14 9h2M8 13h2M14 13h2M10 21v-4h4v4"/>',
    followups:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    meetings:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    users:'<circle cx="9" cy="8" r="3"/><path d="M3 20c.5-3.3 2.5-5 6-5s5.5 1.7 6 5M16 11c2.8 0 4.5 1.3 5 4"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    save:'<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>',
    logout:'<path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9"/>',
    close:'<path d="M6 6l12 12M18 6L6 18"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="M16 16l5 5"/>',
    filter:'<path d="M4 5h16M7 12h10M10 19h4"/>'
  };
  function svg(name){return '<svg class="emdad-icon" viewBox="0 0 24 24" aria-hidden="true">'+(icons[name]||icons.projects)+'</svg>';}
  function decorate(){
    const nav=document.getElementById('nav');
    if(nav) nav.querySelectorAll('button').forEach((b,i)=>{if(b.querySelector('.emdad-icon'))return;const names=['dashboard','projects','companies','followups','meetings','users'];const n=names[i];if(n)b.insertAdjacentHTML('afterbegin',svg(n));});
    document.querySelectorAll('.toolbar button').forEach(b=>{if(b.querySelector('.emdad-icon'))return;const t=(b.textContent||'').trim();let n=t.includes('خروج')?'logout':t.includes('Save')?'save':t.includes('بحث')?'search':t.startsWith('+')?'plus':t.includes('Close')?'close':null;if(n)b.insertAdjacentHTML('afterbegin',svg(n));});
    document.querySelectorAll('.sectionTitle button').forEach(b=>{if(!b.querySelector('.emdad-icon'))b.insertAdjacentHTML('afterbegin',svg('projects'));});
  }
  const obs=new MutationObserver(decorate);obs.observe(document.body,{childList:true,subtree:true});
  decorate();
  document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;b.animate([{transform:'scale(.985)'},{transform:'scale(1)'}],{duration:140,easing:'ease-out'});},{passive:true});
})();
</script>`;
  html = html.replace('</body>', uiScript + '</body>');

  return new Response(html,{status:200,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store, max-age=0'}});
}
