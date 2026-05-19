import { Request, Response } from 'express';
import { db } from '../config/db';

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const [counts]: any = await db.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'customer') as totalUsers,
        (SELECT COUNT(*) FROM users WHERE role = 'customer' AND status = 'Active') as activeUsers,
        (SELECT COUNT(*) FROM users WHERE role = 'customer' AND status = 'Suspended') as suspendedUsers,
        (SELECT IFNULL(SUM(amount), 0) FROM payments WHERE status = 'Approved') as totalRevenue,
        (SELECT IFNULL(SUM(total_due), 0) FROM users WHERE role = 'customer') as totalDue,
        (SELECT COUNT(*) FROM tickets WHERE status != 'Closed') as openTickets
    `);

    res.json({ data: counts[0] });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};
