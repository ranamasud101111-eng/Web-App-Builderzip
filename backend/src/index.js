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
// Always-allowed origins (hardcoded). Additional origins can be added via the
// ALLOWED_ORIGINS environment variable (comma-separated) on Render.
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

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
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

app.get('/', (req, res) =>
  res.send('Backend is running successfully 🚀')
);

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' })
);


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
