import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db';
import { generateToken } from '../utils/jwt';

// Load ENV credentials with secure, standard fallbacks
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

/**
 * Handles authentication for the system.
 * Supports static environment credentials as top-priority, falling back cleanly to the database.
 */
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    console.log(`[Auth Controller] Login attempt received for username: "${username}"`);

    if (!username || !password) {
      console.warn('[Auth Controller] Missing username or password in payload.');
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // 1. First Priority Check: Match against static environment credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      console.log('[Auth Controller] Static ENV Admin match detected. Generating token...');
      const token = generateToken({
        id: 1,
        username: ADMIN_USERNAME,
        role: 'admin'
      });

      return res.status(200).json({
        token,
        user: {
          id: 1,
          username: ADMIN_USERNAME,
          role: 'admin',
          name: 'System Admin (Config)'
        }
      });
    }

    // 2. Second Priority Check: Fallback to verification via database
    console.log('[Auth Controller] Verifying credentials from SQLite database...');
    const [users]: any = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    const user = users && users[0];

    if (!user) {
      console.warn(`[Auth Controller] Authentication failed: User "${username}" not found in database.`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`[Auth Controller] Authentication failed: Password mismatch for user "${username}".`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log(`[Auth Controller] Database credential match for user: "${user.username}". Generating token...`);
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role
    });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      }
    });

  } catch (error: any) {
    console.error('[Auth Controller] Critical error during login workflow:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message || error 
    });
  }
};

/**
 * Returns user profile info for authenticated requests.
 */
export const getProfile = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      console.warn('[Auth Controller] Profile request rejected: No authenticated user in request context.');
      return res.status(401).json({ error: 'Unauthorized profile request.' });
    }

    console.log('[Auth Controller] Serving profile for:', req.user.username);
    return res.status(200).json({ user: req.user });
  } catch (error) {
    console.error('[Auth Controller] Profile retrieval failed with error:', error);
    return res.status(500).json({ error: 'Internal server error while fetching profile.' });
  }
};
