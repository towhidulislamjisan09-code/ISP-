import { Request, Response } from 'express';
import { db } from '../config/firebaseAdmin';

/**
 * GET /api/tickets
 * Retrieves service tickets with join details, filtered by customer role if applicable.
 */
export const getAllTickets = async (req: any, res: Response) => {
  try {
    // 1. Fetch user map lookup
    const usersSnapshot = await db.collection('users').get();
    const userMap = new Map<string, any>();
    usersSnapshot.docs.forEach(doc => {
      userMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    // 2. Fetch tickets
    let ticketsRef: any = db.collection('tickets');
    if (req.user.role !== 'admin') {
      ticketsRef = ticketsRef.where('user_id', '==', req.user.id);
    }
    
    const ticketsSnapshot = await ticketsRef.get();
    const rows = ticketsSnapshot.docs.map((doc: any) => {
      const data = doc.data();
      const user = userMap.get(data.user_id);
      return {
        id: doc.id,
        ...data,
        user_name: user ? user.name : 'Unknown User',
        user_username: user ? user.username : 'unknown'
      };
    }) as any[];

    // Sort by updated_at or created_at descending
    rows.sort((a, b) => {
      const dateA = a.updated_at || a.created_at || a.createdAt || '';
      const dateB = b.updated_at || b.created_at || b.createdAt || '';
      return dateB.localeCompare(dateA);
    });

    res.json({ data: rows });
  } catch (error) {
    console.error('[getAllTickets] Firestore reading error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * POST /api/tickets
 * Submits a new technical support/customer ticket to Firestore.
 */
export const createTicket = async (req: any, res: Response) => {
  const { subject, description, priority } = req.body;
  const user_id = req.user.id;

  try {
    const payload = {
      user_id,
      subject: subject || '',
      description: description || '',
      priority: priority || 'Medium',
      status: 'Open',
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const docRef = await db.collection('tickets').add(payload);
    res.status(201).json({ id: docRef.id, message: 'Ticket created successfully' });
  } catch (error) {
    console.error('[createTicket] Firestore write error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * GET /api/tickets/replies/:id
 * Fetches replies associated with a ticket ID.
 */
export const getTicketReplies = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // 1. Fetch user map lookup
    const usersSnapshot = await db.collection('users').get();
    const userMap = new Map<string, any>();
    usersSnapshot.docs.forEach(doc => {
      userMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    // 2. Fetch ticket replies
    const repliesSnapshot = await db.collection('ticket_replies')
      .where('ticket_id', '==', id)
      .get();

    const rows = repliesSnapshot.docs.map(doc => {
      const data = doc.data();
      const user = userMap.get(data.user_id);
      return {
        id: doc.id,
        ...data,
        user_name: user ? user.name : 'Unknown User',
        user_role: user ? user.role : 'customer'
      };
    }) as any[];

    // Sort by chronological order
    rows.sort((a, b) => {
      const dateA = a.created_at || a.createdAt || '';
      const dateB = b.created_at || b.createdAt || '';
      return dateA.localeCompare(dateB);
    });

    res.json({ data: rows });
  } catch (error) {
    console.error('[getTicketReplies] Firestore error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * POST /api/tickets/reply/:id
 * Submits a diagnostic/customer reply to a specific ticket.
 */
export const replyTicket = async (req: any, res: Response) => {
  const { id } = req.params;
  const { message } = req.body;
  const user_id = req.user.id;

  try {
    const replyPayload = {
      ticket_id: id,
      user_id,
      message: message || '',
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    await db.collection('ticket_replies').add(replyPayload);
    
    // Update ticket status depending on responder
    const newStatus = req.user.role === 'admin' ? 'In Progress' : 'Open';
    await db.collection('tickets').doc(id).update({
      status: newStatus,
      updated_at: new Date().toISOString()
    });

    res.status(201).json({ message: 'Reply submitted' });
  } catch (error) {
    console.error('[replyTicket] Firestore update error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * PUT /api/tickets/close/:id
 * Marks a technical ticket as Closed.
 */
export const closeTicket = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.collection('tickets').doc(id).update({
      status: 'Closed',
      updated_at: new Date().toISOString()
    });
    res.json({ message: 'Ticket closed' });
  } catch (error) {
    console.error('[closeTicket] Firestore write error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};
