import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

let _db: Database | null = null;

async function getDb() {
  if (_db) return _db;
  
  const dbPath = path.join(process.cwd(), 'database.sqlite');
  const dbExists = fs.existsSync(dbPath);

  _db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  if (!dbExists) {
    console.log('Initializing SQLite database...');
    await initializeDatabase(_db);
  }

  return _db;
}

async function initializeDatabase(db: Database) {
  // SQLite compatible schema
  const schema = `
    CREATE TABLE IF NOT EXISTS packages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        speed INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        fup_limit TEXT,
        mikrotik_profile TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT,
        role TEXT DEFAULT 'customer',
        package_id INTEGER NULL,
        status TEXT DEFAULT 'Active',
        ip_address TEXT,
        mac_address TEXT,
        pppoe_username TEXT,
        total_due DECIMAL(10, 2) DEFAULT 0.00,
        expiry_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS bills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        billing_month TEXT NOT NULL,
        due_date DATE NOT NULL,
        status TEXT DEFAULT 'Unpaid',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        bill_id INTEGER NULL,
        amount DECIMAL(10, 2) NOT NULL,
        transaction_id TEXT UNIQUE,
        payment_method TEXT,
        status TEXT DEFAULT 'Pending',
        payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subject TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT DEFAULT 'Open',
        priority TEXT DEFAULT 'Medium',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ticket_replies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'Broadcast',
        user_id INTEGER NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    INSERT INTO packages (name, speed, price, fup_limit, mikrotik_profile) VALUES 
    ('Basic', 10, 500.00, 'Unlimited', '10M_Unlimited'),
    ('Standard', 20, 800.00, 'Unlimited', '20M_Unlimited'),
    ('Premium', 50, 1200.00, 'Unlimited', '50M_Unlimited');

    INSERT INTO users (username, password, name, phone, role) VALUES 
    ('admin', '$2b$10$w8.BmqU2.6J/H3I2oBvAueMhZf.S1L7fXv9KxU3k/Xh/oYj7G0G0.', 'System Admin', '01700000000', 'admin');
  `;

  // Split and run commands
  const commands = schema.split(';').filter(c => c.trim());
  for (const cmd of commands) {
    await db.run(cmd);
  }
}

// Shim to maintain compatibility with mysql2 promise API used in controllers
export const db = {
  execute: async (sql: string, params: any[] = []) => {
    const database = await getDb();
    try {
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const rows = await database.all(sql, params);
        return [rows, null];
      } else {
        const result = await database.run(sql, params);
        return [{
          insertId: result.lastID,
          affectedRows: result.changes
        }, null];
      }
    } catch (error: any) {
      // Normalize common error codes
      if (error.message?.includes('UNIQUE constraint failed')) {
        error.code = 'ER_DUP_ENTRY';
      }
      throw error;
    }
  },
  query: async (sql: string, params: any[] = []) => {
    const database = await getDb();
    try {
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const rows = await database.all(sql, params);
        return [rows, null];
      } else {
        const result = await database.run(sql, params);
        return [{
          insertId: result.lastID,
          affectedRows: result.changes
        }, null];
      }
    } catch (error: any) {
      if (error.message?.includes('UNIQUE constraint failed')) {
        error.code = 'ER_DUP_ENTRY';
      }
      throw error;
    }
  }
};
