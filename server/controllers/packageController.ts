import { Request, Response } from 'express';
import { db } from '../config/db';

let hasCreatedTable = false;

/**
 * Ensures that the packages table exists in the MySQL database.
 * Supports the user's requested schema while adding an optional description field 
 * to serve the existing frontend template properly.
 */
const ensureTableExists = async () => {
  if (hasCreatedTable) return;
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS packages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        speed INT,
        price DECIMAL(10,2),
        fupLimit INT,
        mikrotikProfile VARCHAR(100),
        description TEXT
      )
    `);
    hasCreatedTable = true;
    console.log('[packageController] Verified/created "packages" table successfully.');
  } catch (err) {
    console.error('[packageController] Error verifying packages table:', err);
  }
};

/**
 * GET /api/packages
 * Fetches all available service tier packages.
 * Always returns an array (empty if an error occurs) to prevent the frontend from crashing.
 */
export const getAllPackages = async (req: Request, res: Response) => {
  try {
    await ensureTableExists();
    
    // Select both the schema columns and their snake_case equivalents to support the frontend out of the box
    const [rows]: any = await db.execute(`
      SELECT 
        id, 
        name, 
        speed, 
        price, 
        fupLimit, 
        fupLimit AS fup_limit, 
        mikrotikProfile, 
        mikrotikProfile AS mikrotik_profile,
        description 
      FROM packages 
      ORDER BY price ASC
    `);

    res.json({ data: rows || [] });
  } catch (error) {
    console.error('[getAllPackages] SQL error, returning empty dataset:', error);
    res.json({ data: [] });
  }
};

/**
 * POST /api/packages
 * Creates a new service tier package.
 */
export const createPackage = async (req: Request, res: Response) => {
  try {
    await ensureTableExists();
    const { name, speed, price, fupLimit, fup_limit, mikrotikProfile, mikrotik_profile, description } = req.body;

    const rawFup = fupLimit !== undefined ? fupLimit : fup_limit;
    const rawMikrotik = mikrotikProfile !== undefined ? mikrotikProfile : mikrotik_profile;

    // Convert fup to integer safely if present, otherwise set null
    const parsedFup = rawFup !== undefined && rawFup !== null ? parseInt(String(rawFup), 10) : null;
    const finalFup = isNaN(parsedFup as number) ? null : parsedFup;

    const finalMikrotik = rawMikrotik !== undefined ? String(rawMikrotik) : null;
    const finalDescription = description !== undefined ? String(description) : null;

    const [result]: any = await db.execute(
      'INSERT INTO packages (name, speed, price, fupLimit, mikrotikProfile, description) VALUES (?, ?, ?, ?, ?, ?)',
      [name || '', speed || 0, price || 0, finalFup, finalMikrotik, finalDescription]
    );

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Package created successfully' 
    });
  } catch (error) {
    console.error('[createPackage] Database insertion error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * PUT /api/packages/:id
 * Updates an existing package.
 */
export const updatePackage = async (req: Request, res: Response) => {
  try {
    await ensureTableExists();
    const { id } = req.params;
    const { name, speed, price, fupLimit, fup_limit, mikrotikProfile, mikrotik_profile, description } = req.body;

    const rawFup = fupLimit !== undefined ? fupLimit : fup_limit;
    const rawMikrotik = mikrotikProfile !== undefined ? mikrotikProfile : mikrotik_profile;

    const parsedFup = rawFup !== undefined && rawFup !== null ? parseInt(String(rawFup), 10) : null;
    const finalFup = isNaN(parsedFup as number) ? null : parsedFup;

    const finalMikrotik = rawMikrotik !== undefined ? String(rawMikrotik) : null;
    const finalDescription = description !== undefined ? String(description) : null;

    await db.execute(
      'UPDATE packages SET name = ?, speed = ?, price = ?, fupLimit = ?, mikrotikProfile = ?, description = ? WHERE id = ?',
      [name || '', speed || 0, price || 0, finalFup, finalMikrotik, finalDescription, id]
    );

    res.json({ message: 'Package updated successfully' });
  } catch (error) {
    console.error('[updatePackage] Database update error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * DELETE /api/packages/:id
 * Deletes a package.
 */
export const deletePackage = async (req: Request, res: Response) => {
  try {
    await ensureTableExists();
    const { id } = req.params;

    await db.execute('DELETE FROM packages WHERE id = ?', [id]);
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error('[deletePackage] Database deletion error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};
