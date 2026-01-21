-- Add ipAddress and userAgent fields to sessions table for Better Auth compatibility
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "ip_address" VARCHAR(45);
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "user_agent" TEXT;
