/**
 * Drizzle Kit Configuration (PostgreSQL)
 *
 * Configuration for Drizzle Kit CLI tool.
 * Used for schema introspection, migrations, and studio.
 *
 * Commands:
 * - `npx drizzle-kit generate` - Generate SQL migrations from schema changes
 * - `npx drizzle-kit migrate` - Apply migrations to the database
 * - `npx drizzle-kit push` - Push schema changes directly (dev only)
 * - `npx drizzle-kit studio` - Open Drizzle Studio (database GUI)
 * - `npx drizzle-kit introspect` - Generate schema from existing database
 */

import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load environment variables
dotenv.config({ path: ".env.local" });

export default defineConfig({
  // Database dialect
  dialect: "postgresql",

  // Path to schema files
  schema: "./src/infrastructure/database/schema/*",

  // Output directory for generated migrations
  out: "./drizzle/migrations",

  // Database connection
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  // Verbose logging
  verbose: true,

  // Strict mode - fail on warnings
  strict: true,

  // Table filtering (optional)
  // tablesFilter: ['users', 'posts'],

  // Schema filtering (optional - for multi-schema databases)
  // schemaFilter: ['public'],
});
