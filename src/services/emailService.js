export async function sendOrderEmail(orderData) {
  const { customer, items, total, subtotal, discount, shipping, shippingMethod, paymentMethod } = orderData;
  
  const itemsList = items.map(item => 
    `${item.name} x${item.quantity} — ${(item.price * item.quantity).toFixed(2)}$`
  ).join('\n');

  const emailContent = `
🎉 NOUVELLE COMMANDE - VEGEDERM

INFORMATIONS CLIENT:
-----------------
Nom: ${customer.firstName} ${customer.lastName}
Email: ${customer.email}
Téléphone: ${customer.phone}

ADRESSE DE LIVRAISON:
-------------------
${customer.address}
${customer.city}, ${customer.province}
${customer.postalCode}

MÉTHODE DE LIVRAISON: ${shippingMethod === 'express' ? 'Express (1-2 jours)' : 'Standard (3-5 jours)'}
MÉTHODE DE PAIEMENT: ${paymentMethod === 'stripe' ? 'Stripe (Carte)' : 'PayPal'}

COMMANDES:
---------
${itemsList}

SOUS-TOTAL: ${subtotal.toFixed(2)}$
RÉDUCTION: -${discount.toFixed(2)}$
LIVRAISON: ${shipping.toFixed(2)}$
TOTAL: ${total.toFixed(2)}$

---
VEGEDERM - Cosmétiques Naturels & Bio
zoumcosmo@gmail.com
  `.trim();

  const formData = new FormData();
  formData.append('email', 'zoumcosmo@gmail.com');
  formData.append('subject', `🔥 Nouvelle commande de ${customer.firstName} ${customer.lastName} - ${total.toFixed(2)}$`);
  formData.append('message', emailContent);

  try {
    const response = await fetch('https://formspree.io/f/xpwzgvjq', {
      method: 'POST',
      body: formData,
      mode: 'no-cors'
    });
    return true;
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return false;
  }
}

export async function sendConfirmationEmail(customerEmail, orderData) {
  const { items, total, subtotal, discount, shipping, shippingMethod } = orderData;
  
  const itemsList = items.map(item => 
    `• ${item.name} x${item.quantity}`
  ).join('\n');

  const emailContent = `
Merci pour votre commande! 🌿

Bonjour ${orderData.customer.firstName},

Votre commande a été confirmée!

COMMANDES:
---------
${itemsList}

SOUS-TOTAL: ${subtotal.toFixed(2)}$
RÉDUCTION: -${discount.toFixed(2)}$
LIVRAISON: ${shipping.toFixed(2)}$
TOTAL: ${total.toFixed(2)}$

Mode de livraison: ${shippingMethod === 'express' ? 'Express (1-2 jours)' : 'Standard (3-5 jours)'}

Nous vous remercions de votre confiance!
L'équipe VEGEDERM

---
zoumcosmo@gmail.com
  `.trim();

  const formData = new FormData();
  formData.append('email', customerEmail);
  formData.append('subject', 'Confirmation de commande - VEGEDERM');
  formData.append('message', emailContent);

  try {
    const response = await fetch('https://formspree.io/f/xpwzgvjq', {
      method: 'POST',
      body: formData,
      mode: 'no-cors'
    });
    return true;
  } catch (error) {
    console.error('Erreur envoi confirmation:', error);
    return false;
  }
}