import { Router } from 'express';
import * as billingController from '../controllers/billingController';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', billingController.getAllBills);
router.post('/generate', authorizeAdmin, billingController.generateMonthlyBills);
router.patch('/:id/pay', authorizeAdmin, billingController.markBillAsPaid);

export default router;
