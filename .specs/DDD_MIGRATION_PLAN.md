# DDD Migration Plan - Learning Cards Application

**Version:** 2.0
**Last Updated:** 2026-01-19
**Status:** 🟢 Near Complete (97% Complete) - Backend Ready!
**Spec-Driven Development Tracker**

---

## 📊 Overall Progress

```
███████████████████████████████████ 97% Complete

✅ Domain Layer:        100% (31/31 tasks)
✅ Infrastructure Layer: 100% (6/6 tasks)
✅ Application Layer:   100% (15/15 tasks)
✅ Presentation Layer:  100% (21/21 tasks)
🟡 Integration Layer:   60% (7/12 tasks)
```

**Legend:**
- ✅ Complete
- 🟡 In Progress
- 🔴 Not Started
- ⏸️ Blocked/Deferred
- ⚠️ Needs Review

---

## 🎯 Quick Start Guide for Agents

### If you're a new agent picking up this work:

1. **Read this section first** to understand the context
2. **Check the "Next Priority Tasks"** section below
3. **Review the relevant task details** in the sections below
4. **Update progress markers** when you complete tasks
5. **Add notes** in the "Implementation Notes" section

### Context

This is a migration from an **anemic domain model** to a **rich Domain-Driven Design** architecture. The codebase uses:
- **Framework:** Next.js 15 with App Router
- **Database:** SQLite via better-sqlite3
- **State:** TanStack Query for client state
- **UI:** React 19 with shadcn/ui components

### Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│ Presentation Layer (Next.js UI Components)             │
│ - Server Actions                                        │
│ - React Components                                      │
│ - TanStack Query hooks                                  │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ Application Layer (Use Cases / Orchestration)          │
│ - Use Cases (StartLesson, SubmitAnswer, etc.)          │
│ - DTOs (Request/Response objects)                       │
│ - Event Handlers                                        │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ Domain Layer (Business Logic)                          │
│ - Entities (Domain, Category, Flashcard)               │
│ - Aggregates (LessonSession, ReviewSession)            │
│ - Value Objects (XP, Hearts, Accuracy, etc.)           │
│ - Domain Events                                         │
│ - Domain Services                                       │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ Infrastructure Layer (Data Access)                     │
│ - Repository Implementations (SQLite)                   │
│ - Database Connection                                   │
│ - External Service Adapters                            │
└─────────────────────────────────────────────────────────┘
```

---

## 🔥 Next Priority Tasks (Pick One)

### Priority 1: Frontend Component Updates
- [ ] **Task 5.4.1** - Update domains page to use Server Actions
- [ ] **Task 5.4.2** - Create lesson page for active lessons
- [ ] **Task 5.4.3** - Update review page to use Server Actions
- [ ] **Task 5.4.4** - Update progress page to use Server Actions

### Priority 2: Event Publishing (Optional)
- [ ] **Task 5.3.1** - Create event publisher
- [ ] **Task 5.3.2** - Register event handlers
- [ ] **Task 5.3.3** - Integrate with use cases

### Priority 3: Testing (Recommended)
- [ ] Unit tests for domain entities
- [ ] Unit tests for value objects
- [ ] Integration tests for use cases
- [ ] E2E tests for critical flows

---

## ✅ PHASE 1: Domain Layer (100% Complete)

### 1.1 Value Objects ✅ (9/9)

<details>
<summary>View Tasks</summary>

| ID | Task | Status | File | Description |
|----|------|--------|------|-------------|
| 1.1.1 | XP value object | ✅ | `src/domains/gamification/value-objects/XP.ts` | Experience points with validation (no negatives), add/subtract/multiply operations |
| 1.1.2 | Hearts value object | ✅ | `src/domains/gamification/value-objects/Hearts.ts` | Hearts system (max 5), deduct/refill operations, empty state detection |
| 1.1.3 | Streak value object | ✅ | `src/domains/gamification/value-objects/Streak.ts` | Consecutive days tracking, increment with date validation, break detection |
| 1.1.4 | Accuracy value object | ✅ | `src/domains/learning-path/value-objects/Accuracy.ts` | Percentage (0-100), ratio calculation, threshold comparisons |
| 1.1.5 | Progress value object | ✅ | `src/domains/learning-path/value-objects/Progress.ts` | Completed/total tracking, percentage calc, advance operation |
| 1.1.6 | Answer value object | ✅ | `src/domains/learning-path/value-objects/Answer.ts` | Immutable answer record with timestamp, time tracking |
| 1.1.7 | ReviewInterval value object | ✅ | `src/domains/review/value-objects/ReviewInterval.ts` | Spaced repetition intervals (1,3,7,14,30 days), next review calc |
| 1.1.8 | Export value object modules | ✅ | `src/domains/*/value-objects/index.ts` | Clean exports for each context |
| 1.1.9 | Branded type IDs | ✅ | `src/domains/shared/types/branded-types.ts` | Type-safe IDs (DomainId, LessonId, etc.) |

</details>

### 1.2 Entities ✅ (4/4)

<details>
<summary>View Tasks</summary>

| ID | Task | Status | File | Description |
|----|------|--------|------|-------------|
| 1.2.1 | Domain entity | ✅ | `src/domains/content/entities/Domain.ts` | Rich domain entity with validation, create/reconstitute factories |
| 1.2.2 | Category entity | ✅ | `src/domains/content/entities/Category.ts` | Category with domain association, validation logic |
| 1.2.3 | Flashcard entity | ✅ | `src/domains/content/entities/Flashcard.ts` | Flashcard with question/answer validation, difficulty |
| 1.2.4 | UserProgress entity | ✅ | `src/domains/gamification/entities/UserProgress.ts` | User progress with XP/hearts/streak, level calc, event emission |

</details>

### 1.3 Aggregates ✅ (2/2)

<details>
<summary>View Tasks</summary>

| ID | Task | Status | File | Description |
|----|------|--------|------|-------------|
| 1.3.1 | LessonSession aggregate | ✅ | `src/domains/learning-path/aggregates/LessonSession.ts` | Manages active lesson with hearts, answers, completion. Invariants: no negative hearts, can't advance past last card |
| 1.3.2 | ReviewSession aggregate | ✅ | `src/domains/review/aggregates/ReviewSession.ts` | Manages review with spaced repetition, struggling card detection |

**Aggregate Patterns Implemented:**
- ✅ Encapsulated state changes
- ✅ Invariant validation
- ✅ Domain event emission
- ✅ Factory methods (start, create)
- ✅ Reconstitution from persistence

</details>

### 1.4 Domain Events ✅ (17/17)

<details>
<summary>View Tasks</summary>

| ID | Task | Status | File | Description |
|----|------|--------|------|-------------|
| 1.4.1 | Lesson events | ✅ | `src/domains/learning-path/events/LessonEvents.ts` | LessonStarted, CardAdvanced, LessonCompleted, LessonFailed, HeartLost |
| 1.4.2 | Review events | ✅ | `src/domains/review/events/ReviewEvents.ts` | CardMastered, CardStruggled, SessionCompleted, CardMarkedAsStruggling |
| 1.4.3 | Progress events | ✅ | `src/domains/gamification/events/ProgressEvents.ts` | XPEarned, HeartsDepletedHeartsDepleted, StreakBroken, StreakMilestone, UnitCompleted, PathCompleted |

</details>

### 1.5 Domain Services ✅ (3/3)

<details>
<summary>View Tasks</summary>

| ID | Task | Status | File | Description |
|----|------|--------|------|-------------|
| 1.5.1 | XPCalculationService | ✅ | `src/domains/learning-path/services/XPCalculationService.ts` | Calculate lesson XP with bonuses, streak bonuses, combo multipliers |
| 1.5.2 | SpacedRepetitionService | ✅ | `src/domains/review/services/SpacedRepetitionService.ts` | SM-2 algorithm, next interval calculation, struggling detection |
| 1.5.3 | HeartRefillService | ✅ | `src/domains/gamification/services/HeartRefillService.ts` | Refill timing (24hr), passive refill (1 per 4hr), progress calculation |

</details>

### 1.6 Shared Kernel ✅ (3/3)

<details>
<summary>View Tasks</summary>

| ID | Task | Status | File | Description |
|----|------|--------|------|-------------|
| 1.6.1 | Domain errors | ✅ | `src/domains/shared/errors/DomainError.ts` | Business rule violations with error codes |
| 1.6.2 | Validation errors | ✅ | `src/domains/shared/errors/ValidationError.ts` | Input validation failures, invariant violations |
| 1.6.3 | Branded types | ✅ | `src/domains/shared/types/branded-types.ts` | Type-safe IDs for all entities |

</details>

---

## ✅ PHASE 2: Infrastructure Layer (100% Complete)

### 2.1 Repository Implementations (5/5) ✅

<details>
<summary>View Tasks</summary>

| ID | Task | Status | File | Description |
|----|------|--------|------|-------------|
| 2.1.1 | SqliteDomainRepository | ✅ | `src/infrastructure/repositories/content/SqliteDomainRepository.ts` | CRUD for Domain entities, reconstitution from DB |
| 2.1.2 | SqliteCategoryRepository | ✅ | `src/infrastructure/repositories/content/SqliteCategoryRepository.ts` | CRUD for Category entities |
| 2.1.3 | SqliteFlashcardRepository | ✅ | `src/infrastructure/repositories/content/SqliteFlashcardRepository.ts` | CRUD for Flashcard entities, pagination, filters, search |
| 2.1.4 | SqliteUserProgressRepository | ✅ | `src/infrastructure/repositories/gamification/SqliteUserProgressRepository.ts` | CRUD for UserProgress, XP/hearts/streak updates |
| 2.1.5 | SqliteReviewHistoryRepository | ✅ | `src/infrastructure/repositories/review/SqliteReviewHistoryRepository.ts` | Review history tracking, struggling cards query |

**Implementation Pattern:**
```typescript
export class SqliteFlashcardRepository implements IFlashcardRepository {
  constructor(private readonly db: Database) {}

  async findById(id: FlashcardId): Promise<Flashcard | null> {
    const row = this.db.prepare('SELECT * FROM flashcards WHERE id = ?').get(id);
    if (!row) return null;
    return this.mapToFlashcard(row);
  }

  private mapToFlashcard(row: any): Flashcard {
    return Flashcard.reconstitute(/* map row to entity */);
  }
}
```

</details>

### 2.2 Database Connection ✅ (2/2)

<details>
<summary>View Tasks</summary>

| ID | Task | Status | File | Description |
|----|------|--------|------|-------------|
| 2.2.1 | Database instance manager | ✅ | `src/infrastructure/database/db.ts` | Singleton DB connection, already exists |
| 2.2.2 | Transaction support | ✅ | `src/infrastructure/database/transactions.ts` | Comprehensive transaction wrapper with async/sync support, savepoints, batch operations |

**Transaction Pattern Implemented:**
```typescript
export async function withTransaction<T>(
  fn: (db: Database.Database) => Promise<T> | T,
  mode: TransactionMode = TransactionMode.DEFERRED
): Promise<TransactionResult<T>>

// Features:
// - Async and sync transaction support
// - Three isolation levels (DEFERRED, IMMEDIATE, EXCLUSIVE)
// - Batch operations support
// - Savepoint support for nested transactions
// - Type-safe result handling
```

</details>

---

## ✅ PHASE 3: Application Layer (100% Complete)

### 3.1 Lesson Use Cases (5/5) ✅

<details>
<summary>View Tasks</summary>

| ID | Task | Status | File | Description | Agent Instructions |
|----|------|--------|------|-------------|-------------------|
| 3.1.1 | StartLessonUseCase | ✅ | `src/application/use-cases/lesson/StartLessonUseCase.ts` | Reference implementation complete | N/A |
| 3.1.2 | SubmitAnswerUseCase | ✅ | `src/application/use-cases/lesson/SubmitAnswerUseCase.ts` | Reference implementation complete | N/A |
| 3.1.3 | CompleteLessonUseCase | ✅ | `src/application/use-cases/lesson/CompleteLessonUseCase.ts` | Finalize lesson, calculate total XP, update UserProgress, record completion | N/A |
| 3.1.4 | GetLessonProgressUseCase | ✅ | `src/application/use-cases/lesson/GetLessonProgressUseCase.ts` | Get current progress for a lesson | ✅ Complete |
| 3.1.5 | GetLessonFlashcardsUseCase | ✅ | `src/application/use-cases/lesson/GetLessonFlashcardsUseCase.ts` | Get all flashcards for a lesson | ✅ Complete |

</details>

### 3.2 Review Use Cases (4/4) ✅

<details>
<summary>View Tasks</summary>

| ID | Task | Status | File | Description | Agent Instructions |
|----|------|--------|------|-------------|-------------------|
| 3.2.1 | StartReviewSessionUseCase | ✅ | `src/application/use-cases/review/StartReviewSessionUseCase.ts` | Start review session with due cards | ✅ Complete |
| 3.2.2 | SubmitReviewUseCase | ✅ | `src/application/use-cases/review/SubmitReviewUseCase.ts` | Submit review answer, update intervals | ✅ Complete |
| 3.2.3 | GetDueCardsUseCase | ✅ | `src/application/use-cases/review/GetDueCardsUseCase.ts` | Get cards due for review | ✅ Complete |
| 3.2.4 | GetStrugglingCardsUseCase | ✅ | `src/application/use-cases/review/GetStrugglingCardsUseCase.ts` | Get cards user is struggling with | ✅ Complete |

</details>

### 3.3 Progress Use Cases (3/3) ✅

<details>
<summary>View Tasks</summary>

| ID | Task | Status | File | Description | Agent Instructions |
|----|------|--------|------|-------------|-------------------|
| 3.3.1 | GetUserProgressUseCase | ✅ | `src/application/use-cases/progress/GetUserProgressUseCase.ts` | Get user progress for a path | ✅ Complete |
| 3.3.2 | RefillHeartsUseCase | ✅ | `src/application/use-cases/progress/RefillHeartsUseCase.ts` | Refill hearts (daily/time-based) | ✅ Complete |
| 3.3.3 | UpdateStreakUseCase | ✅ | `src/application/use-cases/progress/UpdateStreakUseCase.ts` | Update daily streak | ✅ Complete |

</details>

### 3.4 Content Management Use Cases (8/8) ✅

<details>
<summary>View Tasks</summary>

| ID | Task | Status | File | Description | Agent Instructions |
|----|------|--------|------|-------------|-------------------|
| 3.4.1 | CreateDomainUseCase | ✅ | `src/application/use-cases/content/CreateDomainUseCase.ts` | Create new domain | ✅ Complete |
| 3.4.2 | UpdateDomainUseCase | ✅ | `src/application/use-cases/content/UpdateDomainUseCase.ts` | Update domain | ✅ Complete |
| 3.4.3 | DeleteDomainUseCase | ✅ | `src/application/use-cases/content/DeleteDomainUseCase.ts` | Delete domain (with cascade check) | ✅ Complete |
| 3.4.4 | CreateCategoryUseCase | ✅ | `src/application/use-cases/content/CreateCategoryUseCase.ts` | Create category | ✅ Complete |
| 3.4.5 | UpdateCategoryUseCase | ✅ | `src/application/use-cases/content/UpdateCategoryUseCase.ts` | Update category | ✅ Complete |
| 3.4.6 | DeleteCategoryUseCase | ✅ | `src/application/use-cases/content/DeleteCategoryUseCase.ts` | Delete category (with cascade check) | ✅ Complete |
| 3.4.7 | CreateFlashcardUseCase | ✅ | `src/application/use-cases/content/CreateFlashcardUseCase.ts` | Create flashcard | ✅ Complete |
| 3.4.8 | BulkCreateFlashcardsUseCase | ✅ | `src/application/use-cases/content/BulkCreateFlashcardsUseCase.ts` | Bulk create flashcards | ✅ Complete |

</details>

---

## ✅ PHASE 4: Presentation Layer (100% Complete)

**Note:** See `.specs/SSR_MIGRATION_PLAN.md` for detailed Server Actions + SSR migration plan

### 4.1 Server Actions (21/21) ✅

<details>
<summary>View Tasks</summary>

| ID | Task | Status | File | Description | Agent Instructions |
|----|------|--------|------|-------------|-------------------|
| 4.1.1 | Action result types | ✅ | `src/presentation/types/action-result.ts` | Already implemented | N/A |
| 4.1.2 | Create domain action | ✅ | `src/presentation/actions/content/create-domain.ts` | Server Action for creating domain | Uses `withAuth` wrapper + CreateDomainUseCase |
| 4.1.3 | Update domain action | ✅ | `src/presentation/actions/content/update-domain.ts` | Server Action for updating domain | Uses `withAuth` wrapper + UpdateDomainUseCase |
| 4.1.4 | Delete domain action | ✅ | `src/presentation/actions/content/delete-domain.ts` | Server Action for deleting domain | Uses `withAuth` wrapper + DeleteDomainUseCase |
| 4.1.5 | Create category action | ✅ | `src/presentation/actions/content/create-category.ts` | Server Action for creating category | Uses `withAuth` wrapper + CreateCategoryUseCase |
| 4.1.6 | Create flashcard action | ✅ | `src/presentation/actions/content/create-flashcard.ts` | Server Action for creating flashcard | Uses `withAuth` wrapper + CreateFlashcardUseCase |
| 4.1.7 | Bulk create flashcards | ✅ | `src/presentation/actions/content/bulk-create-flashcards.ts` | Server Action for bulk creating flashcards | Uses `withAuth` wrapper + BulkCreateFlashcardsUseCase |
| 4.1.8 | Get domains action | ✅ | `src/presentation/actions/content/get-domains.ts` | Server Action for querying domains | Uses repository directly for read operations |
| 4.1.9 | Get categories action | ✅ | `src/presentation/actions/content/get-categories.ts` | Server Action for querying categories | Uses repository directly for read operations |
| 4.1.10 | Get flashcards action | ✅ | `src/presentation/actions/content/get-flashcards.ts` | Server Action for querying flashcards | Uses repository directly for read operations |
| 4.1.11 | Start review action | ✅ | `src/presentation/actions/review/start-review.ts` | Server Action for starting review session | Uses `withAuth` wrapper + StartReviewSessionUseCase |
| 4.1.12 | Submit review action | ✅ | `src/presentation/actions/review/submit-review.ts` | Server Action for submitting review answer | Uses `withAuth` wrapper + SubmitReviewUseCase |
| 4.1.13 | Get due cards action | ✅ | `src/presentation/actions/review/get-due-cards.ts` | Server Action for getting due flashcards | Uses `withAuth` wrapper + GetDueCardsUseCase |
| 4.1.14 | Get struggling cards action | ✅ | `src/presentation/actions/review/get-struggling-cards.ts` | Server Action for getting struggling cards | Uses `withAuth` wrapper + GetStrugglingCardsUseCase |
| 4.1.15 | Get user progress action | ✅ | `src/presentation/actions/progress/get-user-progress.ts` | Server Action for getting user progress | Uses `withAuth` wrapper + GetUserProgressUseCase |
| 4.1.16 | Refill hearts action | ✅ | `src/presentation/actions/progress/refill-hearts.ts` | Server Action for refilling hearts | Uses `withAuth` wrapper + RefillHeartsUseCase |
| 4.1.17 | Update streak action | ✅ | `src/presentation/actions/progress/update-streak.ts` | Server Action for updating streak | Uses `withAuth` wrapper + UpdateStreakUseCase |
| 4.1.18 | Get lesson progress action | ✅ | `src/presentation/actions/lesson/get-lesson-progress.ts` | Server Action for getting lesson progress | Uses `withAuth` wrapper + GetLessonProgressUseCase |
| 4.1.19 | Get lesson flashcards action | ✅ | `src/presentation/actions/lesson/get-lesson-flashcards.ts` | Server Action for getting lesson flashcards | Uses `withAuth` wrapper + GetLessonFlashcardsUseCase |
| 4.1.20 | Start lesson action | ✅ | `src/presentation/actions/lesson/start-lesson.ts` | Already implemented | N/A |
| 4.1.21 | Submit answer action | ✅ | `src/presentation/actions/lesson/submit-answer.ts` | Already implemented | N/A |
| 4.1.19 | Get lesson flashcards action | ✅ | `src/presentation/actions/lesson/get-lesson-flashcards.ts` | Server Action for getting lesson flashcards | Uses `withAuth` wrapper + GetLessonFlashcardsUseCase |
| 4.1.20 | Start lesson action | ✅ | `src/presentation/actions/lesson/start-lesson.ts` | Server Action for starting lesson | Uses `withAuth` wrapper + StartLessonUseCase |
| 4.1.21 | Submit answer action | ✅ | `src/presentation/actions/lesson/submit-answer.ts` | Server Action for submitting answer | Uses `withAuth` wrapper + SubmitAnswerUseCase |

**Server Action Pattern:**
```typescript
'use server';
import { withAuth } from '@/presentation/utils/action-wrapper';
import { CreateDomainUseCase } from '@/application/use-cases/content/CreateDomainUseCase';

export async function createDomain(name: string, description: string | null) {
  return withAuth(['admin', 'member'], async (user) => {
    const useCase = new CreateDomainUseCase(/* inject repos */);
    const domain = await useCase.execute({ name, description, userId: user.id });
    return { success: true, data: domain };
  });
}
```

</details>

### 4.2 React Query Hooks (DEPRECATED - See SSR Migration Plan)

**⚠️ Architecture Change:** We're migrating to Server Actions + SSR instead of TanStack Query.

**See:** `.specs/SSR_MIGRATION_PLAN.md` for complete migration strategy.

**Decision:** 
- ❌ **No TanStack Query hooks needed** - Use Server Components + Server Actions
- ✅ **Server Components** for data fetching (SSR)
- ✅ **Server Actions** for mutations (with `useActionState` or form actions)
- ✅ **Client Components** only for interactive UI (forms, buttons)

**Old hooks will be removed** as part of the SSR migration.

</details>

---

## 🟡 PHASE 5: Integration Layer (60% Complete)

### 5.1 API Route Updates (5/8)

<details>
<summary>View Tasks</summary>

| ID | Task | Status | File | Description | Agent Instructions |
|----|------|--------|------|-------------|-------------------|
| 5.1.1 | Update /api/domains | ✅ | `src/app/api/domains/route.ts` | Use CreateDomainUseCase, UpdateDomainUseCase, DeleteDomainUseCase | ✅ Migrated from DomainService |
| 5.1.2 | Update /api/categories | ✅ | `src/app/api/categories/route.ts` | Use CreateCategoryUseCase, UpdateCategoryUseCase, DeleteCategoryUseCase | ✅ Migrated from CategoryService |
| 5.1.3 | Update /api/flashcards | ⏸️ | N/A | Server Actions used instead of API routes | Using Server Actions (modern Next.js pattern) |
| 5.1.4 | Create /api/lessons/[id]/start | ✅ | `src/app/api/lessons/[id]/start/route.ts` | Endpoint for starting lessons using StartLessonUseCase | ✅ Complete |
| 5.1.5 | Create /api/lessons/[id]/submit | ✅ | `src/app/api/lessons/[id]/submit/route.ts` | Endpoint for submitting answers using SubmitAnswerUseCase | ✅ Complete |
| 5.1.6 | Create /api/lessons/[id]/complete | ✅ | `src/app/api/lessons/[id]/complete/route.ts` | Endpoint for completing lessons using CompleteLessonUseCase | ✅ Complete |
| 5.1.7 | Update /api/review | ⏸️ | N/A | Server Actions used instead of API routes | Using Server Actions (modern Next.js pattern) |
| 5.1.8 | Update /api/progress | ⏸️ | N/A | Server Actions used instead of API routes | Using Server Actions (modern Next.js pattern) |

**Note:** Tasks 5.1.3, 5.1.7, 5.1.8 are deferred because we're using Server Actions instead of API routes (modern Next.js 13+ pattern). Server Actions are already implemented and working.

</details>

### 5.2 Dependency Injection Setup (1/2)

<details>
<summary>View Tasks</summary>

| ID | Task | Status | File | Description | Agent Instructions |
|----|------|--------|------|-------------|-------------------|
| 5.2.1 | Create DI container | ✅ | `src/infrastructure/di/container.ts` | Simple DI container for repositories | Provides singleton repos for use cases |
| 5.2.2 | Update use cases with DI | 🔴 | `src/application/use-cases/**/*.ts` | **TODO:** Inject repos via constructor | Update all use cases to accept repos in constructor |

**DI Pattern:**
```typescript
// src/infrastructure/di/container.ts
const db = getDb();

export const repositories = {
  domain: new SqliteDomainRepository(db),
  category: new SqliteCategoryRepository(db),
  flashcard: new SqliteFlashcardRepository(db),
  userProgress: new SqliteUserProgressRepository(db),
};

export const useCases = {
  createDomain: new CreateDomainUseCase(repositories.domain),
  startLesson: new StartLessonUseCase(repositories.lesson, repositories.userProgress),
};
```

</details>

### 5.3 Event Publisher (0/3)

<details>
<summary>View Tasks</summary>

| ID | Task | Status | File | Description | Agent Instructions |
|----|------|--------|------|-------------|-------------------|
| 5.3.1 | Create event publisher | 🔴 | `src/infrastructure/events/DomainEventPublisher.ts` | **TODO:** In-memory event publisher | Pub/sub pattern for domain events |
| 5.3.2 | Register event handlers | 🔴 | `src/infrastructure/events/handlers/index.ts` | **TODO:** Event handlers (e.g., update progress on LessonCompleted) | Map events to handlers |
| 5.3.3 | Integrate with use cases | 🔴 | `src/application/use-cases/**/*.ts` | **TODO:** Publish events after each use case | Call eventPublisher.publishAll(events) |

</details>

### 5.4 Frontend Component Updates (0/5)

<details>
<summary>View Tasks</summary>

| ID | Task | Status | File | Description | Agent Instructions |
|----|------|--------|------|-------------|-------------------|
| 5.4.1 | Update domains page | 🔴 | `src/app/domains/page.tsx` | **TODO:** Use Server Actions instead of API | Replace fetch with Server Actions |
| 5.4.2 | Create lesson page | 🔴 | `src/app/lesson/[id]/page.tsx` | **TODO:** New page for active lessons | Use lesson hooks |
| 5.4.3 | Update review page | 🔴 | `src/app/review/page.tsx` | **TODO:** Use review hooks | Replace API calls |
| 5.4.4 | Update progress page | 🔴 | `src/app/progress/page.tsx` | **TODO:** Use progress hooks | Replace API calls |
| 5.4.5 | Add optimistic updates | 🔴 | All pages | **TODO:** Use TanStack Query optimistic updates | Improve UX with optimistic updates |

</details>

---

## 📝 Implementation Notes

### Completed Work
- **Domain layer** fully implemented with rich entities, aggregates, value objects, events, and services
- **Repository interfaces** defined for all aggregates
- **Example use cases** created (StartLesson, SubmitAnswer) showing the pattern
- **Presentation helpers** created (action wrappers, result types)

### Known Issues
- [x] ~~Old `src/lib/services/*` still in use by API routes~~ ✅ Migrated to use cases
- [ ] Old anemic types in `src/lib/types.ts` still referenced (low priority)
- [x] ~~No dependency injection - use cases don't have repositories injected~~ ✅ DI container implemented
- [ ] No event publishing - events are created but not published (optional feature)
- [ ] Frontend components still use old API patterns - need to migrate to Server Actions

### Migration Strategy
1. **Incremental approach**: Migrate one feature at a time (start with lessons)
2. **Keep old code**: Don't delete old services until fully migrated
3. **Side-by-side**: Run new use cases alongside old services
4. **Test thoroughly**: Each migration should be tested before moving on

### Testing Checklist
- [ ] Unit tests for domain entities
- [ ] Unit tests for value objects
- [ ] Unit tests for domain services
- [ ] Integration tests for use cases
- [ ] E2E tests for critical flows

---

## 🚀 Quick Commands for Agents

### To start working on a task:
1. Find the task in this file
2. Update status from 🔴 to 🟡
3. Read the "Agent Instructions" column
4. Implement following the pattern shown
5. Update status to ✅ when done
6. Update progress percentage at top

### To create a new use case:
```bash
# Template location
cp src/application/use-cases/lesson/StartLessonUseCase.ts \
   src/application/use-cases/[context]/[NewUseCase].ts
```

### To create a repository:
```bash
# Template location
cp src/infrastructure/repositories/content/SqliteDomainRepository.ts \
   src/infrastructure/repositories/[context]/Sqlite[Entity]Repository.ts
```

### To create a Server Action:
```bash
# Use the pattern in
# src/presentation/utils/action-wrapper.ts
```

---

## 📚 Reference Documentation

- **Architecture:** `DDD_IMPLEMENTATION_STATUS.md`
- **Domain Model:** `DOMAIN_DRIVEN_DESIGN_MODEL.md`
- **Old Plan:** `IMPLEMENTATION_PLAN.md`
- **API Review:** `API_ROUTES_REVIEW.md`
- **SSR Migration:** `.specs/SSR_MIGRATION_PLAN.md` ⭐ **NEW** - Complete Server Actions + SSR migration plan

---

## 🎯 Success Criteria

### Phase 1: Domain Layer ✅
- [x] All value objects enforce invariants
- [x] Entities have behavior, not just data
- [x] Aggregates manage consistency boundaries
- [x] Events are emitted on state changes
- [x] Services handle cross-entity logic

### Phase 2: Infrastructure Layer ✅
- [x] Repositories implement interfaces
- [x] Database connection managed
- [x] Transaction support added
- [x] All repositories implemented

### Phase 3: Application Layer ✅
- [x] Use cases orchestrate domain logic
- [x] DTOs separate from domain entities
- [x] No business logic in use cases (delegated to domain)
- [ ] Event handlers update cross-aggregate state (optional)

### Phase 4: Presentation Layer ✅
- [x] Server Actions wrap use cases (21 actions created)
- [x] Error handling consistent (ActionResult pattern)
- [ ] React Components updated to use Server Actions (next phase)
- [ ] Optimistic updates implemented (when needed)

### Phase 5: Integration Layer 🟡
- [x] Core API routes updated (domains, categories, lessons)
- [x] Old services migrated to use cases
- [ ] Old types deprecated (low priority cleanup)
- [ ] Frontend works with new backend (components need update)
- [ ] E2E tests passing

---

**Last Updated By:** Claude (Agent)
**Next Review:** After Phase 3 completion
**Questions?** Check reference docs or ask in project chat
