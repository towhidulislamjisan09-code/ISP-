import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'triangle-secret-key-2026';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // In a real scenario, we'd query the DB:
    // const [users]: any = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    // const user = users[0];

    // For the starter code, we accept a hardcoded admin for demonstration
    if (username === 'admin' && password === 'admin123') {
      const token = jwt.sign(
        { id: 1, username: 'admin', role: 'admin' },
        JWT_SECRET,
        { expiresIn: '8h' }
      );
      return res.json({ token, user: { username: 'admin', role: 'admin', name: 'System Admin' } });
    }

    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (req: any, res: Response) => {
  res.json({ user: req.user });
};
