import { Request, Response } from 'express';
import { db } from '../config/db';

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'customer') as totalCustomers,
        (SELECT COUNT(*) FROM users WHERE role = 'customer' AND status = 'Active') as activeCustomers,
        (SELECT COUNT(*) FROM users WHERE role = 'customer' AND status = 'Suspended') as suspendedCustomers,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'Approved') as monthlyRevenue,
        (SELECT COALESCE(SUM(total_due), 0) FROM users WHERE role = 'customer') as unpaidBills,
        (SELECT COUNT(*) FROM tickets WHERE status != 'Closed') as openTickets
    `);

    const statsRow = (rows && rows[0]) ? rows[0] : {
      totalCustomers: 0,
      activeCustomers: 0,
      suspendedCustomers: 0,
      monthlyRevenue: 0,
      unpaidBills: 0,
      openTickets: 0
    };

    const statsPayload = {
      totalCustomers: Number(statsRow.totalCustomers || 0),
      activeCustomers: Number(statsRow.activeCustomers || 0),
      suspendedCustomers: Number(statsRow.suspendedCustomers || 0),
      monthlyRevenue: Number(statsRow.monthlyRevenue || 0),
      unpaidBills: Number(statsRow.unpaidBills || 0),
      openTickets: Number(statsRow.openTickets || 0),
      
      // Supporting front-end typed interface properties for backward compatibility
      totalUsers: Number(statsRow.totalCustomers || 0),
      activeUsers: Number(statsRow.activeCustomers || 0),
      suspendedUsers: Number(statsRow.suspendedCustomers || 0),
      totalRevenue: Number(statsRow.monthlyRevenue || 0),
      totalDue: Number(statsRow.unpaidBills || 0)
    };

    console.log('[getAdminStats] Returning aggregated metrics:', statsPayload);
    res.json({
      ...statsPayload,
      data: statsPayload
    });
  } catch (error) {
    console.error('[getAdminStats] Database error fetching analytics:', error);
    res.status(500).json({ error: 'Database error' });
  }
};
