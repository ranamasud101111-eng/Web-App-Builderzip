import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import subjectRoutes from './routes/subjects.js';
import chapterRoutes from './routes/chapters.js';
import notificationRoutes from './routes/notifications.js';
import userRoutes from './routes/users.js';
import mcqRoutes from './routes/mcqs.js';

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

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, '127.0.0.1', () => {
  console.log(`CA Mock API running on port ${PORT}`);
});
