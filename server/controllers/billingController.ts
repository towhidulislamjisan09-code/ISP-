import { Request, Response } from 'express';
import { db } from '../config/db';

export const getAllBills = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.execute(`
      SELECT b.*, u.name as user_name, u.username as user_username
      FROM bills b
      JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `);
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const generateMonthlyBills = async (req: Request, res: Response) => {
  const { month } = req.body; // e.g., 'May 2026'
  try {
    // Get all active customers with a package
    const [users]: any = await db.execute(`
      SELECT u.id, p.price 
      FROM users u
      JOIN packages p ON u.package_id = p.id
      WHERE u.status = 'Active' AND u.role = 'customer'
    `);

    let generatedCount = 0;
    for (const user of users) {
      // Check if bill already exists for this month
      const [existing]: any = await db.execute(
        'SELECT id FROM bills WHERE user_id = ? AND billing_month = ?',
        [user.id, month]
      );

      if (existing.length === 0) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 10); // 10 days from now
        
        await db.execute(
          'INSERT INTO bills (user_id, amount, billing_month, due_date, status) VALUES (?, ?, ?, ?, ?)',
          [user.id, user.price, month, dueDate.toISOString().split('T')[0], 'Unpaid']
        );
        
        // Update user total due
        await db.execute(
          'UPDATE users SET total_due = total_due + ? WHERE id = ?',
          [user.price, user.id]
        );
        
        generatedCount++;
      }
    }

    res.json({ message: `Successfully generated ${generatedCount} bills for ${month}` });
  } catch (error) {
    console.error('Generate bills error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

export const markBillAsPaid = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [bills]: any = await db.execute('SELECT * FROM bills WHERE id = ?', [id]);
    const bill = bills[0];

    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    if (bill.status === 'Paid') return res.status(400).json({ error: 'Bill already paid' });

    await db.execute('UPDATE bills SET status = ? WHERE id = ?', ['Paid', id]);
    
    // Deduct from user total due
    await db.execute(
      'UPDATE users SET total_due = total_due - ? WHERE id = ?',
      [bill.amount, bill.user_id]
    );

    res.json({ message: 'Bill marked as paid' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};
