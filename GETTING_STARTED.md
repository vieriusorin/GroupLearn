# Getting Started: Next-Gen Features Implementation

> **Quick Start Guide** for transforming Learning Cards into a collaborative, AI-powered platform
> **Total Timeline**: 14 weeks | **Immediate Focus**: Real-time infrastructure

---

## 📋 What We're Building

Transform your spaced-repetition app into:

1. **Collaborative Learning** - Live quizzes, study squads, peer teaching
2. **AI Learning Coach** - Gap analysis, Socratic hints, auto-generated flashcards
3. **Advanced Gamification** - Group streaks, knowledge maps, confidence-based SRS
4. **Enterprise Features** - Certifications, analytics dashboards, content marketplace

---

## 🎯 Three Essential Documents

### 1. [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)
**What**: Complete feature breakdown by phase
**When to read**: When planning sprints and prioritizing features
**Key sections**:
- Phase 0: Infrastructure (real-time, AI, file upload)
- Phase 1: Real-time collaborative learning
- Phase 2: AI learning accelerator
- Phase 3: Advanced gamification
- Phase 4: B2B/enterprise features

### 2. [TASKS_BREAKDOWN.md](./TASKS_BREAKDOWN.md)
**What**: Granular task list with acceptance criteria
**When to read**: During implementation (day-to-day)
**Key sections**:
- Each task has status, priority, dependencies, time estimate
- Code examples for every major feature
- Database schema definitions

### 3. [ARCHITECTURE_ANALYSIS.md](./ARCHITECTURE_ANALYSIS.md)
**What**: Gap analysis comparing current state vs. proposed features
**When to read**: Before starting each phase (architectural decisions)
**Key sections**:
- Domain-by-domain analysis
- Infrastructure gaps and recommendations
- Cost estimates and risk assessment

---

## 🚀 Start Here: Week 1 Action Plan

### Day 1-2: Real-Time Infrastructure Decision

**Task 0.1.1: Choose Real-Time Provider**

**Options**:
1. ✅ **Supabase Realtime** (RECOMMENDED)
   - Free tier: 200 concurrent connections
   - Native PostgreSQL integration
   - Compatible with Better Auth
   - Cost: $0 → $25/mo

2. Socket.io (More control, more setup)
3. Ably or Pusher (More expensive)

**Action**:
```bash
# Install Supabase
npm install @supabase/supabase-js

# Add to .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Create** `src/lib/realtime/client.ts`:
```ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

**Test**: Create a simple presence indicator component

---

### Day 3-4: Presence System Database

**Task 0.1.3: Create Schema**

**Create** `src/infrastructure/database/schema/realtime.schema.ts`:
```ts
import { pgTable, serial, text, timestamp, varchar, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './auth.schema';
import { groups } from './groups.schema';

export const onlinePresence = pgTable('online_presence', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  groupId: integer('group_id').references(() => groups.id, { onDelete: 'cascade' }),
  sessionId: text('session_id'),
  status: varchar('status', { enum: ['online', 'away', 'offline'] }).notNull(),
  lastSeen: timestamp('last_seen').notNull().defaultNow(),
  metadata: jsonb('metadata').$type<{ currentActivity?: string }>(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('presence_user_idx').on(table.userId),
  groupIdIdx: index('presence_group_idx').on(table.groupId),
}));
```

**Run migration**:
```bash
npx drizzle-kit generate
npx drizzle-kit push
```

**Test**: Insert a record manually, query it

---

### Day 5: Presence Heartbeat

**Task 0.1.4: Implement Heartbeat**

**Create** `src/hooks/usePresence.ts`:
```ts
import { useEffect } from 'react';
import { useSession } from '@/hooks/auth/useAuthSession';
import { updatePresence } from '@/presentation/actions/realtime/update-presence';

export function usePresence(groupId?: number) {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    // Initial presence
    updatePresence({
      userId: session.user.id,
      groupId,
      status: 'online',
    });

    // Heartbeat every 30 seconds
    const interval = setInterval(() => {
      updatePresence({
        userId: session.user.id,
        groupId,
        status: document.hasFocus() ? 'online' : 'away',
      });
    }, 30_000);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      updatePresence({
        userId: session.user.id,
        groupId,
        status: 'offline',
      });
    };
  }, [session?.user?.id, groupId]);
}
```

**Create Server Action** `src/presentation/actions/realtime/update-presence.ts`:
```ts
'use server';

import { db } from '@/infrastructure/database/db';
import { onlinePresence } from '@/infrastructure/database/schema/realtime.schema';
import { eq, and } from 'drizzle-orm';

export async function updatePresence(data: {
  userId: string;
  groupId?: number;
  status: 'online' | 'away' | 'offline';
}) {
  await db
    .insert(onlinePresence)
    .values({
      userId: data.userId,
      groupId: data.groupId,
      status: data.status,
      lastSeen: new Date(),
    })
    .onConflictDoUpdate({
      target: [onlinePresence.userId],
      set: {
        status: data.status,
        lastSeen: new Date(),
        updatedAt: new Date(),
      },
    });
}
```

**Test**: Use hook in a component, verify presence updates in database

---

## Week 2: AI & File Upload

### AI Service Layer

**Install dependencies** (move from devDependencies):
```bash
npm install @anthropic-ai/sdk
```

**Create** `src/lib/ai/anthropic-client.ts`:
```ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function generateAIResponse(prompt: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = message.content.find(block => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response');
  }

  return textBlock.text;
}
```

**Test**: Call API with a simple prompt, verify response

---

### File Upload

**Install Cloudflare R2** (S3-compatible):
```bash
npm install @aws-sdk/client-s3
```

**Create** `src/lib/storage/r2-client.ts`:
```ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadFile(file: Buffer, key: string): Promise<string> {
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: file,
  }));

  return `${process.env.R2_PUBLIC_URL}/${key}`;
}
```

**Test**: Upload a test file, verify URL

---

## Week 3: First Live Feature

### Blitz Quiz MVP

**Goal**: Get a working live quiz (even if basic)

**Database schema** (see TASKS_BREAKDOWN.md Task 1.1.1):
- `live_sessions`
- `live_session_participants`
- `live_session_answers`

**Commands**:
1. `CreateLiveSession` - Host creates quiz
2. `JoinLiveSession` - Participants join
3. `StartLiveSession` - Host starts countdown
4. `SubmitLiveAnswer` - Participants answer

**Real-time events**:
- `session:started` - Broadcast to all participants
- `session:card_revealed` - Show next flashcard
- `session:answer_submitted` - Update leaderboard
- `session:ended` - Final scores

**UI Components** (minimal):
- `<BlitzQuizLobby>` - Waiting room
- `<BlitzQuizHost>` - Start button, next card button
- `<BlitzQuizParticipant>` - Answer buttons, timer
- `<LiveLeaderboard>` - Real-time scores

**Test**: 2-3 people join a live quiz, answer cards, see leaderboard update

---

## Quick Wins (High Impact, Low Effort)

### 1. Confidence-Based SRS (2 days)
**Effort**: LOW
**Impact**: HIGH (better retention)

**Steps**:
1. Add `confidence_level` column to `review_history`
2. Update `SpacedRepetitionService.calculateNextReview()` to use confidence
3. Add confidence slider to review UI

**Code**:
```ts
// Migration
ALTER TABLE review_history ADD COLUMN confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5);

// Update service
if (isCorrect && confidenceLevel <= 2) {
  return addDays(now, 1); // Review sooner
} else if (isCorrect && confidenceLevel >= 4) {
  return addDays(now, 7); // Review later
}
```

---

### 2. Group Streaks (3 days)
**Effort**: LOW
**Impact**: HIGH (social accountability)

**Steps**:
1. Create `group_streaks` and `streak_contributions` tables
2. Trigger.dev task: Check daily if all members reviewed
3. UI: `<GroupStreakWidget>` showing current streak

**Code**:
```ts
// Trigger.dev task (runs daily)
export const checkGroupStreaks = task({
  id: 'check-group-streaks',
  run: async () => {
    const groups = await db.query.groups.findMany();

    for (const group of groups) {
      const today = startOfDay(new Date());
      const members = await db.query.groupMembers.findMany({
        where: eq(groupMembers.groupId, group.id),
      });

      const contributions = await db.query.streakContributions.findMany({
        where: and(
          eq(streakContributions.groupId, group.id),
          eq(streakContributions.date, today)
        ),
      });

      const allCompleted = members.every(m =>
        contributions.some(c => c.userId === m.userId && c.completed)
      );

      if (allCompleted) {
        // Increment streak
        await db.update(groupStreaks)
          .set({ currentStreak: sql`current_streak + 1` })
          .where(eq(groupStreaks.groupId, group.id));
      } else {
        // Reset streak
        await db.update(groupStreaks)
          .set({ currentStreak: 0 })
          .where(eq(groupStreaks.groupId, group.id));
      }
    }
  },
});
```

---

## Common Pitfalls & Solutions

### 1. Real-Time Connection Limit
**Problem**: Hit Supabase free tier limit (200 connections)

**Solution**:
- Implement connection pooling in client
- Close connections when user leaves page
- Monitor connection count in Supabase dashboard

---

### 2. AI API Costs Spiral
**Problem**: $500/month Claude API bill

**Solution**:
- Aggressive caching (store hints for 24h)
- User quotas (10 AI operations/day for free tier)
- Offer premium tier ($5/mo = unlimited AI)
- Use Claude Haiku for simple tasks (10x cheaper)

---

### 3. Database Connection Exhaustion
**Problem**: "Too many clients" error

**Solution**:
```ts
// Increase pool size
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 50, // Increase from default 10
});
```

---

### 4. Live Quiz Cheating
**Problem**: Users inspect network requests to see answers

**Solution**:
- Encrypt answers in transit
- Validate answers on server
- Time-based answer submission (can't submit after time limit)

---

## Testing Strategy

### Unit Tests (Domain Logic)
```ts
// Example: Test XP calculation with confidence
describe('XPCalculationService', () => {
  it('awards bonus XP for high confidence correct answers', () => {
    const service = new XPCalculationService();
    const xp = service.calculateReviewXP({
      isCorrect: true,
      confidenceLevel: 5,
      difficulty: 'hard',
    });

    expect(xp).toBeGreaterThan(10); // Base XP + confidence bonus
  });
});
```

---

### Integration Tests (CQRS Handlers)
```ts
// Example: Test live session creation
describe('CreateLiveSessionHandler', () => {
  it('creates session and auto-joins host', async () => {
    const sessionId = await handleCreateLiveSession({
      groupId: 1,
      sessionType: 'blitz_quiz',
      config: { cardCount: 10, timeLimit: 30 },
    }, 'user-1');

    const participants = await db.query.liveSessionParticipants.findMany({
      where: eq(liveSessionParticipants.sessionId, sessionId),
    });

    expect(participants).toHaveLength(1);
    expect(participants[0].userId).toBe('user-1');
  });
});
```

---

### E2E Tests (Playwright)
```ts
// Example: Complete live quiz flow
test('complete blitz quiz', async ({ page, context }) => {
  // Host creates quiz
  await page.goto('/groups/1/live-quiz/create');
  await page.click('button:has-text("Create Quiz")');

  // Participant joins (in new tab)
  const participantPage = await context.newPage();
  await participantPage.goto('/groups/1/live-quiz/join');
  await participantPage.click('button:has-text("Join")');

  // Host starts quiz
  await page.click('button:has-text("Start")');

  // Verify participant sees first card
  await expect(participantPage.locator('h2')).toContainText('Question 1');
});
```

---

## Monitoring & Observability

### 1. Real-Time Connection Monitoring
```ts
// Track connection count
supabase.channel('monitoring')
  .on('presence', { event: 'sync' }, () => {
    const state = supabase.channel('monitoring').presenceState();
    console.log('Active connections:', Object.keys(state).length);
  })
  .subscribe();
```

---

### 2. AI Usage Tracking
```ts
// Log every AI call
export async function generateAIResponse(prompt: string, userId: string): Promise<string> {
  const startTime = Date.now();

  const message = await client.messages.create({ /* ... */ });

  await db.insert(aiUsageTracking).values({
    userId,
    operation: 'generate_response',
    tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
    cost: calculateCost(message.usage),
    latencyMs: Date.now() - startTime,
  });

  return message.content[0].text;
}
```

---

### 3. Query Performance
```ts
// Log slow queries
import { drizzle } from 'drizzle-orm/node-postgres';

const db = drizzle(pool, {
  logger: {
    logQuery(query, params) {
      const duration = performance.now();
      // Execute query...
      const elapsed = performance.now() - duration;

      if (elapsed > 1000) {
        console.warn(`Slow query (${elapsed}ms):`, query);
      }
    },
  },
});
```

---

## Next Steps After Week 1

### ✅ Week 1 Checklist
- [ ] Real-time provider chosen and configured
- [ ] Presence system working (can see who's online)
- [ ] AI client can make successful API calls
- [ ] File upload works (upload test PDF)
- [ ] All environment variables set

### 🎯 Week 2 Goals
- [ ] Complete AI domain structure
- [ ] Create prompt templates (hints, flashcard generation)
- [ ] Build file upload UI
- [ ] Start live session database schema

### 🚀 Week 3 Goals
- [ ] Blitz quiz MVP (can complete full quiz)
- [ ] Real-time leaderboard updates
- [ ] Basic UI for host and participants

---

## Questions? Stuck?

### Architecture Questions
**Read**: [ARCHITECTURE_ANALYSIS.md](./ARCHITECTURE_ANALYSIS.md)
- Domain structure recommendations
- Infrastructure choices
- Cost estimates

### Implementation Questions
**Read**: [TASKS_BREAKDOWN.md](./TASKS_BREAKDOWN.md)
- Detailed acceptance criteria
- Code examples
- Dependencies

### Feature Prioritization
**Read**: [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)
- Full feature list
- Phase breakdown
- Success metrics

---

## Summary: Critical Path

**Week 1-2**: Infrastructure (Real-time + AI) → **BLOCKS ALL OTHER WORK**

**Week 3-5**: Blitz Quiz (Live Sessions) → **HIGHEST USER IMPACT**

**Week 6-8**: AI Features (Hints + Gap Analysis) → **DIFFERENTIATION**

**Week 9-11**: Gamification (Streaks + Knowledge Map) → **RETENTION**

**Week 12-14**: Enterprise (Certifications + Analytics) → **MONETIZATION**

**Total**: 14 weeks to transform your app into a next-gen learning platform 🚀

---

Let me know which phase you want to start with, and I'll help implement it step-by-step!
