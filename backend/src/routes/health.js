import { Router } from 'express';
import { isGeminiConfigured } from '../config/env.js';
export const healthRouter = Router();
healthRouter.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'ai-lesson-generator-backend',
    version: '0.1.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    gemini: isGeminiConfigured() ? 'configured' : 'fallback',
  });
});
