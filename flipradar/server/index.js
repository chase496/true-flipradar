import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import scannerRoutes from './routes/scanner.js';
import supplierRoutes from './routes/supplier.js';
import feedRoutes from './routes/feed.js';
import competitionRoutes from './routes/competition.js';
import { checkRateLimit, getRateLimitInfo } from './middleware/rateLimit.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Usage tracking endpoint
app.get('/api/usage', (req, res) => {
  const clientId = req.headers['x-client-id'] || req.ip;
  const info = getRateLimitInfo(clientId);
  res.json(info);
});

// Routes — scanner is rate-limited, others are free
app.use('/api/scanner', checkRateLimit, scannerRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/competition', competitionRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n⚡ FlipRadar API running on http://localhost:${PORT}\n`);
});
