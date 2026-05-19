import { Request, Response } from 'express';
import { db } from '../config/firebaseAdmin';

/**
 * GET /api/packages
 * Fetches all available service tier packages from Firestore.
 */
export const getAllPackages = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('packages').get();
    const rows = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    // Sort by price ascending
    rows.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));

    // Support formatting schema variants for standard interface
    const formatted = rows.map(pkg => ({
      ...pkg,
      fup_limit: pkg.fup_limit !== undefined ? pkg.fup_limit : pkg.fupLimit,
      fupLimit: pkg.fupLimit !== undefined ? pkg.fupLimit : pkg.fup_limit,
      mikrotik_profile: pkg.mikrotik_profile !== undefined ? pkg.mikrotik_profile : pkg.mikrotikProfile,
      mikrotikProfile: pkg.mikrotikProfile !== undefined ? pkg.mikrotikProfile : pkg.mikrotik_profile,
    }));

    res.json({ data: formatted });
  } catch (error) {
    console.error('[getAllPackages] Firestore error, returning empty dataset:', error);
    res.json({ data: [] });
  }
};

/**
 * POST /api/packages
 * Creates a new service tier package in Firestore.
 */
export const createPackage = async (req: Request, res: Response) => {
  try {
    const { name, speed, price, fupLimit, fup_limit, mikrotikProfile, mikrotik_profile, description } = req.body;

    const rawFup = fupLimit !== undefined ? fupLimit : fup_limit;
    const rawMikrotik = mikrotikProfile !== undefined ? mikrotikProfile : mikrotik_profile;

    const payload = {
      name: name || '',
      speed: Number(speed) || 0,
      price: Number(price) || 0,
      fup_limit: rawFup !== undefined && rawFup !== null ? String(rawFup) : 'Unlimited',
      fupLimit: rawFup !== undefined && rawFup !== null ? String(rawFup) : 'Unlimited',
      mikrotik_profile: rawMikrotik !== undefined ? String(rawMikrotik) : 'DEFAULT-PROFILE',
      mikrotikProfile: rawMikrotik !== undefined ? String(rawMikrotik) : 'DEFAULT-PROFILE',
      description: description !== undefined ? String(description) : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('packages').add(payload);

    res.status(201).json({ 
      id: docRef.id, 
      message: 'Package created successfully' 
    });
  } catch (error) {
    console.error('[createPackage] Firestore insert error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * PUT /api/packages/:id
 * Updates an existing package.
 */
export const updatePackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, speed, price, fupLimit, fup_limit, mikrotikProfile, mikrotik_profile, description } = req.body;

    const rawFup = fupLimit !== undefined ? fupLimit : fup_limit;
    const rawMikrotik = mikrotikProfile !== undefined ? mikrotikProfile : mikrotik_profile;

    const payload: any = {
      name: name || '',
      speed: Number(speed) || 0,
      price: Number(price) || 0,
      fup_limit: rawFup !== undefined && rawFup !== null ? String(rawFup) : 'Unlimited',
      fupLimit: rawFup !== undefined && rawFup !== null ? String(rawFup) : 'Unlimited',
      mikrotik_profile: rawMikrotik !== undefined ? String(rawMikrotik) : 'DEFAULT-PROFILE',
      mikrotikProfile: rawMikrotik !== undefined ? String(rawMikrotik) : 'DEFAULT-PROFILE',
      description: description !== undefined ? String(description) : '',
      updatedAt: new Date().toISOString()
    };

    await db.collection('packages').doc(id).update(payload);

    res.json({ message: 'Package updated successfully' });
  } catch (error) {
    console.error('[updatePackage] Firestore update error:', error);
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
    await db.collection('packages').doc(id).delete();
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error('[deletePackage] Firestore deletion error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};
