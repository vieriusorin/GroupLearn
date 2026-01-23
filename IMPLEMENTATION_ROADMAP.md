# Learning Cards - Next-Gen Implementation Roadmap

> **Status**: Planning Phase
> **Last Updated**: 2026-01-23
> **Architecture**: DDD + CQRS on Next.js 16 with Trigger.dev v4

## Executive Summary

This roadmap transforms Learning Cards from a solo spaced-repetition platform into a **collaborative, AI-powered learning ecosystem** with real-time interaction, gamification, and enterprise features. The plan builds on the existing DDD/CQRS architecture and leverages Trigger.dev for async operations.

### Vision
- **Individual Learners**: AI-accelerated learning with social accountability
- **Study Groups**: Real-time competition and peer teaching
- **Enterprises**: Skill certification and team analytics

---

## Current State Assessment

### ✅ Strong Foundation (Already Built)

**Architecture**
- ✅ DDD with 6 bounded contexts (Auth, Content, Learning Path, Gamification, Review, Collaboration)
- ✅ CQRS pattern with Commands/Queries/Handlers
- ✅ PostgreSQL with Drizzle ORM
- ✅ Better Auth with RBAC
- ✅ Trigger.dev v4 integration (configured, minimal usage)
- ✅ Rich text editor (Tiptap)
- ✅ URL state management (nuqs)

**Features**
- ✅ Spaced repetition algorithm
- ✅ Learning paths (Domains → Paths → Units → Lessons)
- ✅ XP, Hearts, Streaks
- ✅ Groups with invitations and role-based access
- ✅ Admin panel
- ✅ Multiple review modes (Flashcard, Quiz, Recall)

**Tech Stack**
- ✅ Next.js 16 + React 19
- ✅ TypeScript strict mode
- ✅ Anthropic SDK available (@anthropic-ai/sdk)
- ✅ Drizzle ORM with migrations
- ✅ Tailwind CSS v4

### ⚠️ Gaps for Next-Gen Features

**Infrastructure Missing**
- ❌ Real-time communication layer (WebSocket/Supabase Realtime)
- ❌ AI integration (SDK present, not implemented)
- ❌ Audio recording/playback
- ❌ File upload system (PDF processing)
- ❌ Object storage (S3/Cloudflare R2)

**Database Schema Gaps**
- ❌ Live sessions and presence tracking
- ❌ Peer review system
- ❌ AI-generated content metadata
- ❌ Certification/badge system
- ❌ Confidence ratings in reviews
- ❌ Organization/enterprise tables
- ❌ Visual knowledge map data structures

**Domain Expansion Needed**
- ⚠️ Collaboration domain (exists but needs real-time features)
- ❌ AI domain (new - for AI coaching logic)
- ❌ Certification domain (new - for B2B)
- ❌ Analytics domain (for enterprise dashboards)

---

## Implementation Phases

### Phase 0: Infrastructure Foundations (Week 1-2)

**Goal**: Prepare technical infrastructure for real-time, AI, and enterprise features

#### Task 0.1: Real-Time Infrastructure
**Priority**: CRITICAL - Required for all collaborative features

- [ ] **Evaluate real-time providers**
  - [ ] Research: Socket.io vs Supabase Realtime vs Ably vs Pusher
  - [ ] Decision criteria: Cost, latency, DX, scalability
  - [ ] **Recommendation**: Supabase Realtime (free tier, PostgreSQL integration, easy auth)

- [ ] **Install and configure real-time provider**
  - [ ] Add dependencies: `@supabase/supabase-js` or `socket.io`
  - [ ] Configure environment variables (SUPABASE_URL, etc.)
  - [ ] Set up connection pooling and reconnection logic
  - [ ] Create `src/lib/realtime/client.ts` utility

- [ ] **Create presence system**
  - [ ] Database schema: `online_presence` table
    ```sql
    - userId: text (FK to users)
    - groupId: integer (FK to groups, nullable)
    - sessionId: text (nullable - for live quiz sessions)
    - status: 'online' | 'away' | 'offline'
    - lastSeen: timestamp
    - metadata: jsonb (current activity)
    ```
  - [ ] Real-time subscription handlers
  - [ ] Heartbeat mechanism (every 30s)
  - [ ] Auto-cleanup for stale presence (Trigger.dev task)

#### Task 0.2: AI Service Layer
**Priority**: HIGH - Core differentiator

- [ ] **Create AI domain structure**
  - [ ] `src/domains/ai/` directory
  - [ ] `services/AICoachService.ts` (Socratic hints, gap analysis)
  - [ ] `services/ContentGenerationService.ts` (flashcard generation)
  - [ ] `services/KnowledgeMapService.ts` (dependency graph)
  - [ ] `repositories/IAIGeneratedContentRepository.ts`

- [ ] **Integrate Anthropic Claude**
  - [ ] Create `src/lib/ai/anthropic-client.ts`
  - [ ] Implement retry logic with exponential backoff
  - [ ] Add rate limiting (Trigger.dev for queuing)
  - [ ] Create prompt templates:
    - `prompts/generate-flashcards.ts`
    - `prompts/socratic-hint.ts`
    - `prompts/gap-analysis.ts`

- [ ] **Database schema for AI features**
  - [ ] `ai_generated_content` table
    ```sql
    - id: serial
    - sourceType: 'pdf' | 'url' | 'text' | 'audio'
    - sourceContent: text (or S3 key)
    - generatedCards: jsonb[]
    - status: 'pending' | 'completed' | 'failed'
    - userId: text (FK)
    - createdAt, updatedAt
    ```
  - [ ] `ai_hints` table (cache hints by flashcard)
  - [ ] `knowledge_gaps` table (track identified weaknesses)

#### Task 0.3: File Upload & Storage
**Priority**: MEDIUM - Required for PDF-to-deck

- [ ] **Choose storage provider**
  - [ ] Cloudflare R2 (S3-compatible, free egress)
  - [ ] Or Next.js file uploads to `/tmp` then process

- [ ] **Implement upload handler**
  - [ ] Server Action: `uploadFile(formData: FormData)`
  - [ ] Validate file type/size (PDF max 10MB)
  - [ ] Generate presigned URLs for uploads
  - [ ] Store metadata in `uploaded_files` table

- [ ] **PDF text extraction**
  - [ ] Add `pdf-parse` dependency
  - [ ] Trigger.dev task: `extractTextFromPDF`
  - [ ] Stream processing for large PDFs (>5MB)

#### Task 0.4: Audio Recording (Voice-to-Flashcard)
**Priority**: LOW - Nice-to-have, deprioritize if time-constrained

- [ ] **Browser audio capture**
  - [ ] `src/hooks/useAudioRecorder.ts`
  - [ ] MediaRecorder API integration
  - [ ] WebM/MP3 encoding

- [ ] **Speech-to-text processing**
  - [ ] Integrate Whisper API (OpenAI) or Deepgram
  - [ ] Trigger.dev task for async transcription
  - [ ] Store audio files in object storage

---

### Phase 1: Real-Time Collaborative Learning (Week 3-5)

**Goal**: Enable synchronous group learning experiences

#### Task 1.1: Live Session Infrastructure

- [ ] **Database schema**
  - [ ] `live_sessions` table
    ```sql
    - id: serial
    - sessionType: 'blitz_quiz' | 'study_room' | 'peer_review'
    - groupId: integer (FK to groups)
    - hostId: text (FK to users)
    - categoryId: integer (FK - source of cards)
    - config: jsonb (e.g., { cardCount: 10, timeLimit: 30 })
    - status: 'waiting' | 'active' | 'completed' | 'cancelled'
    - startedAt, endedAt
    ```
  - [ ] `live_session_participants` table
    ```sql
    - sessionId, userId, joinedAt, score, rank
    ```
  - [ ] `live_session_answers` table (for real-time scoring)
    ```sql
    - sessionId, userId, flashcardId, answer, isCorrect, responseTime
    ```

- [ ] **Commands & Handlers**
  - [ ] `CreateLiveSession.command.ts`
  - [ ] `JoinLiveSession.command.ts`
  - [ ] `StartLiveSession.command.ts` (host only)
  - [ ] `SubmitLiveAnswer.command.ts`
  - [ ] `EndLiveSession.command.ts`

- [ ] **Queries & Handlers**
  - [ ] `GetActiveLiveSessions.query.ts` (for group)
  - [ ] `GetLiveSessionLeaderboard.query.ts`
  - [ ] `GetLiveSessionParticipants.query.ts`

#### Task 1.2: Blitz Quiz (Kahoot Mode)

- [ ] **Real-time event handlers**
  - [ ] Broadcast card reveal: `session:card_revealed`
  - [ ] Broadcast answers: `session:answer_submitted`
  - [ ] Update leaderboard: `session:leaderboard_updated`
  - [ ] Session state transitions: `session:started`, `session:ended`

- [ ] **UI Components**
  - [ ] `<BlitzQuizLobby>` - Waiting room with participant list
  - [ ] `<BlitzQuizHost>` - Host controls (start, next card, end)
  - [ ] `<BlitzQuizParticipant>` - Answer UI with countdown timer
  - [ ] `<LiveLeaderboard>` - Real-time ranking with animations
  - [ ] `<BlitzQuizResults>` - Final scores and XP awards

- [ ] **Scoring Logic**
  - [ ] Base points: correctness (10 pts)
  - [ ] Speed bonus: `10 - (responseTime / timeLimit * 10)`
  - [ ] XP calculation: `XPCalculationService.calculateBlitzQuizXP()`
  - [ ] Award XP at session end (Trigger.dev task for batch processing)

#### Task 1.3: Study Squads (Private Groups with Shared Progress)

- [ ] **Extend Groups schema**
  - [ ] Add `group_type` column: 'regular' | 'squad'
  - [ ] Add `squad_settings` jsonb column
    ```json
    {
      "shareProgress": true,
      "autoSuggestCards": true,
      "streakMode": "individual" | "group"
    }
    ```

- [ ] **Squad-specific features**
  - [ ] Query: `GetSquadSharedProgress.query.ts`
    - Aggregate progress across members
    - Identify common weak points
  - [ ] Command: `SuggestCardToSquad.command.ts`
    - When user creates/masters a card, suggest to squad
  - [ ] Real-time notifications: "John just mastered 'JavaScript Promises'!"

- [ ] **UI Components**
  - [ ] `<SquadProgressDashboard>` - Shared knowledge map
  - [ ] `<SquadActivityFeed>` - Real-time updates
  - [ ] `<SuggestedCardsList>` - Cards recommended by squad mates

#### Task 1.4: Peer-to-Peer Recall Validation

- [ ] **Database schema**
  - [ ] `peer_reviews` table
    ```sql
    - id: serial
    - flashcardId: integer
    - revieweeId: text (user who answered)
    - reviewerId: text (user who validates)
    - recallType: 'text' | 'audio'
    - recallContent: text (or audio URL)
    - validationStatus: 'pending' | 'approved' | 'needs_work'
    - validationNotes: text
    - createdAt, validatedAt
    ```

- [ ] **Commands**
  - [ ] `SubmitRecallForReview.command.ts`
  - [ ] `ValidatePeerRecall.command.ts`
  - [ ] `RequestPeerReview.command.ts` (poke a squad mate)

- [ ] **Queries**
  - [ ] `GetPendingReviews.query.ts` (for reviewer)
  - [ ] `GetMySubmittedRecalls.query.ts` (for reviewee)

- [ ] **UI Components**
  - [ ] `<RecallRecorder>` - Audio/text input
  - [ ] `<PeerReviewQueue>` - List of pending validations
  - [ ] `<RecallValidator>` - Compare user's answer with correct answer
  - [ ] Notification system: "Sarah requested your review!"

---

### Phase 2: AI Learning Accelerator (Week 6-8)

**Goal**: Transform AI from card generator to active learning coach

#### Task 2.1: AI Knowledge Gap Analysis

- [ ] **Aggregate weakness detection**
  - [ ] Query: `GetGroupWeaknesses.query.ts`
    ```ts
    // Find cards with <40% group success rate
    // Identify prerequisite concepts
    // Return ranked list of "knowledge gaps"
    ```
  - [ ] Service: `AICoachService.analyzeGroupWeaknesses()`
    - Send aggregate data to Claude (no individual user data)
    - Prompt: "Group fails at X, Y, Z. Suggest prerequisite topics."
    - Return structured `KnowledgeGap[]`

- [ ] **Auto-generate "Bridge Decks"**
  - [ ] Command: `GenerateBridgeDeck.command.ts`
    - Input: `KnowledgeGap`
    - Output: 5-10 flashcards targeting the gap
  - [ ] Store in `ai_generated_content` with `bridgeDeckFor` reference
  - [ ] Notify group admin: "AI suggests a deck to fix async/await struggles"

- [ ] **UI Components**
  - [ ] `<AIInsightsDashboard>` - Visual gap analysis
  - [ ] `<BridgeDeckSuggestion>` - Review and approve AI-generated cards
  - [ ] `<GapProgressTracker>` - Monitor improvement after bridge deck

#### Task 2.2: Socratic Hint System

- [ ] **Flashcard schema extension**
  - [ ] Add `hint_context` column (optional text for hint generation)
  - [ ] Store cached hints in `ai_hints` table to avoid re-generating

- [ ] **Service logic**
  - [ ] `AICoachService.generateSocraticHint(flashcard: Flashcard)`
    - Prompt: "Don't reveal answer. Ask a question to guide thinking."
    - Example: "What does the 'await' keyword do to a Promise?"
  - [ ] Cache hint for 24 hours (reduce API costs)

- [ ] **Commands**
  - [ ] `RequestHint.command.ts`
    - Deduct 2 XP as "help-seeking penalty"
    - Record hint usage in `review_history` metadata
  - [ ] Handler calls `AICoachService.generateSocraticHint()`

- [ ] **UI Components**
  - [ ] Add "💡 Hint" button to review cards
  - [ ] Display hint in expandable section
  - [ ] Show XP penalty warning before requesting

#### Task 2.3: Automated Doc-to-Deck Generation

- [ ] **File upload flow** (builds on Task 0.3)
  - [ ] Page: `/generate-from-doc`
  - [ ] Accept PDF, Markdown, or URL
  - [ ] Validate file (<10MB, allowed types)
  - [ ] Store in object storage

- [ ] **Text extraction & processing**
  - [ ] Trigger.dev task: `processDocumentToCards.task.ts`
    ```ts
    export const processDocument = task({
      id: "process-document-to-cards",
      run: async (payload: { fileUrl: string; userId: string }) => {
        // 1. Extract text (pdf-parse or web scraping)
        // 2. Chunk into sections
        // 3. Call Claude: "Generate 10 flashcards from this content"
        // 4. Store in ai_generated_content
        // 5. Notify user when complete
      }
    });
    ```

- [ ] **Review & approval UI**
  - [ ] Query: `GetPendingAICards.query.ts`
  - [ ] Page: `/ai-cards/review`
  - [ ] Component: `<AICardReviewer>`
    - Show suggested cards
    - Allow edit/delete/approve
    - Bulk approve or import to category
  - [ ] Command: `ApproveAICards.command.ts`

#### Task 2.4: Voice-to-Flashcard (Optional)

- [ ] **Audio recording in UI** (builds on Task 0.4)
  - [ ] Page: `/create-from-voice`
  - [ ] Component: `<VoiceRecorder>` with live waveform
  - [ ] Upload to storage as MP3

- [ ] **Transcription**
  - [ ] Trigger.dev task: `transcribeAudio.task.ts`
  - [ ] Use Whisper API or Deepgram
  - [ ] Store transcription in `ai_generated_content`

- [ ] **Card generation from transcription**
  - [ ] Claude prompt: "Extract key facts from this transcript and create flashcards"
  - [ ] Same review flow as doc-to-deck

---

### Phase 3: Advanced Gamification & Psychology (Week 9-11)

**Goal**: Increase retention through social pressure and advanced SRS

#### Task 3.1: Group Streaks (Social Accountability)

- [ ] **Database schema**
  - [ ] `group_streaks` table
    ```sql
    - groupId: integer
    - currentStreak: integer
    - longestStreak: integer
    - lastResetDate: date
    - streakType: 'all_members' | 'majority' (>50%)
    ```
  - [ ] `streak_contributions` table (daily tracking per member)
    ```sql
    - groupId, userId, date, completed (boolean)
    ```

- [ ] **Streak logic**
  - [ ] Service: `GroupStreakService.checkGroupStreak(groupId)`
    - Query today's contributions
    - If all/majority completed reviews → increment streak
    - If failed → reset streak, emit event
  - [ ] Trigger.dev task: `checkGroupStreaks.task.ts` (runs daily at midnight)

- [ ] **Social pressure mechanics**
  - [ ] Query: `GetStreakBreakers.query.ts` (who hasn't completed today)
  - [ ] Real-time notification: "John and Sarah completed today. You're next!"
  - [ ] XP multiplier: `1.5x` when group streak > 7 days

- [ ] **UI Components**
  - [ ] `<GroupStreakWidget>` - Flame icon with streak count
  - [ ] `<StreakWallOfFame>` - Members who completed vs. pending
  - [ ] `<StreakReminderNotification>` - "Don't break the 14-day streak!"

#### Task 3.2: Visual Knowledge Map (The Constellation)

- [ ] **Knowledge graph data structure**
  - [ ] `knowledge_map_nodes` table
    ```sql
    - id: serial
    - domainId: integer
    - categoryId: integer (nullable)
    - flashcardId: integer (nullable)
    - nodeType: 'domain' | 'category' | 'flashcard'
    - position: jsonb { x, y, z }
    - metadata: jsonb (brightness, mastery level)
    ```
  - [ ] `knowledge_map_edges` table
    ```sql
    - fromNodeId, toNodeId, edgeType: 'prerequisite' | 'related'
    ```

- [ ] **Graph generation logic**
  - [ ] Service: `KnowledgeMapService.generateMap(userId, domainId)`
    - Use force-directed graph algorithm (D3.js)
    - Node size = card count
    - Node brightness = mastery level (0-100%)
  - [ ] Cache in Redis or database (expensive computation)

- [ ] **UI Components**
  - [ ] `<KnowledgeMapVisualization>` using D3.js or Three.js
    - Interactive: click node → see cards
    - Color coding: gray (not started), yellow (learning), green (mastered)
  - [ ] `<GroupKnowledgeOverlay>` - Compare individual vs. group map
  - [ ] Animation: nodes "light up" when cards are mastered

#### Task 3.3: Confidence-Based SRS

- [ ] **Schema change**
  - [ ] Add `confidence_level` column to `review_history` (1-5)
  - [ ] Migrate existing data to default confidence = 3

- [ ] **Service logic**
  - [ ] Update `SpacedRepetitionService.calculateNextReview()`
    ```ts
    if (isCorrect && confidence <= 2) {
      // Low confidence → review sooner
      return addDays(now, 1);
    } else if (isCorrect && confidence >= 4) {
      // High confidence → review later
      return addDays(now, 7);
    }
    ```

- [ ] **UI Changes**
  - [ ] Add confidence slider to review UI
    - "How confident are you? 😰 1 - 5 😎"
  - [ ] Update `SubmitAnswer.command.ts` to accept `confidenceLevel`

#### Task 3.4: Exam Mode (Timed Sprints)

- [ ] **Database schema**
  - [ ] `exam_sessions` table
    ```sql
    - id, userId, categoryId, pathId (nullable)
    - mode: 'sprint' | 'certification'
    - duration: integer (minutes)
    - passingScore: integer (%)
    - finalScore: integer
    - status: 'in_progress' | 'passed' | 'failed'
    - startedAt, completedAt
    ```

- [ ] **Exam mode logic**
  - [ ] Disable SRS intervals (no "due date" filtering)
  - [ ] Time pressure: 30s per card (configurable)
  - [ ] No hearts deduction
  - [ ] Must complete all cards in session

- [ ] **Commands**
  - [ ] `StartExamSession.command.ts`
  - [ ] `SubmitExamAnswer.command.ts` (no SRS update)
  - [ ] `CompleteExamSession.command.ts` (calculate score)

- [ ] **UI Components**
  - [ ] `<ExamModeSelector>` - Choose sprint duration
  - [ ] `<ExamTimer>` - Countdown clock
  - [ ] `<ExamResults>` - Score report with pass/fail

---

### Phase 4: B2B & Enterprise Features (Week 12-14)

**Goal**: Make the platform indispensable for companies and certification prep

#### Task 4.1: Skill Certification Paths

- [ ] **Database schema**
  - [ ] `certifications` table
    ```sql
    - id: serial
    - name: varchar (e.g., "AWS Solutions Architect")
    - pathId: integer (FK)
    - requiredMastery: integer (%) (e.g., 90%)
    - badgeImageUrl: text
    - createdBy: text (admin)
    - isActive: boolean
    ```
  - [ ] `user_certifications` table
    ```sql
    - userId, certificationId, earnedAt
    - certificateUrl: text (generated PDF)
    - verificationCode: uuid
    ```

- [ ] **Certification logic**
  - [ ] Query: `CheckCertificationEligibility.query.ts`
    - Calculate user's mastery % in path
    - Return eligible certifications
  - [ ] Command: `AwardCertification.command.ts`
    - Generate certificate PDF (use `@react-pdf/renderer`)
    - Upload to storage
    - Emit `CertificationEarned` event
  - [ ] Trigger.dev task: `generateCertificatePDF.task.ts`

- [ ] **UI Components**
  - [ ] `<CertificationProgress>` - "You're 85% to AWS cert!"
  - [ ] `<CertificationBadge>` - Display earned badges
  - [ ] `<CertificateViewer>` - Shareable certificate with QR code

#### Task 4.2: Manager/Instructor Analytics Dashboard

- [ ] **Analytics schema**
  - [ ] `organization_analytics` materialized view
    ```sql
    CREATE MATERIALIZED VIEW org_analytics AS
    SELECT
      groupId,
      COUNT(DISTINCT userId) as memberCount,
      AVG(masteryPercentage) as avgMastery,
      domain,
      category,
      COUNT(CASE WHEN masteryLevel = 'mastered' THEN 1 END) as masteredCards
    FROM user_progress
    JOIN group_members ...
    GROUP BY groupId, domain, category;
    ```
  - [ ] Refresh via Trigger.dev task (daily)

- [ ] **Queries**
  - [ ] `GetOrganizationAnalytics.query.ts`
    - Team proficiency heatmap
    - Most difficult categories
    - Engagement metrics (daily active users)
  - [ ] `GetSkillGapReport.query.ts`
    - "Engineering team is 90% in React, 40% in Security"

- [ ] **Manager Dashboard UI**
  - [ ] Page: `/admin/analytics`
  - [ ] Components:
    - `<ProficiencyHeatmap>` - Color-coded skill matrix
    - `<EngagementChart>` - Daily active learners
    - `<SkillGapTable>` - Sortable table of weak areas
    - `<PathAssignmentRecommendations>` - AI suggestions

#### Task 4.3: Path Assignment with Deadlines

- [ ] **Schema extension**
  - [ ] Add to `group_paths` table:
    - `deadline: timestamp` (nullable)
    - `isMandatory: boolean`
    - `assignedBy: text`

- [ ] **Commands**
  - [ ] `AssignPathWithDeadline.command.ts`
  - [ ] `UpdatePathDeadline.command.ts`

- [ ] **Deadline enforcement**
  - [ ] Query: `GetOverduePaths.query.ts`
  - [ ] Trigger.dev task: `sendDeadlineReminders.task.ts`
    - Check daily for paths with deadline in 3 days
    - Send email notification
  - [ ] UI warning badge on overdue paths

#### Task 4.4: Content Marketplace / Public Decks

- [ ] **Schema changes**
  - [ ] Add to `domains` table:
    - `isPublic: boolean`
    - `isTemplate: boolean`
    - `authorId: text`
    - `downloads: integer`
  - [ ] Add `domain_ratings` table (star ratings)

- [ ] **Marketplace features**
  - [ ] Page: `/marketplace`
  - [ ] Query: `GetPublicDomains.query.ts`
    - Filter by category, rating, popularity
  - [ ] Command: `CloneDomain.command.ts`
    - Deep copy all categories and flashcards
    - Assign to user's private workspace

- [ ] **UI Components**
  - [ ] `<MarketplaceGrid>` - Browse public decks
  - [ ] `<DomainPreview>` - View before cloning
  - [ ] `<CloneButton>` - One-click copy

---

## Additional Improvements & Refinements

### Task 5.1: Database Optimizations

- [ ] **Add indexes**
  - [ ] `review_history(userId, nextReviewDate)` - Speed up due card queries
  - [ ] `live_session_answers(sessionId, userId)` - Real-time leaderboard
  - [ ] `ai_hints(flashcardId)` - Cache lookups
  - [ ] `group_members(groupId, userId)` - Group queries

- [ ] **Materialized views**
  - [ ] `user_mastery_summary` - Pre-calculated mastery levels
  - [ ] `group_analytics` - Aggregate stats
  - [ ] Refresh via Trigger.dev tasks

### Task 5.2: Performance Optimizations

- [ ] **Caching layer**
  - [ ] Add Redis for:
    - Session data (live quiz state)
    - Presence data (who's online)
    - AI hint cache
    - Leaderboard snapshots
  - [ ] Use `@upstash/redis` (serverless-friendly)

- [ ] **Database connection pooling**
  - [ ] Increase pool size for real-time load
  - [ ] Monitor with `pg_stat_activity`

- [ ] **Code splitting**
  - [ ] Lazy load `<KnowledgeMapVisualization>` (D3.js is heavy)
  - [ ] Dynamic import for audio recorder

### Task 5.3: Testing Strategy

- [ ] **Unit tests**
  - [ ] All domain services (XPCalculationService, SpacedRepetitionService)
  - [ ] AI service mocks (test without API calls)
  - [ ] Streak calculation logic

- [ ] **Integration tests**
  - [ ] CQRS handlers with test database
  - [ ] Real-time event flows
  - [ ] Trigger.dev task execution

- [ ] **E2E tests**
  - [ ] Playwright: Complete blitz quiz flow
  - [ ] Certification path completion
  - [ ] Group streak mechanics

---

## Migration & Deployment Strategy

### Database Migrations

**Order of execution** (to avoid dependency issues):

1. **Phase 0 migrations**
   ```bash
   # 001_add_presence_system.sql
   # 002_add_ai_tables.sql
   # 003_add_file_uploads.sql
   ```

2. **Phase 1 migrations**
   ```bash
   # 004_add_live_sessions.sql
   # 005_add_peer_reviews.sql
   # 006_extend_groups_for_squads.sql
   ```

3. **Phase 2-4 migrations**
   ```bash
   # 007_add_knowledge_map.sql
   # 008_add_confidence_to_reviews.sql
   # 009_add_certifications.sql
   # 010_add_organization_analytics.sql
   ```

### Feature Flags

Use `nuqs` or environment variables to gradually roll out features:

```ts
// .env.local
FEATURE_BLITZ_QUIZ=true
FEATURE_AI_COACH=false
FEATURE_CERTIFICATIONS=false
```

UI checks:
```tsx
{process.env.NEXT_PUBLIC_FEATURE_BLITZ_QUIZ && <BlitzQuizButton />}
```

### Backward Compatibility

- [ ] All new columns are `nullable` initially
- [ ] Add `@default()` values in Drizzle schema
- [ ] Write data migration scripts for existing records

---

## Success Metrics

### User Engagement
- **Daily Active Users (DAU)**: +40% (live features)
- **Session Duration**: +30% (interactive quizzes)
- **Group Retention**: 70% of groups active after 30 days

### Learning Outcomes
- **Retention Rate**: 85% on cards reviewed with confidence-based SRS
- **Time to Mastery**: -20% with AI bridge decks
- **Peer Review Accuracy**: >90% alignment with correct answers

### Enterprise Adoption
- **Certification Completion**: 60% of assigned paths with deadlines
- **Manager Dashboard Usage**: 80% of group admins use analytics monthly
- **Marketplace Engagement**: 500+ public deck downloads in 6 months

---

## Risk Mitigation

### Technical Risks

| Risk | Mitigation |
|------|-----------|
| Real-time scalability issues | Start with Supabase free tier, monitor connection count, upgrade to dedicated infrastructure |
| AI API costs spiral | Implement aggressive caching, rate limiting, and "AI credits" system for users |
| Large file uploads crash server | Use streaming uploads, validate file size client-side, process asynchronously with Trigger.dev |
| Knowledge map performance (D3.js) | Limit nodes to 100 per view, use Web Workers for graph calculation, cache layouts |

### Product Risks

| Risk | Mitigation |
|------|-----------|
| Users find AI hints "too easy" | Add XP penalty, limit hints per day, track hint usage in analytics |
| Group streaks create stress | Make it opt-in, offer "solo streak" mode, grace period for missed days |
| Certification devalued if too easy | Set high mastery threshold (90%), time-box exams, prevent retries for 7 days |

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 0: Infrastructure | 2 weeks | Real-time, AI, file upload, audio |
| Phase 1: Collaborative | 3 weeks | Blitz quiz, squads, peer review |
| Phase 2: AI Accelerator | 3 weeks | Gap analysis, hints, doc-to-deck |
| Phase 3: Gamification | 3 weeks | Group streaks, knowledge map, confidence SRS |
| Phase 4: Enterprise | 3 weeks | Certifications, analytics, marketplace |
| **Total** | **14 weeks** | **Full next-gen platform** |

---

## Next Steps

1. **Review & Prioritize**: Go through each task and mark priorities
2. **Set Up Project Board**: Create GitHub Issues/Linear tickets for each task
3. **Start with Phase 0, Task 0.1**: Real-time infrastructure (highest dependency)
4. **Iterate Weekly**: Build → Test → Deploy in small increments

---

**Questions or Clarifications Needed:**

1. **Real-time provider preference**: Supabase vs. Socket.io?
2. **AI budget**: What's acceptable monthly spend on Claude API?
3. **Enterprise priority**: Focus on B2B features first or collaborative learning?
4. **Audio features**: Voice-to-flashcard essential or nice-to-have?
5. **Marketplace**: Public launch or internal first?

Let me know which features to prioritize, and I'll help implement them step by step! 🚀
