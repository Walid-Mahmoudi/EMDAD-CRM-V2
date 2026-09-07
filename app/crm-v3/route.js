export const dynamic = 'force-dynamic';

export async function GET() {
  const source = 'https://raw.githubusercontent.com/Walid-Mahmoudi/EMDAD-CRM-V2/main/crm-v3.html';
  const response = await fetch(source, { cache: 'no-store' });
  if (!response.ok) {
    return new Response('EMDAD CRM V3 is temporarily unavailable.', { status: 502 });
  }
  let html = await response.text();

  // Always load the authenticated profile from the SECURITY DEFINER RPC.
  // Never silently downgrade an authenticated user to the sales role.
  const oldBoot = "let r=await db.from('profiles').select('*').eq('id',u.id).maybeSingle();me=r.data||{id:u.id,full_name:u.email,role:'sales'};";
  const newBoot = "let r=await db.rpc('get_my_profile');if(r.error||!r.data){let rr=await db.rpc('get_my_role');if(rr.error||!rr.data){console.error('Profile load failed',r.error,rr.error);return msg('تعذر تحميل صلاحيات الحساب. تواصل مع المدير.',true)}me={id:u.id,full_name:u.email,role:rr.data}}else me=r.data;";
  html = html.replace(oldBoot, newBoot);

  // EMDAD corporate visual system: red / charcoal / white, clean typography,
  // stronger hierarchy, mobile-friendly controls, and polished tables/cards.
  const stylePatch = `<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
:root{--red:#c83535;--red2:#a92727;--dark:#20252b;--dark2:#2c333b;--bg:#f5f6f8;--muted:#6b7280;--line:#e4e7eb;--white:#fff;--shadow:0 10px 30px rgba(32,37,43,.08)}
*{box-sizing:border-box}body{font-family:Inter,Arial,Tahoma,sans-serif;background:linear-gradient(180deg,#f7f8fa 0%,#f1f3f5 100%);color:var(--dark)}
button{border-radius:10px;padding:10px 15px;background:linear-gradient(135deg,var(--red),var(--red2));box-shadow:0 5px 14px rgba(200,53,53,.18);transition:.18s;font-family:inherit}button:hover{transform:translateY(-1px);filter:brightness(1.03)}button.secondary{background:#fff;color:var(--dark);border:1px solid var(--line);box-shadow:none}button.danger{background:#7f1d1d}.top{background:linear-gradient(135deg,#1c2127,#303740);padding:14px 24px;box-shadow:0 4px 20px rgba(0,0,0,.12)}.brand{letter-spacing:.2px}.brand:before{content:'◉ ';color:var(--red)}
.wrap{max-width:1500px;padding:22px}.nav{gap:7px;padding:8px;background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:var(--shadow)}.nav button{border:0;background:transparent;color:#4b5563;box-shadow:none}.nav button:hover{background:#f6f7f8;transform:none}.nav button.on{background:var(--dark);color:#fff;box-shadow:0 5px 14px rgba(32,37,43,.14)}
.card{border:1px solid var(--line);border-radius:16px;padding:18px;box-shadow:var(--shadow)}.kpi{position:relative;overflow:hidden}.kpi:before{content:'';position:absolute;right:0;top:0;width:5px;height:100%;background:var(--red)}.kpi h2{font-size:24px;letter-spacing:-.4px}.toolbar h2{font-weight:800}.sectionTitle h3{font-weight:800}input,select,textarea{border-color:#d8dde3;border-radius:10px;outline:none;transition:.15s;font-family:inherit}input:focus,select:focus,textarea:focus{border-color:var(--red);box-shadow:0 0 0 3px rgba(200,53,53,.10)}label{color:#374151}th{background:#f4f5f7;color:#374151;font-weight:700}tr.click:hover{background:#fff5f5}.badge{font-weight:600}.auth{background:radial-gradient(circle at 50% 15%,#3a424b 0,#20252b 45%,#161a1f 100%)}.authbox{border:0;box-shadow:0 25px 70px rgba(0,0,0,.35);padding:28px}.authbox h1{font-weight:800;letter-spacing:-1px}.authbox h1:before{content:'EMDAD';display:block;font-size:13px;letter-spacing:3px;color:var(--red);margin-bottom:8px}.modalbox{box-shadow:0 25px 70px rgba(0,0,0,.28);border:1px solid var(--line)}
@media(max-width:520px){.wrap{padding:9px}.top{padding:12px 14px}.brand{font-size:17px}.nav{border-radius:12px;padding:5px}.nav button{padding:8px 10px;font-size:12px}.card{padding:13px}.toolbar>*{max-width:100%;width:100%}.toolbar .right{display:none}.grid{gap:8px}.kpi h2{font-size:20px}.authbox{padding:22px}}
</style>`;
html = html.replace('</head>', stylePatch + '</head>');

  // Admin-only user management. Keep it injected at the serving layer so the
  // large legacy single-file CRM stays stable while adding the admin screen.
  const oldNav = "let items=[['dashboard','Dashboard'],['projects','Projects'],['companies','Customers'],['followups','Follow-ups'],['meetings','Meetings']];";
  const newNav = "let items=[['dashboard','Dashboard'],['projects','Projects'],['companies','Customers'],['followups','Follow-ups'],['meetings','Meetings']];if(isAdmin())items.push(['users','Users']);";
  html = html.replace(oldNav, newNav);

  const marker = "function go(p){state.page=p;nav();({dashboard:dashboard,projects:projects,companies:companiesPage,followups:followupsPage,meetings:meetingsPage}[p]||dashboard)()}";
  const replacement = `async function usersPage(){if(!isAdmin())return dashboard();let r=await db.rpc('admin_list_profiles');if(r.error)return pageError(r.error);let rows=r.data||[];$('page').innerHTML=\`<div class="toolbar"><h2>User Management</h2><span class="right"></span></div><div class="card"><div class="hint">Admin only — manage role, active status and user details.</div><div class="tablewrap"><table><tr><th>Name</th><th>Phone</th><th>Role</th><th>Status</th><th>Created</th><th></th></tr>\${rows.map(x=>\`<tr><td><input id="un-\${x.id}" value="\${esc(x.full_name)}"></td><td><input id="up-\${x.id}" value="\${esc(x.phone)}"></td><td><select id="ur-\${x.id}">\${['admin','sales','technical_support','management'].map(z=>\`<option value="\${z}" \${x.role===z?'selected':''}>\${z}</option>\`).join('')}</select></td><td><select id="ua-\${x.id}"><option value="true" \${x.is_active?'selected':''}>Active</option><option value="false" \${!x.is_active?'selected':''}>Inactive</option></select></td><td>\${dt(x.created_at)}</td><td><button onclick="saveUserProfile('\\${x.id}')">Save</button></td></tr>\`).join('')}</table></div></div>\`}
async function saveUserProfile(id){if(!isAdmin())return;let r=await db.rpc('admin_update_profile',{p_id:id,p_role:$('ur-'+id).value,p_is_active:$('ua-'+id).value==='true',p_full_name:$('un-'+id).value,p_phone:$('up-'+id).value});if(r.error)return alert(r.error.message);usersPage()}
${marker.replace("meetings:meetingsPage", "meetings:meetingsPage,users:usersPage")}`;
  html = html.replace(marker, replacement);

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
