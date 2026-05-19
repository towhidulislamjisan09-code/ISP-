import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

console.log("Connecting to MySQL...");

const dbHost = process.env.DB_HOST || process.env.DATABASE_HOST || '127.0.0.1';
const dbPort = process.env.DB_PORT || process.env.DATABASE_PORT || '3306';
const dbUser = process.env.DB_USER || process.env.DATABASE_USER || '';
const dbPassword = process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || '';
const dbName = process.env.DB_NAME || process.env.DATABASE_NAME || '';

export const pool = mysql.createPool({
  host: dbHost,
  port: parseInt(dbPort, 10),
  user: dbUser,
  password: dbPassword,
  database: dbName,
  ssl: process.env.DB_SSL_CA ? {
    ca: process.env.DB_SSL_CA,
    rejectUnauthorized: false
  } : {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then((conn) => {
    console.log("MySQL Connected Successfully");
    conn.release();
  })
  .catch((err) => {
    console.error("[db] MySQL connection handshakes failed:", err.message || err);
  });

export const db = pool;
