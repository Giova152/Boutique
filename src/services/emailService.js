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
    const response = await fetch('https://formspree.io/f/mrejlbaa', {
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
    const response = await fetch('https://formspree.io/f/mrejlbaa', {
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

export async function sendStatusUpdateEmail(customerEmail, orderData, newStatus) {
  const statusMessages = {
    'confirmée': {
      title: 'Votre commande est confirmée! ✅',
      message: 'Nous avons bien reçu votre paiement. Votre commande est en cours de préparation.'
    },
    'expéditée': {
      title: 'Votre commande a été expédiée! 📦',
      message: 'Votre colis est en route! Vous recevrez bientôt votre commande.'
    },
    'livrée': {
      title: 'Votre commande est livrée! 🎉',
      message: 'Votre commande a été livrée. Nous espérons que vous l\'aimez!'
    }
  };

  const statusInfo = statusMessages[newStatus] || { title: 'Mise à jour de commande', message: 'Le statut de votre commande a été mis à jour.' };

  const emailContent = `
${statusInfo.title}

Bonjour ${orderData.customer?.firstName || 'Client'},

${statusInfo.message}

Numéro de commande: ${orderData.id}
Total: ${parseFloat(orderData.total).toFixed(2)}$

Merci pour votre confiance!
L'équipe VEGEDERM 🌿
  `.trim();

  const formData = new FormData();
  formData.append('email', customerEmail);
  formData.append('subject', `Commande ${orderData.id} - ${statusInfo.title}`);
  formData.append('message', emailContent);

  try {
    await fetch('https://formspree.io/f/mrejlbaa', {
      method: 'POST',
      body: formData,
      mode: 'no-cors'
    });
    return true;
  } catch (error) {
    console.error('Erreur envoi notification statut:', error);
    return false;
  }
}