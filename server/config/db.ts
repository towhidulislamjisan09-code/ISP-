import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

console.log("Connecting to MySQL...");

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: process.env.DB_SSL_CA
  }
});

// Startup test to verify connection
pool.getConnection()
  .then((conn) => {
    console.log("MySQL Connected Successfully");
    conn.release();
  })
  .catch((err) => {
    console.error("MySQL connection error:", err);
  });

export const db = pool;
