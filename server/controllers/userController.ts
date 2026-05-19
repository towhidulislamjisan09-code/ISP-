import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.execute(`
      SELECT u.id, u.username, u.name, u.phone, u.address, u.role, u.package_id, u.status, 
             u.ip_address, u.mac_address, u.pppoe_username, u.total_due, u.expiry_date, u.created_at,
             p.name as package_name, p.speed as package_speed 
      FROM users u 
      LEFT JOIN packages p ON u.package_id = p.id
      ORDER BY u.created_at DESC
    `);
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { 
    username, password, name, phone, address, role, 
    package_id, ip_address, mac_address, pppoe_username, expiry_date 
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password || 'password123', 10);
    
    const [result]: any = await db.execute(
      `INSERT INTO users (username, password, name, phone, address, role, package_id, ip_address, mac_address, pppoe_username, expiry_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [username, hashedPassword, name, phone, address, role || 'customer', package_id || null, ip_address, mac_address, pppoe_username, expiry_date]
    );

    res.status(201).json({ 
      id: result.insertId,
      message: 'User created successfully'
    });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { 
    name, phone, address, role, package_id, 
    ip_address, mac_address, pppoe_username, expiry_date, status, total_due 
  } = req.body;

  try {
    await db.execute(
      `UPDATE users SET name = ?, phone = ?, address = ?, role = ?, package_id = ?, 
       ip_address = ?, mac_address = ?, pppoe_username = ?, expiry_date = ?, status = ?, total_due = ?
       WHERE id = ?`,
      [name, phone, address, role, package_id, ip_address, mac_address, pppoe_username, expiry_date, status, total_due, id]
    );
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.execute('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: `User status changed to ${status}` });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};
