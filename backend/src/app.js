import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { loadEnv } from './config/env.js';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { lessonsRouter } from './routes/lessons.js';
import { exportRouter } from './routes/export.js';
import { analyticsRouter } from './routes/analytics.js';
import { operationsRouter } from './routes/operations.js';
import { curriculumRouter } from './routes/curriculum.js';
import { materialsRouter } from './routes/materials.js';
import { communicationsRouter } from './routes/communications.js';
import { managementRouter } from './routes/management.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { getLogger } from './lib/logger.js';
export function createApp() {
  const env = loadEnv();
  const app = express();
  const logger = getLogger();
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use((req, _res, next) => {
    logger.debug({ method: req.method, url: req.url }, 'request');
    next();
  });
  // Rate limit on auth routes
  const authLimiter = rateLimit({
    windowMs: 60_000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { code: 'RATE_LIMITED', message: 'Too many auth attempts' } },
  });
  app.use('/health', healthRouter);
  app.use('/api/auth', authLimiter, authRouter);
  app.use('/api/lessons', lessonsRouter);
  app.use('/api/export', exportRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/operations', operationsRouter);
  app.use('/api/curriculum', curriculumRouter);
  app.use('/api/materials', materialsRouter);
  app.use('/api/communications', communicationsRouter);
  app.use('/api/management', managementRouter);
  app.get('/', (_req, res) => {
    res.json({ service: 'ai-lesson-generator-backend', docs: '/health' });
  });
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
