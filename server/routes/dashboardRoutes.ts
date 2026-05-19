import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticateToken, authorizeAdmin, dashboardController.getAdminStats);

export default router;
