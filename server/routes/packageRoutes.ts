import { Router } from 'express';
import * as packageController from '../controllers/packageController';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, packageController.getAllPackages);
router.post('/', authenticateToken, authorizeAdmin, packageController.createPackage);
router.put('/:id', authenticateToken, authorizeAdmin, packageController.updatePackage);
router.delete('/:id', authenticateToken, authorizeAdmin, packageController.deletePackage);

export default router;
