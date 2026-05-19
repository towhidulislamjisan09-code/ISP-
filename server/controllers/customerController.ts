import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db';

export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.execute(`
      SELECT u.*, p.name as package_name, p.speed as package_speed 
      FROM users u 
      LEFT JOIN packages p ON u.package_id = p.id
      ORDER BY u.created_at DESC
    `);
    res.json({ message: 'Success', data: rows });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  const { username, password, name, phone, address, package_id, ip_address, mac_address, expiry_date } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password || 'password123', 10);
    
    const [result]: any = await db.execute(
      `INSERT INTO users (username, password, name, phone, address, package_id, ip_address, mac_address, expiry_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [username, hashedPassword, name, phone, address, package_id, ip_address, mac_address, expiry_date]
    );

    res.status(201).json({ 
      message: 'Customer created successfully', 
      id: result.insertId 
    });
  } catch (error: any) {
    console.error('Create customer error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone, address, package_id, ip_address, mac_address, expiry_date, status } = req.body;

  try {
    await db.execute(
      `UPDATE users SET name = ?, phone = ?, address = ?, package_id = ?, ip_address = ?, mac_address = ?, expiry_date = ?, status = ?
       WHERE id = ?`,
      [name, phone, address, package_id, ip_address, mac_address, expiry_date, status, id]
    );
    res.json({ message: `Customer ${id} updated` });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

export const suspendUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // Expect 'Suspended' or 'Active'

  try {
    await db.execute('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: `Customer ${id} status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: `Customer ${id} deleted` });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};
