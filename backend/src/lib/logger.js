import pino from 'pino';
import { loadEnv } from '../config/env.js';
let _logger = null;
function buildLogger() {
  const env = loadEnv();
  const isDev = env.NODE_ENV === 'development';
  return pino({
    level: env.LOG_LEVEL,
    ...(isDev
      ? {
          transport: {
            target: 'pino-pretty',
            options: { colorize: true, translateTime: 'SYS:standard' },
          },
        }
      : {}),
    redact: {
      paths: ['req.headers.authorization', '*.password', '*.passwordHash', '*.token'],
      censor: '[REDACTED]',
    },
  });
}
export function getLogger() {
  if (!_logger) _logger = buildLogger();
  return _logger;
}
export const logger = new Proxy(
  {},
  {
    get(_target, prop) {
      return Reflect.get(getLogger(), prop);
    },
  },
);
