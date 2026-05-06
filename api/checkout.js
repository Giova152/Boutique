export default async function handler(request) {
  try {
    if (request.method === 'GET') {
      return new Response('API OK', { status: 200 });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Use POST' }), { status: 405 });
    }

    const { amount } = await request.json().catch(() => ({}));

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), { status: 400 });
    }

    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), { status: 500 });
    }

    const res = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `amount=${Math.round(amount * 100)}&currency=cad&automatic_payment_methods[enabled]=true`,
    });

    const data = await res.json();

    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ clientSecret: data.client_secret, paymentIntentId: data.id }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}