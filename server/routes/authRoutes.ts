import { Router } from 'express';
import { login, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Route for authenticating users
router.post('/login', login);

// Route for obtaining currently logged-in user profile metrics
router.get('/profile', authenticateToken, getProfile);

export default router;
