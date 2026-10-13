import { createApp } from './app.js';
import { ENV } from './config/env.js';
import { initDatabase } from './db/dbAdapter.js';

async function bootstrap() {
  console.log('====================================================');
  console.log('  AgriMarket Production Backend (Node.js & TypeScript)');
  console.log('====================================================');

  // Initialize Database (PostgreSQL with auto-migrations or Mock In-Memory fallback)
  await initDatabase();

  const app = createApp();
  const port = ENV.PORT;

  const server = app.listen(port, () => {
    console.log(`[Server] AgriMarket API listening on port ${port} (http://localhost:${port})`);
    console.log(`[Server] Health check: http://localhost:${port}/api/health`);
    console.log(`[Server] Environment: ${ENV.NODE_ENV}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('[Server] Gracefully shutting down...');
    server.close(() => {
      console.log('[Server] Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
