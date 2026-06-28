import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { loadEnv } from '../config/env.js';
import { query, withClient } from '../lib/db.js';
import { ConflictError, UnauthorizedError, BadRequestError } from '../middleware/error.js';
import { getLogger } from '../lib/logger.js';
import { getSupabase } from '../lib/supabase.js';
const BCRYPT_COST = 12;
function isUniqueViolation(err) {
  return typeof err === 'object' && err !== null && 'code' in err && err.code === '23505';
}
function toUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at.toISOString(),
  };
}
export async function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_COST);
}
export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
export function signToken(userId) {
  const env = loadEnv();
  const payload = { sub: userId };
  const options = { expiresIn: env.JWT_EXPIRES_IN };
  return jwt.sign(payload, env.JWT_SECRET, options);
}
export function verifyToken(token) {
  const env = loadEnv();
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (!decoded.sub || typeof decoded.sub !== 'string') {
    throw new UnauthorizedError('Invalid token payload');
  }
  return { userId: decoded.sub };
}
export async function syncUserToDb(id, email, name) {
  const rows = await query(
    `INSERT INTO users (id, name, email, password_hash)
     VALUES ($1, $2, $3, '')
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [id, name, email],
  );
  return rows[0]?.id ?? id;
}
export async function registerUser(input) {
  const { name, email, password } = input;
  if (process.env.NODE_ENV !== 'test') {
    const { data, error } = await getSupabase().auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    if (error) {
      if (error.status === 409) {
        throw new ConflictError('Email already registered');
      }
      throw new BadRequestError(error.message);
    }
    if (!data.user) {
      throw new BadRequestError('Failed to create user in Supabase');
    }
    const user = {
      id: data.user.id,
      name,
      email,
      createdAt: data.user.created_at || new Date().toISOString(),
    };
    await syncUserToDb(user.id, user.email, user.name);
    const token = data.session?.access_token || '';
    return { user, token };
  }
  // Local/Test Fallback
  const passwordHash = await hashPassword(password);
  try {
    const row = await withClient(async (client) => {
      const result = await client.query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, name, email, password_hash, created_at`,
        [name, email, passwordHash],
      );
      if (!result.rows[0]) throw new Error('Insert returned no row');
      return result.rows[0];
    });
    const user = toUser(row);
    const token = signToken(user.id);
    return { user, token };
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new ConflictError('Email already registered');
    }
    getLogger().error({ err }, 'registerUser failed');
    throw err;
  }
}
export async function loginUser(input) {
  const { email, password } = input;
  if (process.env.NODE_ENV !== 'test') {
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new UnauthorizedError(error.message);
    }
    if (!data.user || !data.session) {
      throw new UnauthorizedError('Invalid credentials');
    }
    const user = {
      id: data.user.id,
      name: data.user.user_metadata?.name || 'User',
      email: data.user.email || '',
      createdAt: data.user.created_at || new Date().toISOString(),
    };
    await syncUserToDb(user.id, user.email, user.name);
    return { user, token: data.session.access_token };
  }
  // Local/Test Fallback
  const rows = await query(
    `SELECT id, name, email, password_hash, created_at
     FROM users WHERE email = $1 LIMIT 1`,
    [email],
  );
  const row = rows[0];
  if (!row) {
    throw new UnauthorizedError('Invalid credentials');
  }
  if (!row.password_hash) {
    throw new UnauthorizedError('Invalid credentials');
  }
  const ok = await comparePassword(password, row.password_hash);
  if (!ok) {
    throw new UnauthorizedError('Invalid credentials');
  }
  const user = toUser(row);
  const token = signToken(user.id);
  return { user, token };
}
