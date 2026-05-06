export const paymentConfig = {
  stripe: {
    publishableKey: '', // Ajouter ta clé Stripe publique ici
  },
  paypal: {
    clientId: '', // Ajouter ton client PayPal ici
  }
};

export const isPaymentConfigured = () => {
  return paymentConfig.stripe.publishableKey !== '' && paymentConfig.paypal.clientId !== '';
};