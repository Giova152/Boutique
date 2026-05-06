export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, email } = body;

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), { status: 400 });
    }

    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return new Response(JSON.stringify({ error: 'Stripe not configured on server' }), { status: 500 });
    }

    const stripeRes = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'amount': Math.round(amount * 100),
        'currency': 'cad',
        'receipt_email': email || '',
        'automatic_payment_methods[enabled]': 'true',
      }),
    });

    const paymentIntent = await stripeRes.json();

    if (paymentIntent.error) {
      return new Response(JSON.stringify({ error: paymentIntent.error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id 
    }), { status: 200 });
  } catch (error) {
    console.error('Stripe error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}