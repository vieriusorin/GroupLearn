/**
 * Drizzle ORM Client Initialization (PostgreSQL)
 *
 * This file initializes the Drizzle ORM with node-postgres driver.
 * It provides a type-safe database client for querying and mutations.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
// Load environment variables if not already loaded
import * as dotenv from "dotenv";

// Try to load .env.local first, then .env
const envLocalPath = join(process.cwd(), ".env.local");
if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: false });
} else {
  dotenv.config({ override: false });
}

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { schema } from "./schema";

let pool: Pool | null = null;
let drizzleInstance: ReturnType<typeof drizzle> | null = null;

/**
 * Gets or creates the PostgreSQL connection pool
 * Uses environment variables for configuration
 */
function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL is not defined. Please set it in your .env.local or .env file.\n" +
          'Example: DATABASE_URL="postgresql://user:password@localhost:5432/dbname"',
      );
    }

    pool = new Pool({
      connectionString: databaseUrl,
      // Connection pool settings
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
    });

    // Handle pool errors
    pool.on("error", (err) => {
      console.error("Unexpected error on idle PostgreSQL client", err);
      process.exit(-1);
    });
  }
  return pool;
}

/**
 * Gets the Drizzle ORM instance with full schema
 * This is the main entry point for database operations
 *
 * @returns Drizzle database client with type-safe queries
 *
 * @example
 * ```ts
 * import { db } from '@/infrastructure/database/drizzle';
 * import { users } from '@/infrastructure/database/schema';
 * import { eq } from 'drizzle-orm';
 *
 * // Select all users
 * const allUsers = await db.select().from(users);
 *
 * // Select with condition
 * const user = await db.select().from(users).where(eq(users.id, userId));
 *
 * // Insert
 * await db.insert(users).values({ email: 'test@example.com', ... });
 *
 * // Update
 * await db.update(users).set({ name: 'New Name' }).where(eq(users.id, userId));
 *
 * // Delete
 * await db.delete(users).where(eq(users.id, userId));
 * ```
 */
export function getDb() {
  if (!drizzleInstance) {
    const pgPool = getPool();
    drizzleInstance = drizzle(pgPool, { schema });
  }
  return drizzleInstance;
}

/**
 * Main database client export
 * Use this for all database operations
 */
export const db = getDb();

/**
 * Close the database connection pool
 * Useful for cleanup in tests or scripts
 */
export async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
    drizzleInstance = null;
  }
}

/**
 * Type export for the database client
 * Useful for dependency injection
 */
export type DbClient = ReturnType<typeof getDb>;
