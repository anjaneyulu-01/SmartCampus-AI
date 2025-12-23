import bcrypt from 'bcrypt';
import crypto from 'crypto';

const SALT_ROUNDS = 10;

/**
 * Hash password using bcrypt
 * Returns { salt, hash }
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = bcrypt.hashSync(password, SALT_ROUNDS);
  return { salt, hash };
}

/**
 * Verify password against hash
 */
export function verifyPassword(password, salt, hash) {
  try {
    return bcrypt.compareSync(password, hash);
  } catch (error) {
    console.error('[ERROR] Password verification failed:', error);
    return false;
  }
}

