import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
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
import progressRoutes from './routes/progress.js';
import todoRoutes from './routes/todos.js';

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
const HARDCODED_ORIGINS = [
  'https://optireachhub.com',
  'https://www.optireachhub.com',
  'http://optireachhub.com',
  'http://www.optireachhub.com',
];

const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

const allowedOrigins = [...new Set([...HARDCODED_ORIGINS, ...envOrigins])];

const REPLIT_DOMAIN_RE = /\.replit\.dev$|\.repl\.co$/;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (REPLIT_DOMAIN_RE.test(origin)) return callback(null, true);
    if (!IS_PRODUCTION) return callback(null, true);
    console.warn(`CORS blocked: ${origin}`);
    callback(new Error(`Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
app.use('/api/progress', progressRoutes);
app.use('/api/todos', todoRoutes);

app.get('/', (req, res) =>
  res.send('Backend is running successfully 🚀')
);

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' })
);


// ── Database schema ───────────────────────────────────────────────────────────
async function initDb() {
  try {
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Database schema initialized');
  } catch (err) {
    console.error('Failed to initialize database schema:', err.message);
  }
}

// ── Auto-create admin if none exists ──────────────────────────────────────────
async function ensureAdminExists() {
  try {
    const existing = await pool.query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    );
    if (existing.rows.length > 0) {
      console.log('[Admin] Admin account already exists — skipping seed');
      return;
    }

    const ADMIN_EMAIL    = 'ranamasud101111@gmail.com';
    const TEMP_PASSWORD  = 'Admin@1234';
    const hashed = await bcrypt.hash(TEMP_PASSWORD, 12);

    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, email_verified)
       VALUES ($1, $2, $3, 'admin', TRUE)`,
      ['Admin', ADMIN_EMAIL, hashed]
    );

    console.log(`[Admin] Admin account created — email: ${ADMIN_EMAIL} | temp password: ${TEMP_PASSWORD}`);
    console.log('[Admin] IMPORTANT: Log in and change your password immediately.');
  } catch (err) {
    console.error('[Admin] Failed to seed admin account:', err.message);
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  await initDb();
  await ensureAdminExists();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CA Mock API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

start();
