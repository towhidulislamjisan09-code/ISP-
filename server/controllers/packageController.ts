import { Request, Response } from 'express';
import { db } from '../config/db';

let hasCheckedTable = false;
let cachedColumns: string[] = [];

/**
 * Gets the actual column names from the "packages" table dynamically.
 * Helps prevent errors if columns are camelCase or snake_case without assuming schema DDL.
 */
const getPackagesColumns = async (): Promise<string[]> => {
  if (cachedColumns.length > 0) return cachedColumns;
  try {
    const [cols]: any = await db.execute('SHOW COLUMNS FROM packages');
    cachedColumns = cols.map((c: any) => c.Field);
    hasCheckedTable = true;
    return cachedColumns;
  } catch (err) {
    console.error('[packageController] Error reading columns of packages table:', err);
    return [];
  }
};

/**
 * GET /api/packages
 * Fetches all available service tier packages.
 * Always returns an array (empty if an error occurs) to prevent the frontend from crashing.
 */
export const getAllPackages = async (req: Request, res: Response) => {
  try {
    await getPackagesColumns();
    
    // Select all columns to support any variation programmatically
    const [rows]: any = await db.execute(`SELECT * FROM packages ORDER BY price ASC`);

    const formatted = (rows || []).map((row: any) => ({
      ...row,
      fup_limit: row.fup_limit !== undefined ? row.fup_limit : row.fupLimit,
      fupLimit: row.fupLimit !== undefined ? row.fupLimit : row.fup_limit,
      mikrotik_profile: row.mikrotik_profile !== undefined ? row.mikrotik_profile : row.mikrotikProfile,
      mikrotikProfile: row.mikrotikProfile !== undefined ? row.mikrotikProfile : row.mikrotik_profile,
    }));

    res.json({ data: formatted });
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
    const cols = await getPackagesColumns();
    const { name, speed, price, fupLimit, fup_limit, mikrotikProfile, mikrotik_profile, description } = req.body;

    const hasFupLimit = cols.includes('fupLimit');
    const hasFupLimitSnake = cols.includes('fup_limit');
    const hasMikrotikProfile = cols.includes('mikrotikProfile');
    const hasMikrotikProfileSnake = cols.includes('mikrotik_profile');
    const hasDescription = cols.includes('description');

    const insertCols = ['name', 'speed', 'price'];
    const insertVals: any[] = [name || '', speed || 0, price || 0];
    const placeholders = ['?', '?', '?'];

    const rawFup = fupLimit !== undefined ? fupLimit : fup_limit;
    const rawMikrotik = mikrotikProfile !== undefined ? mikrotikProfile : mikrotik_profile;

    if (hasFupLimit) {
      insertCols.push('fupLimit');
      insertVals.push(rawFup !== undefined && rawFup !== null ? String(rawFup) : null);
      placeholders.push('?');
    } else if (hasFupLimitSnake) {
      insertCols.push('fup_limit');
      insertVals.push(rawFup !== undefined && rawFup !== null ? String(rawFup) : null);
      placeholders.push('?');
    }

    if (hasMikrotikProfile) {
      insertCols.push('mikrotikProfile');
      insertVals.push(rawMikrotik !== undefined ? String(rawMikrotik) : null);
      placeholders.push('?');
    } else if (hasMikrotikProfileSnake) {
      insertCols.push('mikrotik_profile');
      insertVals.push(rawMikrotik !== undefined ? String(rawMikrotik) : null);
      placeholders.push('?');
    }

    if (hasDescription) {
      insertCols.push('description');
      insertVals.push(description !== undefined ? String(description) : null);
      placeholders.push('?');
    }

    const query = `INSERT INTO packages (${insertCols.join(', ')}) VALUES (${placeholders.join(', ')})`;
    const [result]: any = await db.execute(query, insertVals);

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
    const cols = await getPackagesColumns();
    const { id } = req.params;
    const { name, speed, price, fupLimit, fup_limit, mikrotikProfile, mikrotik_profile, description } = req.body;

    const hasFupLimit = cols.includes('fupLimit');
    const hasFupLimitSnake = cols.includes('fup_limit');
    const hasMikrotikProfile = cols.includes('mikrotikProfile');
    const hasMikrotikProfileSnake = cols.includes('mikrotik_profile');
    const hasDescription = cols.includes('description');

    const updateSets = ['name = ?', 'speed = ?', 'price = ?'];
    const updateVals: any[] = [name || '', speed || 0, price || 0];

    const rawFup = fupLimit !== undefined ? fupLimit : fup_limit;
    const rawMikrotik = mikrotikProfile !== undefined ? mikrotikProfile : mikrotik_profile;

    if (hasFupLimit) {
      updateSets.push('fupLimit = ?');
      updateVals.push(rawFup !== undefined && rawFup !== null ? String(rawFup) : null);
    } else if (hasFupLimitSnake) {
      updateSets.push('fup_limit = ?');
      updateVals.push(rawFup !== undefined && rawFup !== null ? String(rawFup) : null);
    }

    if (hasMikrotikProfile) {
      updateSets.push('mikrotikProfile = ?');
      updateVals.push(rawMikrotik !== undefined ? String(rawMikrotik) : null);
    } else if (hasMikrotikProfileSnake) {
      updateSets.push('mikrotik_profile = ?');
      updateVals.push(rawMikrotik !== undefined ? String(rawMikrotik) : null);
    }

    if (hasDescription) {
      updateSets.push('description = ?');
      updateVals.push(description !== undefined ? String(description) : null);
    }

    updateVals.push(id);

    const query = `UPDATE packages SET ${updateSets.join(', ')} WHERE id = ?`;
    await db.execute(query, updateVals);

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
    const { id } = req.params;
    await db.execute('DELETE FROM packages WHERE id = ?', [id]);
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error('[deletePackage] Database deletion error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};
