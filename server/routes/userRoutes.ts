import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';

const router = Router();

// All user routes require admin access
router.use(authenticateToken);
router.use(authorizeAdmin);

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.patch('/:id/status', userController.toggleUserStatus);
router.delete('/:id', userController.deleteUser);

export default router;
