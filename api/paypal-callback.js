export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }

  const { code, error, error_description, state } = req.query;

  if (error) {
    const msg = error_description || error;
    return res.redirect('/admin?tab=settings&paypal_error=' + encodeURIComponent(msg));
  }

  if (!code) {
    return res.redirect('/admin?tab=settings&paypal_error=No authorization code received');
  }

  try {
    const adminUrl = process.env.SUPABASE_URL;
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!adminUrl || !adminKey) {
      return res.redirect('/admin?tab=settings&paypal_error=Server config missing');
    }

    const { data: settings } = await fetch(`${adminUrl}/rest/v1/admin_settings?id=eq.1&select=paypal_client_id,paypal_client_secret`, {
      headers: {
        'apikey': adminKey,
        'Authorization': `Bearer ${adminKey}`,
        'Content-Type': 'application/json'
      }
    }).then(r => r.json());

    const paypalClientId = settings?.[0]?.paypal_client_id;
    const paypalClientSecret = settings?.[0]?.paypal_client_secret;

    if (!paypalClientId || !paypalClientSecret) {
      return res.redirect('/admin?tab=settings&paypal_error=PayPal credentials not found. Please re-enter Client ID and Secret.');
    }

    const paypalMode = process.env.PAYPAL_MODE || 'sandbox';
    const baseUrl = paypalMode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    const redirectUri = `${req.headers.origin || 'https://vegederm229.vercel.app'}/api/paypal-callback`;

    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    if (!tokenResponse.ok) {
      const errData = await tokenResponse.json().catch(() => ({}));
      console.error('PayPal token exchange failed:', errData);
      return res.redirect('/admin?tab=settings&paypal_error=PayPal token exchange failed: ' + (errData.error_description || 'Unknown error'));
    }

    const tokens = await tokenResponse.json();

    if (tokens.access_token) {
      await fetch(`${adminUrl}/rest/v1/admin_settings`, {
        method: 'PATCH',
        headers: {
          'apikey': adminKey,
          'Authorization': `Bearer ${adminKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          paypal_client_id: paypalClientId,
          paypal_access_token: tokens.access_token,
          paypal_token_expiry: tokens.expires_in,
          paypal_token_issued: new Date().toISOString(),
          paypal_verified: true,
          paypal_mode: paypalMode,
          updated_at: new Date().toISOString()
        })
      });

      return res.redirect('/admin?tab=settings&paypal_success=true');
    } else {
      return res.redirect('/admin?tab=settings&paypal_error=No access token received from PayPal');
    }
  } catch (err) {
    console.error('PayPal callback error:', err);
    return res.redirect('/admin?tab=settings&paypal_error=Server error: ' + err.message);
  }
}
