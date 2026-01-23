# Architecture Analysis: Current State vs. Proposed Features

> **Analysis Date**: 2026-01-23
> **Reviewed By**: Claude Code
> **Purpose**: Gap analysis and architectural recommendations for next-gen features

---

## Executive Summary

Your codebase has an **exceptionally strong foundation** for the proposed features. The DDD/CQRS architecture, existing domain structure, and Trigger.dev integration provide the perfect scaffold for building collaborative, AI-powered learning features.

### Key Strengths ✅
- **DDD Architecture**: 6 well-defined domains with clear boundaries
- **CQRS Pattern**: Commands/Queries separation makes adding features predictable
- **Trigger.dev v4**: Already configured for async AI processing
- **Better Auth + RBAC**: Ready for enterprise features
- **Rich Infrastructure**: Drizzle ORM, PostgreSQL, TypeScript strict mode

### Primary Gaps ⚠️
- **Real-time infrastructure**: No WebSocket/Supabase Realtime integration
- **AI integration**: Anthropic SDK present but unused
- **File handling**: No PDF upload or audio processing
- **Collaboration domain**: Exists but minimal (needs expansion for live features)

### Verdict
**Highly feasible** to implement all proposed features. Estimated effort: **12-14 weeks** with proper prioritization.

---

## Domain-by-Domain Analysis

### 1. Auth Domain
**Current State**: ✅ Strong
- Better Auth with email/password and OAuth ready
- RBAC with admin/instructor/member roles
- Session management

**Proposed Features**:
- B2B organization accounts
- SSO for enterprise (SAML, Azure AD)

**Gaps**:
- No `organizations` table (separate from groups)
- No SSO provider integration

**Recommendations**:
```ts
// Add to auth.schema.ts
export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  domain: varchar('domain', { length: 255 }).unique(), // e.g., "acme.com"
  subscription: varchar('subscription', { enum: ['free', 'team', 'enterprise'] }),
  ssoProvider: varchar('sso_provider', { enum: ['none', 'saml', 'azure_ad', 'okta'] }),
  ssoConfig: jsonb('sso_config'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const organizationMembers = pgTable('organization_members', {
  orgId: integer('org_id').references(() => organizations.id),
  userId: text('user_id').references(() => users.id),
  role: varchar('role', { enum: ['owner', 'admin', 'member'] }),
});
```

**Priority**: Phase 4 (B2B features)

---

### 2. Content Domain
**Current State**: ✅ Strong
- Domains, Categories, Flashcards with CRUD
- Tiptap rich text editor integration
- Bulk operations

**Proposed Features**:
- AI-generated flashcards from PDFs/text/audio
- Content marketplace (public/template decks)
- Hints and Socratic coaching

**Gaps**:
- No `ai_generated_content` table
- No `isPublic`/`isTemplate` flags on domains
- No file upload system
- No audio storage

**Recommendations**:
1. **Extend Domains schema**:
```ts
export const domains = pgTable('domains', {
  // ... existing columns
  isPublic: boolean('is_public').notNull().default(false),
  isTemplate: boolean('is_template').notNull().default(false),
  authorId: text('author_id').references(() => users.id),
  downloads: integer('downloads').notNull().default(0),
  averageRating: numeric('average_rating', { precision: 3, scale: 2 }),
});

export const domainRatings = pgTable('domain_ratings', {
  id: serial('id').primaryKey(),
  domainId: integer('domain_id').references(() => domains.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id),
  rating: integer('rating').notNull(), // 1-5
  review: text('review'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

2. **Add AI content tracking** (see Task 0.2.4 in TASKS_BREAKDOWN.md)

3. **File upload service**:
```ts
// src/lib/storage/upload-service.ts
export async function uploadFile(file: File, userId: string): Promise<string> {
  // 1. Validate file type and size
  // 2. Generate S3 key: `uploads/${userId}/${uuid()}.${ext}`
  // 3. Upload to Cloudflare R2 or local storage
  // 4. Return URL or key
}
```

**Priority**: Phase 2 (AI features)

---

### 3. Learning Path Domain
**Current State**: ✅ Very Strong
- Paths → Units → Lessons hierarchy
- `LessonSession` aggregate for state management
- Unlock requirements
- XP calculation service

**Proposed Features**:
- Timed exam mode (sprint sessions)
- Certification paths
- Knowledge map visualization

**Gaps**:
- No exam session type (currently only lesson sessions)
- No certification tracking
- No knowledge graph data structure

**Recommendations**:
1. **Extend LessonSession for exam mode**:
```ts
// Modify LessonSession aggregate
export class LessonSession {
  // ... existing
  constructor(
    // ... existing params
    public readonly sessionType: 'lesson' | 'exam' | 'sprint',
    public readonly timeLimit?: number, // For exams
    public readonly passingScore?: number, // For exams
  ) {}
}
```

2. **Add certifications schema** (see Phase 4, Task 4.1 in IMPLEMENTATION_ROADMAP.md)

3. **Knowledge map** requires new schema (see Task 3.2 in IMPLEMENTATION_ROADMAP.md)

**Priority**: Phase 3 (Gamification) and Phase 4 (Enterprise)

---

### 4. Gamification Domain
**Current State**: ✅ Strong
- XP transactions with sources
- Hearts system with refill
- Streak tracking
- Leaderboards (global + group)

**Proposed Features**:
- Group streaks (social accountability)
- Confidence-based XP
- Battle Room scoring (real-time competition)
- Knowledge map brightness

**Gaps**:
- No `group_streaks` table
- No `confidence_level` in review history
- No real-time scoring system

**Recommendations**:
1. **Group streaks**:
```ts
export const groupStreaks = pgTable('group_streaks', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').references(() => groups.id),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastCompletionDate: date('last_completion_date'),
  streakType: varchar('streak_type', { enum: ['all_members', 'majority'] }).notNull(),
});

export const streakContributions = pgTable('streak_contributions', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').references(() => groups.id),
  userId: text('user_id').references(() => users.id),
  date: date('date').notNull(),
  completed: boolean('completed').notNull().default(false),
});
```

2. **Confidence tracking**: Add column to `review_history`
```ts
// Migration
ALTER TABLE review_history ADD COLUMN confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5);
```

3. **Real-time scoring**: See Live Sessions schema (Task 1.1.1)

**Priority**: Phase 1 (Real-time) and Phase 3 (Gamification)

---

### 5. Review Domain
**Current State**: ✅ Very Strong
- `ReviewSession` aggregate
- Spaced repetition service with intervals
- Review history tracking
- Struggling queue

**Proposed Features**:
- Confidence-based interval adjustment
- Peer review validation
- AI-generated hints
- Interleaving (mixed categories)

**Gaps**:
- `SpacedRepetitionService` doesn't use confidence
- No peer review schema
- No hint caching

**Recommendations**:
1. **Update SpacedRepetitionService**:
```ts
// src/domains/review/services/SpacedRepetitionService.ts
export class SpacedRepetitionService {
  calculateNextReview(
    isCorrect: boolean,
    currentInterval: number,
    confidenceLevel?: number // NEW
  ): Date {
    if (!isCorrect) {
      return addDays(new Date(), 1);
    }

    // Confidence adjustment
    let intervalMultiplier = 2; // Default doubling
    if (confidenceLevel) {
      if (confidenceLevel <= 2) {
        intervalMultiplier = 1.5; // Low confidence → shorter interval
      } else if (confidenceLevel >= 4) {
        intervalMultiplier = 2.5; // High confidence → longer interval
      }
    }

    const nextInterval = Math.min(currentInterval * intervalMultiplier, 365);
    return addDays(new Date(), nextInterval);
  }
}
```

2. **Peer review schema**: See Task 1.4 in IMPLEMENTATION_ROADMAP.md

3. **Hint caching**: See `ai_hints` table in Task 0.2.4

**Priority**: Phase 2 (AI) and Phase 3 (Psychology)

---

### 6. Collaboration Domain
**Current State**: ⚠️ Basic (Needs Expansion)
- Groups with roles (admin/member)
- Invitations system
- Path assignments
- Group analytics (aggregate progress)

**Proposed Features**:
- Live study rooms (real-time presence)
- Blitz quizzes (Kahoot mode)
- Study squads (private groups with shared progress)
- Peer-to-peer recall validation
- Battle Room (real-time competition)

**Gaps**:
- No real-time infrastructure (WebSocket/Supabase)
- No live session management
- No presence tracking
- No squad-specific settings

**Recommendations**:
1. **Real-time infrastructure**: Critical first step (see Phase 0, Task 0.1)

2. **Extend Groups for squads**:
```ts
export const groups = pgTable('groups', {
  // ... existing columns
  groupType: varchar('group_type', { enum: ['regular', 'squad'] }).notNull().default('regular'),
  squadSettings: jsonb('squad_settings').$type<{
    shareProgress: boolean;
    autoSuggestCards: boolean;
    streakMode: 'individual' | 'group';
    peerReviewRequired: boolean;
  }>(),
});
```

3. **Live sessions schema**: See Task 1.1.1 in TASKS_BREAKDOWN.md

**Priority**: Phase 1 (Real-time) - HIGHEST IMPACT

---

### 7. NEW Domain: AI (To Be Created)
**Current State**: ❌ Does Not Exist

**Proposed Features**:
- AI coach (Socratic hints, gap analysis)
- Content generation (flashcards from PDFs/audio)
- Knowledge map generation
- Bridge deck suggestions

**Recommendations**:
1. **Create new domain**: `src/domains/ai/`

2. **Structure**:
```
src/domains/ai/
├── services/
│   ├── AICoachService.ts           # Hints, gap analysis
│   ├── ContentGenerationService.ts # PDF/audio → flashcards
│   └── KnowledgeMapService.ts      # Graph generation
├── repositories/
│   └── IAIGeneratedContentRepository.ts
├── entities/
│   ├── KnowledgeGap.ts
│   └── AIGeneratedContent.ts
└── value-objects/
    └── AIHint.ts
```

3. **Integration points**:
- Commands: `GenerateBridgeDeck`, `RequestHint`, `ProcessDocument`
- Queries: `GetAIInsights`, `GetPendingAICards`, `GetKnowledgeMap`
- Trigger.dev tasks: All AI processing (async, can take >10s)

**Priority**: Phase 2 (AI features)

---

### 8. NEW Domain: Analytics (Optional)
**Current State**: ⚠️ Partial (Scattered across domains)

**Proposed Features**:
- Manager dashboards
- Skill gap reports
- Engagement heatmaps
- Proficiency matrix

**Recommendations**:
1. **Option A**: Keep analytics logic in existing domains (simpler)
   - Group analytics in `collaboration` domain
   - User analytics in `gamification` domain

2. **Option B**: Create dedicated `analytics` domain (cleaner)
   - Centralized analytics logic
   - Materialized views for performance
   - Dedicated analytics schema

**Recommendation**: Start with Option A (simpler), refactor to Option B if analytics grow complex

**Priority**: Phase 4 (Enterprise features)

---

## Technical Infrastructure Gaps

### 1. Real-Time Communication
**Status**: ❌ Missing

**Required For**:
- Live quizzes
- Presence system
- Real-time leaderboards
- Peer review notifications

**Options**:

| Provider | Pros | Cons | Cost |
|----------|------|------|------|
| **Supabase Realtime** | Free tier (200 connections), PostgreSQL integration, auth compatible | Limited to Supabase ecosystem | Free → $25/mo |
| **Socket.io** | Full control, self-hosted, mature | More setup, need Redis for scaling | Infrastructure cost only |
| **Ably** | Great DX, channels, presence built-in | Expensive at scale | $25 → $200+/mo |
| **Pusher** | Simple, good docs | Expensive, less flexible | $49 → $499+/mo |

**Recommendation**: **Supabase Realtime**
- Best fit for existing PostgreSQL + Better Auth stack
- Free tier sufficient for MVP (200 concurrent = ~50 live quizzes)
- Upgrade path to dedicated infrastructure later

**Implementation Timeline**: Week 1-2 (Phase 0)

---

### 2. AI Integration
**Status**: ⚠️ SDK Installed, Not Used

**Current Setup**:
- `@anthropic-ai/sdk` in `devDependencies` (should be in `dependencies`)
- No AI service layer
- No prompt engineering infrastructure

**Required For**:
- Socratic hints
- Gap analysis
- Flashcard generation
- Bridge deck suggestions

**Recommendations**:
1. **Move SDK to production dependencies**:
```bash
npm install @anthropic-ai/sdk --save
```

2. **Create AI service layer** (see Task 0.2.2 in TASKS_BREAKDOWN.md)

3. **Cost management**:
```ts
// Add usage tracking
export const aiUsageTracking = pgTable('ai_usage_tracking', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  operation: varchar('operation', { enum: ['hint', 'generate_cards', 'gap_analysis'] }),
  tokensUsed: integer('tokens_used'),
  cost: numeric('cost', { precision: 10, scale: 6 }), // in USD
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Implement rate limiting
export async function checkAIQuota(userId: string): Promise<boolean> {
  const today = startOfDay(new Date());
  const usage = await db
    .select({ total: sum(aiUsageTracking.tokensUsed) })
    .from(aiUsageTracking)
    .where(and(
      eq(aiUsageTracking.userId, userId),
      gte(aiUsageTracking.createdAt, today)
    ));

  const FREE_TIER_LIMIT = 50_000; // 50k tokens/day
  return (usage[0]?.total ?? 0) < FREE_TIER_LIMIT;
}
```

**Implementation Timeline**: Week 3-4 (Phase 0)

---

### 3. File Upload & Storage
**Status**: ❌ Missing

**Required For**:
- PDF upload for doc-to-deck
- Audio recording for voice-to-flashcard
- Certificate PDF generation
- Avatar uploads

**Options**:

| Provider | Pros | Cons | Cost |
|----------|------|------|------|
| **Cloudflare R2** | S3-compatible, free egress, cheap | Newer, less ecosystem support | $0.015/GB storage |
| **AWS S3** | Mature, huge ecosystem | Egress costs | $0.023/GB + egress |
| **Vercel Blob** | Zero config with Next.js | Expensive, vendor lock-in | $0.15/GB |
| **Local storage** | Free, simple | Not scalable, backup issues | Infrastructure only |

**Recommendation**: **Cloudflare R2**
- S3-compatible (use `@aws-sdk/client-s3`)
- Free egress (huge savings for certificates, avatars)
- Cheapest storage cost

**Implementation**:
```ts
// src/lib/storage/r2-client.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToR2(file: Buffer, key: string): Promise<string> {
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: file,
  }));

  return `https://cdn.yourdomain.com/${key}`;
}
```

**Implementation Timeline**: Week 2 (Phase 0)

---

### 4. Audio Processing
**Status**: ❌ Missing

**Required For**:
- Voice-to-flashcard
- Peer recall validation (audio answers)

**Components Needed**:
1. **Browser recording**: MediaRecorder API
2. **Storage**: R2 (see above)
3. **Transcription**: Whisper API or Deepgram

**Recommendations**:
```ts
// src/hooks/useAudioRecorder.ts
export function useAudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      setAudioBlob(new Blob(chunks, { type: 'audio/webm' }));
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setRecording(true);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  return { recording, audioBlob, startRecording, stopRecording };
}
```

**Transcription via Trigger.dev**:
```ts
// src/trigger/tasks/transcribe-audio.ts
import { task } from '@trigger.dev/sdk';
import { OpenAI } from 'openai';

export const transcribeAudio = task({
  id: 'transcribe-audio',
  run: async (payload: { audioUrl: string; userId: string }) => {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const transcription = await openai.audio.transcriptions.create({
      file: await fetch(payload.audioUrl).then(r => r.blob()),
      model: 'whisper-1',
    });

    await db.update(aiGeneratedContent)
      .set({ extractedText: transcription.text, status: 'completed' })
      .where(eq(aiGeneratedContent.sourceUrl, payload.audioUrl));

    return transcription.text;
  },
});
```

**Priority**: LOW (Phase 2, optional feature)

---

## Database Performance Considerations

### 1. Indexes for Real-Time Queries
**Current State**: ⚠️ Some indexes, needs more for real-time

**Required Indexes** (add via migrations):
```sql
-- Live sessions (high-frequency queries)
CREATE INDEX idx_live_sessions_status_group ON live_sessions(status, group_id);
CREATE INDEX idx_live_participants_session ON live_session_participants(session_id) WHERE left_at IS NULL;
CREATE INDEX idx_live_answers_session_user ON live_session_answers(session_id, user_id);

-- Presence (constant updates)
CREATE INDEX idx_presence_user_status ON online_presence(user_id, status);
CREATE INDEX idx_presence_group_online ON online_presence(group_id) WHERE status = 'online';

-- AI features (cache lookups)
CREATE INDEX idx_ai_hints_flashcard_expires ON ai_hints(flashcard_id) WHERE expires_at > NOW();

-- Review history (confidence-based SRS)
CREATE INDEX idx_review_history_next_review_confidence ON review_history(user_id, next_review_date, confidence_level);
```

---

### 2. Materialized Views for Analytics
**Recommendation**: Use for expensive aggregate queries

```sql
-- Group proficiency summary (refreshed daily)
CREATE MATERIALIZED VIEW group_proficiency_summary AS
SELECT
  gm.group_id,
  d.id AS domain_id,
  d.name AS domain_name,
  c.id AS category_id,
  c.name AS category_name,
  COUNT(DISTINCT gm.user_id) AS member_count,
  AVG(CASE WHEN rh.is_correct THEN 100 ELSE 0 END) AS avg_success_rate,
  COUNT(DISTINCT rh.flashcard_id) AS cards_reviewed
FROM group_members gm
JOIN review_history rh ON rh.user_id = gm.user_id
JOIN flashcards f ON f.id = rh.flashcard_id
JOIN categories c ON c.id = f.category_id
JOIN domains d ON d.id = c.domain_id
GROUP BY gm.group_id, d.id, d.name, c.id, c.name;

-- Refresh via Trigger.dev task (daily)
CREATE UNIQUE INDEX ON group_proficiency_summary(group_id, category_id);
```

**Trigger.dev task**:
```ts
export const refreshAnalytics = task({
  id: 'refresh-analytics',
  run: async () => {
    await db.execute(sql`REFRESH MATERIALIZED VIEW CONCURRENTLY group_proficiency_summary`);
  },
});

// Schedule: Daily at 2 AM
```

---

### 3. Connection Pooling for Real-Time Load
**Current State**: ⚠️ Default Drizzle connection (likely 10 connections)

**Recommendation**: Increase for real-time workload

```ts
// src/infrastructure/database/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 50, // Increase from default 10
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool);
```

**Monitor with**:
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'learning_cards';

-- Check slow queries
SELECT pid, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > interval '1 second';
```

---

## Deployment Considerations

### 1. Environment Variables
**New Variables Required**:
```env
# Real-time (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx

# AI (Anthropic Claude)
ANTHROPIC_API_KEY=sk-ant-xxx

# File Storage (Cloudflare R2)
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=learning-cards
R2_PUBLIC_URL=https://cdn.yourdomain.com

# Audio Transcription (OpenAI Whisper)
OPENAI_API_KEY=sk-xxx

# Feature Flags
NEXT_PUBLIC_FEATURE_BLITZ_QUIZ=true
NEXT_PUBLIC_FEATURE_AI_COACH=false
NEXT_PUBLIC_FEATURE_CERTIFICATIONS=false
```

---

### 2. Vercel Deployment Adjustments
**Current Setup**: Likely configured for Vercel

**Adjustments Needed**:
1. **Increase serverless function timeout** (for AI processing):
```json
// vercel.json
{
  "functions": {
    "app/api/**": {
      "maxDuration": 60
    }
  }
}
```

2. **Add Redis for session state** (Upstash):
```bash
npm install @upstash/redis
```

3. **Configure Trigger.dev** (if not already):
```bash
npx trigger.dev@latest deploy
```

---

## Cost Estimates

### Monthly Operational Costs (1,000 Active Users)

| Service | Usage | Cost |
|---------|-------|------|
| **Supabase Realtime** | 200 concurrent connections (free tier) | $0 |
| **Anthropic Claude** | 10M tokens (~200 cards/user/month) | ~$30 |
| **Cloudflare R2** | 10 GB storage + transfers | ~$0.20 |
| **OpenAI Whisper** | 1,000 minutes audio transcription | ~$6 |
| **PostgreSQL** | Existing hosting | $0 (assumed covered) |
| **Trigger.dev** | Free tier (500 runs/day) | $0 |

**Total**: ~$36/month (scales with usage)

**At 10,000 users**: ~$300/month (Claude API dominates cost)

**Cost Optimization Strategies**:
1. **Aggressive AI caching** (reduce redundant API calls)
2. **User quotas** (free tier = 10 AI operations/day)
3. **Premium tier** ($5/month = unlimited AI)

---

## Risk Assessment

### High-Risk Areas

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Real-time scalability | HIGH | MEDIUM | Start with Supabase free tier, monitor connection count, implement connection pooling |
| AI costs spiral | MEDIUM | HIGH | Implement quotas, caching, rate limiting; offer premium tier |
| Live quiz cheating | MEDIUM | MEDIUM | Time limits, answer encryption, participant verification |
| Database overload (real-time writes) | HIGH | LOW | Connection pooling, materialized views, Redis caching |
| Audio storage costs | LOW | LOW | Limit recording length (max 2 minutes), compress audio |

### Low-Risk Areas
- Schema migrations (Drizzle handles well)
- Authentication (Better Auth is solid)
- CQRS complexity (architecture already in place)
- TypeScript type safety (strict mode enabled)

---

## Recommended Priorities

### Phase 0: Foundations (Weeks 1-2)
**Why First**: All other features depend on these

1. Real-time infrastructure (Supabase)
2. AI service layer (Anthropic)
3. File upload (R2)

**Outcome**: Can start building Phase 1 features

---

### Phase 1: Collaborative Learning (Weeks 3-5)
**Why Next**: Highest user engagement impact

1. Live sessions infrastructure
2. Blitz quiz (most exciting feature)
3. Study squads

**Outcome**: Transform from solo to social learning

---

### Phase 2: AI Accelerator (Weeks 6-8)
**Why Third**: Builds on Phase 1 data (group weaknesses)

1. Gap analysis
2. Socratic hints
3. Doc-to-deck generation

**Outcome**: AI becomes active coach, not just card generator

---

### Phase 3: Gamification (Weeks 9-11)
**Why Fourth**: Enhances engagement from Phases 1-2

1. Group streaks
2. Knowledge map
3. Confidence-based SRS

**Outcome**: Retention increases through social pressure

---

### Phase 4: Enterprise (Weeks 12-14)
**Why Last**: Requires all previous features working

1. Certifications
2. Manager dashboards
3. Content marketplace

**Outcome**: Platform ready for B2B sales

---

## Conclusion

**Your codebase is exceptionally well-positioned for these features.** The DDD/CQRS architecture makes each phase predictable and isolated. Biggest effort is in Phase 0 (infrastructure) and Phase 1 (real-time), but these unlock massive value.

**Recommendation**: Start with **Phase 0, Task 0.1 (Real-time infrastructure)** immediately. This is the critical path for all collaborative features.

**Questions to Resolve**:
1. ✅ Real-time provider: Supabase Realtime (recommended)
2. ❓ AI budget: What's acceptable monthly spend? ($30-300/month)
3. ❓ Audio features: Essential or optional? (Recommend optional)
4. ✅ Database: PostgreSQL is perfect, add indexes as needed
5. ❓ Timeline: 14 weeks realistic? Or prioritize subset of features?

Let me know which features to prioritize first, and I'll help implement them step-by-step! 🚀
