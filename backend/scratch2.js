const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT c.*, u.name as "userName", u."avatarUrl" as "userAvatar" FROM comments c LEFT JOIN users u ON c."userId" = u.id').then(res => {
  console.log(res.rows);
  process.exit(0);
});
