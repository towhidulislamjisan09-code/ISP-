import { Router } from 'express';
import * as customerController from '../controllers/customerController';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';

const router = Router();

// All customer routes require admin access
router.use(authenticateToken);
router.use(authorizeAdmin);

router.get('/', customerController.getAllCustomers);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.patch('/:id/status', customerController.suspendUser);
router.delete('/:id', customerController.deleteCustomer);

export default router;
