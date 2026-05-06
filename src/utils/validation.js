export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>\"'&]/g, '').trim();
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePhone(phone) {
  const re = /^[\d\s\-\+\(\)]{10,}$/;
  return re.test(phone.replace(/\s/g, ''));
}

export function validatePostalCode(code, province) {
  const codes = {
    'Québec': /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/i,
    'Ontario': /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/i,
    'Colombie-Britannique': /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/i,
    'Alberta': /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/i,
    'Nouveau-Brunswick': /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/i,
    'Nova Scotia': /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/i,
    'Manitoba': /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/i,
    'Saskatchewan': /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/i,
  };
  const regex = codes[province] || /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/i;
  return regex.test(code);
}

export function validateCheckoutForm(shippingInfo) {
  const errors = {};
  
  if (!shippingInfo.firstName || shippingInfo.firstName.length < 2) {
    errors.firstName = 'Prénom requis (min 2 caractères)';
  }
  if (!shippingInfo.lastName || shippingInfo.lastName.length < 2) {
    errors.lastName = 'Nom requis (min 2 caractères)';
  }
  if (!validateEmail(shippingInfo.email)) {
    errors.email = 'Email invalide';
  }
  if (!shippingInfo.address || shippingInfo.address.length < 5) {
    errors.address = 'Adresse requise (min 5 caractères)';
  }
  if (!shippingInfo.city || shippingInfo.city.length < 2) {
    errors.city = 'Ville requise';
  }
  if (!validatePostalCode(shippingInfo.postalCode, shippingInfo.province)) {
    errors.postalCode = 'Code postal invalide';
  }
  if (shippingInfo.phone && !validatePhone(shippingInfo.phone)) {
    errors.phone = 'Téléphone invalide';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}