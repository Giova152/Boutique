const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || 're_ZGjw8er8_4GEUJkSKd6JfiCG32DnX7zYp';

async function sendEmailViaResend(to, subject, html) {
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
    throw new Error(error.message);
  }
  
  return response.json();
}

export async function sendInvoiceEmail(customerEmail, order) {
  const itemsList = order.items?.map(item =>
    `${item.name} x${item.quantity} — ${(parseFloat(item.price) * item.quantity).toFixed(2)}$`
  ).join('<br>') || '';

  const html = `
    <h2>VEGE DERM - FACTURE #${order.id}</h2>
    <p><strong>Date:</strong> ${new Date(order.date || Date.now()).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    
    <h3>INFORMATIONS CLIENT</h3>
    <p>${order.customer?.firstName || ''} ${order.customer?.lastName || ''}<br>
    ${order.customer?.email || ''}<br>
    ${order.customer?.phone || ''}</p>
    
    <h3>ADRESSE DE LIVRAISON</h3>
    <p>${order.customer?.address || ''}<br>
    ${order.customer?.city || ''}, ${order.customer?.province || ''}<br>
    ${order.customer?.postalCode || ''}</p>
    
    <h3>ARTICLES COMMANDÉS</h3>
    <p>${itemsList}</p>
    
    <h3>RÉCAPITULATIF</h3>
    <p><strong>Sous-total:</strong> ${parseFloat(order.subtotal || 0).toFixed(2)}$</p>
    ${order.promoCode ? `<p><strong>Code promo utilisé:</strong> ${order.promoCode}</p>` : ''}
    <p><strong>Frais de livraison:</strong> ${parseFloat(order.shipping || 0).toFixed(2)}$</p>
    <p><strong>Total:</strong> <strong>${parseFloat(order.total || 0).toFixed(2)}$</strong></p>
    
    <p style="margin-top: 30px; font-size: 12px; color: #666;">
      VEGE DERM - Cosmétiques Naturels & Bio au Canada<br>
      Merci pour votre confiance!
    </p>
  `;
  
  return sendEmailViaResend(customerEmail, `Facture #${order.id} - VEGE DERM`, html);
}

export async function sendConfirmationEmail(customerEmail, order) {
  const itemsList = order.items?.map(item =>
    `${item.name} x${item.quantity}`
  ).join(', ');

  const html = `
    <h2>VEGE DERM - CONFIRMATION DE COMMANDE</h2>
    <p>Bonjour ${order.customer?.firstName || ''},</p>
    <p>Votre commande a été confirmée!</p>
    <p><strong>Commande #${order.id}</strong></p>
    <p>Articles: ${itemsList}</p>
    <p><strong>Total:</strong> ${parseFloat(order.total || 0).toFixed(2)}$</p>
    
    <p>Nous vous tiendrons informé de l'avancement de votre livraison.</p>
    
    <p>L'équipe VEGE DERM 🌿</p>
  `;
  
  return sendEmailViaResend(customerEmail, `Commande confirmée #${order.id} - VEGE DERM`, html);
}

export async function sendOrderEmail(customerEmail, order) {
  return sendConfirmationEmail(customerEmail, order);
}

export async function sendStatusUpdateEmail(customerEmail, order, status) {
  const statusInfo = {
    'en cours': { title: 'En attente de paiement', color: '#f39c12' },
    'confirmée': { title: 'Confirmée', color: '#3498db' },
    'expéditée': { title: 'Expédiée', color: '#9b59b6' },
    'livrée': { title: 'Livrée', color: '#27ae60' }
  }[status] || { title: status, color: '#666' };

  const html = `
    <h2>VEGE DERM - MISE À JOUR DE COMMANDE</h2>
    <p>Bonjour,</p>
    <p>Votre commande <strong>#${order.id}</strong> est maintenant: <strong style="color: ${statusInfo.color}">${statusInfo.title}</strong></p>
    
    ${status === 'expéditée' ? `
      <p>Votre colis est en route! Vous pouvez suivre la livraison.</p>
    ` : ''}
    
    ${status === 'livrée' ? `
      <p>Votre commande a été livrée!</p>
      <p>Merci de nous donner votre avis sur les produits.</p>
    ` : ''}
    
    <p>L'équipe VEGE DERM 🌿</p>
  `;
  
  return sendEmailViaResend(customerEmail, `Commande ${order.id} - ${statusInfo.title}`, html);
}

export async function sendStockRestockEmail(adminEmail, product) {
  const html = `
    <h2>VEGE DERM - ALERTE STOCK</h2>
    <p>Le produit <strong>${product.name}</strong> est presque épuisé.</p>
    <p>Stock actuel: ${product.in_stock}</p>
    <p>Veuillez vérifier et réapprovisionner.</p>
  `;
  
  return sendEmailViaResend(adminEmail, `Alerte stock: ${product.name}`, html);
}

export async function sendDeliveryReviewEmail(customerEmail, order) {
  const reviewLink = `${import.meta.env.VITE_APP_URL || 'https://vegederm229.vercel.app'}/review/${order.id}`;
  
  const itemsList = order.items?.map(item => 
    `<li>${item.name} x${item.quantity}</li>`
  ).join('') || '';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1a5c3a;">VEGE DERM - Merci pour votre commande!</h2>
      
      <p>Bonjour,</p>
      <p>Nous espérons que vous êtes satisfait de votre commande!<br>
      Votre colis a été livré et nous aimerions connaître votre avis sur les produits que vous avez achetés.</p>
      
      <h3 style="color: #1a5c3a;">Produits commandés:</h3>
      <ul>${itemsList}</ul>
      
      <p>Cliquez sur le bouton ci-dessous pour donner votre avis:</p>
      
      <a href="${reviewLink}" style="display: inline-block; background: #1a5c3a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
        Donner mon avis
      </a>
      
      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        Votre avis nous aide à améliorer nos produits et à mieux servir nos clients.
      </p>
      
      <p style="margin-top: 20px;">L'équipe VEGE DERM 🌿</p>
    </div>
  `;
  
  return sendEmailViaResend(customerEmail, 'Votre avis sur VEGE DERM - Produits reçus', html);
}

export async function sendContactNotification(name, email, message) {
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
      
      <p style="color: #666; font-size: 14px;">
        Connectez-vous au panneau admin pour répondre: 
        <a href="${import.meta.env.VITE_APP_URL || 'https://vegederm229.vercel.app'}/admin" style="color: #1a5c3a;">
          Voir dans Admin
        </a>
      </p>
    </div>
  `;
  
  return sendEmailViaResend(['zoumcosmo@gmail.com', 'midogiova@gmail.com'], `Nouveau contact de ${name}`, html);
}