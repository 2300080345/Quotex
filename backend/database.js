require('dotenv').config();
const { Pool } = require('pg');

async function setupDatabase() {
  if (process.env.DATABASE_URL) {
    console.log('🔗 Connecting to Supabase (PostgreSQL)...');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // Required for Supabase
    });

    // Drop old tables with INTEGER ids to reset schema
    await pool.query(`
      DROP TABLE IF EXISTS comments CASCADE;
      DROP TABLE IF EXISTS quote_likes CASCADE;
      DROP TABLE IF EXISTS quotes CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // Create PostgreSQL Tables (Using UUIDs for Supabase Auth)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY, -- References auth.users(id)
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        tier TEXT DEFAULT 'Bronze Writer',
        "avatarUrl" TEXT
      );

      CREATE TABLE IF NOT EXISTS quotes (
        id SERIAL PRIMARY KEY,
        "userId" UUID REFERENCES users(id),
        text TEXT NOT NULL,
        category TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS quote_likes (
        "userId" UUID REFERENCES users(id),
        "quoteId" INTEGER REFERENCES quotes(id),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY ("userId", "quoteId")
      );

      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        "userId" UUID REFERENCES users(id),
        "quoteId" INTEGER REFERENCES quotes(id),
        text TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS daily_quote (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        text TEXT NOT NULL,
        author TEXT NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // The Magic Database Translator (Translates SQLite API into PostgreSQL API)
    const convertSql = (sql) => {
      let i = 1;
      // Replace SQLite '?' with Postgres '$1, $2'
      // Also quote camelCase column names that Postgres lowercases by default
      return sql.replace(/\?/g, () => `$${i++}`)
                .replace(/userId/g, '"userId"')
                .replace(/quoteId/g, '"quoteId"')
                .replace(/avatarUrl/g, '"avatarUrl"')
                .replace(/isVerified/g, '"isVerified"')
                .replace(/createdAt/g, '"createdAt"')
                .replace(/userName/g, '"userName"')
                .replace(/userAvatar/g, '"userAvatar"')
                .replace(/userTotalLikes/g, '"userTotalLikes"')
                .replace(/authorName/g, '"authorName"');
    };

    return {
      get: async (sql, params = []) => {
        const res = await pool.query(convertSql(sql), params);
        return res.rows[0];
      },
      all: async (sql, params = []) => {
        const res = await pool.query(convertSql(sql), params);
        return res.rows;
      },
      run: async (sql, params = []) => {
        let pgSql = convertSql(sql);
        // Postgres needs RETURNING id to get the last inserted ID
        let isInsert = pgSql.trim().toUpperCase().startsWith('INSERT');
        if (isInsert && !pgSql.toUpperCase().includes('RETURNING')) {
          pgSql += ' RETURNING id';
        }
        const res = await pool.query(pgSql, params);
        return { lastID: res.rows[0]?.id };
      }
    };

  } else {
    console.log('💾 Connecting to Local SQLite (Fallback)...');
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        isVerified INTEGER DEFAULT 0,
        otp TEXT,
        name TEXT,
        tier TEXT DEFAULT 'Bronze Writer',
        avatarUrl TEXT
      );

      CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        text TEXT NOT NULL,
        category TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS quote_likes (
        userId INTEGER,
        quoteId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (userId, quoteId),
        FOREIGN KEY (userId) REFERENCES users (id),
        FOREIGN KEY (quoteId) REFERENCES quotes (id)
      );

      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        quoteId INTEGER,
        text TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id),
        FOREIGN KEY (quoteId) REFERENCES quotes (id)
      );

      CREATE TABLE IF NOT EXISTS daily_quote (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        text TEXT NOT NULL,
        author TEXT NOT NULL,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    try {
      await db.exec('ALTER TABLE users ADD COLUMN avatarUrl TEXT');
    } catch (e) {
      // Ignore error if column already exists
    }

    return db;
  }
}

module.exports = setupDatabase;
