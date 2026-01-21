/**
 * Database Reset Script (Force - No Confirmation)
 *
 * Completely resets the database without user confirmation.
 * Useful for CI/CD pipelines and automated testing.
 *
 * WARNING: This will DELETE ALL DATA in the database IMMEDIATELY!
 *
 * Usage: npm run reset:db:force
 */

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import * as dotenv from "dotenv";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Load environment variables
const envLocalPath = join(process.cwd(), ".env.local");
if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config();
}

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not defined in environment variables!");
  console.error("Please create a .env.local file with DATABASE_URL");
  process.exit(1);
}

async function resetDatabase() {
  console.log("🔥 DATABASE RESET - Deleting all data...\n");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  try {
    // Step 1: Drop all tables
    console.log("🗑️  Step 1: Dropping all existing tables...");

    // Disable foreign key checks temporarily
    await db.execute(sql`SET session_replication_role = 'replica';`);

    // Get all table names
    const tables = await db.execute(sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
    `);

    // Drop each table
    for (const table of tables.rows) {
      const tableName = table.tablename;
      console.log(`   Dropping table: ${tableName}`);
      await db.execute(sql.raw(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`));
    }

    // Re-enable foreign key checks
    await db.execute(sql`SET session_replication_role = 'origin';`);

    console.log("✅ All tables dropped\n");

    // Step 2: Push schema to database
    console.log("📋 Step 2: Recreating database schema...");
    console.log("   Running: npx drizzle-kit push\n");

    try {
      execSync("npx drizzle-kit push --force", {
        stdio: "inherit",
        cwd: process.cwd(),
      });
      console.log("✅ Schema recreated successfully\n");
    } catch (error) {
      console.error("❌ Failed to push schema:", error);
      throw error;
    }

    // Step 3: Seed the database
    console.log("🌱 Step 3: Seeding database with test data...");
    console.log("   Running: npm run seed:db\n");

    try {
      execSync("npm run seed:db", {
        stdio: "inherit",
        cwd: process.cwd(),
      });
    } catch (error) {
      console.error("❌ Failed to seed database:", error);
      throw error;
    }

    console.log("\n✅ Database reset completed successfully!");
    console.log("\n📊 Your database is now fresh with test data.");
    console.log("\n👤 Test Accounts:");
    console.log("   Admin: admin@learningcards.com / password123");
    console.log("   User 1: john@example.com / password123");
    console.log("   User 2: jane@example.com / password123");
    console.log("   User 3: bob@example.com / password123\n");
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    throw error;
  } finally {
    await pool.end();
    process.exit(0);
  }
}

resetDatabase();
