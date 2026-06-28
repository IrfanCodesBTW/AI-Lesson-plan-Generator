import 'dotenv/config';
import { createApp } from './app.js';
import { loadEnv } from './config/env.js';
import { getLogger } from './lib/logger.js';
import { runMigrations } from './lib/migrate.js';
const env = loadEnv();
const logger = getLogger();
async function main() {
  if (env.NODE_ENV === 'production') {
    logger.info('running database migrations');
    await runMigrations('up');
    logger.info('migrations complete');
  }
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'backend started');
  });
  registerShutdown(server);
}
function shutdown(server, signal) {
  logger.info({ signal }, 'shutting down');
  server.close((err) => {
    if (err) {
      logger.error({ err }, 'error during shutdown');
      process.exit(1);
    }
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
function registerShutdown(server) {
  process.on('SIGINT', () => shutdown(server, 'SIGINT'));
  process.on('SIGTERM', () => shutdown(server, 'SIGTERM'));
  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'unhandled rejection');
  });
}
main().catch((err) => {
  logger.error({ err }, 'fatal startup error');
  process.exit(1);
});
