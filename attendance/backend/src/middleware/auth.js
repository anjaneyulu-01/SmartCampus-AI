import { getUsernameForToken } from '../utils/token.js';
import { dbGet } from '../database/db.js';

/**
 * Authentication middleware
 * Expects Authorization header: "Bearer <token>"
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid Authorization format' });
    }
    
    const token = authHeader.split(' ')[1];
    const username = getUsernameForToken(token);
    
    if (!username) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Get user from database
    const user = await dbGet(
      'SELECT username, role, display_name, student_id, assigned_classes FROM users WHERE username = ?',
      [username]
    );
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Attach user to request
    req.user = {
      username: user.username,
      role: user.role,
      display_name: user.display_name,
      student_id: user.student_id,
      assigned_classes: user.assigned_classes
    };
    
    next();
  } catch (error) {
    console.error('[ERROR] Auth middleware:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Require specific role
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

