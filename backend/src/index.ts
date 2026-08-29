import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

import authRoutes from './routes/auth.routes';
import jobsRoutes from './routes/jobs.routes';
import applicationsRoutes from './routes/applications.routes';
import studentRoutes from './routes/student.routes';
import adminRoutes from './routes/admin.routes';
import companyRoutes from './routes/company.routes';
import uploadRoutes from './routes/upload.routes';
import dashboardRoutes from './routes/dashboard.routes';
import universityRoutes from './routes/university.routes';
import logbookRoutes from './routes/logbook.routes';
import evaluationRoutes from './routes/evaluation.routes';
import path from 'path';

app.use(cors());
app.use(express.json());

// Serve static files for mock S3 uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'InternFlow API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/logbook', logbookRoutes);
app.use('/api/evaluations', evaluationRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
