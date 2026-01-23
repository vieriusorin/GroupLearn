# Learning Cards - Detailed Task Breakdown

> **Format**: Each task includes Status, Priority, Dependencies, Acceptance Criteria, and Implementation Notes
> **Status**: 🔴 Not Started | 🟡 In Progress | 🟢 Completed | 🔵 Blocked

---

## Phase 0: Infrastructure Foundations

### 0.1.1: Evaluate and Choose Real-Time Provider
**Status**: 🔴 Not Started
**Priority**: P0 (Critical)
**Estimated Time**: 4 hours
**Dependencies**: None

**Acceptance Criteria**:
- [ ] Research document comparing Socket.io, Supabase Realtime, Ably, Pusher
- [ ] Decision matrix with criteria: cost, latency, DX, scalability, auth integration
- [ ] Final recommendation with justification
- [ ] Proof of concept: Simple presence system working

**Implementation Notes**:
```md
Evaluation Criteria:
1. Cost: Free tier limits, pricing beyond free tier
2. Latency: P95 latency for message delivery
3. Developer Experience: SDK quality, TypeScript support, docs
4. Scalability: Connection limits, message throughput
5. Auth Integration: Works with Better Auth session tokens
6. PostgreSQL Integration: Native support for database changes

Recommendation: Supabase Realtime
- Free tier: 200 concurrent connections
- Native PostgreSQL integration (listen to DB changes)
- Works with existing Better Auth (Supabase Auth compatible)
- Excellent TypeScript SDK
```

---

### 0.1.2: Install Real-Time Provider Dependencies
**Status**: 🔴 Not Started
**Priority**: P0 (Critical)
**Estimated Time**: 2 hours
**Dependencies**: 0.1.1

**Acceptance Criteria**:
- [ ] Dependencies installed: `@supabase/supabase-js` or `socket.io`
- [ ] Environment variables configured in `.env.local` and `.env.example`
- [ ] Connection utility created at `src/lib/realtime/client.ts`
- [ ] Reconnection logic handles network failures
- [ ] Type definitions exported for real-time events

**Implementation Notes**:
```bash
# For Supabase
npm install @supabase/supabase-js

# Environment variables
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
```

File: `src/lib/realtime/client.ts`
```ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type RealtimeEvent =
  | { type: 'presence_update'; payload: { userId: string; status: string } }
  | { type: 'session_started'; payload: { sessionId: string } };
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

### 0.2.2: Integrate Anthropic Claude Client
**Status**: 🔴 Not Started
**Priority**: P1 (High)
**Estimated Time**: 6 hours
**Dependencies**: 0.2.1

**Acceptance Criteria**:
- [ ] Client utility created at `src/lib/ai/anthropic-client.ts`
- [ ] Retry logic with exponential backoff implemented
- [ ] Rate limiting with queue (max 50 requests/min)
- [ ] Error handling for 429, 500, timeout
- [ ] Usage tracking (token count, cost estimation)
- [ ] Environment variable `ANTHROPIC_API_KEY` configured

**Implementation**:
```ts
// src/lib/ai/anthropic-client.ts
import Anthropic from '@anthropic-ai/sdk';
import { retry } from '@/lib/shared/retry';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function generateAIResponse(prompt: string): Promise<string> {
  return retry(
    async () => {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      });

      const textBlock = message.content.find(block => block.type === 'text');
      if (!textBlock || textBlock.type !== 'text') {
        throw new Error('No text response from Claude');
      }

      return textBlock.text;
    },
    { maxAttempts: 3, delayMs: 1000, backoffFactor: 2 }
  );
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

### 0.2.4: Create AI Database Schema
**Status**: 🔴 Not Started
**Priority**: P1 (High)
**Estimated Time**: 4 hours
**Dependencies**: 0.2.1

**Acceptance Criteria**:
- [ ] Schema file: `src/infrastructure/database/schema/ai.schema.ts`
- [ ] Tables created:
  - `ai_generated_content`
  - `ai_hints` (cache)
  - `knowledge_gaps`
- [ ] Migration generated and applied
- [ ] Zod schemas exported
- [ ] Indexes on foreign keys

**Implementation**:
```ts
// src/infrastructure/database/schema/ai.schema.ts
export const aiGeneratedContent = pgTable('ai_generated_content', {
  id: serial('id').primaryKey(),
  sourceType: varchar('source_type', { enum: ['pdf', 'url', 'text', 'audio'] }).notNull(),
  sourceUrl: text('source_url'), // S3 key or original URL
  extractedText: text('extracted_text'), // Full text extraction
  generatedCards: jsonb('generated_cards').$type<FlashcardDraft[]>(),
  status: varchar('status', { enum: ['pending', 'processing', 'completed', 'failed'] }).notNull().default('pending'),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  errorMessage: text('error_message'),
  tokensUsed: integer('tokens_used'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  userIdIdx: index('ai_content_user_idx').on(table.userId),
  statusIdx: index('ai_content_status_idx').on(table.status),
}));

export const aiHints = pgTable('ai_hints', {
  id: serial('id').primaryKey(),
  flashcardId: integer('flashcard_id').notNull().references(() => flashcards.id, { onDelete: 'cascade' }),
  hint: text('hint').notNull(),
  expiresAt: timestamp('expires_at').notNull(), // Cache for 24h
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  flashcardIdx: index('ai_hints_flashcard_idx').on(table.flashcardId),
}));

export const knowledgeGaps = pgTable('knowledge_gaps', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  topic: varchar('topic', { length: 255 }).notNull(),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  successRate: integer('success_rate').notNull(), // 0-100
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
