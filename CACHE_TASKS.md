## Caching & Revalidation Tasks

This file is the source of truth for improving server data fetching with caching, tags, and revalidation.

We will update the checkboxes as tasks are completed.

---

### Phase 1 – Paths data (used on `src/app/page.tsx`)

- [x] **Define cache tag helpers**
  - [x] Create `src/lib/cache-tags.ts` with helpers for:
    - [x] `paths` (global or per-user if necessary)
    - [x] `userStats(userId)`
    - [x] `userProgress(userId, pathId)`

- [x] **Wrap expensive DB queries in `unstable_cache` (paths)**
  - [x] Identify the core DB function(s) for fetching paths (likely in `src/lib/db-operations-paths-drizzle.ts`)
  - [x] Wrap the paths fetch in `unstable_cache` with:
    - [x] Stable cache key (e.g. `['paths']` or `['paths', userId]`)
    - [x] Appropriate tag(s) (e.g. `'paths'`)

- [x] **Update `getPaths` action to use cached function**
  - [x] Ensure `src/presentation/actions/paths/get-paths.ts` calls the cached DB function
  - [x] Confirm the action surface (return type, error handling) stays the same for callers like `src/app/page.tsx`

- [ ] **Wire up `revalidateTag` for paths mutations**
  - [x] Find all server actions that create/update/delete:
    - [x] Domains
    - [x] Paths
    - [ ] Units (no unit CRUD server actions present yet)
    - [x] Lessons (lesson completion affects path/unit/lesson progress)
  - [x] After successful writes for domains, group path assignments and lesson completion, call `revalidateTag('paths')`

---

### Phase 2 – User stats (`getUserStats`)

- [x] Wrap DB queries for user stats with `unstable_cache` using tag `user-stats:{userId}`
- [x] Update `src/presentation/actions/user/get-user-stats.ts` to use the cached function
- [x] Add `revalidateTag` calls in actions that modify streak or hearts (e.g. `refillHearts`, `updateStreak`)

---

### Phase 3 – User progress (`getUserProgress`)

- [x] Wrap DB queries for user progress with `unstable_cache` using tag `user-progress:{userId}:{pathId}`
- [x] Update `src/presentation/actions/progress/get-user-progress.ts` to use the cached function
- [x] Add `revalidateTag` calls in progress-update actions like `refillHearts` and `updateStreak`

---

### Phase 5 – Additional heavy queries (XP history, leaderboard, dashboard)

- [x] **XP history & totals**
  - [x] Wrap `getXPHistory` and `getTotalXP` in `unstable_cache` (in `src/lib/db-operations-paths-critical-converted.ts`)
  - [x] Tag them appropriately (reuse `paths` tag)
  - [x] Update `src/presentation/actions/stats/get-xp-history.ts` to use the cached helpers

- [x] **Leaderboard**
  - [x] Wrap `getTopUsersAllTime`, `getTopUsersLast7Days`, `getTopUsersLast30Days` in `unstable_cache` (in `src/lib/leaderboard-utils.ts`)
  - [x] Use tags like `leaderboard:all-time`, `leaderboard:7days`, `leaderboard:30days`
  - [x] Update `src/presentation/actions/stats/get-leaderboard.ts` to use the cached helpers
  - [x] Add `revalidateTag` calls for leaderboard tags when XP is awarded (in `completeLesson`)

- [x] **Dashboard stats**
  - [x] Identify the heaviest reads inside `src/presentation/actions/stats/get-stats.ts` (e.g. `ReviewService`, `CategoryService`, `FlashcardService`)
  - [x] Wrap the overall `getStats` aggregation in `unstable_cache` per user, with a `dashboard-stats` tag
  - [x] Add `revalidateTag` calls in actions that modify flashcards or reviews (e.g. `createFlashcard`, `updateFlashcard`, `deleteFlashcard`, `submitReview`, `recordReview`)

---

### Phase 4 – Review and tuning

- [ ] Verify caching behavior locally:
  - [ ] Data is fast when re-requested without mutations
  - [ ] Data updates correctly after mutations (via `revalidateTag`)
- [ ] Adjust cache granularity (global vs per-user) if needed based on actual data access patterns


