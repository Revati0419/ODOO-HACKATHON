import mysql from 'mysql2';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'qa_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export as default
export default pool.promise();

// Alternative if you prefer named exports:
// export const db = pool.promise();