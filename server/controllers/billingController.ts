import { Request, Response } from 'express';
import { db } from '../config/firebaseAdmin';

/**
 * GET /api/bills
 * Retrieves all billing items and merges user attributes.
 */
export const getAllBills = async (req: Request, res: Response) => {
  try {
    // 1. Fetch users lookup
    const usersSnapshot = await db.collection('users').get();
    const userMap = new Map<string, any>();
    usersSnapshot.docs.forEach(doc => {
      userMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    // 2. Fetch bills
    const billsSnapshot = await db.collection('bills').get();
    const rows = billsSnapshot.docs.map(doc => {
      const billData = doc.data();
      const user = userMap.get(billData.user_id);
      return {
        id: doc.id,
        ...billData,
        user_name: user ? user.name : 'Unknown User',
        user_username: user ? user.username : 'unknown'
      };
    }) as any[];

    // Sort by creation date descending
    rows.sort((a, b) => {
      const dateA = a.created_at || a.createdAt || '';
      const dateB = b.created_at || b.createdAt || '';
      return dateB.localeCompare(dateA);
    });

    res.json({ data: rows });
  } catch (error) {
    console.error('[getAllBills] Firestore error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * POST /api/bills/generate
 * Generates bills for active customers and updates their outstanding ledger.
 */
export const generateMonthlyBills = async (req: Request, res: Response) => {
  const { month } = req.body; // e.g., 'May 2026'
  try {
    if (!month) {
      return res.status(400).json({ error: 'Month is required' });
    }

    // 1. Get all packages for custom pricing lookups
    const packagesSnapshot = await db.collection('packages').get();
    const pkgMap = new Map<string, number>();
    packagesSnapshot.docs.forEach(doc => {
      pkgMap.set(doc.id, Number(doc.data().price) || 0);
    });

    // 2. Get active customers
    const usersSnapshot = await db.collection('users')
      .where('status', '==', 'Active')
      .where('role', '==', 'customer')
      .get();

    let generatedCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      const packageId = userData.package_id;
      const basePrice = packageId ? (pkgMap.get(packageId) || 0) : 0;

      if (!packageId || basePrice <= 0) continue;

      // Check if bill already exists for this customer/month
      const existingCheck = await db.collection('bills')
        .where('user_id', '==', userId)
        .where('billing_month', '==', month)
        .limit(1)
        .get();

      if (existingCheck.empty) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 10); // 10 days boundary
        
        // Add Bill Document
        const billPayload = {
          user_id: userId,
          amount: basePrice,
          billing_month: month,
          due_date: dueDate.toISOString().split('T')[0],
          status: 'Unpaid',
          created_at: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await db.collection('bills').add(billPayload);

        // Update customer total outstanding due
        const currentDue = Number(userData.total_due) || 0;
        await db.collection('users').doc(userId).update({
          total_due: currentDue + basePrice,
          updated_at: new Date().toISOString()
        });

        generatedCount++;
      }
    }

    res.json({ message: `Successfully generated ${generatedCount} bills for ${month}` });
  } catch (error) {
    console.error('[generateMonthlyBills] Firestore execution error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * PUT /api/bills/pay/:id
 * Marks a outstanding bill as Paid and reconciles customer ledger.
 */
export const markBillAsPaid = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const billDocRef = db.collection('bills').doc(id);
    const billDoc = await billDocRef.get();

    if (!billDoc.exists) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const bill = billDoc.data()!;
    if (bill.status === 'Paid') {
      return res.status(400).json({ error: 'Bill already paid' });
    }

    // 1. Mark status paid
    await billDocRef.update({
      status: 'Paid',
      updated_at: new Date().toISOString()
    });

    // 2. Adjust users collection outstanding balance
    const userDocRef = db.collection('users').doc(bill.user_id);
    const userDoc = await userDocRef.get();
    if (userDoc.exists) {
      const currentDue = Number(userDoc.data()!.total_due) || 0;
      await userDocRef.update({
        total_due: Math.max(0, currentDue - (Number(bill.amount) || 0)),
        updated_at: new Date().toISOString()
      });
    }

    res.json({ message: 'Bill marked as paid' });
  } catch (error) {
    console.error('[markBillAsPaid] Firestore transaction error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};
