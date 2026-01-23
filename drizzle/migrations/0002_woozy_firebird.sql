CREATE TABLE "ai_generated_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_type" varchar(20) NOT NULL,
	"source_url" text,
	"source_file_name" varchar(255),
	"extracted_text" text,
	"generated_cards" jsonb,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"user_id" text NOT NULL,
	"model_used" varchar(100),
	"tokens_used" integer,
	"estimated_cost" numeric(10, 6),
	"error_message" text,
	"approved_count" integer DEFAULT 0 NOT NULL,
	"rejected_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ai_hints" (
	"id" serial PRIMARY KEY NOT NULL,
	"flashcard_id" integer NOT NULL,
	"hint" text NOT NULL,
	"model_used" varchar(100) NOT NULL,
	"tokens_used" integer NOT NULL,
	"request_count" integer DEFAULT 1 NOT NULL,
	"last_requested_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_hints_flashcard_unique_idx" UNIQUE("flashcard_id")
);
--> statement-breakpoint
CREATE TABLE "ai_response_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"cache_key" varchar(255) NOT NULL,
	"prompt_hash" varchar(64) NOT NULL,
	"prompt" text NOT NULL,
	"response" text NOT NULL,
	"model_used" varchar(100) NOT NULL,
	"request_type" varchar(50) NOT NULL,
	"tokens_used" integer NOT NULL,
	"estimated_cost" numeric(10, 6) NOT NULL,
	"hit_count" integer DEFAULT 0 NOT NULL,
	"last_accessed_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_response_cache_cache_key_unique" UNIQUE("cache_key")
);
--> statement-breakpoint
CREATE TABLE "ai_usage_quotas" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"daily_request_count" integer DEFAULT 0 NOT NULL,
	"daily_token_count" integer DEFAULT 0 NOT NULL,
	"monthly_request_count" integer DEFAULT 0 NOT NULL,
	"monthly_token_count" integer DEFAULT 0 NOT NULL,
	"daily_reset_at" timestamp NOT NULL,
	"monthly_reset_at" timestamp NOT NULL,
	"is_blocked" boolean DEFAULT false NOT NULL,
	"block_reason" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_usage_quotas_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "ai_usage_tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"request_type" varchar(50) NOT NULL,
	"model_used" varchar(100) NOT NULL,
	"tokens_used" integer NOT NULL,
	"estimated_cost" numeric(10, 6) NOT NULL,
	"was_from_cache" boolean DEFAULT false NOT NULL,
	"response_time_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_gaps" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"topic" varchar(255) NOT NULL,
	"category_id" integer,
	"success_rate" integer NOT NULL,
	"affected_user_count" integer NOT NULL,
	"total_users" integer NOT NULL,
	"prerequisite_concepts" jsonb,
	"recommended_actions" jsonb,
	"bridge_deck_generated" boolean DEFAULT false NOT NULL,
	"bridge_deck_id" integer,
	"severity" varchar(20) DEFAULT 'medium' NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"detected_at" timestamp DEFAULT now() NOT NULL,
	"addressed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "live_session_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"flashcard_id" integer NOT NULL,
	"answer" text,
	"is_correct" boolean NOT NULL,
	"response_time_ms" integer NOT NULL,
	"points_earned" integer NOT NULL,
	"card_index" integer NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_session_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"left_at" timestamp,
	"total_score" integer DEFAULT 0 NOT NULL,
	"correct_answers" integer DEFAULT 0 NOT NULL,
	"total_answers" integer DEFAULT 0 NOT NULL,
	"average_response_time" integer DEFAULT 0 NOT NULL,
	"rank" integer
);
--> statement-breakpoint
CREATE TABLE "live_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_type" varchar(50) NOT NULL,
	"group_id" integer NOT NULL,
	"host_id" text NOT NULL,
	"category_id" integer,
	"config" jsonb,
	"status" varchar(20) DEFAULT 'waiting' NOT NULL,
	"current_card_index" integer DEFAULT 0 NOT NULL,
	"selected_flashcards" jsonb,
	"started_at" timestamp,
	"ended_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "online_presence" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"group_id" integer,
	"session_id" text,
	"status" varchar(20) DEFAULT 'online' NOT NULL,
	"last_seen" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_session_token_unique";--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "token" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "expires_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "ip_address" varchar(45);--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "ai_generated_content" ADD CONSTRAINT "ai_generated_content_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_hints" ADD CONSTRAINT "ai_hints_flashcard_id_flashcards_id_fk" FOREIGN KEY ("flashcard_id") REFERENCES "public"."flashcards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_quotas" ADD CONSTRAINT "ai_usage_quotas_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_tracking" ADD CONSTRAINT "ai_usage_tracking_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_gaps" ADD CONSTRAINT "knowledge_gaps_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_gaps" ADD CONSTRAINT "knowledge_gaps_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_session_answers" ADD CONSTRAINT "live_session_answers_session_id_live_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."live_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_session_answers" ADD CONSTRAINT "live_session_answers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_session_participants" ADD CONSTRAINT "live_session_participants_session_id_live_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."live_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_session_participants" ADD CONSTRAINT "live_session_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD CONSTRAINT "live_sessions_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD CONSTRAINT "live_sessions_host_id_users_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_presence" ADD CONSTRAINT "online_presence_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_presence" ADD CONSTRAINT "online_presence_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_content_user_idx" ON "ai_generated_content" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_content_status_idx" ON "ai_generated_content" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ai_content_created_idx" ON "ai_generated_content" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ai_hints_flashcard_idx" ON "ai_hints" USING btree ("flashcard_id");--> statement-breakpoint
CREATE INDEX "ai_hints_expires_idx" ON "ai_hints" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "ai_cache_key_idx" ON "ai_response_cache" USING btree ("cache_key");--> statement-breakpoint
CREATE INDEX "ai_cache_prompt_hash_idx" ON "ai_response_cache" USING btree ("prompt_hash");--> statement-breakpoint
CREATE INDEX "ai_cache_expires_idx" ON "ai_response_cache" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "ai_cache_request_type_idx" ON "ai_response_cache" USING btree ("request_type");--> statement-breakpoint
CREATE INDEX "ai_cache_last_accessed_idx" ON "ai_response_cache" USING btree ("last_accessed_at");--> statement-breakpoint
CREATE INDEX "ai_quotas_user_idx" ON "ai_usage_quotas" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_quotas_daily_reset_idx" ON "ai_usage_quotas" USING btree ("daily_reset_at");--> statement-breakpoint
CREATE INDEX "ai_quotas_monthly_reset_idx" ON "ai_usage_quotas" USING btree ("monthly_reset_at");--> statement-breakpoint
CREATE INDEX "ai_usage_user_idx" ON "ai_usage_tracking" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_usage_created_idx" ON "ai_usage_tracking" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ai_usage_user_date_idx" ON "ai_usage_tracking" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "ai_usage_request_type_idx" ON "ai_usage_tracking" USING btree ("request_type");--> statement-breakpoint
CREATE INDEX "knowledge_gaps_group_idx" ON "knowledge_gaps" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "knowledge_gaps_category_idx" ON "knowledge_gaps" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "knowledge_gaps_status_idx" ON "knowledge_gaps" USING btree ("status");--> statement-breakpoint
CREATE INDEX "knowledge_gaps_severity_idx" ON "knowledge_gaps" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "live_answers_session_idx" ON "live_session_answers" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "live_answers_user_idx" ON "live_session_answers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "live_answers_flashcard_idx" ON "live_session_answers" USING btree ("flashcard_id");--> statement-breakpoint
CREATE INDEX "live_answers_session_user_idx" ON "live_session_answers" USING btree ("session_id","user_id");--> statement-breakpoint
CREATE INDEX "live_participants_session_idx" ON "live_session_participants" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "live_participants_user_idx" ON "live_session_participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "live_participants_session_user_idx" ON "live_session_participants" USING btree ("session_id","user_id");--> statement-breakpoint
CREATE INDEX "live_sessions_group_idx" ON "live_sessions" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "live_sessions_host_idx" ON "live_sessions" USING btree ("host_id");--> statement-breakpoint
CREATE INDEX "live_sessions_status_idx" ON "live_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "live_sessions_created_idx" ON "live_sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "presence_user_idx" ON "online_presence" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "presence_group_idx" ON "online_presence" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "presence_session_idx" ON "online_presence" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "presence_status_idx" ON "online_presence" USING btree ("status");--> statement-breakpoint
CREATE INDEX "presence_last_seen_idx" ON "online_presence" USING btree ("last_seen");--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "session_token";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "expires";--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_token_unique" UNIQUE("token");