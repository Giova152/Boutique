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
    ${order.discount > 0 ? `<p><strong>Réduction:</strong> -${parseFloat(order.discount).toFixed(2)}$</p>` : ''}
    <p><strong>Livraison:</strong> ${parseFloat(order.shipping || 0).toFixed(2)}$</p>
    <hr>
    <p><strong>TOTAL: ${parseFloat(order.total || 0).toFixed(2)}$</strong></p>
    
    <p style="margin-top: 30px;">Merci pour votre confiance!<br>
    <strong>VEGE DERM</strong> - Cosmétiques Naturels & Bio<br>
    www.vegederm.ca<br>
    Contact: zoumcosmo@gmail.com</p>
  `;

  try {
    await sendEmailViaResend(customerEmail, `VEGE DERM - Facture #${order.id}`, html);
    return true;
  } catch (error) {
    console.error('Erreur envoi facture:', error);
    return false;
  }
}

export async function sendStockRestockEmail(customerEmail, product) {
  const html = `
    <h2>Bonne nouvelle!</h2>
    <p>Le produit "${product.name}" est de retour en stock!</p>
    <p>Ne tardez pas - les stocks sont limits!</p>
    <p><a href="${typeof window !== 'undefined' ? window.location.origin : ''}/boutique">Commandez maintenant</a></p>
    <p>L'equipe VEGE DERM</p>
  `;

  try {
    await sendEmailViaResend(customerEmail, `Notification - "${product.name}" est de retour en stock!`, html);
    return true;
  } catch (error) {
    console.error('Erreur envoi alerte stock:', error);
    return false;
  }
}

export async function sendAbandonedCartEmail(customerEmail, cartItems, cartUrl) {
  const itemsList = cartItems?.map(item =>
    `- ${item.name} x${item.quantity} (${parseFloat(item.price).toFixed(2)}$)`
  ).join('<br>') || '';

  const html = `
    <h2>Vous avez laisse des articles dans votre panier!</h2>
    <h3>VOTRE PANIER</h3>
    <p>${itemsList}</p>
    <p><a href="${cartUrl}">Recuperez votre panier</a></p>
    <p><strong>Offre speciale:</strong> Utilisez le code BIENVENUE15 pour obtenir 15% de reduction sur votre premiere commande!</p>
    <p>L'equipe VEGE DERM</p>
  `;

  try {
    await sendEmailViaResend(customerEmail, 'Votre panier VEGE DERM vous attend!', html);
    return true;
  } catch (error) {
    console.error('Erreur envoi panier abandonne:', error);
    return false;
  }
}

export async function sendOrderEmail(orderData) {
  const { customer, items, total, subtotal, discount, shipping, shippingMethod, paymentMethod } = orderData;

  const itemsList = items.map(item =>
    `${item.name} x${item.quantity} -- ${(item.price * item.quantity).toFixed(2)}$`
  ).join('<br>');

  const html = `
    <h2>Nouvelle commande - VEGEDERM</h2>
    <h3>INFORMATIONS CLIENT</h3>
    <p><strong>Nom:</strong> ${customer.firstName} ${customer.lastName}<br>
    <strong>Email:</strong> ${customer.email}<br>
    <strong>Telephone:</strong> ${customer.phone}</p>
    
    <h3>ADRESSE DE LIVRAISON</h3>
    <p>${customer.address}<br>
    ${customer.city}, ${customer.province}<br>
    ${customer.postalCode}</p>
    
    <p><strong>Methode de livraison:</strong> ${shippingMethod === 'express' ? 'Express (1-2 jours)' : 'Standard (3-5 jours)'}<br>
    <strong>Methode de paiement:</strong> ${paymentMethod === 'stripe' ? 'Stripe (Carte)' : 'PayPal'}</p>
    
    <h3>COMMANDES</h3>
    <p>${itemsList}</p>
    
    <p><strong>Sous-total:</strong> ${subtotal.toFixed(2)}$<br>
    <strong>Reduction:</strong> -${discount.toFixed(2)}$<br>
    <strong>Livraison:</strong> ${shipping.toFixed(2)}$<br>
    <strong>TOTAL:</strong> ${total.toFixed(2)}$</p>
    
    <p>---<br>
    VEGEDERM - Cosmetiques Naturels & Bio<br>
    zoumcosmo@gmail.com</p>
  `;

  try {
    await sendEmailViaResend('zoumcosmo@gmail.com', `Nouvelle commande de ${customer.firstName} ${customer.lastName} - ${total.toFixed(2)}$`, html);
    return true;
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return false;
  }
}

export async function sendConfirmationEmail(customerEmail, orderData) {
  const { items, total, subtotal, discount, shipping, shippingMethod } = orderData;

  const itemsList = items.map(item =>
    `- ${item.name} x${item.quantity}`
  ).join('<br>');

  const html = `
    <h2>Merci pour votre commande!</h2>
    <p>Bonjour ${orderData.customer.firstName},</p>
    <p>Votre commande a ete confirmee!</p>
    
    <h3>COMMANDES</h3>
    <p>${itemsList}</p>
    
    <p><strong>Sous-total:</strong> ${subtotal.toFixed(2)}$<br>
    <strong>Reduction:</strong> -${discount.toFixed(2)}$<br>
    <strong>Livraison:</strong> ${shipping.toFixed(2)}$<br>
    <strong>TOTAL:</strong> ${total.toFixed(2)}$</p>
    
    <p>Mode de livraison: ${shippingMethod === 'express' ? 'Express (1-2 jours)' : 'Standard (3-5 jours)'}</p>
    
    <p>Nous vous remercions de votre confiance!<br>
    L'equipe VEGEDERM</p>
  `;

  try {
    await sendEmailViaResend(customerEmail, 'Confirmation de commande - VEGEDERM', html);
    return true;
  } catch (error) {
    console.error('Erreur envoi confirmation:', error);
    return false;
  }
}

export async function sendStatusUpdateEmail(customerEmail, orderData, newStatus) {
  const statusMessages = {
    'confirmee': {
      title: 'Votre commande est confirmee!',
      message: 'Nous avons bien recu votre paiement. Votre commande est en cours de preparation.'
    },
    'expeditee': {
      title: 'Votre commande a ete expediee!',
      message: 'Votre colis est en route! Vous recevrez bientot votre commande.'
    },
    'livree': {
      title: 'Votre commande est livree!',
      message: 'Votre commande a ete livree. Nous esperons que vous l\'aimez!'
    }
  };

  const statusInfo = statusMessages[newStatus] || { title: 'Mise a jour de commande', message: 'Le statut de votre commande a ete mis a jour.' };

  const html = `
    <h2>${statusInfo.title}</h2>
    <p>Bonjour ${orderData.customer?.firstName || 'Client'},</p>
    <p>${statusInfo.message}</p>
    <p><strong>Numero de commande:</strong> ${orderData.id}<br>
    <strong>Total:</strong> ${parseFloat(orderData.total).toFixed(2)}$</p>
    <p>Merci pour votre confiance!<br>
    L'equipe VEGEDERM</p>
  `;

  try {
    await sendEmailViaResend(customerEmail, `Commande ${orderData.id} - ${statusInfo.title}`, html);
    return true;
  } catch (error) {
    console.error('Erreur envoi notification statut:', error);
    return false;
  }
}