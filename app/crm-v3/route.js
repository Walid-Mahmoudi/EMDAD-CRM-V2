export const dynamic = 'force-dynamic';

export async function GET() {
  const source = 'https://raw.githubusercontent.com/Walid-Mahmoudi/EMDAD-CRM-V2/main/crm-v3.html';
  const response = await fetch(source, { cache: 'no-store' });
  if (!response.ok) {
    return new Response('EMDAD CRM V3 is temporarily unavailable.', { status: 502 });
  }
  const html = await response.text();
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
