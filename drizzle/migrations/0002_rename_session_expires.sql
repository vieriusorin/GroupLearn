-- Rename sessions.expires to sessions.expires_at for Better Auth compatibility
ALTER TABLE "sessions" RENAME COLUMN "expires" TO "expires_at";
