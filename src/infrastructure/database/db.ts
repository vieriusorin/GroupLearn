import { db as drizzleDb, getDb as getDrizzleDb } from "./drizzle";

export function getDb() {
  return getDrizzleDb();
}

export const db = drizzleDb;

export function initDb() {
  return getDrizzleDb();
}
