import validator from 'validator';

export function validateEmail(email) {
  return validator.isEmail(email);
}

export function validateURL(url) {
  return validator.isURL(url);
}

export function validateTwitterHandle(handle) {
  return /^@?[A-Za-z0-9_]{1,15}$/.test(handle);
}

export function sanitizeInput(input) {
  return validator.trim(validator.escape(input));
}

export function validateAlertType(type) {
  const validTypes = ['testnet', 'nft', 'funding', 'launch', 'partnership'];
  return validTypes.includes(type);
}
