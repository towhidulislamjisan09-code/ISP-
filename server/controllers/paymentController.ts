import { Request, Response } from 'express';
import { db } from '../config/db';

export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.execute(`
      SELECT p.*, u.name as user_name, u.username as user_username
      FROM payments p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.payment_date DESC
    `);
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const submitPayment = async (req: any, res: Response) => {
  const { bill_id, amount, transaction_id, payment_method, notes } = req.body;
  const user_id = req.user.id;

  try {
    const [result]: any = await db.execute(
      'INSERT INTO payments (user_id, bill_id, amount, transaction_id, payment_method, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, bill_id || null, amount, transaction_id, payment_method, 'Pending', notes]
    );
    res.status(201).json({ id: result.insertId, message: 'Payment submitted for verification' });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Transaction ID already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, admin_notes } = req.body; // Approved or Rejected

  try {
    const [payments]: any = await db.execute('SELECT * FROM payments WHERE id = ?', [id]);
    const payment = payments[0];

    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (payment.status !== 'Pending') return res.status(400).json({ error: 'Payment already verified' });

    await db.execute('UPDATE payments SET status = ?, notes = ? WHERE id = ?', [status, admin_notes || payment.notes, id]);

    if (status === 'Approved' && payment.bill_id) {
       // Also mark the linked bill as paid if the amount matches or handle partial payment
       // For simplicity, let's just mark the bill as paid if approved
       await db.execute('UPDATE bills SET status = ? WHERE id = ?', ['Paid', payment.bill_id]);
       
       // Deduct from user total due
       await db.execute(
         'UPDATE users SET total_due = total_due - ? WHERE id = ?',
         [payment.amount, payment.user_id]
       );
    }

    res.json({ message: `Payment ${status}` });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};
