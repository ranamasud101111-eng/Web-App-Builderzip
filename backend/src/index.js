import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from './db.js';
import authRoutes from './routes/auth.js';
import subjectRoutes from './routes/subjects.js';
import chapterRoutes from './routes/chapters.js';
import notificationRoutes from './routes/notifications.js';
import userRoutes from './routes/users.js';
import mcqRoutes from './routes/mcqs.js';
import examRoutes from './routes/exams.js';
import classRoutes from './routes/classes.js';
import flashcardRoutes from './routes/flashcards.js';
import shortnotesRoutes from './routes/shortnotes.js';
import qbankRoutes from './routes/qbank.js';
import settingsRoutes from './routes/settings.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3001;

// ── Startup validation ────────────────────────────────────────────────────────
if (IS_PRODUCTION) {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

// ── App ───────────────────────────────────────────────────────────────────────
const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
// Development: allow all origins.
// Production: only allow origins listed in ALLOWED_ORIGINS (comma-separated).
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

app.use(cors({
  origin: (origin, callback) => {
    if (!IS_PRODUCTION) return callback(null, true);
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`CORS blocked request from origin: ${origin}`);
    callback(new Error(`Origin ${origin} not allowed by CORS policy`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mcqs', mcqRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/shortnotes', shortnotesRoutes);
app.use('/api/qbank', qbankRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/', (req, res) =>
  res.send('Backend is running successfully 🚀')
);

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' })
);

// ── Database connection test ───────────────────────────────────────────────────
app.get('/api/test-db', async (req, res) => {
  try {
    // 1. Basic connectivity
    const pingResult = await pool.query('SELECT NOW() AS server_time, version() AS pg_version');
    const { server_time, pg_version } = pingResult.rows[0];

    // 2. Insert a test record
    await pool.query(`
      CREATE TABLE IF NOT EXISTS _db_test (
        id SERIAL PRIMARY KEY,
        message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`INSERT INTO _db_test (message) VALUES ($1)`, ['connection-test']);

    // 3. Fetch it back
    const fetchResult = await pool.query(`SELECT * FROM _db_test ORDER BY id DESC LIMIT 5`);

    // 4. Clean up
    await pool.query(`DROP TABLE IF EXISTS _db_test`);

    res.json({
      status: 'ok',
      database: process.env.SUPABASE_DATABASE_URL ? 'Supabase PostgreSQL' : 'Replit PostgreSQL',
      server_time,
      pg_version: pg_version.split(' ').slice(0, 2).join(' '),
      insert_test: 'passed',
      fetch_test: `passed — ${fetchResult.rows.length} row(s) fetched`,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
      database: process.env.SUPABASE_DATABASE_URL ? 'Supabase PostgreSQL' : 'Replit PostgreSQL',
    });
  }
});

// ── Database schema (development only) ───────────────────────────────────────
async function initDb() {
  try {
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Database schema initialized');
  } catch (err) {
    console.error('Failed to initialize database schema:', err.message);
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  if (!IS_PRODUCTION) {
    await initDb();
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CA Mock API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

start();
