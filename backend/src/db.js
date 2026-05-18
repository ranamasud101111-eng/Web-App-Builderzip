import pg from 'pg';
const { Pool } = pg;

// In production (Render): set DATABASE_URL to your Supabase connection string.
// In development (Replit): DATABASE_URL is automatically the Replit PostgreSQL.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('FATAL: DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const isSupabase = connectionString.includes('supabase.co');

const pool = new Pool({
  connectionString,
  ssl: isSupabase || process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

pool.on('connect', () => {
  console.log(`[DB] Connected — ${isSupabase ? 'Supabase PostgreSQL' : 'Replit PostgreSQL'}`);
});

pool.on('error', (err) => {
  console.error('[DB] Pool error:', err.message);
});

export default pool;
