import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/mud',
});

export const db = drizzle(pool, { schema });

// Export all schema tables for easy imports
export * from './schema.js';
