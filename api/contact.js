const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ivmjlizqwwcjvizyoryi.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bWpsaXpxd3djanZpenlvcnlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNjQ2MDcsImV4cCI6MjA5MzY0MDYwN30.W0GxJKViQIOTvuGc99KEEGT9VL9GafwLUlD06s2DhiY';
const RESEND_API_KEY = process.env.VITE_RESEND_API_KEY || 're_ZGjw8er8_4GEUJkSKd6JfiCG32DnX7zYp';
const ADMIN_EMAILS = ['zoumcosmo@gmail.com', 'midogiova@gmail.com'];

async function sendEmailViaResend(to, subject, html) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'VEGE DERM <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html
      })
    });
    return response.ok;
  } catch (e) {
    console.error('Email error:', e);
    return false;
  }
}

export default async function handler(request) {
  try {
    if (request.method === 'GET') {
      return new Response(JSON.stringify({ status: 'OK' }), { status: 200 });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Use POST' }), { status: 405 });
    }

    const { name, email, message } = await request.json().catch(() => ({}));

    if (!name || name.length < 2) {
      return new Response(JSON.stringify({ error: 'Nom invalide' }), { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Email invalide' }), { status: 400 });
    }
    if (!message || message.length < 10) {
      return new Response(JSON.stringify({ error: 'Message trop court' }), { status: 400 });
    }

    // Save to Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/support_messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify([{
        name,
        email,
        message,
        status: 'new'
      }])
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Supabase error:', errText);
      return new Response(JSON.stringify({ error: 'Erreur base de données' }), { status: 500 });
    }

    // Send email notification
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a5c3a;">📬 Nouveau message de contact - VEGEDERM</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Nom:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      </div>
    `;

    for (const adminEmail of ADMIN_EMAILS) {
      await sendEmailViaResend(adminEmail, `Nouveau contact de ${name}`, html);
    }

    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (e) {
    console.error('Handler error:', e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}