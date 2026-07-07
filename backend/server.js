import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import laporanRoutes from './routes/laporan.js';
import perusahaanRoutes from './routes/perusahaan.js';
import logRoutes from './routes/log.js';
import notifikasiRoutes from './routes/notifikasi.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/perusahaan', perusahaanRoutes);
app.use('/api/log', logRoutes);
app.use('/api/notifikasi', notifikasiRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 SIPEL Backend running at http://localhost:${PORT}`);
});
