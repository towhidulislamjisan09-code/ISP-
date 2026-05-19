import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const db = mysql.createPool({
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'isp_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialization SQL (Users can run this in their DB)
/*
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'customer') DEFAULT 'customer',
  status ENUM('Active', 'Suspended', 'Expired') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
  id INT PRIMARY KEY,
  user_id INT,
  phone VARCHAR(20),
  address TEXT,
  package VARCHAR(50),
  expiry_date DATE,
  ip VARCHAR(45),
  mac VARCHAR(17),
  due DECIMAL(10, 2) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
*/
