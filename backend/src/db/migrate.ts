import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(): Promise<boolean> {
  const client = await pool.connect();
  try {
    console.log('[Database] Checking schema migrations...');

    // Create flyway_schema_history table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS flyway_schema_history (
        installed_rank INT NOT NULL PRIMARY KEY,
        version VARCHAR(50),
        description VARCHAR(200) NOT NULL,
        type VARCHAR(20) NOT NULL,
        script VARCHAR(1000) NOT NULL,
        checksum INT,
        installed_by VARCHAR(100) NOT NULL,
        installed_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        execution_time INT NOT NULL,
        success BOOLEAN NOT NULL
      );
    `);

    const installedRes = await client.query(
      'SELECT version FROM flyway_schema_history WHERE success = true'
    );
    const installedVersions = new Set(installedRes.rows.map((r: { version: string }) => r.version));

    const migrationsDir = path.resolve(__dirname, '../../migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.warn('[Database] Migrations directory not found at:', migrationsDir);
      return true;
    }

    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));

    // Sort by integer version extracted from V<number>__...
    files.sort((a, b) => {
      const matchA = a.match(/^V(\d+)/i);
      const matchB = b.match(/^V(\d+)/i);
      const numA = matchA ? parseInt(matchA[1], 10) : 0;
      const numB = matchB ? parseInt(matchB[1], 10) : 0;
      return numA - numB;
    });

    let rank = installedVersions.size + 1;

    for (const file of files) {
      const match = file.match(/^V(\d+)__(.+)\.sql$/i);
      if (!match) continue;

      const version = match[1];
      const description = match[2].replace(/_/g, ' ');

      if (installedVersions.has(version)) {
        continue;
      }

      console.log(`[Database] Applying migration V${version}: ${description}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      const startTime = Date.now();
      await client.query('BEGIN');
      try {
        await client.query(sql);
        const duration = Date.now() - startTime;

        await client.query(
          `INSERT INTO flyway_schema_history
           (installed_rank, version, description, type, script, installed_by, execution_time, success)
           VALUES ($1, $2, $3, 'SQL', $4, 'agrimarket_node', $5, true)`,
          [rank, version, description, file, duration]
        );

        await client.query('COMMIT');
        rank++;
        console.log(`[Database] Applied V${version} successfully in ${duration}ms`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`[Database] Migration failed on ${file}:`, err);
        throw err;
      }
    }

    console.log('[Database] All migrations applied successfully.');
    return true;
  } finally {
    client.release();
  }
}
