ALTER TABLE "accounts" ALTER COLUMN "type" SET DEFAULT 'oauth';--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "access_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "refresh_token_expires_at" timestamp;