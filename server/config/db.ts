import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Primary test connection verification block to output the required console log
pool.getConnection()
  .then((conn) => {
    console.log("MySQL Connected Successfully");
    conn.release();
  })
  .catch((err) => {
    console.error("[db] MySQL connection handshakes failed:", err);
  });

export const db = pool;
