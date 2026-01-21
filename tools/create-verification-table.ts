/**
 * Script to create the verification table for Better Auth
 * Run with: npx tsx tools/create-verification-table.ts
 */

import { sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/drizzle";

async function createVerificationTable() {
  try {
    console.log("Creating verification table...");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "verification" (
        "id" text PRIMARY KEY NOT NULL,
        "identifier" varchar(255) NOT NULL,
        "value" varchar(255) NOT NULL,
        "expires_at" timestamp NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    console.log("✅ Verification table created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating verification table:", error);
    process.exit(1);
  }
}

createVerificationTable();
