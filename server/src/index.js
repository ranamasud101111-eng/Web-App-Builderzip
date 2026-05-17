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

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

async function initDb() {
  try {
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Database schema initialized');
  } catch (err) {
    console.error('Failed to initialize database schema:', err.message);
  }
}

initDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CA Mock API running on port ${PORT}`);
  });
});
