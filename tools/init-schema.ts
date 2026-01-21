/**
 * Initialize PostgreSQL database schema using Drizzle Kit
 * Pushes the schema to the database without generating migration files
 */

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
const envLocalPath = join(process.cwd(), ".env.local");
if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
  console.log("✅ Loaded environment variables from .env.local\n");
} else {
  dotenv.config(); // Fallback to .env
}

console.log("🚀 Initializing PostgreSQL database schema...\n");

try {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set!");
    console.log("\nPlease create a .env.local file with:");
    console.log(
      'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/learning_cards?schema=public"\n',
    );
    process.exit(1);
  }

  console.log(
    `📊 Database: ${process.env.DATABASE_URL.replace(/:[^:]*@/, ":****@")}\n`,
  );

  console.log("📋 Using Drizzle Kit to push schema to database...\n");

  // Use drizzle-kit push to sync schema to database
  execSync("npx drizzle-kit push", {
    stdio: "inherit",
    env: process.env,
  });

  console.log("\n✅ Database schema initialized successfully!");
  console.log("\n📝 Next steps:");
  console.log("   - Run: npm run seed:db (to populate with test data)");
  console.log("   - Run: npx drizzle-kit studio (to view database in GUI)");
} catch (error) {
  console.error("\n❌ Failed to initialize schema:", error);
  console.log("\n💡 Troubleshooting:");
  console.log("   1. Make sure PostgreSQL is running: docker-compose up -d");
  console.log("   2. Check DATABASE_URL in .env.local");
  console.log("   3. Verify database connection: npm run check:db");
  process.exit(1);
}
