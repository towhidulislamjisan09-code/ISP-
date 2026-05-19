import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/firebaseAdmin';

/**
 * GET /api/users
 * Fetches all registered users, combining package definitions dynamically.
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // 1. Fetch package lookup
    const packagesSnapshot = await db.collection('packages').get();
    const pkgMap = new Map<string, any>();
    packagesSnapshot.docs.forEach(doc => {
      pkgMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    // 2. Fetch users
    const usersSnapshot = await db.collection('users').get();
    const rows = usersSnapshot.docs.map(doc => {
      const userData = doc.data();
      const pkg = userData.package_id ? pkgMap.get(userData.package_id) : null;
      
      return {
        id: doc.id,
        ...userData,
        package_name: pkg ? pkg.name : null,
        package_speed: pkg ? pkg.speed : null
      };
    }) as any[];

    // Sort by creation date descending
    rows.sort((a, b) => {
      const dateA = a.created_at || a.createdAt || '';
      const dateB = b.created_at || b.createdAt || '';
      return dateB.localeCompare(dateA);
    });

    res.json({ data: rows });
  } catch (error) {
    console.error('[getAllUsers] Firestore fetch error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * POST /api/users
 * Registers or adds a new user to the Firestore collection.
 */
export const createUser = async (req: Request, res: Response) => {
  const { 
    username, password, name, phone, address, role, 
    package_id, ip_address, mac_address, pppoe_username, expiry_date 
  } = req.body;

  try {
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Check uniqueness of username in Firestore
    const existingUsernameCheck = await db.collection('users').where('username', '==', username).get();
    if (!existingUsernameCheck.empty) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);
    
    const payload = {
      username,
      password: hashedPassword,
      name: name || '',
      phone: phone || '',
      address: address || '',
      role: role || 'customer',
      package_id: package_id || null,
      ip_address: ip_address || '',
      mac_address: mac_address || '',
      pppoe_username: pppoe_username || '',
      expiry_date: expiry_date || '',
      status: 'Active',
      total_due: 0.00,
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const docRef = await db.collection('users').add(payload);

    res.status(201).json({ 
      id: docRef.id,
      message: 'User created successfully'
    });
  } catch (error: any) {
    console.error('[createUser] Firestore error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * PUT /api/users/:id
 * Updates an existing user document.
 */
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { 
    name, phone, address, role, package_id, 
    ip_address, mac_address, pppoe_username, expiry_date, status, total_due 
  } = req.body;

  try {
    const payload = {
      name: name || '',
      phone: phone || '',
      address: address || '',
      role: role || 'customer',
      package_id: package_id || null,
      ip_address: ip_address || '',
      mac_address: mac_address || '',
      pppoe_username: pppoe_username || '',
      expiry_date: expiry_date || '',
      status: status || 'Active',
      total_due: total_due !== undefined ? Number(total_due) : 0,
      updated_at: new Date().toISOString()
    };

    await db.collection('users').doc(id).update(payload);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('[updateUser] Firestore update error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * PUT /api/users/toggle/:id
 * Toggles status between Active and Suspended.
 */
export const toggleUserStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.collection('users').doc(id).update({
      status: status || 'Active',
      updated_at: new Date().toISOString()
    });
    res.json({ message: `User status changed to ${status}` });
  } catch (error) {
    console.error('[toggleUserStatus] Firestore update error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * DELETE /api/users/:id
 * Removes a user document.
 */
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.collection('users').doc(id).delete();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('[deleteUser] Firestore delete error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};
