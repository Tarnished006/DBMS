import pg from 'pg';
import { ENV } from '../config/env.js';

const { Pool } = pg;

export const pool = new Pool(
  ENV.DB_URL
    ? { connectionString: ENV.DB_URL, max: 20, idleTimeoutMillis: 30000 }
    : {
        host: ENV.DB_HOST,
        port: ENV.DB_PORT,
        database: ENV.DB_NAME,
        user: ENV.DB_USERNAME,
        password: ENV.DB_PASSWORD,
        max: 20,
        idleTimeoutMillis: 30000,
      }
);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});
