import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'shoktinet_super_secret_7gH5kP9sQ2LmX8';

export interface TokenPayload {
  id: string | number;
  username: string;
  role: string;
}

/**
 * Generates a verification JWT token for a given user payload.
 */
export function generateToken(payload: TokenPayload): string {
  try {
    console.log('[JWT] Generating token for payload:', payload);
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
  } catch (error) {
    console.error('[JWT] Error during token generation:', error);
    throw new Error('Failed to generate auth token');
  }
}

/**
 * Verifies and decodes a JWT token.
 */
export function verifyToken(token: string): TokenPayload {
  if (!token || token === 'null' || token === 'undefined' || typeof token !== 'string') {
    throw new Error('Access token is empty or malformed.');
  }
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    console.error('[JWT] Error verifying token:', error);
    throw error;
  }
}
