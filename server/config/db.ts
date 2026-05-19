import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'database.sqlite');
console.log(`[db] Initializing local SQLite database at: ${dbPath}`);

const localDb = new Database(dbPath);
// Enable foreign keys
localDb.pragma('foreign_keys = ON');

// SQLite-friendly database schema matching database.sql requirements perfectly
const schema = `
CREATE TABLE IF NOT EXISTS packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    speed INTEGER NOT NULL,
    price REAL NOT NULL,
    fup_limit TEXT,
    fupLimit TEXT,
    mikrotik_profile TEXT,
    mikrotikProfile TEXT,
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
    total_due REAL DEFAULT 0.00,
    expiry_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    billing_month TEXT NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT DEFAULT 'Unpaid',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    bill_id INTEGER NULL,
    amount REAL NOT NULL,
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
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

// Initialize structural schema
try {
  localDb.exec(schema);
  console.log('[db] Initialized SQLite tables successfully.');

  // Seed default Packages if packages table is currently empty
  const packageCount = localDb.prepare('SELECT COUNT(*) AS count FROM packages').get() as { count: number };
  if (packageCount.count === 0) {
    console.log('[db] Empty package configuration. Seeding default service tiers...');
    const insertPkg = localDb.prepare('INSERT INTO packages (name, speed, price, fup_limit, fupLimit, mikrotik_profile, mikrotikProfile) VALUES (?, ?, ?, ?, ?, ?, ?)');
    insertPkg.run('Basic', 10, 500.00, 'Unlimited', 'Unlimited', '10M_Unlimited', '10M_Unlimited');
    insertPkg.run('Standard', 20, 800.00, 'Unlimited', 'Unlimited', '20M_Unlimited', '20M_Unlimited');
    insertPkg.run('Premium', 50, 1200.00, 'Unlimited', 'Unlimited', '50M_Unlimited', '50M_Unlimited');
  }

  // Seed default System Admin if users table is currently empty
  const userCount = localDb.prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    console.log('[db] Empty users list. Seeding system default admin credentials...');
    const insertAdmin = localDb.prepare('INSERT INTO users (username, password, name, phone, role) VALUES (?, ?, ?, ?, ?)');
    insertAdmin.run(
      'admin', 
      '$2b$10$vUWuw9BwwPEGd5btDBEkK.jXwuWtpLaWqpgo41GjOhkjV.7QdAITi', // admin123
      'System Admin', 
      '01700000000', 
      'admin'
    );
  }
} catch (err) {
  console.error('[db] Error setting up local SQLite schema/seeds:', err);
}

/**
 * High-compatibility Pool interface. Emulates mysql2/promise behavior with SQLite backend,
 * maps query errors, and preserves array-like results format [rows, fields].
 */
export const pool = {
  execute: async (sqlQuery: string, params: any[] = []): Promise<[any, any]> => {
    return pool.query(sqlQuery, params);
  },
  query: async (sqlQuery: string, params: any[] = []): Promise<[any, any]> => {
    try {
      const trimmedQuery = sqlQuery.trim();
      const isSelect = trimmedQuery.toUpperCase().startsWith('SELECT') || trimmedQuery.toUpperCase().startsWith('SHOW');
      
      if (isSelect) {
        const stmt = localDb.prepare(sqlQuery);
        const rows = stmt.all(...params);
        return [rows, []];
      } else {
        const stmt = localDb.prepare(sqlQuery);
        const info = stmt.run(...params);
        // Map SQLite lastInsertRowid & changes to MySQL's insertId & affectedRows to preserve application logic
        const result = {
          insertId: info.lastInsertRowid,
          affectedRows: info.changes,
        };
        return [result, []];
      }
    } catch (err: any) {
      console.error(`[db SQLite Query Error]: "${sqlQuery}" | Params:`, params, err.message || err);
      // Compatibility mapping: convert unique constraints to mysql2's ER_DUP_ENTRY code
      if (err && err.message && err.message.toUpperCase().includes('UNIQUE')) {
        err.code = 'ER_DUP_ENTRY';
      }
      throw err;
    }
  },
  getConnection: async () => {
    return {
      execute: pool.execute,
      query: pool.query,
      release: () => {}
    };
  }
};

export const db = pool;
export default pool;
