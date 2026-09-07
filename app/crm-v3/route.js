export const dynamic = 'force-dynamic';

export async function GET() {
  const source = 'https://raw.githubusercontent.com/Walid-Mahmoudi/EMDAD-CRM-V2/main/crm-v3.html';
  const response = await fetch(source, { cache: 'no-store' });
  if (!response.ok) {
    return new Response('EMDAD CRM V3 is temporarily unavailable.', { status: 502 });
  }
  let html = await response.text();

  // The production app serves crm-v3.html through this route. Patch the
  // profile bootstrap here so the live route cannot fall back to "sales".
  const oldBoot = "let r=await db.from('profiles').select('*').eq('id',u.id).maybeSingle();me=r.data||{id:u.id,full_name:u.email,role:'sales'};";
  const newBoot = "let r=await db.rpc('get_my_profile');if(r.error||!r.data){console.error('Profile load failed',r.error);return msg('تعذر تحميل صلاحيات الحساب',true)}me=r.data;";
  html = html.replace(oldBoot, newBoot);

  // Admin-only user management: keep it injected at the serving layer so
  // the large legacy single-file CRM remains untouched.
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
