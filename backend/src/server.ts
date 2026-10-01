import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

import { connectDB } from './config/db';
import { seedDatabase } from './utils/seed';
import authRoutes from './routes/authRoutes';
import publicRoutes from './routes/publicRoutes';
import adminRoutes from './routes/adminRoutes';
import { authenticateToken } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Rate limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

// High-frequency analytics rate limiter
const analyticsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/public/business/:slug/view', analyticsLimiter);
app.use('/api/public/business/:slug/links/:linkId/click', analyticsLimiter);

// Body parsers & Cookie parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static uploads folder
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Business Link Hub Standalone API',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Global Error]', err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    // Run seed to guarantee admin & initial profile exists
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Business Link Hub API running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔑 Admin Quick Access PIN: 753753`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
