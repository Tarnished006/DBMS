import crypto from 'crypto';

/**
 * Creates SHA-256 hash of a token string.
 * Used for storing refresh tokens, password reset tokens, email verification tokens, and OTPs.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

/**
 * Generates a cryptographically secure URL-safe random string.
 */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generates a 6-digit numeric OTP.
 */
export function generateNumericOtp(digits = 6): string {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}
