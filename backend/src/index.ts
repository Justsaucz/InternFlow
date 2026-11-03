import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { allowedOrigins } from './lib/config';
import prisma from './lib/prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

import authRoutes from './routes/auth.routes';
import jobsRoutes from './routes/jobs.routes';
import applicationsRoutes from './routes/applications.routes';
import studentRoutes from './routes/student.routes';
import companyRoutes from './routes/company.routes';
import uploadRoutes, { uploadedFiles } from './routes/upload.routes';
import dashboardRoutes from './routes/dashboard.routes';
import logbookRoutes from './routes/logbook.routes';
import evaluationRoutes from './routes/evaluation.routes';
import profileRoutes from './routes/profile.routes';

app.use(cors({ origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)) }));
app.disable('x-powered-by');
app.use(express.json());

// Only public profile images may be read without an authenticated API request.
app.use('/uploads', uploadedFiles);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'InternFlow API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/logbook', logbookRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/profile', profileRoutes);

app.get('/api/ready', async (_req, res) => {
  try { await prisma.$queryRaw`SELECT 1`; res.json({ status: 'ready' }); }
  catch { res.status(503).json({ status: 'unavailable' }); }
});
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
process.on('SIGTERM', () => {
  server.close(() => { prisma.$disconnect().finally(() => process.exit(0)); });
  setTimeout(() => process.exit(1), 10000).unref();
});
