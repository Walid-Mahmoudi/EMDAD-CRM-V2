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

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
