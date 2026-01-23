# Learning Cards - Detailed Task Breakdown

> **Format**: Each task includes Status, Priority, Dependencies, Acceptance Criteria, and Implementation Notes
> **Status**: 🔴 Not Started | 🟡 In Progress | 🟢 Completed | 🔵 Blocked

---

## Phase 0: Infrastructure Foundations

### 0.1.1: Evaluate and Choose Real-Time Provider
**Status**: 🟢 Completed
**Priority**: P0 (Critical)
**Estimated Time**: 4 hours
**Dependencies**: None

**Acceptance Criteria**:
- [x] Research document comparing Socket.io, Supabase Realtime, Ably, Pusher
- [x] Decision matrix with criteria: cost, latency, DX, scalability, auth integration
- [x] Final recommendation with justification
- [ ] Proof of concept: Simple presence system working

**Decision Made**: Socket.io
**Rationale**:
1. Self-hosted - no external service dependencies
2. Full control over real-time infrastructure
3. Works seamlessly with Next.js API routes
4. No additional costs
5. Proven reliability and extensive community support
6. Better integration with existing Better Auth session management

---

### 0.1.2: Install Socket.io Dependencies & Configuration
**Status**: 🔴 Not Started
**Priority**: P0 (Critical)
**Estimated Time**: 3 hours
**Dependencies**: 0.1.1

**Acceptance Criteria**:
- [ ] Dependencies installed: `socket.io` and `socket.io-client`
- [ ] Socket.io server created in custom Next.js server or API route
- [ ] Environment variables configured for feature flag
- [ ] Connection utility created at `src/lib/realtime/socket-client.ts`
- [ ] Reconnection logic handles network failures
- [ ] Type definitions exported for real-time events
- [ ] Better Auth session middleware for Socket.io connections

**Implementation Notes**:
```bash
npm install socket.io socket.io-client
```

**Environment variables** (`.env.example`):
```bash
# Feature Flags
NEXT_PUBLIC_FEATURE_REALTIME=false
NEXT_PUBLIC_FEATURE_AI_COACH=false
NEXT_PUBLIC_FEATURE_BLITZ_QUIZ=false
NEXT_PUBLIC_FEATURE_AI_GENERATION=false

# Socket.io Configuration
SOCKET_IO_PATH=/api/socketio
```

File: `src/lib/realtime/socket-client.ts`
```ts
import { io, Socket } from 'socket.io-client';

export type RealtimeEvent =
  | { type: 'presence_update'; payload: { userId: string; status: string } }
  | { type: 'session_started'; payload: { sessionId: string } }
  | { type: 'session:card_revealed'; payload: { sessionId: number; cardIndex: number } };

let socket: Socket | null = null;

export function initSocket(sessionToken: string): Socket {
  if (!socket) {
    socket = io({
      path: process.env.NEXT_PUBLIC_SOCKET_IO_PATH || '/api/socketio',
      auth: { token: sessionToken },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });
  }
  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
```

---

### 0.1.3: Create Presence System Database Schema
**Status**: 🔴 Not Started
**Priority**: P0 (Critical)
**Estimated Time**: 3 hours
**Dependencies**: 0.1.2

**Acceptance Criteria**:
- [ ] Drizzle schema created in `src/infrastructure/database/schema/realtime.schema.ts`
- [ ] Migration generated: `npx drizzle-kit generate`
- [ ] Migration applied: `npx drizzle-kit push`
- [ ] Table has indexes on `userId`, `groupId`, `sessionId`
- [ ] Zod schema exported for validation

**Implementation**:
```ts
// src/infrastructure/database/schema/realtime.schema.ts
export const onlinePresence = pgTable('online_presence', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  groupId: integer('group_id').references(() => groups.id, { onDelete: 'cascade' }),
  sessionId: text('session_id'), // For live quiz sessions
  status: varchar('status', { enum: ['online', 'away', 'offline'] }).notNull(),
  lastSeen: timestamp('last_seen').notNull().defaultNow(),
  metadata: jsonb('metadata').$type<{ currentActivity?: string; currentPath?: number }>(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('presence_user_idx').on(table.userId),
  groupIdIdx: index('presence_group_idx').on(table.groupId),
  sessionIdIdx: index('presence_session_idx').on(table.sessionId),
}));
```

---

### 0.1.4: Implement Presence Heartbeat System
**Status**: 🔴 Not Started
**Priority**: P0 (Critical)
**Estimated Time**: 6 hours
**Dependencies**: 0.1.3

**Acceptance Criteria**:
- [ ] React hook `usePresence` broadcasts heartbeat every 30s
- [ ] Server Action `updatePresence` upserts presence record
- [ ] Real-time subscription shows online users in group
- [ ] Stale presence cleanup task (Trigger.dev)
- [ ] UI component `<OnlineIndicator>` shows online/away/offline

**Implementation**:

File: `src/hooks/usePresence.ts`
```ts
export function usePresence(groupId?: number, sessionId?: string) {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    const interval = setInterval(async () => {
      await updatePresence({
        userId: session.user.id,
        groupId,
        sessionId,
        status: document.hasFocus() ? 'online' : 'away',
      });
    }, 30_000); // 30 seconds

    return () => clearInterval(interval);
  }, [session?.user?.id, groupId, sessionId]);
}
```

Trigger.dev task:
```ts
// src/trigger/tasks/cleanup-stale-presence.ts
export const cleanupStalePresence = task({
  id: "cleanup-stale-presence",
  run: async () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    await db.update(onlinePresence)
      .set({ status: 'offline' })
      .where(lt(onlinePresence.lastSeen, fiveMinutesAgo));
  },
});
```

---

### 0.2.1: Create AI Domain Structure
**Status**: 🔴 Not Started
**Priority**: P1 (High)
**Estimated Time**: 4 hours
**Dependencies**: None

**Acceptance Criteria**:
- [ ] Directory created: `src/domains/ai/`
- [ ] Subdirectories: `services/`, `repositories/`, `entities/`, `value-objects/`
- [ ] Service interfaces defined:
  - `AICoachService` - Socratic hints, gap analysis
  - `ContentGenerationService` - Flashcard generation from text/audio
  - `KnowledgeMapService` - Dependency graph generation
- [ ] Repository interface: `IAIGeneratedContentRepository`
- [ ] Export barrel files created

**Implementation**:
```ts
// src/domains/ai/services/AICoachService.ts
export interface AICoachService {
  generateSocraticHint(flashcard: Flashcard): Promise<string>;
  analyzeGroupWeaknesses(groupId: number): Promise<KnowledgeGap[]>;
  suggestBridgeDeck(gap: KnowledgeGap): Promise<FlashcardDraft[]>;
}

// src/domains/ai/entities/KnowledgeGap.ts
export class KnowledgeGap {
  constructor(
    public readonly topic: string,
    public readonly successRate: number,
    public readonly affectedUsers: number,
    public readonly prerequisiteConcepts: string[]
  ) {}
}
```

---

### 0.2.2: Create AI Wrapper SDK with Model Selection
**Status**: 🔴 Not Started
**Priority**: P1 (High)
**Estimated Time**: 10 hours
**Dependencies**: 0.2.1

**Acceptance Criteria**:
- [ ] AI SDK wrapper created at `src/lib/ai/ai-sdk.ts`
- [ ] Model selection logic based on task complexity
- [ ] Retry logic with exponential backoff implemented
- [ ] Rate limiting with queue (max 50 requests/min)
- [ ] Error handling for 429, 500, timeout
- [ ] Usage tracking (token count, cost estimation per user)
- [ ] Response caching layer implemented
- [ ] Per-user usage limits enforced
- [ ] Feature flag integration
- [ ] Environment variable `ANTHROPIC_API_KEY` configured

**Implementation Strategy**:
```ts
// src/lib/ai/ai-sdk.ts
import Anthropic from '@anthropic-ai/sdk';

export enum AIModelTier {
  FAST = 'fast',        // Haiku - Simple tasks, low cost
  BALANCED = 'balanced', // Sonnet - Most tasks, good balance
  POWERFUL = 'powerful'  // Opus - Complex analysis only
}

export interface AIRequestOptions {
  modelTier?: AIModelTier;
  maxTokens?: number;
  temperature?: number;
  userId: string;
  cacheKey?: string;
  bypassCache?: boolean;
}

const MODEL_CONFIG = {
  [AIModelTier.FAST]: {
    model: 'claude-3-5-haiku-20241022',
    maxTokens: 1024,
    costPer1kTokens: 0.001, // Example pricing
  },
  [AIModelTier.BALANCED]: {
    model: 'claude-sonnet-4-5-20250929',
    maxTokens: 2048,
    costPer1kTokens: 0.003,
  },
  [AIModelTier.POWERFUL]: {
    model: 'claude-opus-4-5-20251101',
    maxTokens: 4096,
    costPer1kTokens: 0.015,
  },
};

// Model selection based on task type
export function selectModelForTask(taskType: string): AIModelTier {
  switch (taskType) {
    case 'socratic_hint':
    case 'simple_flashcard':
      return AIModelTier.FAST;

    case 'flashcard_generation':
    case 'gap_analysis':
      return AIModelTier.BALANCED;

    case 'bridge_deck':
    case 'knowledge_map':
      return AIModelTier.POWERFUL;

    default:
      return AIModelTier.BALANCED;
  }
}

export class AIService {
  private client: Anthropic;

  async generate(prompt: string, options: AIRequestOptions): Promise<string> {
    // 1. Check feature flag
    if (!process.env.NEXT_PUBLIC_FEATURE_AI_COACH) {
      throw new Error('AI features are disabled');
    }

    // 2. Check user usage limits
    await this.checkUsageLimits(options.userId);

    // 3. Check cache
    if (options.cacheKey && !options.bypassCache) {
      const cached = await this.getFromCache(options.cacheKey);
      if (cached) return cached;
    }

    // 4. Select model and generate
    const config = MODEL_CONFIG[options.modelTier || AIModelTier.BALANCED];
    const response = await this.callAPI(prompt, config);

    // 5. Track usage
    await this.trackUsage(options.userId, response.usage);

    // 6. Cache response
    if (options.cacheKey) {
      await this.saveToCache(options.cacheKey, response.text);
    }

    return response.text;
  }

  private async checkUsageLimits(userId: string): Promise<void> {
    // Check daily/monthly limits per user
  }

  private async trackUsage(userId: string, usage: any): Promise<void> {
    // Track tokens and cost
  }
}
```

---

### 0.2.3: Create AI Prompt Templates
**Status**: 🔴 Not Started
**Priority**: P1 (High)
**Estimated Time**: 8 hours
**Dependencies**: 0.2.2

**Acceptance Criteria**:
- [ ] Template files created in `src/lib/ai/prompts/`
- [ ] Prompts tested with Claude API
- [ ] Validation: Output parsing succeeds with structured data
- [ ] Templates include:
  - `generate-flashcards.ts` - From text/PDF
  - `socratic-hint.ts` - Question-based hints
  - `gap-analysis.ts` - Identify missing prerequisites
  - `bridge-deck.ts` - Generate prerequisite cards

**Implementation**:
```ts
// src/lib/ai/prompts/generate-flashcards.ts
export function buildFlashcardGenerationPrompt(content: string, count: number = 10): string {
  return `
You are a learning specialist creating flashcards for spaced repetition study.

CONTENT TO ANALYZE:
${content}

TASK: Generate exactly ${count} high-quality flashcards from this content.

OUTPUT FORMAT (JSON array):
[
  {
    "question": "Clear, specific question (use Markdown for formatting)",
    "answer": "Concise, accurate answer (use Markdown)",
    "difficulty": "easy" | "medium" | "hard",
    "hints": "Optional context for Socratic hints"
  }
]

REQUIREMENTS:
1. Focus on key concepts, not trivia
2. Questions should test understanding, not just recall
3. Use clear, unambiguous language
4. Difficulty:
   - easy: Basic facts and definitions
   - medium: Application of concepts
   - hard: Analysis, synthesis, edge cases
5. Return ONLY the JSON array, no additional text

Generate the flashcards:
`.trim();
}

// src/lib/ai/prompts/socratic-hint.ts
export function buildSocraticHintPrompt(question: string, answer: string): string {
  return `
You are a Socratic tutor helping a student learn through guided questions.

FLASHCARD:
Question: ${question}
Answer: ${answer}

TASK: Provide a Socratic hint that guides the student toward the answer WITHOUT revealing it.

REQUIREMENTS:
1. Ask a leading question that prompts thinking
2. Do NOT include the answer or key terms
3. Focus on the reasoning process
4. Keep it brief (1-2 sentences)
5. Use an encouraging tone

Example:
Question: "What does the 'await' keyword do in JavaScript?"
Bad hint: "It waits for a Promise to resolve" (reveals answer)
Good hint: "What happens when you need to pause execution until an async operation completes?"

Provide your Socratic hint:
`.trim();
}
```

---

### 0.2.4: Create AI Database Schema with Usage Tracking
**Status**: 🔴 Not Started
**Priority**: P1 (High)
**Estimated Time**: 6 hours
**Dependencies**: 0.2.1

**Acceptance Criteria**:
- [ ] Schema file: `src/infrastructure/database/schema/ai.schema.ts`
- [ ] Tables created:
  - `ai_generated_content`
  - `ai_response_cache` (aggressive caching)
  - `ai_usage_tracking` (per-user limits)
  - `ai_hints` (hint cache)
  - `knowledge_gaps`
- [ ] Migration generated and applied
- [ ] Zod schemas exported
- [ ] Indexes on foreign keys and cache lookup fields

**Implementation**:
```ts
// src/infrastructure/database/schema/ai.schema.ts
export const aiGeneratedContent = pgTable('ai_generated_content', {
  id: serial('id').primaryKey(),
  sourceType: varchar('source_type', { enum: ['pdf', 'url', 'text', 'audio'] }).notNull(),
  sourceUrl: text('source_url'),
  extractedText: text('extracted_text'),
  generatedCards: jsonb('generated_cards').$type<FlashcardDraft[]>(),
  status: varchar('status', { enum: ['pending', 'processing', 'completed', 'failed'] }).notNull().default('pending'),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  modelUsed: varchar('model_used', { length: 100 }),
  tokensUsed: integer('tokens_used'),
  estimatedCost: decimal('estimated_cost', { precision: 10, scale: 6 }),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  userIdIdx: index('ai_content_user_idx').on(table.userId),
  statusIdx: index('ai_content_status_idx').on(table.status),
}));

// Cache AI responses to reduce costs
export const aiResponseCache = pgTable('ai_response_cache', {
  id: serial('id').primaryKey(),
  cacheKey: varchar('cache_key', { length: 255 }).notNull().unique(),
  prompt: text('prompt').notNull(),
  response: text('response').notNull(),
  modelUsed: varchar('model_used', { length: 100 }).notNull(),
  tokensUsed: integer('tokens_used').notNull(),
  hitCount: integer('hit_count').notNull().default(0),
  lastAccessedAt: timestamp('last_accessed_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at').notNull(), // Cache TTL
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  cacheKeyIdx: index('ai_cache_key_idx').on(table.cacheKey),
  expiresAtIdx: index('ai_cache_expires_idx').on(table.expiresAt),
}));

// Track per-user AI usage for limits
export const aiUsageTracking = pgTable('ai_usage_tracking', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  requestType: varchar('request_type', {
    length: 50,
    enum: ['socratic_hint', 'flashcard_generation', 'gap_analysis', 'bridge_deck']
  }).notNull(),
  modelUsed: varchar('model_used', { length: 100 }).notNull(),
  tokensUsed: integer('tokens_used').notNull(),
  estimatedCost: decimal('estimated_cost', { precision: 10, scale: 6 }).notNull(),
  wasFromCache: boolean('was_from_cache').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('ai_usage_user_idx').on(table.userId),
  createdAtIdx: index('ai_usage_created_idx').on(table.createdAt),
  userDateIdx: index('ai_usage_user_date_idx').on(table.userId, table.createdAt),
}));

// Hint cache (specific to flashcards)
export const aiHints = pgTable('ai_hints', {
  id: serial('id').primaryKey(),
  flashcardId: integer('flashcard_id').notNull().references(() => flashcards.id, { onDelete: 'cascade' }),
  hint: text('hint').notNull(),
  modelUsed: varchar('model_used', { length: 100 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  flashcardIdx: index('ai_hints_flashcard_idx').on(table.flashcardId),
  expiresAtIdx: index('ai_hints_expires_idx').on(table.expiresAt),
}));

export const knowledgeGaps = pgTable('knowledge_gaps', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  topic: varchar('topic', { length: 255 }).notNull(),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  successRate: integer('success_rate').notNull(),
  affectedUserCount: integer('affected_user_count').notNull(),
  prerequisiteConcepts: jsonb('prerequisite_concepts').$type<string[]>(),
  bridgeDeckGenerated: boolean('bridge_deck_generated').notNull().default(false),
  detectedAt: timestamp('detected_at').notNull().defaultNow(),
}, (table) => ({
  groupIdx: index('knowledge_gaps_group_idx').on(table.groupId),
}));
```

---

## Phase 1: Real-Time Collaborative Learning

### 1.1.1: Create Live Sessions Database Schema
**Status**: 🔴 Not Started
**Priority**: P0 (Critical)
**Estimated Time**: 4 hours
**Dependencies**: 0.1.3

**Acceptance Criteria**:
- [ ] Schema file: `src/infrastructure/database/schema/live-sessions.schema.ts`
- [ ] Tables created:
  - `live_sessions`
  - `live_session_participants`
  - `live_session_answers`
- [ ] Foreign keys and indexes defined
- [ ] Zod schemas exported
- [ ] Migration applied

**Implementation**:
```ts
export const liveSessions = pgTable('live_sessions', {
  id: serial('id').primaryKey(),
  sessionType: varchar('session_type', { enum: ['blitz_quiz', 'study_room', 'peer_review'] }).notNull(),
  groupId: integer('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  hostId: text('host_id').notNull().references(() => users.id),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  config: jsonb('config').$type<{
    cardCount: number;
    timeLimit: number; // seconds per card
    allowHints: boolean;
  }>(),
  status: varchar('status', { enum: ['waiting', 'active', 'completed', 'cancelled'] }).notNull().default('waiting'),
  currentCardIndex: integer('current_card_index').notNull().default(0),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  groupIdx: index('live_sessions_group_idx').on(table.groupId),
  statusIdx: index('live_sessions_status_idx').on(table.status),
}));

export const liveSessionParticipants = pgTable('live_session_participants', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').notNull().references(() => liveSessions.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  totalScore: integer('total_score').notNull().default(0),
  rank: integer('rank'),
  leftAt: timestamp('left_at'),
}, (table) => ({
  sessionUserIdx: index('live_participants_session_user_idx').on(table.sessionId, table.userId),
}));

export const liveSessionAnswers = pgTable('live_session_answers', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').notNull().references(() => liveSessions.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id),
  flashcardId: integer('flashcard_id').notNull().references(() => flashcards.id),
  answer: text('answer'), // For text-based answers
  isCorrect: boolean('is_correct').notNull(),
  responseTimeMs: integer('response_time_ms').notNull(),
  pointsEarned: integer('points_earned').notNull(),
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
}, (table) => ({
  sessionIdx: index('live_answers_session_idx').on(table.sessionId),
}));
```

---

### 1.1.2: Create Live Session Commands
**Status**: 🔴 Not Started
**Priority**: P0 (Critical)
**Estimated Time**: 8 hours
**Dependencies**: 1.1.1

**Acceptance Criteria**:
- [ ] Commands created:
  - `CreateLiveSession.command.ts`
  - `JoinLiveSession.command.ts`
  - `StartLiveSession.command.ts`
  - `SubmitLiveAnswer.command.ts`
  - `EndLiveSession.command.ts`
- [ ] Handlers implemented with business logic
- [ ] Validation with Zod schemas
- [ ] Domain events emitted (e.g., `SessionStartedEvent`)
- [ ] Unit tests for each handler

**Implementation Example**:
```ts
// src/commands/live-session/CreateLiveSession.command.ts
export const createLiveSessionSchema = z.object({
  groupId: z.number().int().positive(),
  categoryId: z.number().int().positive().optional(),
  sessionType: z.enum(['blitz_quiz', 'study_room', 'peer_review']),
  config: z.object({
    cardCount: z.number().int().min(5).max(50),
    timeLimit: z.number().int().min(10).max(120), // seconds
    allowHints: z.boolean(),
  }),
});

export type CreateLiveSessionCommand = z.infer<typeof createLiveSessionSchema>;

// src/commands/handlers/live-session/CreateLiveSessionHandler.ts
export async function handleCreateLiveSession(
  command: CreateLiveSessionCommand,
  userId: string
): Promise<number> {
  // 1. Validate user is group admin
  const member = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, command.groupId),
      eq(groupMembers.userId, userId)
    ),
  });

  if (!member || member.role !== GroupRole.ADMIN) {
    throw new DomainError('Only group admins can create live sessions');
  }

  // 2. Create session
  const [session] = await db.insert(liveSessions).values({
    sessionType: command.sessionType,
    groupId: command.groupId,
    hostId: userId,
    categoryId: command.categoryId,
    config: command.config,
    status: 'waiting',
  }).returning();

  // 3. Auto-join host
  await db.insert(liveSessionParticipants).values({
    sessionId: session.id,
    userId,
  });

  // 4. Emit event for real-time updates
  await broadcastToGroup(command.groupId, {
    type: 'live_session_created',
    payload: { sessionId: session.id },
  });

  return session.id;
}
```

---

### 1.1.3: Create Live Session Queries
**Status**: 🔴 Not Started
**Priority**: P0 (Critical)
**Estimated Time**: 6 hours
**Dependencies**: 1.1.1

**Acceptance Criteria**:
- [ ] Queries created:
  - `GetActiveLiveSessions.query.ts` - For group
  - `GetLiveSessionDetail.query.ts`
  - `GetLiveSessionLeaderboard.query.ts`
  - `GetLiveSessionParticipants.query.ts`
- [ ] Handlers with optimized SQL
- [ ] Real-time data freshness (<1s latency)
- [ ] Pagination support for large sessions

**Implementation**:
```ts
// src/queries/live-session/GetLiveSessionLeaderboard.query.ts
export const getLiveSessionLeaderboardSchema = z.object({
  sessionId: z.number().int().positive(),
});

export type GetLiveSessionLeaderboardQuery = z.infer<typeof getLiveSessionLeaderboardSchema>;

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar: string | null;
  totalScore: number;
  rank: number;
  correctAnswers: number;
  averageResponseTime: number;
}

// Handler
export async function handleGetLiveSessionLeaderboard(
  query: GetLiveSessionLeaderboardQuery
): Promise<LeaderboardEntry[]> {
  const results = await db
    .select({
      userId: liveSessionParticipants.userId,
      userName: users.name,
      userAvatar: users.image,
      totalScore: liveSessionParticipants.totalScore,
      rank: liveSessionParticipants.rank,
    })
    .from(liveSessionParticipants)
    .innerJoin(users, eq(liveSessionParticipants.userId, users.id))
    .where(eq(liveSessionParticipants.sessionId, query.sessionId))
    .orderBy(desc(liveSessionParticipants.totalScore));

  // Calculate additional stats from answers
  const stats = await db
    .select({
      userId: liveSessionAnswers.userId,
      correctAnswers: sql<number>`COUNT(CASE WHEN ${liveSessionAnswers.isCorrect} THEN 1 END)`,
      averageResponseTime: sql<number>`AVG(${liveSessionAnswers.responseTimeMs})`,
    })
    .from(liveSessionAnswers)
    .where(eq(liveSessionAnswers.sessionId, query.sessionId))
    .groupBy(liveSessionAnswers.userId);

  // Merge results
  return results.map((r, index) => ({
    ...r,
    rank: index + 1,
    correctAnswers: stats.find(s => s.userId === r.userId)?.correctAnswers ?? 0,
    averageResponseTime: stats.find(s => s.userId === r.userId)?.averageResponseTime ?? 0,
  }));
}
```

---

### 1.2.1: Implement Blitz Quiz Real-Time Event Handlers
**Status**: 🔴 Not Started
**Priority**: P0 (Critical)
**Estimated Time**: 12 hours
**Dependencies**: 0.1.4, 1.1.2

**Acceptance Criteria**:
- [ ] Real-time events defined:
  - `session:card_revealed` - Host shows next card
  - `session:answer_submitted` - Participant answers
  - `session:leaderboard_updated` - Scores change
  - `session:started` - Quiz begins
  - `session:ended` - Quiz completes
- [ ] Event handlers broadcast to all participants
- [ ] Optimistic UI updates on client
- [ ] Latency < 200ms for event propagation
- [ ] Handle reconnection gracefully

**Implementation**:
```ts
// src/lib/realtime/live-session-events.ts
export type LiveSessionEvent =
  | { type: 'session:started'; sessionId: number; startedAt: string }
  | { type: 'session:card_revealed'; sessionId: number; cardIndex: number; flashcard: Flashcard; timeLimit: number }
  | { type: 'session:answer_submitted'; sessionId: number; userId: string; isCorrect: boolean; points: number }
  | { type: 'session:leaderboard_updated'; sessionId: number; leaderboard: LeaderboardEntry[] }
  | { type: 'session:ended'; sessionId: number; finalLeaderboard: LeaderboardEntry[] };

// Supabase channel setup
export function subscribeToLiveSession(sessionId: number, callback: (event: LiveSessionEvent) => void) {
  const channel = supabase.channel(`live-session-${sessionId}`);

  channel
    .on('broadcast', { event: '*' }, ({ payload }) => {
      callback(payload as LiveSessionEvent);
    })
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}

export async function broadcastToSession(sessionId: number, event: LiveSessionEvent) {
  const channel = supabase.channel(`live-session-${sessionId}`);
  await channel.send({
    type: 'broadcast',
    event: event.type,
    payload: event,
  });
}
```

---

### 1.2.2: Build Blitz Quiz UI Components
**Status**: 🔴 Not Started
**Priority**: P0 (Critical)
**Estimated Time**: 16 hours
**Dependencies**: 1.2.1

**Acceptance Criteria**:
- [ ] Components created:
  - `<BlitzQuizLobby>` - Waiting room
  - `<BlitzQuizHost>` - Host controls
  - `<BlitzQuizParticipant>` - Answer UI
  - `<LiveLeaderboard>` - Real-time ranking
  - `<BlitzQuizResults>` - Final scores
- [ ] Animations for:
  - Card flip reveal
  - Score updates
  - Rank changes
- [ ] Accessibility: Keyboard navigation, screen reader support
- [ ] Mobile responsive design

**Component Spec - BlitzQuizParticipant**:
```tsx
// src/components/live-session/BlitzQuizParticipant.tsx
export function BlitzQuizParticipant({ sessionId }: { sessionId: number }) {
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [answered, setAnswered] = useState(false);

  // Subscribe to real-time events
  useEffect(() => {
    const unsubscribe = subscribeToLiveSession(sessionId, (event) => {
      if (event.type === 'session:card_revealed') {
        setCurrentCard(event.flashcard);
        setTimeRemaining(event.timeLimit);
        setAnswered(false);
      }
    });

    return unsubscribe;
  }, [sessionId]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  async function handleAnswer(answer: string) {
    if (answered || timeRemaining === 0) return;

    const startTime = Date.now();
    await submitLiveAnswer({ sessionId, flashcardId: currentCard!.id, answer });
    const responseTime = Date.now() - startTime;

    setAnswered(true);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {currentCard && (
        <>
          <div className="text-6xl font-bold mb-8">
            {timeRemaining}s
          </div>

          <Card className="w-full max-w-2xl">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-4">
                {currentCard.question}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {/* Multiple choice options */}
                {currentCard.options?.map(option => (
                  <Button
                    key={option}
                    size="lg"
                    variant={answered ? "outline" : "default"}
                    disabled={answered || timeRemaining === 0}
                    onClick={() => handleAnswer(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {answered && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center text-green-600 font-semibold"
                >
                  ✅ Answer submitted!
                </motion.div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
```

---

## Continuation: Remaining Tasks

The file is getting long. Should I:
1. **Continue in this file** with all remaining tasks (Phases 2-4)
2. **Create separate files** for each phase
3. **Create a summary** with links to detailed task files

Which would be most useful for you?
