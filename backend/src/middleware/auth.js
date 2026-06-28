import jwt from 'jsonwebtoken';
import { verifyToken, syncUserToDb } from '../services/auth.service.js';
import { UnauthorizedError } from './error.js';
import { getSupabase } from '../lib/supabase.js';
import { getLogger } from '../lib/logger.js';
import { loadEnv } from '../config/env.js';
export async function requireAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing bearer token'));
  }
  const token = header.slice('Bearer '.length).trim();
  if (process.env.NODE_ENV === 'test') {
    try {
      const { userId } = verifyToken(token);
      req.userId = userId;
      return next();
    } catch {
      return next(new UnauthorizedError('Invalid or expired token'));
    }
  }
  const env = loadEnv();
  const logger = getLogger();
  logger.info(
    { hasSupabaseUrl: !!env.SUPABASE_URL, hasAnonKey: !!env.SUPABASE_ANON_KEY },
    'requireAuth env check',
  );
  // Try remote verification via Supabase Auth API
  if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
    try {
      const { data, error } = await getSupabase().auth.getUser(token);
      if (!error && data?.user) {
        try {
          const localId = await syncUserToDb(
            data.user.id,
            data.user.email || '',
            data.user.user_metadata?.name || 'User',
          );
          req.userId = localId;
        } catch (syncErr) {
          logger.warn({ err: syncErr }, 'syncUserToDb failed (non-fatal), using Supabase ID');
          req.userId = data.user.id;
        }
        return next();
      }
      logger.error(
        { errorMessage: error?.message, status: error?.status },
        'Supabase getUser failed, falling back to local decode',
      );
    } catch (err) {
      logger.error({ err }, 'Supabase getUser threw, falling back to local decode');
    }
  }
  // Fallback: decode the JWT locally to extract user claims
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.sub || typeof decoded.sub !== 'string') {
      return next(new UnauthorizedError('Invalid or expired token'));
    }
    const skewTolerance = 300; // 5 minutes in seconds
    if (decoded.exp && Date.now() >= (decoded.exp + skewTolerance) * 1000) {
      logger.warn({ userId: decoded.sub }, 'requireAuth rejected expired token');
      return next(new UnauthorizedError('Invalid or expired token'));
    }
    const email = decoded.email;
    const name = decoded.user_metadata?.name || email?.split('@')[0] || 'User';
    try {
      const localId = await syncUserToDb(decoded.sub, email || '', name);
      req.userId = localId;
    } catch (syncErr) {
      logger.warn({ err: syncErr }, 'syncUserToDb failed (non-fatal), using decoded sub');
      req.userId = decoded.sub;
    }
    logger.info({ userId: req.userId }, 'requireAuth via local JWT decode');
    return next();
  } catch {
    return next(new UnauthorizedError('Invalid or expired token'));
  }
}
