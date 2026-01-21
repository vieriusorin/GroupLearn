-- Rename sessions.session_token to sessions.token for Better Auth compatibility
ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_session_token_unique";
ALTER TABLE "sessions" RENAME COLUMN "session_token" TO "token";
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_token_unique" UNIQUE ("token");
