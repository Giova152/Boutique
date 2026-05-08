const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || 're_ZGjw8er8_4GEUJkSKd6JfiCG32DnX7zYp';

async function sendEmail(to, subject, html) {
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
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Email error:', error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Email send error:', e);
    return false;
  }
}

export async function sendWelcomeEmail(email, name) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; }
        .logo { font-size: 28px; font-weight: bold; color: #1d4e38; text-align: center; margin-bottom: 20px; }
        .logo span { color: #c9a86c; }
        h1 { color: #1d4e38; font-size: 24px; margin-bottom: 20px; }
        p { color: #555; line-height: 1.6; margin-bottom: 15px; }
        .btn { display: inline-block; background: #1d4e38; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">VEGE<span>DERM</span></div>
        <h1>Bienvenue ${name} !</h1>
        <p>Merci de votre inscription sur <strong>VEGE DERM</strong> - vos cosmétiques naturels préférés!</p>
        <p>Votre compte a été créé avec succès. Vous pouvez maintenant:</p>
        <ul>
          <li>Suivre vos commandes</li>
          <li>Sauvegarder vos produits préférés</li>
          <li>Gagner des points de fidélité</li>
          <li>Bénéficier d'offres exclusives</li>
        </ul>
        <p>Nous vous remercions de votre confiance!</p>
        <div class="footer">
          <p>VEGE DERM - Cosmétiques Naturels & Bio</p>
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, 'Bienvenue sur VEGE DERM! 🌿', html);
}

export async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${import.meta.env.VITE_APP_URL || 'https://vegederm229.vercel.app'}/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; }
        .logo { font-size: 28px; font-weight: bold; color: #1d4e38; text-align: center; margin-bottom: 20px; }
        .logo span { color: #c9a86c; }
        h1 { color: #1d4e38; font-size: 24px; margin-bottom: 20px; }
        p { color: #555; line-height: 1.6; margin-bottom: 15px; }
        .btn { display: inline-block; background: #1d4e38; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .warning { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; color: #856404; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">VEGE<span>DERM</span></div>
        <h1>Réinitialisation de mot de passe</h1>
        <p>Vous avez demandé la réinitialisation de votre mot de passe sur VEGE DERM.</p>
        <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe:</p>
        <a href="${resetUrl}" class="btn">Réinitialiser mon mot de passe</a>
        <div class="warning">
          <strong>⚠️ Important:</strong> Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
        </div>
        <div class="footer">
          <p>VEGE DERM - Cosmétiques Naturels & Bio</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, 'Réinitialisez votre mot de passe - VEGE DERM', html);
}

export async function sendEmailConfirmationEmail(email, confirmationToken) {
  const confirmUrl = `${import.meta.env.VITE_APP_URL || 'https://vegederm229.vercel.app'}/confirm-email?token=${confirmationToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; }
        .logo { font-size: 28px; font-weight: bold; color: #1d4e38; text-align: center; margin-bottom: 20px; }
        .logo span { color: #c9a86c; }
        h1 { color: #1d4e38; font-size: 24px; margin-bottom: 20px; }
        p { color: #555; line-height: 1.6; margin-bottom: 15px; }
        .btn { display: inline-block; background: #1d4e38; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">VEGE<span>DERM</span></div>
        <h1>Confirmez votre email</h1>
        <p>Merci de vous être inscrit sur VEGE DERM!</p>
        <p>Cliquez sur le bouton ci-dessous pour confirmer votre adresse email:</p>
        <a href="${confirmUrl}" class="btn">Confirmer mon email</a>
        <div class="footer">
          <p>VEGE DERM - Cosmétiques Naturels & Bio</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, 'Confirmez votre inscription - VEGE DERM', html);
}