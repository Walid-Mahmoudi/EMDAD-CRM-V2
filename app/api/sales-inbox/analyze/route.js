import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const schema = {
  type: 'OBJECT',
  properties: {
    summary: { type: 'STRING' },
    probability: { type: 'NUMBER' },
    company: { type: 'STRING' },
    contact: { type: 'STRING' },
    project: { type: 'STRING' },
    value: { type: 'NUMBER' },
    project_type: { type: 'STRING' }
  },
  required: ['summary','probability','company','contact','project','value','project_type']
};

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    if (!url || !serviceKey) return NextResponse.json({ error: 'Supabase server credentials are not configured.' }, { status: 500 });

    const input = await request.json();
    if (!input.id) return NextResponse.json({ error: 'Missing inbox record id.' }, { status: 400 });

    const prompt = `You are an HVAC B2B sales analyst for EMDAD Engineering Solutions. Analyze this incoming email and extract only factual or strongly implied sales information. Estimate opportunity probability from 0 to 100. Return empty strings/0 when unknown. Do not invent names, values, dates, or project details.\n\nSubject: ${input.subject || ''}\nSender: ${input.sender_name || ''} <${input.sender_email || ''}>\nBody:\n${String(input.body || '').slice(0, 30000)}`;

    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', responseSchema: schema, temperature: 0.1 } })
    });
    const aiJson = await aiResponse.json();
    if (!aiResponse.ok) return NextResponse.json({ error: aiJson?.error?.message || 'Gemini analysis failed.' }, { status: 502 });

    const text = aiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini returned no analysis.');
    const parsed = JSON.parse(text);
    const probability = Math.max(0, Math.min(100, Number(parsed.probability || 0)));

    const db = createClient(url, serviceKey);
    const { data: record, error } = await db.from('sales_inbox').update({ ai_status: 'Reviewing', ai_summary: String(parsed.summary || ''), ai_probability: probability, extracted_company: String(parsed.company || ''), extracted_contact: String(parsed.contact || ''), extracted_project: String(parsed.project || ''), extracted_value: Number(parsed.value || 0), extracted_project_type: String(parsed.project_type || '') }).eq('id', input.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ record });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unexpected analysis error.' }, { status: 500 });
  }
}
