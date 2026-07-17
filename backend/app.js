import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import laporanRoutes from './routes/laporan.js';
import perusahaanRoutes from './routes/perusahaan.js';
import logRoutes from './routes/log.js';
import notifikasiRoutes from './routes/notifikasi.js';
import usersRoutes from './routes/users.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/perusahaan', perusahaanRoutes);
app.use('/api/log', logRoutes);
app.use('/api/notifikasi', notifikasiRoutes);
app.use('/api/users', usersRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
