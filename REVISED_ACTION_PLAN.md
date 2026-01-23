# Revised Action Plan: Collaborative Learning First with Socket.io

> **Updated**: 2026-01-23
> **Preferences Applied**:
> - AI Budget: $30/month (free tier, ~200 flashcards generated/user/month)
> - Timeline: 14 weeks ✅
> - Audio: Optional (deprioritized)
> - Priority: Collaborative learning first
> - Real-time: **Socket.io** (not Supabase)

---

## 🎯 Revised Priorities

### Phase 0: Infrastructure (Weeks 1-2) - CRITICAL PATH
1. **Socket.io Setup** - Real-time infrastructure
2. **AI Service Layer** - Anthropic Claude with strict quotas
3. **File Upload** - Cloudflare R2 (for PDFs only, skip audio)

### Phase 1: Collaborative Learning (Weeks 3-5) - MAIN FOCUS
1. **Blitz Quiz** - Live competitive quizzes (Kahoot mode)
2. **Study Squads** - Private groups with shared progress
3. **Peer Review** - Text-based recall validation (skip audio)

### Phase 2: AI Accelerator (Weeks 6-8)
1. **Knowledge Gap Analysis** - Identify group weaknesses
2. **Socratic Hints** - Question-based guidance
3. **Doc-to-Deck** - PDF → flashcards

### Phase 3: Gamification (Weeks 9-11)
1. **Group Streaks** - Social accountability
2. **Confidence-Based SRS** - Better retention
3. **Knowledge Map** - Visual mastery

### Phase 4: Enterprise (Weeks 12-14) - LAST
1. **Certifications** - Skill badges
2. **Manager Dashboards** - Analytics
3. **Content Marketplace** - Public decks

**Audio features (voice-to-flashcard)**: Skipped entirely

---

## 🔧 Socket.io Implementation Plan

### Why Socket.io?
- Full control over infrastructure
- Scales horizontally with Redis adapter
- No vendor lock-in
- Battle-tested (10+ years)
- Perfect for Next.js (API routes + client)

### Architecture

```
┌─────────────────────────────────────────────────┐
│  Next.js Client (React Components)              │
│  - Socket.io client library                     │
│  - Auto-reconnect logic                         │
│  - Event subscriptions                          │
└─────────────────┬───────────────────────────────┘
                  │ WebSocket/HTTP polling
                  │
┌─────────────────▼───────────────────────────────┐
│  Next.js API Route: /api/socket                 │
│  - Socket.io server instance                    │
│  - Room management (groups, sessions)           │
│  - Event broadcasting                           │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│  Redis (Adapter for multi-instance scaling)     │
│  - Pub/sub for events across servers            │
│  - Optional: Use Upstash (serverless Redis)     │
└─────────────────────────────────────────────────┘
```

---

## Week 1: Socket.io Setup (Days 1-5)

### Day 1: Install Dependencies

```bash
# Install Socket.io
npm install socket.io socket.io-client

# Install Redis adapter (for scaling)
npm install @socket.io/redis-adapter ioredis

# Install Upstash Redis (serverless, free tier)
npm install @upstash/redis
```

**Environment variables** (`.env.local`):
```env
# Redis (Upstash - free tier: 10k commands/day)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# AI (Anthropic)
ANTHROPIC_API_KEY=sk-ant-xxx

# File Storage (Cloudflare R2)
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=learning-cards
R2_PUBLIC_URL=https://cdn.yourdomain.com
```

---

### Day 2: Create Socket.io Server

**File**: `src/lib/socket/server.ts`

```ts
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_APP_URL
        : 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Redis adapter for horizontal scaling
  const pubClient = new Redis(process.env.UPSTASH_REDIS_REST_URL!);
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));

  // Authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;

    // Verify Better Auth token
    const user = await verifyAuthToken(token);
    if (!user) {
      return next(new Error('Authentication failed'));
    }

    socket.data.userId = user.id;
    socket.data.userName = user.name;
    next();
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log('User connected:', socket.data.userId);

    // Join user to their personal room
    socket.join(`user:${socket.data.userId}`);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.data.userId);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

// Helper: Verify Better Auth token
async function verifyAuthToken(token: string): Promise<{ id: string; name: string } | null> {
  // TODO: Implement Better Auth token verification
  // For now, placeholder
  return null;
}
```

---

### Day 3: Create Next.js API Route

**File**: `src/app/api/socket/route.ts`

```ts
import { NextRequest } from 'next/server';
import { initSocketServer } from '@/lib/socket/server';

// This is a workaround for Next.js to create a persistent HTTP server
// Adapted from: https://github.com/vercel/next.js/discussions/49540

let isSocketInitialized = false;

export async function GET(req: NextRequest) {
  if (!isSocketInitialized) {
    // Access the Node.js HTTP server from Next.js
    const httpServer = (globalThis as any).__httpServer;

    if (!httpServer) {
      return new Response('Socket.io server not available', { status: 500 });
    }

    initSocketServer(httpServer);
    isSocketInitialized = true;
  }

  return new Response('Socket.io server running', { status: 200 });
}
```

**File**: `server.ts` (Custom server for Socket.io)

```ts
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initSocketServer } from './src/lib/socket/server';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request', err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Store server globally for API route access
  (globalThis as any).__httpServer = httpServer;

  // Initialize Socket.io
  initSocketServer(httpServer);

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

**Update** `package.json`:
```json
{
  "scripts": {
    "dev": "tsx server.ts",
    "build": "next build",
    "start": "NODE_ENV=production tsx server.ts"
  }
}
```

---

### Day 4: Create Client Hook

**File**: `src/lib/socket/client.ts`

```ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initSocketClient(authToken: string): Socket {
  if (socket?.connected) return socket;

  socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
    auth: { token: authToken },
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Socket.io connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket.io disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.io connection error:', error.message);
  });

  return socket;
}

export function getSocket(): Socket {
  if (!socket) throw new Error('Socket not initialized. Call initSocketClient first.');
  return socket;
}
```

**React Hook**: `src/hooks/useSocket.ts`

```ts
import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { initSocketClient, getSocket } from '@/lib/socket/client';
import { useSession } from '@/hooks/auth/useAuthSession';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    // Initialize socket with auth token
    const authToken = session.accessToken || ''; // Get from Better Auth
    const socketInstance = initSocketClient(authToken);

    setSocket(socketInstance);

    socketInstance.on('connect', () => setConnected(true));
    socketInstance.on('disconnect', () => setConnected(false));

    return () => {
      socketInstance.disconnect();
    };
  }, [session?.user?.id]);

  return { socket, connected };
}
```

---

### Day 5: Test Presence System

**Database Schema**: `src/infrastructure/database/schema/realtime.schema.ts`

```ts
import { pgTable, serial, text, timestamp, varchar, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './auth.schema';
import { groups } from './groups.schema';

export const onlinePresence = pgTable('online_presence', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  socketId: text('socket_id').notNull(),
  groupId: integer('group_id').references(() => groups.id, { onDelete: 'cascade' }),
  sessionId: text('session_id'), // For live quiz sessions
  status: varchar('status', { enum: ['online', 'away', 'offline'] }).notNull(),
  lastSeen: timestamp('last_seen').notNull().defaultNow(),
  metadata: jsonb('metadata').$type<{ currentActivity?: string }>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('presence_user_idx').on(table.userId),
  socketIdIdx: index('presence_socket_idx').on(table.socketId),
  groupIdIdx: index('presence_group_idx').on(table.groupId),
}));
```

**Run migration**:
```bash
npx drizzle-kit generate
npx drizzle-kit push
```

**Server-side presence handler** (add to `src/lib/socket/server.ts`):

```ts
// Add to connection handler
io.on('connection', (socket) => {
  const userId = socket.data.userId;

  // Store presence
  socket.on('presence:update', async (data: { groupId?: number; status: 'online' | 'away' }) => {
    await db.insert(onlinePresence).values({
      userId,
      socketId: socket.id,
      groupId: data.groupId,
      status: data.status,
      lastSeen: new Date(),
    }).onConflictDoUpdate({
      target: [onlinePresence.userId],
      set: {
        socketId: socket.id,
        status: data.status,
        lastSeen: new Date(),
      },
    });

    // Broadcast to group if applicable
    if (data.groupId) {
      socket.to(`group:${data.groupId}`).emit('presence:user_updated', {
        userId,
        userName: socket.data.userName,
        status: data.status,
      });
    }
  });

  // Join group room
  socket.on('presence:join_group', async (groupId: number) => {
    socket.join(`group:${groupId}`);

    // Get all online users in group
    const onlineUsers = await db.query.onlinePresence.findMany({
      where: eq(onlinePresence.groupId, groupId),
      with: { user: { columns: { id: true, name: true, image: true } } },
    });

    socket.emit('presence:group_state', onlineUsers);
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    await db.update(onlinePresence)
      .set({ status: 'offline', lastSeen: new Date() })
      .where(eq(onlinePresence.userId, userId));
  });
});
```

**React Component**: `src/components/groups/OnlineMembers.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface OnlineUser {
  userId: string;
  userName: string;
  userImage?: string;
  status: 'online' | 'away' | 'offline';
}

export function OnlineMembers({ groupId }: { groupId: number }) {
  const { socket, connected } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    if (!socket || !connected) return;

    // Join group room
    socket.emit('presence:join_group', groupId);

    // Update presence status
    socket.emit('presence:update', { groupId, status: 'online' });

    // Listen for initial state
    socket.on('presence:group_state', (users: OnlineUser[]) => {
      setOnlineUsers(users.filter(u => u.status !== 'offline'));
    });

    // Listen for updates
    socket.on('presence:user_updated', (user: OnlineUser) => {
      setOnlineUsers(prev => {
        const filtered = prev.filter(u => u.userId !== user.userId);
        return user.status === 'offline' ? filtered : [...filtered, user];
      });
    });

    // Heartbeat every 30 seconds
    const interval = setInterval(() => {
      socket.emit('presence:update', {
        groupId,
        status: document.hasFocus() ? 'online' : 'away',
      });
    }, 30000);

    return () => {
      clearInterval(interval);
      socket.emit('presence:update', { groupId, status: 'offline' });
      socket.off('presence:group_state');
      socket.off('presence:user_updated');
    };
  }, [socket, connected, groupId]);

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {onlineUsers.slice(0, 5).map(user => (
          <Avatar key={user.userId} className="border-2 border-background">
            <AvatarImage src={user.userImage} />
            <AvatarFallback>{user.userName[0]}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {onlineUsers.length} online
      </span>
    </div>
  );
}
```

**Test**:
1. Start dev server: `npm run dev`
2. Open two browser tabs with different users
3. Navigate to a group page
4. Verify "X online" count updates in real-time

---

## Week 2: AI Service Layer with Strict Quotas

### Day 1: AI Domain Structure

**Create directories**:
```bash
mkdir -p src/domains/ai/services
mkdir -p src/domains/ai/repositories
mkdir -p src/domains/ai/entities
mkdir -p src/domains/ai/value-objects
```

**File**: `src/domains/ai/services/AICoachService.ts`

```ts
import { generateAIResponse } from '@/lib/ai/anthropic-client';
import { buildSocraticHintPrompt } from '@/lib/ai/prompts/socratic-hint';
import { Flashcard } from '@/domains/content/entities/Flashcard';

export class AICoachService {
  async generateSocraticHint(flashcard: Flashcard): Promise<string> {
    const prompt = buildSocraticHintPrompt(flashcard.question, flashcard.answer);
    return await generateAIResponse(prompt);
  }

  async analyzeGroupWeaknesses(groupId: number): Promise<KnowledgeGap[]> {
    // Aggregate review data
    const weaknesses = await db.query.reviewHistory.findMany({
      where: and(
        inArray(reviewHistory.userId,
          db.select({ id: groupMembers.userId })
            .from(groupMembers)
            .where(eq(groupMembers.groupId, groupId))
        ),
        eq(reviewHistory.isCorrect, false)
      ),
      // Group by flashcard, calculate failure rate
    });

    // Send to Claude for analysis
    const prompt = buildGapAnalysisPrompt(weaknesses);
    const response = await generateAIResponse(prompt);

    // Parse structured response
    return JSON.parse(response);
  }
}

export interface KnowledgeGap {
  topic: string;
  categoryId: number;
  successRate: number;
  affectedUserCount: number;
  prerequisiteConcepts: string[];
}
```

---

### Day 2: AI Quota System

**Schema**: `src/infrastructure/database/schema/ai.schema.ts`

```ts
export const aiUsageTracking = pgTable('ai_usage_tracking', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  operation: varchar('operation', { enum: ['hint', 'generate_cards', 'gap_analysis', 'bridge_deck'] }).notNull(),
  tokensUsed: integer('tokens_used').notNull(),
  cost: numeric('cost', { precision: 10, scale: 6 }).notNull(), // USD
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdDateIdx: index('ai_usage_user_date_idx').on(table.userId, table.createdAt),
}));

export const aiQuotas = pgTable('ai_quotas', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tier: varchar('tier', { enum: ['free', 'premium'] }).notNull().default('free'),
  dailyOperationsLimit: integer('daily_operations_limit').notNull().default(10), // Free: 10/day
  dailyOperationsUsed: integer('daily_operations_used').notNull().default(0),
  lastResetDate: date('last_reset_date').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('ai_quotas_user_idx').on(table.userId),
}));
```

**Service**: `src/lib/ai/quota-service.ts`

```ts
import { db } from '@/infrastructure/database/db';
import { aiQuotas, aiUsageTracking } from '@/infrastructure/database/schema/ai.schema';
import { eq, and, gte } from 'drizzle-orm';
import { startOfDay } from 'date-fns';

export class AIQuotaService {
  async checkQuota(userId: string): Promise<{ allowed: boolean; remaining: number }> {
    const today = startOfDay(new Date());

    // Get or create quota record
    let quota = await db.query.aiQuotas.findFirst({
      where: eq(aiQuotas.userId, userId),
    });

    if (!quota) {
      [quota] = await db.insert(aiQuotas).values({
        userId,
        tier: 'free',
        dailyOperationsLimit: 10,
        dailyOperationsUsed: 0,
        lastResetDate: today,
      }).returning();
    }

    // Reset if new day
    if (new Date(quota.lastResetDate) < today) {
      await db.update(aiQuotas)
        .set({ dailyOperationsUsed: 0, lastResetDate: today })
        .where(eq(aiQuotas.userId, userId));
      quota.dailyOperationsUsed = 0;
    }

    const allowed = quota.dailyOperationsUsed < quota.dailyOperationsLimit;
    const remaining = quota.dailyOperationsLimit - quota.dailyOperationsUsed;

    return { allowed, remaining };
  }

  async incrementUsage(
    userId: string,
    operation: string,
    tokensUsed: number
  ): Promise<void> {
    // Calculate cost (Claude Sonnet pricing: $3/MTok input, $15/MTok output)
    const cost = (tokensUsed * 3) / 1_000_000; // Rough estimate

    // Track usage
    await db.insert(aiUsageTracking).values({
      userId,
      operation,
      tokensUsed,
      cost,
    });

    // Increment quota
    await db.update(aiQuotas)
      .set({ dailyOperationsUsed: sql`${aiQuotas.dailyOperationsUsed} + 1` })
      .where(eq(aiQuotas.userId, userId));
  }

  async getMonthlySpend(): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await db
      .select({ total: sql<number>`SUM(${aiUsageTracking.cost})` })
      .from(aiUsageTracking)
      .where(gte(aiUsageTracking.createdAt, startOfMonth));

    return result[0]?.total ?? 0;
  }
}
```

---

### Day 3: Anthropic Client with Caching

**File**: `src/lib/ai/anthropic-client.ts`

```ts
import Anthropic from '@anthropic-ai/sdk';
import { AIQuotaService } from './quota-service';
import { db } from '@/infrastructure/database/db';
import { aiHints } from '@/infrastructure/database/schema/ai.schema';
import { eq, gt } from 'drizzle-orm';
import { addHours } from 'date-fns';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const quotaService = new AIQuotaService();

export async function generateAIResponse(
  prompt: string,
  userId: string,
  operation: 'hint' | 'generate_cards' | 'gap_analysis' | 'bridge_deck'
): Promise<string> {
  // Check quota
  const { allowed, remaining } = await quotaService.checkQuota(userId);
  if (!allowed) {
    throw new Error(`AI quota exceeded. You have ${remaining} operations remaining today.`);
  }

  // Call Claude
  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = message.content.find(block => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  // Track usage
  const tokensUsed = message.usage.input_tokens + message.usage.output_tokens;
  await quotaService.incrementUsage(userId, operation, tokensUsed);

  return textBlock.text;
}

// Helper: Get cached hint (avoid redundant API calls)
export async function getCachedHint(flashcardId: number): Promise<string | null> {
  const cached = await db.query.aiHints.findFirst({
    where: and(
      eq(aiHints.flashcardId, flashcardId),
      gt(aiHints.expiresAt, new Date())
    ),
  });

  return cached?.hint ?? null;
}

// Helper: Store hint in cache
export async function cacheHint(flashcardId: number, hint: string): Promise<void> {
  await db.insert(aiHints).values({
    flashcardId,
    hint,
    expiresAt: addHours(new Date(), 24), // Cache for 24 hours
  });
}
```

---

### Day 4-5: Create Prompt Templates

**File**: `src/lib/ai/prompts/socratic-hint.ts`

```ts
export function buildSocraticHintPrompt(question: string, answer: string): string {
  return `
You are a Socratic tutor helping a student learn through guided questions.

FLASHCARD:
Question: ${question}
Answer: ${answer}

TASK: Provide a Socratic hint that guides the student toward the answer WITHOUT revealing it.

REQUIREMENTS:
1. Ask a leading question that prompts thinking
2. Do NOT include the answer or key terms from the answer
3. Focus on the reasoning process, not the final result
4. Keep it brief (1-2 sentences max)
5. Use an encouraging, friendly tone

EXAMPLE:
Question: "What does the 'await' keyword do in JavaScript?"
Answer: "It pauses execution until a Promise resolves and returns its value."

Bad hint: "It waits for a Promise to resolve" ❌ (reveals answer)
Good hint: "Think about what happens when you need to pause code execution until an async operation completes. What JavaScript feature handles async operations?" ✅

Now provide your Socratic hint for the flashcard above:
`.trim();
}
```

**File**: `src/lib/ai/prompts/generate-flashcards.ts`

```ts
export function buildFlashcardGenerationPrompt(content: string, count: number = 10): string {
  return `
You are a learning specialist creating flashcards for spaced repetition study.

CONTENT TO ANALYZE:
${content}

TASK: Generate exactly ${count} high-quality flashcards from this content.

OUTPUT FORMAT (JSON array only, no markdown):
[
  {
    "question": "Clear, specific question (use **bold** for emphasis)",
    "answer": "Concise answer (2-3 sentences max)",
    "difficulty": "easy" | "medium" | "hard",
    "category": "suggested category name"
  }
]

REQUIREMENTS:
1. Focus on key concepts, not trivia
2. Questions test understanding, not just recall
3. Use clear, unambiguous language
4. Difficulty:
   - easy: Basic facts and definitions
   - medium: Application of concepts
   - hard: Analysis, edge cases, problem-solving
5. Answers should be self-contained (don't reference "the text")
6. Return ONLY the JSON array, no additional text or markdown

Generate the flashcards:
`.trim();
}
```

**Test AI with quota**:
```ts
// Example usage in a Server Action
'use server';

import { generateAIResponse, getCachedHint, cacheHint } from '@/lib/ai/anthropic-client';
import { buildSocraticHintPrompt } from '@/lib/ai/prompts/socratic-hint';

export async function requestHint(flashcardId: number, userId: string) {
  // Check cache first
  const cachedHint = await getCachedHint(flashcardId);
  if (cachedHint) {
    return { success: true, hint: cachedHint, fromCache: true };
  }

  // Get flashcard
  const flashcard = await db.query.flashcards.findFirst({
    where: eq(flashcards.id, flashcardId),
  });

  if (!flashcard) {
    return { success: false, error: 'Flashcard not found' };
  }

  try {
    // Generate hint
    const prompt = buildSocraticHintPrompt(flashcard.question, flashcard.answer);
    const hint = await generateAIResponse(prompt, userId, 'hint');

    // Cache it
    await cacheHint(flashcardId, hint);

    // Deduct 2 XP as "help-seeking penalty"
    await db.update(userProgress)
      .set({ totalXP: sql`${userProgress.totalXP} - 2` })
      .where(eq(userProgress.userId, userId));

    return { success: true, hint, fromCache: false };
  } catch (error) {
    if (error instanceof Error && error.message.includes('quota exceeded')) {
      return { success: false, error: 'Daily AI limit reached. Upgrade to premium for unlimited hints!' };
    }
    throw error;
  }
}
```

---

## Week 3-5: Blitz Quiz Implementation

### Overview
Now that real-time (Socket.io) and AI are ready, build the main collaborative feature.

**Components needed**:
1. Database schema (live sessions, participants, answers)
2. Socket.io event handlers (server-side)
3. React hooks for real-time events (client-side)
4. UI components (lobby, host controls, participant view, leaderboard)

See **TASKS_BREAKDOWN.md** for detailed implementation of:
- Task 1.1.1: Live Sessions Database Schema
- Task 1.1.2: Live Session Commands
- Task 1.1.3: Live Session Queries
- Task 1.2.1: Blitz Quiz Real-Time Event Handlers
- Task 1.2.2: Blitz Quiz UI Components

I'll create a separate detailed guide for Week 3-5 if needed.

---

## Cost Breakdown (Updated)

### Monthly Costs for 1,000 Active Users

| Service | Usage | Cost |
|---------|-------|------|
| **Socket.io** | Self-hosted on Vercel/VPS | $0 |
| **Redis (Upstash)** | Free tier: 10k commands/day | $0 → $10 |
| **Anthropic Claude** | 10 ops/user/month × 1k users × ~2k tokens/op = 20M tokens | ~$30 |
| **Cloudflare R2** | 5 GB storage (PDFs only) | ~$0.10 |

**Total**: **~$30-40/month** ✅ Within budget!

### At 10,000 Users
- Redis: ~$50/month (upgrade to Pro tier)
- Claude: $300/month (if all users hit free quota)
- R2: $1/month

**Total**: **~$350/month** (still very affordable)

---

## Next Steps

### ✅ Your Confirmation
- AI Budget: $30/month ✅
- Timeline: 14 weeks ✅
- Audio: Optional (skip) ✅
- Priority: Collaborative first ✅
- Real-time: Socket.io ✅

### 🎯 Action Plan

**This Week** (Week 1):
1. Install Socket.io and dependencies (Day 1)
2. Create Socket.io server (Day 2)
3. Create Next.js API route + custom server (Day 3)
4. Create client hook (Day 4)
5. Test presence system (Day 5)

**Next Week** (Week 2):
1. AI domain structure (Day 1)
2. AI quota system (Day 2)
3. Anthropic client with caching (Day 3)
4. Prompt templates (Day 4-5)

**Week 3** (Start Blitz Quiz):
1. Live sessions database schema
2. Socket.io event handlers for quiz
3. Basic UI (lobby + participant view)

Let me know when you're ready to start, and I'll guide you through each step! 🚀

Should I create a detailed **Week 3-5 Blitz Quiz Implementation Guide** next?
