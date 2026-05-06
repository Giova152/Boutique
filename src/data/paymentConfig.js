export const paymentConfig = {
  stripe: {
    publishableKey: 'pk_live_51OwDrqHquq8rN1FFAHgsqOmSrwDxELKD2oI6eJxEGUsgqTrAh7g2GwGdfwRbTZgcVpFWl0gRon5MnNdR8pcVMPrz00agnh640A',
  },
  paypal: {
    clientId: ''
  }
};

export const isPaymentConfigured = () => {
  return paymentConfig.stripe.publishableKey !== '' && paymentConfig.paypal.clientId !== '';
};