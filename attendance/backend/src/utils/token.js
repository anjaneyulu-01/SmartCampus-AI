import { v4 as uuidv4 } from 'uuid';

// In-memory token store (for demo - use Redis in production)
const TOKENS = new Map();

/**
 * Create a token for a username
 */
export function createToken(username) {
  const token = uuidv4().replace(/-/g, '');
  TOKENS.set(token, {
    username,
    createdAt: Date.now()
  });
  return token;
}

/**
 * Get username for a token
 */
export function getUsernameForToken(token) {
  const tokenData = TOKENS.get(token);
  if (!tokenData) {
    return null;
  }
  
  // Optional: expire tokens after 24 hours
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  if (Date.now() - tokenData.createdAt > maxAge) {
    TOKENS.delete(token);
    return null;
  }
  
  return tokenData.username;
}

/**
 * Remove a token
 */
export function removeToken(token) {
  TOKENS.delete(token);
}

/**
 * Clean up expired tokens (call periodically)
 */
export function cleanupExpiredTokens() {
  const maxAge = 24 * 60 * 60 * 1000;
  const now = Date.now();
  
  for (const [token, data] of TOKENS.entries()) {
    if (now - data.createdAt > maxAge) {
      TOKENS.delete(token);
    }
  }
}

// Clean up expired tokens every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

