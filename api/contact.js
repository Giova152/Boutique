import { supabase } from '../src/lib/supabase';
import { sendContactNotification } from '../src/services/emailService';

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

    const { data, error } = await supabase
      .from('support_messages')
      .insert([{ name, email, message, status: 'new' }])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    try {
      await sendContactNotification(name, email, message);
    } catch (emailErr) {
      console.error('Email error:', emailErr);
    }

    return new Response(JSON.stringify({ success: true, data }), { status: 201 });
  } catch (e) {
    console.error('Handler error:', e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}