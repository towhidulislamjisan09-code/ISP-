import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
  port: 4000,
  user: "DhZiWPLmxpjnxwC.root",
  password: "VeIMA2KTntS2HT1G",
  database: "sys",
  ssl: {
    rejectUnauthorized: true
  },
  waitForConnections: true,
  connectionLimit: 10
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log("TiDB Connected Successfully");
    conn.release();

    // Verify required tables exist without creating them
    const tables = ['users', 'packages', 'bills', 'payments', 'tickets'];
    for (const table of tables) {
      try {
        await pool.query(`SELECT 1 FROM \`${table}\` LIMIT 1`);
        console.log(`[db] Verified table exists: ${table}`);
      } catch (err: any) {
        console.warn(`[db] Table lookup check for "${table}":`, err.message || err);
      }
    }
  } catch (err) {
    console.error("TiDB Connection Failed:", err);
  }
}

testConnection();

export const db = pool;
export default pool;
