import { Request, Response } from 'express';
import { db } from '../config/db';

export const getAdminStats = async (req: Request, res: Response) => {
  const runQuery = async (query: string, fallback: number): Promise<number> => {
    try {
      const [rows]: any = await db.execute(query);
      if (rows && rows.length > 0) {
        const firstKey = Object.keys(rows[0])[0];
        return Number(rows[0][firstKey] ?? fallback);
      }
      return fallback;
    } catch (err) {
      console.error(`[DashboardStats] Individual query error context for "${query}":`, err);
      return fallback;
    }
  };

  try {
    const [
      totalCustomers,
      activeCustomers,
      suspendedCustomers,
      monthlyRevenue,
      unpaidBills,
      openTickets
    ] = await Promise.all([
      runQuery("SELECT COUNT(*) AS total FROM users", 0),
      runQuery("SELECT COUNT(*) AS active FROM users WHERE status='Active'", 0),
      runQuery("SELECT COUNT(*) AS suspended FROM users WHERE status='Suspended'", 0),
      runQuery("SELECT IFNULL(SUM(amount),0) AS revenue FROM payments", 0),
      runQuery("SELECT COUNT(*) AS unpaid FROM bills WHERE status='Unpaid'", 0),
      runQuery("SELECT COUNT(*) AS open FROM tickets WHERE status='Open'", 0)
    ]);

    const stats = {
      totalCustomers,
      activeCustomers,
      suspendedCustomers,
      monthlyRevenue,
      unpaidBills,
      openTickets,
      
      // Legacy support values for older frontend state properties
      totalUsers: totalCustomers,
      activeUsers: activeCustomers,
      suspendedUsers: suspendedCustomers,
      totalRevenue: monthlyRevenue,
      totalDue: unpaidBills
    };

    console.log('[getAdminStats] Safe retrieval complete. Payload:', stats);
    res.json({
      ...stats,
      data: stats
    });
  } catch (error) {
    console.error('[getAdminStats] Master catch-all error handling stats payload:', error);
    res.json({
      totalCustomers: 0,
      activeCustomers: 0,
      suspendedCustomers: 0,
      monthlyRevenue: 0,
      unpaidBills: 0,
      openTickets: 0,
      totalUsers: 0,
      activeUsers: 0,
      suspendedUsers: 0,
      totalRevenue: 0,
      totalDue: 0,
      data: {
        totalCustomers: 0,
        activeCustomers: 0,
        suspendedCustomers: 0,
        monthlyRevenue: 0,
        unpaidBills: 0,
        openTickets: 0
      }
    });
  }
};
