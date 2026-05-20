import mysql from 'mysql2/promise';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

let pool: mysql.Pool | null = null;
let isInitialized = false;

// Hardcoded schema metadata to prevent queries for unknown fields
const SCHEMA_COLUMNS: { [table: string]: Set<string> } = {
  packages: new Set(['id', 'name', 'speed', 'price', 'fup_limit', 'mikrotik_profile', 'description', 'created_at', 'updated_at']),
  users: new Set(['id', 'username', 'password', 'name', 'phone', 'address', 'role', 'package_id', 'status', 'ip_address', 'mac_address', 'pppoe_username', 'total_due', 'expiry_date', 'created_at', 'updated_at']),
  bills: new Set(['id', 'user_id', 'amount', 'billing_month', 'due_date', 'status', 'created_at', 'updated_at']),
  payments: new Set(['id', 'user_id', 'bill_id', 'amount', 'transaction_id', 'payment_method', 'status', 'payment_date', 'notes']),
  tickets: new Set(['id', 'user_id', 'subject', 'description', 'status', 'priority', 'created_at', 'updated_at']),
  ticket_replies: new Set(['id', 'ticket_id', 'user_id', 'message', 'created_at']),
  notifications: new Set(['id', 'title', 'message', 'type', 'user_id', 'is_read', 'created_at'])
};

const SCHEMA_DEFAULTS: { [table: string]: { [field: string]: any } } = {
  packages: {
    name: 'Default Package',
    speed: 10,
    price: 500.00,
    fup_limit: 'Unlimited',
    mikrotik_profile: 'DEFAULT_PROFILE',
    description: ''
  },
  users: {
    username: '',
    password: '',
    name: '',
    phone: '',
    address: '',
    role: 'customer',
    package_id: null,
    status: 'Active',
    ip_address: '',
    mac_address: '',
    pppoe_username: '',
    total_due: 0.00,
    expiry_date: null
  },
  bills: {
    user_id: 1,
    amount: 0.00,
    billing_month: '',
    due_date: new Date(),
    status: 'Unpaid'
  },
  payments: {
    user_id: 1,
    bill_id: null,
    amount: 0.00,
    transaction_id: '',
    payment_method: 'Cash',
    status: 'Pending',
    notes: ''
  },
  tickets: {
    user_id: 1,
    subject: '',
    description: '',
    status: 'Open',
    priority: 'Medium'
  },
  ticket_replies: {
    ticket_id: 1,
    user_id: 1,
    message: ''
  }
};

export function getMySQLPool(): mysql.Pool {
  if (!pool) {
    const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, DB_SSL_CA } = process.env;
    const config: any = {
      host: DB_HOST || '127.0.0.1',
      user: DB_USER || 'root',
      password: DB_PASSWORD || '',
      database: DB_NAME || 'defaultdb',
      port: Number(DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 15,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000
    };
    if (DB_SSL_CA && existsSync(DB_SSL_CA)) {
      config.ssl = {
        ca: readFileSync(DB_SSL_CA)
      };
    }
    pool = mysql.createPool(config);
  }
  return pool;
}

export async function initDatabase() {
  if (isInitialized) return;
  try {
    const activePool = getMySQLPool();
    const sqlPath = join(process.cwd(), 'database.sql');
    if (existsSync(sqlPath)) {
      console.log('[MySQL Adapter] Initializing core database tables from schema...');
      const sqlContent = readFileSync(sqlPath, 'utf8');
      
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        try {
          let query = statement;
          if (query.toLowerCase().startsWith('insert into')) {
            query = query.replace(/insert into/i, 'INSERT IGNORE INTO');
          }
          await activePool.query(query);
        } catch (err: any) {
          if (!err.message.includes('already exists') && !err.message.includes('Duplicate entry')) {
            console.warn(`[MySQL Init Warning]: ${err.message}`);
          }
        }
      }
      console.log('[MySQL Adapter] Initialization schema successfully applied.');
    }
    isInitialized = true;
  } catch (error: any) {
    console.error('[MySQL Init Error] Database schema migration failed:', error.message);
  }
}

function sanitizeRow(row: any): any {
  if (!row) return row;
  const copy = { ...row };
  for (const [key, val] of Object.entries(copy)) {
    if (typeof val === 'bigint') {
      copy[key] = Number(val);
    } else if (val instanceof Date) {
      copy[key] = val.toISOString();
    } else if ((key.endsWith('_id') || key.endsWith('Id')) && val !== null && val !== undefined) {
      copy[key] = String(val);
    }
  }
  return copy;
}

function safeParseId(id: string | number): any {
  return isNaN(Number(id)) ? id : Number(id);
}

class QuerySnapshot {
  docs: DocumentSnapshot[];
  get empty(): boolean {
    return this.docs.length === 0;
  }
  constructor(docs: DocumentSnapshot[]) {
    this.docs = docs;
  }
}

class DocumentSnapshot {
  id: string;
  private _data: any;
  get exists(): boolean {
    return this._data !== null && this._data !== undefined;
  }
  constructor(id: string, data: any) {
    this.id = id;
    this._data = data;
  }
  data() {
    return this._data;
  }
}

class DocumentReference {
  id: string;
  private _tableName: string;

  constructor(tableName: string, id: string) {
    this._tableName = tableName;
    this.id = id;
  }

  async get(): Promise<DocumentSnapshot> {
    await initDatabase();
    const activePool = getMySQLPool();
    const [rows]: any = await activePool.query(
      `SELECT * FROM \`${this._tableName}\` WHERE id = ?`,
      [safeParseId(this.id)]
    );
    if (rows.length === 0) {
      return new DocumentSnapshot(this.id, null);
    }
    return new DocumentSnapshot(this.id, sanitizeRow(rows[0]));
  }

  async set(payload: any, options?: { merge?: boolean }): Promise<void> {
    await initDatabase();
    const activePool = getMySQLPool();
    const defaults = SCHEMA_DEFAULTS[this._tableName] || {};
    const sanitizedPayload = { ...defaults, ...payload };
    const columns = SCHEMA_COLUMNS[this._tableName] || new Set();

    const [existing]: any = await activePool.query(
      `SELECT id FROM \`${this._tableName}\` WHERE id = ?`,
      [safeParseId(this.id)]
    );

    if (existing.length > 0) {
      await this.update(payload);
    } else {
      const dbIdVal = safeParseId(this.id);
      const fields = Object.keys(sanitizedPayload);
      const insertKeys = ['id'];
      const values: any[] = [dbIdVal];

      for (const field of fields) {
        const dbKey = field === 'createdAt' ? 'created_at' : (field === 'updatedAt' ? 'updated_at' : field);
        if (columns.has(dbKey) && dbKey !== 'id') {
          let val = sanitizedPayload[field];
          if (typeof val === 'object' && val instanceof Date) {
            // keep as-is
          } else if (typeof val === 'object' && val !== null) {
            val = JSON.stringify(val);
          }
          insertKeys.push(`\`${dbKey}\``);
          values.push(val);
        }
      }

      const keysStr = insertKeys.join(', ');
      const placeHolders = insertKeys.map(() => '?').join(', ');

      await activePool.query(
        `INSERT INTO \`${this._tableName}\` (${keysStr}) VALUES (${placeHolders})`,
        values
      );
    }
  }

  async update(payload: any): Promise<void> {
    await initDatabase();
    const activePool = getMySQLPool();
    const columns = SCHEMA_COLUMNS[this._tableName] || new Set();
    const setClause: string[] = [];
    const values: any[] = [];

    for (const [key, val] of Object.entries(payload)) {
      const dbKey = key === 'createdAt' ? 'created_at' : (key === 'updatedAt' ? 'updated_at' : key);
      if (columns.has(dbKey) && dbKey !== 'id') {
        let finalVal = val;
        if (typeof val === 'object' && val instanceof Date) {
          finalVal = val;
        } else if (typeof val === 'object' && val !== null) {
          finalVal = JSON.stringify(val);
        }
        setClause.push(`\`${dbKey}\` = ?`);
        values.push(finalVal);
      }
    }

    if (setClause.length === 0) return;

    values.push(safeParseId(this.id));
    await activePool.query(
      `UPDATE \`${this._tableName}\` SET ${setClause.join(', ')} WHERE id = ?`,
      values
    );
  }

  async delete(): Promise<void> {
    await initDatabase();
    const activePool = getMySQLPool();
    await activePool.query(
      `DELETE FROM \`${this._tableName}\` WHERE id = ?`,
      [safeParseId(this.id)]
    );
  }
}

type WhereClause = {
  field: string;
  op: string;
  value: any;
};

class CollectionQuery {
  protected _tableName: string;
  protected _whereClauses: WhereClause[] = [];

  constructor(tableName: string, whereClauses: WhereClause[] = []) {
    this._tableName = tableName;
    this._whereClauses = [...whereClauses];
  }

  where(field: string, op: string, value: any): CollectionQuery {
    return new CollectionQuery(this._tableName, [
      ...this._whereClauses,
      { field, op, value }
    ]);
  }

  count() {
    return {
      get: async () => {
        await initDatabase();
        const activePool = getMySQLPool();
        const { queryStr, params } = this.buildSQLQuery(true);
        const [rows]: any = await activePool.query(queryStr, params);
        const countValue = rows[0]?.count || 0;
        return {
          data: () => ({ count: countValue })
        };
      }
    };
  }

  async get(): Promise<QuerySnapshot> {
    await initDatabase();
    const activePool = getMySQLPool();
    const { queryStr, params } = this.buildSQLQuery(false);
    const [rows]: any = await activePool.query(queryStr, params);
    const docs = rows.map((row: any) => new DocumentSnapshot(String(row.id), sanitizeRow(row)));
    return new QuerySnapshot(docs);
  }

  private buildSQLQuery(isCount: boolean): { queryStr: string; params: any[] } {
    const selectClause = isCount ? 'COUNT(*) as count' : '*';
    let queryStr = `SELECT ${selectClause} FROM \`${this._tableName}\``;
    const params: any[] = [];
    const whereAnd: string[] = [];

    for (const clause of this._whereClauses) {
      let field = clause.field;
      if (field === 'createdAt') field = 'created_at';
      if (field === 'updatedAt') field = 'updated_at';

      let sqlOp = '=';
      if (clause.op === '==') sqlOp = '=';
      else if (clause.op === '!=') sqlOp = '!=';
      else if (clause.op === '>') sqlOp = '>';
      else if (clause.op === '>=') sqlOp = '>=';
      else if (clause.op === '<') sqlOp = '<';
      else if (clause.op === '<=') sqlOp = '<=';

      whereAnd.push(`\`${field}\` ${sqlOp} ?`);
      params.push(clause.value);
    }

    if (whereAnd.length > 0) {
      queryStr += ` WHERE ${whereAnd.join(' AND ')}`;
    }

    if (!isCount) {
      if (this._tableName === 'packages') {
        queryStr += ` ORDER BY price ASC`;
      } else if (['tickets', 'ticket_replies', 'users', 'bills', 'payments'].includes(this._tableName)) {
        queryStr += ` ORDER BY created_at DESC`;
      }
    }

    return { queryStr, params };
  }
}

class CollectionReference extends CollectionQuery {
  constructor(tableName: string) {
    super(tableName);
  }

  doc(id: string): DocumentReference {
    return new DocumentReference(this._tableName, id);
  }

  async add(payload: any): Promise<DocumentReference> {
    await initDatabase();
    const activePool = getMySQLPool();
    const defaults = SCHEMA_DEFAULTS[this._tableName] || {};
    const sanitizedPayload = { ...defaults, ...payload };
    const columns = SCHEMA_COLUMNS[this._tableName] || new Set();

    const insertKeys: string[] = [];
    const values: any[] = [];

    for (const [key, val] of Object.entries(sanitizedPayload)) {
      const dbKey = key === 'createdAt' ? 'created_at' : (key === 'updatedAt' ? 'updated_at' : key);
      if (columns.has(dbKey) && dbKey !== 'id') {
        let finalVal = val;
        if (typeof val === 'object' && val instanceof Date) {
          // keep as Date type
        } else if (typeof val === 'object' && val !== null) {
          finalVal = JSON.stringify(val);
        }
        insertKeys.push(`\`${dbKey}\``);
        values.push(finalVal);
      }
    }

    const keysStr = insertKeys.join(', ');
    const placeHolders = insertKeys.map(() => '?').join(', ');

    const [result]: any = await activePool.query(
      `INSERT INTO \`${this._tableName}\` (${keysStr}) VALUES (${placeHolders})`,
      values
    );

    const newId = String(result.insertId);
    return new DocumentReference(this._tableName, newId);
  }
}

export const db = {
  collection(collectionName: string) {
    return new CollectionReference(collectionName);
  }
} as any;

export const auth = {
  verifyIdToken: async (token: string) => {
    return { uid: 'mock_uid' };
  },
  getUser: async (uid: string) => {
    return { uid, email: 'admin@system.com' };
  }
} as any;
