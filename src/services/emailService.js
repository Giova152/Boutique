const FORMSPREE_ADMIN = 'mrejlbaa';
const FORMSPREE_CUSTOMER = 'xaqvdewp';

export async function sendInvoiceEmail(customerEmail, order) {
  const itemsList = order.items?.map(item =>
    `${item.name} x${item.quantity} — ${(parseFloat(item.price) * item.quantity).toFixed(2)}$`
  ).join('\n') || '';

  const emailContent = `
VEGE DERM - FACTURE #${order.id}

Date: ${new Date(order.date || Date.now()).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })}

===================================
INFORMATIONS CLIENT
===================================
${order.customer?.firstName || ''} ${order.customer?.lastName || ''}
${order.customer?.email || ''}
${order.customer?.phone || ''}

===================================
ADRESSE DE LIVRAISON
===================================
${order.customer?.address || ''}
${order.customer?.city || ''}, ${order.customer?.province || ''}
${order.customer?.postalCode || ''}

===================================
ARTICLES COMMANDÉS
===================================
${itemsList}

===================================
RÉCAPITULATIF
===================================
Sous-total: ${parseFloat(order.subtotal || 0).toFixed(2)}$
${order.promoCode ? `Code promo utilisé: ${order.promoCode}
` : ''}${order.discount > 0 ? `Réduction: -${parseFloat(order.discount).toFixed(2)}$

` : ''}Livraison: ${parseFloat(order.shipping || 0).toFixed(2)}$
------------------------------------
TOTAL: ${parseFloat(order.total || 0).toFixed(2)}$

===================================

Merci pour votre confiance!
VEGE DERM - Cosmétiques Naturels & Bio
www.vegederm.ca

Pour toute question, contactez-nous a zoumcosmo@gmail.com
  `.trim();

  const formData = new FormData();
  formData.append('email', customerEmail);
  formData.append('subject', `VEGE DERM - Facture #${order.id}`);
  formData.append('message', emailContent);

  try {
    await fetch(`https://formspree.io/f/${FORMSPREE_CUSTOMER}`, {
      method: 'POST',
      body: formData,
      mode: 'no-cors'
    });
    return true;
  } catch (error) {
    console.error('Erreur envoi facture:', error);
    return false;
  }
}

export async function sendStockRestockEmail(customerEmail, product) {
  const emailContent = `
Bonjour!

Bonne nouvelle! Le produit "${product.name}" est de retour en stock!

Ne tardez pas - les stocks sont limites!
Commandez maintenant: ${typeof window !== 'undefined' ? window.location.origin : ''}/boutique

L'equipe VEGE DERM
  `.trim();

  const formData = new FormData();
  formData.append('email', customerEmail);
  formData.append('subject', `Notification - "${product.name}" est de retour en stock!`);
  formData.append('message', emailContent);

  try {
    await fetch(`https://formspree.io/f/${FORMSPREE_CUSTOMER}`, {
      method: 'POST',
      body: formData,
      mode: 'no-cors'
    });
    return true;
  } catch (error) {
    console.error('Erreur envoi alerte stock:', error);
    return false;
  }
}

export async function sendAbandonedCartEmail(customerEmail, cartItems, cartUrl) {
  const itemsList = cartItems?.map(item =>
    `- ${item.name} x${item.quantity} (${parseFloat(item.price).toFixed(2)}$)`
  ).join('\n') || '';

  const emailContent = `
Bonjour,

Vous avez laisse des articles dans votre panier!

====================================
VOTRE PANIER
====================================
${itemsList}

====================================

Recuperez votre panier: ${cartUrl}

Offre speciale: Utilisez le code BIENVENUE15 pour obtenir 15% de reduction sur votre premiere commande!

L'equipe VEGE DERM
  `.trim();

  const formData = new FormData();
  formData.append('email', customerEmail);
  formData.append('subject', 'Votre panier VEGE DERM vous attend!');
  formData.append('message', emailContent);

  try {
    await fetch(`https://formspree.io/f/${FORMSPREE_CUSTOMER}`, {
      method: 'POST',
      body: formData,
      mode: 'no-cors'
    });
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
  ).join('\n');

  const emailContent = `
NOUVELLE COMMANDE - VEGEDERM

INFORMATIONS CLIENT:
-----------------
Nom: ${customer.firstName} ${customer.lastName}
Email: ${customer.email}
Telephone: ${customer.phone}

ADRESSE DE LIVRAISON:
-------------------
${customer.address}
${customer.city}, ${customer.province}
${customer.postalCode}

METHODE DE LIVRAISON: ${shippingMethod === 'express' ? 'Express (1-2 jours)' : 'Standard (3-5 jours)'}
METHODE DE PAIEMENT: ${paymentMethod === 'stripe' ? 'Stripe (Carte)' : 'PayPal'}

COMMANDES:
---------
${itemsList}

SOUS-TOTAL: ${subtotal.toFixed(2)}$
REDUCTION: -${discount.toFixed(2)}$
LIVRAISON: ${shipping.toFixed(2)}$
TOTAL: ${total.toFixed(2)}$

---
VEGEDERM - Cosmetiques Naturels & Bio
zoumcosmo@gmail.com
  `.trim();

  const formData = new FormData();
  formData.append('email', 'zoumcosmo@gmail.com');
  formData.append('subject', `Nouvelle commande de ${customer.firstName} ${customer.lastName} - ${total.toFixed(2)}$`);
  formData.append('message', emailContent);

  try {
    await fetch(`https://formspree.io/f/${FORMSPREE_ADMIN}`, {
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
    `- ${item.name} x${item.quantity}`
  ).join('\n');

  const emailContent = `
Merci pour votre commande!

Bonjour ${orderData.customer.firstName},

Votre commande a ete confirmee!

COMMANDES:
---------
${itemsList}

SOUS-TOTAL: ${subtotal.toFixed(2)}$
REDUCTION: -${discount.toFixed(2)}$
LIVRAISON: ${shipping.toFixed(2)}$
TOTAL: ${total.toFixed(2)}$

Mode de livraison: ${shippingMethod === 'express' ? 'Express (1-2 jours)' : 'Standard (3-5 jours)'}

Nous vous remercions de votre confiance!
L'equipe VEGEDERM

---
zoumcosmo@gmail.com
  `.trim();

  const formData = new FormData();
  formData.append('email', customerEmail);
  formData.append('subject', 'Confirmation de commande - VEGEDERM');
  formData.append('message', emailContent);

  try {
    await fetch(`https://formspree.io/f/${FORMSPREE_CUSTOMER}`, {
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

  const emailContent = `
${statusInfo.title}

Bonjour ${orderData.customer?.firstName || 'Client'},

${statusInfo.message}

Numero de commande: ${orderData.id}
Total: ${parseFloat(orderData.total).toFixed(2)}$

Merci pour votre confiance!
L'equipe VEGEDERM
  `.trim();

  const formData = new FormData();
  formData.append('email', customerEmail);
  formData.append('subject', `Commande ${orderData.id} - ${statusInfo.title}`);
  formData.append('message', emailContent);

  try {
    await fetch(`https://formspree.io/f/${FORMSPREE_CUSTOMER}`, {
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
