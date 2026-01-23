import {
  db as drizzleDb,
  getDb as getDrizzleDb,
} from "@/infrastructure/database/drizzle";

export function getDb() {
  return getDrizzleDb();
}

export function initDb() {
  return getDrizzleDb();
}

export const db = drizzleDb;
