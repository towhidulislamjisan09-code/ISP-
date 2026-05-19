import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export const authenticateToken = (req: any, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.warn('[Auth Middleware] Authentication rejected: No token provided.');
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    console.log('[Auth Middleware] Successfully authenticated user:', decoded.username);
    next();
  } catch (error: any) {
    console.error('[Auth Middleware] Token validation failed:', error.message || error);
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

export const authorizeAdmin = (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      console.warn('[Auth Middleware] Admin authorization failed: user context missing.');
      return res.status(401).json({ error: 'Unauthorized. Please authenticate first.' });
    }

    if (req.user.role !== 'admin') {
      console.warn(`[Auth Middleware] Admin authorization denied for user ${req.user.username} (Role: ${req.user.role})`);
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }

    console.log('[Auth Middleware] Admin authorization cleared for user:', req.user.username);
    next();
  } catch (error: any) {
    console.error('[Auth Middleware] Critical error in admin authorization middleware:', error);
    return res.status(500).json({ error: 'Internal server error during authorization verification.' });
  }
};
