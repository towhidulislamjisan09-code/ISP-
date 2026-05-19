import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let _db: any = null;

function getDb() {
  if (_db) return _db;
  
  const dbPath = path.join(process.cwd(), 'database.sqlite');
  _db = new Database(dbPath);

  // Enable foreign keys
  _db.pragma('foreign_keys = ON');

  // If the database has no packages table, initialize it
  try {
    _db.prepare('SELECT 1 FROM packages LIMIT 1').get();
  } catch (e) {
    console.log('Initializing SQLite schema with better-sqlite3...');
    initializeDatabase(_db);
  }

  return _db;
}

function initializeDatabase(db: any) {
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
    ('admin', '$2b$10$vUWuw9BwwPEGd5btDBEkK.jXwuWtpLaWqpgo41GjOhkjV.7QdAITi', 'System Admin', '01700000000', 'admin');
  `;

  // better-sqlite3 exec can run multiple queries separated by semicolons directly
  db.exec(schema);
}

const execQuery = async (sql: string, params: any[] = []) => {
  const database = getDb();
  try {
    const stmt = database.prepare(sql);
    if (stmt.reader) {
      const rows = stmt.all(...params);
      return [rows, null];
    } else {
      const result = stmt.run(...params);
      return [{
        insertId: result.lastInsertRowid,
        affectedRows: result.changes
      }, null];
    }
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      error.code = 'ER_DUP_ENTRY';
    }
    throw error;
  }
};

export const db = {
  execute: execQuery,
  query: execQuery
};
