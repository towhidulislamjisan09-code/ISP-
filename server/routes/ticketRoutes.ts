import { Router } from 'express';
import * as ticketController from '../controllers/ticketController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', ticketController.getAllTickets);
router.post('/', ticketController.createTicket);
router.get('/:id/replies', ticketController.getTicketReplies);
router.post('/:id/reply', ticketController.replyTicket);
router.patch('/:id/close', ticketController.closeTicket);

export default router;
