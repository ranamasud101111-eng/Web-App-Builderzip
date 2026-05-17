import pg from 'pg';
const { Pool } = pg;

const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
const isSupabase = !!process.env.SUPABASE_DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: isSupabase
    ? { rejectUnauthorized: false }
    : process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

pool.on('connect', () => {
  console.log(`DB connected [${isSupabase ? 'Supabase' : 'Replit PostgreSQL'}]`);
});

pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

export default pool;
