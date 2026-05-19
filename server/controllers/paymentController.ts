import { Request, Response } from 'express';
import { db } from '../config/firebaseAdmin';

/**
 * GET /api/payments
 * Retrieves all payment transaction history aligned with user details.
 */
export const getAllPayments = async (req: Request, res: Response) => {
  try {
    // 1. Fetch user map lookup
    const usersSnapshot = await db.collection('users').get();
    const userMap = new Map<string, any>();
    usersSnapshot.docs.forEach(doc => {
      userMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    // 2. Fetch payments
    const paymentsSnapshot = await db.collection('payments').get();
    const rows = paymentsSnapshot.docs.map(doc => {
      const data = doc.data();
      const user = userMap.get(data.user_id);
      return {
        id: doc.id,
        ...data,
        user_name: user ? user.name : 'Unknown User',
        user_username: user ? user.username : 'unknown'
      };
    }) as any[];

    // Sort by payment_date descending
    rows.sort((a, b) => {
      const dateA = a.payment_date || a.createdAt || '';
      const dateB = b.payment_date || b.createdAt || '';
      return dateB.localeCompare(dateA);
    });

    res.json({ data: rows });
  } catch (error) {
    console.error('[getAllPayments] Firestore error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * POST /api/payments
 * Submits a new payment transaction with dynamic unique Transaction ID validation.
 */
export const submitPayment = async (req: any, res: Response) => {
  const { bill_id, amount, transaction_id, payment_method, notes } = req.body;
  const user_id = req.user.id;

  try {
    if (!transaction_id) {
      return res.status(400).json({ error: 'Transaction ID is required' });
    }

    // Uniqueness check for transaction_id
    const duplicateCheck = await db.collection('payments')
      .where('transaction_id', '==', transaction_id)
      .limit(1)
      .get();
      
    if (!duplicateCheck.empty) {
      return res.status(400).json({ error: 'Transaction ID already exists' });
    }

    const payload = {
      user_id,
      bill_id: bill_id || null,
      amount: Number(amount) || 0,
      transaction_id,
      payment_method: payment_method || '',
      status: 'Pending',
      notes: notes || '',
      payment_date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('payments').add(payload);
    res.status(201).json({ id: docRef.id, message: 'Payment submitted for verification' });
  } catch (error: any) {
    console.error('[submitPayment] Firestore insertion error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * PUT /api/payments/verify/:id
 * Verifies (approves/rejects) general payments and settles linked bill.
 */
export const verifyPayment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, admin_notes } = req.body; // Approved or Rejected

  try {
    const paymentDocRef = db.collection('payments').doc(id);
    const paymentDoc = await paymentDocRef.get();

    if (!paymentDoc.exists) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = paymentDoc.data()!;
    if (payment.status !== 'Pending') {
      return res.status(400).json({ error: 'Payment already verified' });
    }

    const updatedNotes = admin_notes || payment.notes || '';
    
    // Update payment status
    await paymentDocRef.update({
      status: status,
      notes: updatedNotes,
      updatedAt: new Date().toISOString()
    });

    // Reconcile outstanding figures if approved
    if (status === 'Approved') {
      if (payment.bill_id) {
        // Mark linked bill paid
        await db.collection('bills').doc(payment.bill_id).update({
          status: 'Paid',
          updated_at: new Date().toISOString()
        });
      }

      // Deduct total_due from user profile
      const userRef = db.collection('users').doc(payment.user_id);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const currentDue = Number(userDoc.data()!.total_due) || 0;
        await userRef.update({
          total_due: Math.max(0, currentDue - (Number(payment.amount) || 0)),
          updated_at: new Date().toISOString()
        });
      }
    }

    res.json({ message: `Payment ${status}` });
  } catch (error) {
    console.error('[verifyPayment] Firestore processing error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};
