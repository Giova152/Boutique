export const storeConfig = {
  name: 'VEGEDERM',
  tagline: 'Cosmétiques Naturels & Bio',
  description: 'Cosmétiques biologiques conçus pour votre peau. L\'excellence du naturel pour votre beauté quotidienne.',
  phone: '+1 514-264-5963',
  email: 'zoumcosmo@gmail.com',
  address: '123 Rue de la Nature, Montréal, QC H2X 1A1',
  hours: {
    weekdays: '9h00 - 18h00',
    saturday: '10h00 - 16h00'
  },
  social: {
    facebook: 'https://facebook.com/vegederm',
    instagram: 'https://instagram.com/vegederm',
    tiktok: 'https://tiktok.com/@vegederm'
  },
  shipping: {
    freeThreshold: 75,
    standardPrice: 9.99,
    expressPrice: 19.99
  }
};

export const promoCodes = {
  'VEGEDERM10': { type: 'percentage', value: 10, description: '10% de réduction' },
  'FREESHIP': { type: 'shipping', value: 0, description: 'Livraison gratuite' },
  'BIENVENUE15': { type: 'percentage', value: 15, description: '15% pour les nouveaux clients' }
};