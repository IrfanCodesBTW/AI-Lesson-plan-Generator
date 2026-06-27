import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { loadEnv } from './config/env';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { lessonsRouter } from './routes/lessons';
import { exportRouter } from './routes/export';
import { analyticsRouter } from './routes/analytics';
import { operationsRouter } from './routes/operations';
import { errorHandler, notFoundHandler } from './middleware/error';
import { getLogger } from './lib/logger';

export function createApp(): Application {
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

  app.use((req: Request, _res: Response, next: NextFunction) => {
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

  app.get('/', (_req, res) => {
    res.json({ service: 'ai-lesson-generator-backend', docs: '/health' });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
