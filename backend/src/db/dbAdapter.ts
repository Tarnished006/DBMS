import { pool } from './pool.js';
import { runMigrations } from './migrate.js';
import { memoryDb, initMemoryStore } from './memoryStore.js';

let isUsingPostgres = false;

export async function initDatabase(): Promise<void> {
  try {
    console.log('[Database] Testing PostgreSQL connection...');
    const client = await pool.connect();
    client.release();
    console.log('[Database] PostgreSQL connected successfully.');
    isUsingPostgres = true;
    await runMigrations();
  } catch (err: any) {
    console.warn('[Database] PostgreSQL connection failed or credentials not configured:', err?.message || err);
    console.info('[Database] Switching to in-memory store for high-performance zero-config execution...');
    isUsingPostgres = false;
    await initMemoryStore();
  }
}

export function isPostgres(): boolean {
  return isUsingPostgres;
}

export const db = {
  async query<T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }> {
    if (isUsingPostgres) {
      const res = await pool.query(text, params);
      return { rows: res.rows, rowCount: res.rowCount || 0 };
    }
    // Fallback: If not using PostgreSQL, the services use memoryDb directly for CRUD operations
    return { rows: [], rowCount: 0 };
  },
};
