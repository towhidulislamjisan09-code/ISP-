import { Request, Response } from 'express';
import { db } from '../config/db';

export const getAllTickets = async (req: any, res: Response) => {
  try {
    let query = `
      SELECT t.*, u.name as user_name, u.username as user_username
      FROM tickets t
      JOIN users u ON t.user_id = u.id
    `;
    const params = [];

    if (req.user.role !== 'admin') {
      query += ' WHERE t.user_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY t.updated_at DESC';
    
    const [rows]: any = await db.execute(query, params);
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const createTicket = async (req: any, res: Response) => {
  const { subject, description, priority } = req.body;
  const user_id = req.user.id;

  try {
    const [result]: any = await db.execute(
      'INSERT INTO tickets (user_id, subject, description, priority, status) VALUES (?, ?, ?, ?, ?)',
      [user_id, subject, description, priority || 'Medium', 'Open']
    );
    res.status(201).json({ id: result.insertId, message: 'Ticket created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const getTicketReplies = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows]: any = await db.execute(`
      SELECT r.*, u.name as user_name, u.role as user_role
      FROM ticket_replies r
      JOIN users u ON r.user_id = u.id
      WHERE r.ticket_id = ?
      ORDER BY r.created_at ASC
    `, [id]);
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const replyTicket = async (req: any, res: Response) => {
  const { id } = req.params;
  const { message } = req.body;
  const user_id = req.user.id;

  try {
    await db.execute(
      'INSERT INTO ticket_replies (ticket_id, user_id, message) VALUES (?, ?, ?)',
      [id, user_id, message]
    );
    
    // Update ticket status if admin replied
    if (req.user.role === 'admin') {
      await db.execute('UPDATE tickets SET status = ? WHERE id = ?', ['In Progress', id]);
    } else {
      await db.execute('UPDATE tickets SET status = ? WHERE id = ?', ['Open', id]);
    }

    res.status(201).json({ message: 'Reply submitted' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const closeTicket = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.execute('UPDATE tickets SET status = ? WHERE id = ?', ['Closed', id]);
    res.json({ message: 'Ticket closed' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};
