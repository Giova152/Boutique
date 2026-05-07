export const ADMIN_EMAILS = [
  'zoumcosmo@gmail.com',
  'midogiova@gmail.com'
];

export const isAdminEmail = (email) => {
  return ADMIN_EMAILS.includes(email);
};
