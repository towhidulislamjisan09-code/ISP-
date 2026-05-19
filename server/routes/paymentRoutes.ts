import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', authorizeAdmin, paymentController.getAllPayments);
router.post('/submit', paymentController.submitPayment);
router.patch('/:id/verify', authorizeAdmin, paymentController.verifyPayment);

export default router;
