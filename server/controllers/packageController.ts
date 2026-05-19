import { Request, Response } from 'express';
import { db } from '../config/db';

export const getAllPackages = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.execute('SELECT * FROM packages ORDER BY price ASC');
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const createPackage = async (req: Request, res: Response) => {
  const { name, speed, price, fup_limit, mikrotik_profile, description } = req.body;
  try {
    const [result]: any = await db.execute(
      'INSERT INTO packages (name, speed, price, fup_limit, mikrotik_profile, description) VALUES (?, ?, ?, ?, ?, ?)',
      [name, speed, price, fup_limit, mikrotik_profile, description]
    );
    res.status(201).json({ id: result.insertId, message: 'Package created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const updatePackage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, speed, price, fup_limit, mikrotik_profile, description } = req.body;
  try {
    await db.execute(
      'UPDATE packages SET name = ?, speed = ?, price = ?, fup_limit = ?, mikrotik_profile = ?, description = ? WHERE id = ?',
      [name, speed, price, fup_limit, mikrotik_profile, description, id]
    );
    res.json({ message: 'Package updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const deletePackage = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM packages WHERE id = ?', [id]);
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};
