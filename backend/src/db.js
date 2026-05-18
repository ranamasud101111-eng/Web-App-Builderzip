import pg from 'pg';
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('FATAL: DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const isSupabase =
  connectionString.includes('supabase.co') ||
  connectionString.includes('pooler.supabase.com');

const isPooler = connectionString.includes('pooler.supabase.com');
const isReplit = !isSupabase;

const pool = new Pool({
  connectionString,
  ssl: isSupabase
    ? { rejectUnauthorized: false }
    : false,
  ...(isPooler ? { max: 10, idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000 } : {}),
});

pool.on('connect', () => {
  const label = isPooler
    ? 'Supabase Pooler'
    : isSupabase
    ? 'Supabase PostgreSQL'
    : 'Replit PostgreSQL';
  console.log(`[DB] Connected — ${label}`);
});

pool.on('error', (err) => {
  console.error('[DB] Pool error:', err.message);
});

export default pool;
