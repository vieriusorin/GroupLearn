# Lib Folder CQRS Migration Plan

## Overview
This document outlines the incremental migration plan to refactor `src/lib` files from direct database access to CQRS pattern (queries/commands).

## Migration Strategy

### Phase 1: Leaderboard Utilities ✅ COMPLETE
**File:** `lib/leaderboard-utils.ts`
**Status:** ✅ Refactored - Logic moved into `GetLeaderboardHandler`
**Action:** ✅ Completed - All functions moved, file deleted
**Impact:** ✅ Low - single handler usage, no breaking changes

### Phase 2: Analytics Functions
**File:** `lib/analytics.ts`
**Status:** Used in 3 handlers:
- `GetGroupAnalyticsHandler`
- `GetGroupLeaderboardHandler` 
- `GetMemberProgressHandler`
**Action:** Move each function into respective handler
**Impact:** Medium - multiple handlers

### Phase 3: Path Operations (Critical)
**File:** `lib/db-operations-paths-critical-converted.ts`
**Status:** Used in:
- `GetUnitsHandler`
- `GetLessonsHandler`
- `GetXPHistoryHandler`
- `start-lesson.ts` action
- `get-lesson-info.ts` action
- `update-user-path-access.ts` action
**Action:** 
- Move query functions to query handlers
- Move command functions to command handlers
**Impact:** High - many usages

### Phase 4: Path Operations (Drizzle)
**File:** `lib/db-operations-paths-drizzle.ts`
**Status:** Used in `GetPathsHandler`
**Action:** Move logic into `GetPathsHandler`
**Impact:** Low - single handler

### Phase 5: DB Operations (Legacy)
**File:** `lib/db-operations.ts`
**Status:** Used by services:
- `CategoryService`
- `DomainService`
- `FlashcardService`
**Action:** 
- Services should use repositories/queries instead
- Migrate services to use CQRS pattern
**Impact:** High - affects service layer

### Phase 6: Services Layer
**Files:** `lib/services/*.ts`
**Status:** Used in `GetStatsHandler`
**Action:** 
- Refactor services to use queries/commands
- Or move service logic into handlers
**Impact:** Medium - affects stats handler

### Phase 7: Repositories Layer
**Files:** `lib/repositories/*.ts`
**Status:** Used in `GetAdminStatsHandler`
**Action:** Move logic into query handler
**Impact:** Low - single handler

### Phase 8: Folder Organization
**Action:** Organize remaining files by domain:
```
lib/
├── auth/              # rbac.ts, auth.ts, better-auth.ts, etc.
├── gamification/      # gamification.ts, streak-utils.ts, unlock-system.ts
├── shared/            # validation.ts, preferences.ts, authorization.ts, token-utils.ts, utils/
└── infrastructure/    # db.ts, cache-tags.ts, api-utils.ts
```

## Detailed Migration Steps

### Phase 1: Leaderboard Utilities

#### Step 1.1: Move `getTopUsersByXP` into GetLeaderboardHandler
- Extract function logic
- Add to handler
- Remove from leaderboard-utils.ts

#### Step 1.2: Move cached functions
- `getCachedTopUsersAllTime`
- `getCachedTopUsersLast7Days`
- `getCachedTopUsersLast30Days`
- `getUserRankWithContext`

#### Step 1.3: Update GetLeaderboardHandler
- Replace imports with inline logic
- Test functionality

#### Step 1.4: Delete leaderboard-utils.ts
- Verify no other usages
- Remove file

### Phase 2: Analytics Functions

#### Step 2.1: Move `getGroupAnalytics`
- Target: `GetGroupAnalyticsHandler`
- Extract all logic
- Update handler

#### Step 2.2: Move `getGroupLeaderboard`
- Target: `GetGroupLeaderboardHandler`
- Extract all logic
- Update handler

#### Step 2.3: Move `getMemberProgress`
- Target: `GetMemberProgressHandler`
- Extract all logic
- Update handler

#### Step 2.4: Delete analytics.ts
- Verify no other usages
- Remove file

### Phase 3: Path Operations (Critical)

#### Step 3.1: Identify query vs command functions
**Queries:**
- `getCachedUnitsWithProgress` → GetUnitsHandler
- `getCachedLessonsWithProgress` → GetLessonsHandler
- `getPathById` → Create query if needed
- `getUnitById` → Create query if needed
- `getLessonById` → Create query if needed

**Commands:**
- `approveUserForPath` → Create ApprovePathAccess command
- `removePathApproval` → Create RevokePathAccess command

#### Step 3.2: Move query functions
- One handler at a time
- Test after each move

#### Step 3.3: Create commands for write operations
- Create command definitions
- Create handlers
- Update actions

#### Step 3.4: Delete db-operations-paths-critical-converted.ts

### Phase 4: Path Operations (Drizzle)

#### Step 4.1: Move `getVisiblePaths` into GetPathsHandler
- Extract logic
- Update handler

#### Step 4.2: Delete db-operations-paths-drizzle.ts

### Phase 5: DB Operations (Legacy)

#### Step 5.1: Audit service usage
- List all functions used by services
- Identify which are queries vs commands

#### Step 5.2: Create queries/commands
- For each function, create appropriate query/command
- Update services to use queries/commands

#### Step 5.3: Migrate services
- Update CategoryService
- Update DomainService
- Update FlashcardService

#### Step 5.4: Delete db-operations.ts

### Phase 6: Services Layer

#### Step 6.1: Audit GetStatsHandler usage
- Identify what services are used
- Determine if services can be replaced with queries

#### Step 6.2: Refactor GetStatsHandler
- Replace service calls with direct queries
- Or move service logic into handler

#### Step 6.3: Delete or refactor services
- If unused, delete
- If still needed, refactor to use CQRS

### Phase 7: Repositories Layer

#### Step 7.1: Move AdminStatsRepository logic
- Target: `GetAdminStatsHandler`
- Extract all methods
- Update handler

#### Step 7.2: Delete admin-stats.repository.ts

### Phase 8: Folder Organization

#### Step 8.1: Create domain folders
- `lib/auth/`
- `lib/gamification/`
- `lib/shared/`
- `lib/infrastructure/`

#### Step 8.2: Move files
- Group by domain
- Update all imports

#### Step 8.3: Update imports across codebase
- Use find/replace
- Test compilation

## Testing Strategy

After each phase:
1. Run linter
2. Check for broken imports
3. Test affected functionality
4. Verify no regressions

## Rollback Plan

Each phase is independent:
- Keep original files until phase complete
- Use git commits per phase
- Can rollback individual phases if needed

## Success Criteria

- ✅ No direct DB access in lib/ files (except infrastructure)
- ✅ All data access through queries/commands
- ✅ Files organized by domain
- ✅ No unused files
- ✅ All tests passing
- ✅ No broken imports

