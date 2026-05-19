import { Request, Response } from 'express';
import { db } from '../config/firebaseAdmin';

/**
 * GET /api/dashboard/stats
 * Aggregates live Firestore figures to serve system-wide administrative telemetry.
 */
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    // 1. Perform optimized parallelized Firestore counts/queries
    const [
      totalSnap,
      activeSnap,
      suspendedSnap,
      unpaidSnap,
      openTicketsSnap,
      paymentsSnap
    ] = await Promise.all([
      db.collection('users').count().get(),
      db.collection('users').where('status', '==', 'Active').count().get(),
      db.collection('users').where('status', '==', 'Suspended').count().get(),
      db.collection('bills').where('status', '==', 'Unpaid').count().get(),
      db.collection('tickets').where('status', '==', 'Open').count().get(),
      db.collection('payments').get() // For summing revenue
    ]);

    const totalCustomers = totalSnap.data().count || 0;
    const activeCustomers = activeSnap.data().count || 0;
    const suspendedCustomers = suspendedSnap.data().count || 0;
    const unpaidBills = unpaidSnap.data().count || 0;
    const openTickets = openTicketsSnap.data().count || 0;

    // Calculate sum of payments revenue
    let monthlyRevenue = 0;
    paymentsSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.status === 'Approved' || data.status === undefined) {
        monthlyRevenue += Number(data.amount) || 0;
      }
    });

    const stats = {
      totalCustomers,
      activeCustomers,
      suspendedCustomers,
      monthlyRevenue,
      unpaidBills,
      openTickets,
      
      // Legacy support values for standard frontend integration properties
      totalUsers: totalCustomers,
      activeUsers: activeCustomers,
      suspendedUsers: suspendedCustomers,
      totalRevenue: monthlyRevenue,
      totalDue: unpaidBills
    };

    console.log('[getAdminStats] Firestore live aggregation complete:', stats);
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
