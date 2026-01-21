# Server Actions + SSR Migration Status

**Date:** 2026-01-19  
**Status:** 🟢 Phase 1 Complete, Phase 2 Complete ✅, Phase 3 Complete ✅, Phase 4 In Progress (90% overall)  
**Goal:** Complete migration from TanStack Query + API routes to Server Actions + SSR

---

## ✅ Completed: Server Actions Created

### Review Actions (4/4) ✅
- ✅ `src/presentation/actions/review/start-review.ts`
- ✅ `src/presentation/actions/review/submit-review.ts`
- ✅ `src/presentation/actions/review/get-due-cards.ts`
- ✅ `src/presentation/actions/review/get-struggling-cards.ts`

### Progress Actions (3/3) ✅
- ✅ `src/presentation/actions/progress/get-user-progress.ts`
- ✅ `src/presentation/actions/progress/refill-hearts.ts`
- ✅ `src/presentation/actions/progress/update-streak.ts`

### Content Actions (9/9) ✅
- ✅ `src/presentation/actions/content/create-domain.ts`
- ✅ `src/presentation/actions/content/update-domain.ts`
- ✅ `src/presentation/actions/content/delete-domain.ts`
- ✅ `src/presentation/actions/content/create-category.ts`
- ✅ `src/presentation/actions/content/create-flashcard.ts`
- ✅ `src/presentation/actions/content/bulk-create-flashcards.ts`
- ✅ `src/presentation/actions/content/get-domains.ts`
- ✅ `src/presentation/actions/content/get-categories.ts`
- ✅ `src/presentation/actions/content/get-flashcards.ts`

### Lesson Actions (4/4) ✅
- ✅ `src/presentation/actions/lesson/start-lesson.ts` (already existed)
- ✅ `src/presentation/actions/lesson/submit-answer.ts` (already existed)
- ✅ `src/presentation/actions/lesson/complete-lesson.ts` (already existed)
- ✅ `src/presentation/actions/lesson/get-lesson-progress.ts`
- ✅ `src/presentation/actions/lesson/get-lesson-flashcards.ts`

**Total Server Actions Created: 27/27** ✅

### Admin Actions (4/4) ✅
- ✅ `src/presentation/actions/admin/get-users.ts`
- ✅ `src/presentation/actions/admin/get-user-paths.ts`
- ✅ `src/presentation/actions/admin/update-user-path-access.ts`
- ✅ `src/presentation/actions/admin/get-admin-stats.ts`

### Groups Actions (4/4) ✅
- ✅ `src/presentation/actions/groups/get-my-groups.ts`
- ✅ `src/presentation/actions/groups/get-groups.ts`
- ✅ `src/presentation/actions/groups/create-group.ts`
- ✅ `src/presentation/actions/groups/delete-group.ts`

### Invitation Actions (2/2) ✅
- ✅ `src/presentation/actions/invitations/get-invitation.ts`
- ✅ `src/presentation/actions/invitations/accept-invitation.ts`

---

## ✅ All Core Server Actions Created!

### Content Actions (Complete)
- ✅ `update-category.ts` - Update category **COMPLETED**
- ✅ `delete-category.ts` - Delete category **COMPLETED**
- ✅ `update-flashcard.ts` - Update flashcard **COMPLETED**
- ✅ `delete-flashcard.ts` - Delete flashcard **COMPLETED**

### Paths/Lessons Actions (Complete)
- ✅ `get-paths.ts` - Get all paths **COMPLETED**
- ✅ `get-units.ts` - Get units for path **COMPLETED**
- ✅ `get-lessons.ts` - Get lessons for unit **COMPLETED**

## 🔴 Optional/Advanced Server Actions (Lower Priority)

### Groups Actions (Advanced Features)
- 🔴 `get-group.ts` - Get single group (can use getGroups and filter)
- 🔴 `update-group.ts` - Update group (not yet needed)
- 🔴 `get-group-members.ts` - Get group members (complex, may need API route)
- 🔴 `get-group-analytics.ts` - Get group analytics (complex, may need API route)

### Invitations Actions (Advanced Features)
- 🔴 `create-invitation.ts` - Create invitation (used in admin, may need API route)
- 🔴 `decline-invitation.ts` - Decline invitation (not commonly used)

### Paths Actions (Advanced Features)
- 🔴 `get-path.ts` - Get single path (can use getPaths and filter)

---

## 📊 TanStack Query Usage Analysis

### Hooks Updated to Use Server Actions ✅

**Completed Hooks:**
- ✅ `src/hooks/domains/useDomains.ts` - Uses `getDomains` Server Action
- ✅ `src/hooks/domains/useDomainMutations.ts` - Uses domain Server Actions
- ✅ `src/hooks/domain/useCategories.ts` - Uses category Server Actions
- ✅ `src/hooks/flashcards/useFlashcards.ts` - Uses `getFlashcards` Server Action
- ✅ `src/hooks/flashcards/useFlashcardMutations.ts` - Uses flashcard Server Actions
- ✅ `src/hooks/groups/useGroups.ts` - Uses `getGroups`, `createGroup`, `deleteGroup` Server Actions
- ✅ `src/hooks/groups/useMyGroups.ts` - Uses `getMyGroups` Server Action
- ✅ `src/hooks/groups/useGroupPaths.ts` - Uses `getPaths` Server Action (useAllPaths)
- ✅ `src/hooks/invitations/useInvitations.ts` - Uses `getInvitation` Server Action
- ✅ `src/hooks/invitations/useInvitationMutations.ts` - Uses `acceptInvitationAction` Server Action
- ✅ `src/hooks/admin/useUsers.ts` - Uses `getUsers`, `getUserPaths`, `updateUserPathAccess` Server Actions
- ✅ `src/hooks/admin/useAdminDashboard.ts` - Uses `getAdminStats` Server Action
- ✅ `src/hooks/lessons/useLessons.ts` - Already uses `startLesson` Server Action
- ✅ `src/hooks/lessons/useLessonMutations.ts` - Already uses `completeLesson` Server Action

**Note:** All updated hooks still use TanStack Query for caching benefits, but now call Server Actions instead of API routes.

### Files Still Using API Routes Directly (Lower Priority)

#### Pages (Client Components)
1. **`src/app/page.tsx`** 🔴
   - Uses: `useQuery` for paths, progress
   - API: `/api/paths`, `/api/progress`
   - **Action:** Convert to Server Component, use `get-paths` Server Action

2. **`src/app/flashcards/page.tsx`** 🔴
   - Uses: `useFlashcardsPage` hook (uses TanStack Query)
   - API: `/api/flashcards`
   - **Action:** Convert to Server Component, use `get-flashcards` Server Action

3. **`src/app/review/page.tsx`** 🔴
   - Uses: `useReviewPage` hook (uses TanStack Query)
   - API: `/api/review`
   - **Action:** Convert to Server Component, use `get-due-cards` Server Action

4. **`src/app/admin/groups/page.tsx`** 🔴
   - Uses: `useGroups`, `useCreateGroup`, `useDeleteGroup`
   - API: `/api/groups`
   - **Action:** Create group Server Actions, convert to Server Component

#### Hooks (All need replacement)
5. **`src/hooks/domains/useDomains.ts`** 🔴
   - **Replace with:** Server Component using `get-domains` Server Action

6. **`src/hooks/domains/useDomainMutations.ts`** 🔴
   - **Replace with:** `useActionState` + Server Actions (already created)

7. **`src/hooks/flashcards/useFlashcards.ts`** 🔴
   - **Replace with:** Server Component using `get-flashcards` Server Action

8. **`src/hooks/flashcards/useFlashcardMutations.ts`** 🔴
   - **Replace with:** `useActionState` + Server Actions (partially created)

9. **`src/hooks/flashcards/useFlashcardsPage.ts`** 🔴
   - **Replace with:** Server Component + Client Component for forms

10. **`src/hooks/review/useReview.ts`** 🔴
    - **Replace with:** Server Component using `get-due-cards` Server Action

11. **`src/hooks/review/useReviewMutations.ts`** 🔴
    - **Replace with:** `useActionState` + Server Actions (already created)

12. **`src/hooks/review/useReviewPage.ts`** 🔴
    - **Replace with:** Server Component + Client Component for interactions

13. **`src/hooks/lessons/useLessons.ts`** 🔴
    - **Replace with:** Server Component using `get-lessons` Server Action (need to create)

14. **`src/hooks/lessons/useLessonMutations.ts`** 🔴
    - **Replace with:** `useActionState` + Server Actions (already created)

15. **`src/hooks/lessons/useLessonSession.ts`** 🔴
    - **Replace with:** Server Component using `get-lesson-flashcards` + Server Actions

16. **`src/hooks/groups/useGroups.ts`** 🔴
    - **Replace with:** Server Component (need to create `get-groups` Server Action)

17. **`src/hooks/groups/useGroupMutations.ts`** 🔴
    - **Replace with:** `useActionState` + Server Actions (need to create)

18. **`src/hooks/invitations/useInvitations.ts`** 🔴
    - **Replace with:** Server Component (need to create `get-invitations` Server Action)

19. **`src/hooks/invitations/useInvitationMutations.ts`** 🔴
    - **Replace with:** `useActionState` + Server Actions (need to create)

20. **`src/hooks/admin/useAdminDashboard.ts`** 🔴
    - **Replace with:** Server Component (need to create `get-admin-stats` Server Action)

21. **`src/hooks/admin/useUsers.ts`** 🔴
    - **Replace with:** Server Component (need to create `get-users` Server Action)

22. **`src/hooks/stats/useStats.ts`** 🔴
    - **Replace with:** Server Component (need to create `get-stats` Server Action)

#### Components
23. **`src/components/lesson/LessonStartDialog.tsx`** ✅ **COMPLETED**
    - [x] Migrated to use `startLesson` Server Action
    - [x] Removed TanStack Query dependencies

24. **`src/components/lesson/LessonCompletionDialog.tsx`** 🔴
    - Uses: `useLessonMutations`
    - **Action:** Use `completeLesson` Server Action directly

25. **`src/components/path/PathVisualization.tsx`** 🔴
    - Uses: `useQuery` for units
    - **Action:** Convert to Server Component or use Server Action

26. **`src/components/layout/TopBar.tsx`** 🔴
    - Uses: `useQuery` for user stats
    - **Action:** Use Server Component or Server Action

---

## 🗑️ API Routes to Remove (After Migration)

### Content API Routes
- 🔴 `src/app/api/domains/route.ts` → Use `get-domains`, `create-domain`, etc. Server Actions
- 🔴 `src/app/api/categories/route.ts` → Use category Server Actions
- 🔴 `src/app/api/flashcards/route.ts` → Use flashcard Server Actions

### Review API Routes
- 🔴 `src/app/api/review/route.ts` → Use review Server Actions

### Progress API Routes
- 🔴 `src/app/api/progress/route.ts` → Use `get-user-progress` Server Action
- 🔴 `src/app/api/user/stats/route.ts` → Use progress Server Actions

### Lesson API Routes (Keep for now, but can migrate)
- 🟡 `src/app/api/lessons/route.ts` → Can use Server Actions
- 🟡 `src/app/api/lessons/[id]/start/route.ts` → Already have `start-lesson` Server Action
- 🟡 `src/app/api/lessons/[id]/submit/route.ts` → Already have `submit-answer` Server Action
- 🟡 `src/app/api/lessons/[id]/complete/route.ts` → Already have `complete-lesson` Server Action

### Groups API Routes
- 🔴 `src/app/api/groups/route.ts` → Need to create group Server Actions
- 🔴 `src/app/api/groups/[id]/route.ts` → Need to create group Server Actions
- 🔴 `src/app/api/groups/[id]/members/route.ts` → Need to create Server Actions
- 🔴 `src/app/api/groups/[id]/analytics/route.ts` → Need to create Server Actions

### Invitations API Routes
- 🔴 `src/app/api/invitations/route.ts` → Need to create invitation Server Actions
- 🔴 `src/app/api/invitations/[token]/route.ts` → Need to create Server Actions

### Admin API Routes
- 🔴 `src/app/api/admin/stats/route.ts` → Need to create Server Actions
- 🔴 `src/app/api/admin/users/route.ts` → Need to create Server Actions

### Paths API Routes
- 🔴 `src/app/api/paths/route.ts` → Need to create `get-paths` Server Action
- 🔴 `src/app/api/units/route.ts` → Need to create `get-units` Server Action

---

## 🎯 Priority Migration Plan

### Phase 1: Complete Missing Server Actions (HIGH PRIORITY)

#### 1.1 Content Actions (4 actions)
- [ ] `update-category.ts`
- [ ] `delete-category.ts`
- [ ] `update-flashcard.ts`
- [ ] `delete-flashcard.ts`

#### 1.2 Paths/Lessons Actions (4 actions)
- [ ] `get-paths.ts`
- [ ] `get-path.ts`
- [ ] `get-units.ts`
- [ ] `get-lessons.ts`

### Phase 2: Migrate High-Traffic Pages (HIGH PRIORITY)

#### 2.1 Main Learn Page
- [ ] Convert `src/app/page.tsx` to Server Component
- [ ] Use `get-paths` Server Action
- [ ] Use `get-user-progress` Server Action
- [ ] Remove TanStack Query

#### 2.2 Flashcards Page ✅ **COMPLETED**
- [x] Convert `src/app/flashcards/page.tsx` to Server Component
- [x] Use `get-flashcards` Server Action
- [x] Create Client Component for forms/mutations (`FlashcardsPageClient`)
- [x] Remove TanStack Query dependencies
- [x] Use `createFlashcard`, `updateFlashcard`, `deleteFlashcard` Server Actions

#### 2.3 Review Page
- [ ] Convert `src/app/review/page.tsx` to Server Component
- [ ] Use `get-due-cards` Server Action
- [ ] Create Client Component for review interactions
- [ ] Remove `useReviewPage` hook

### Phase 3: Migrate Lesson Components (MEDIUM PRIORITY)

#### 3.1 Lesson Session
- [ ] Update `src/hooks/lessons/useLessonSession.ts` to use Server Actions
- [ ] Use `get-lesson-flashcards` Server Action
- [ ] Use `startLesson`, `submitAnswer`, `completeLesson` Server Actions
- [ ] Remove TanStack Query

### Phase 4: Migrate Admin/Group Features (LOW PRIORITY)

#### 4.1 Groups
- [ ] Create group Server Actions
- [ ] Convert group pages to Server Components
- [ ] Remove group hooks

#### 4.2 Admin
- [ ] Create admin Server Actions
- [ ] Convert admin pages to Server Components
- [ ] Remove admin hooks

---

## 📝 Migration Checklist Template

For each feature area:

### Step 1: Create Server Actions
- [ ] Create query Server Actions (for data fetching)
- [ ] Create mutation Server Actions (for updates)
- [ ] Test Server Actions work correctly

### Step 2: Convert Pages to Server Components
- [ ] Remove `'use client'` directive
- [ ] Make component `async`
- [ ] Call Server Actions directly
- [ ] Remove TanStack Query hooks
- [ ] Test page loads correctly

### Step 3: Extract Interactive Parts
- [ ] Create Client Component for forms/interactions
- [ ] Use `useActionState` for mutations
- [ ] Use form actions where appropriate
- [ ] Test interactivity works

### Step 4: Remove Old Code
- [ ] Remove TanStack Query hooks
- [ ] Remove API routes (if no longer used)
- [ ] Update imports
- [ ] Test everything still works

---

## 🚀 Quick Wins (Start Here)

1. ✅ **Flashcards Page** - **COMPLETED!** Migrated to Server Component with Server Actions
2. ✅ **Review Page** - **COMPLETED!** Migrated to Server Component with Server Actions
3. ✅ **Main Learn Page** - **COMPLETED!** Migrated to Server Component with Server Actions
4. ✅ **Progress Page** - **COMPLETED!** Migrated to Server Component with Server Actions
5. ✅ **TopBar Component** - **COMPLETED!** Migrated to use Server Actions
6. ✅ **Content CRUD** - **COMPLETED!** All Server Actions created (including update/delete)

---

## 📊 Progress Summary

**Server Actions:** 28/28 core actions created ✅ (added update/delete flashcard, get-paths, get-units, get-lessons, get-user-stats, get-stats)  
**Missing Server Actions:** ~7 actions needed (get-path, groups, invitations, admin)  
**Pages Using TanStack Query:** 0 pages ✅ **ALL PAGES MIGRATED!**  
**Components Using TanStack Query:** TopBar migrated ✅, LessonStartDialog migrated ✅  
**Hooks Using TanStack Query:** ~20 hooks (still used in admin pages and some components)  
**API Routes to Remove:** ~25 routes (see `.specs/API_ROUTES_CLEANUP_PLAN.md` for detailed plan)  

**Next Steps:**
1. Create missing content Server Actions (update/delete)
2. Create paths/lessons query Server Actions
3. Migrate flashcards page (easiest win)
4. Migrate review page
5. Migrate main learn page

---

## 📈 Migration Progress Summary

**Overall Progress: 90% (54/60 tasks)**

**By Phase:**
- ✅ Phase 1: Create Server Actions - 100% (27/27 tasks) **COMPLETE!**
- ✅ Phase 2: Migrate Components - 100% (13/13 tasks) **COMPLETE!** ✅
- ✅ Phase 3: Update Client Components - 100% (10/10 tasks) **COMPLETE!** ✅
- 🟢 Phase 4: Remove Old Code - 47% (8/17 tasks) - In Progress!

**Key Accomplishments:**
- ✅ All core Server Actions created (27 actions)
- ✅ All main pages migrated to SSR (13 pages) ✅
- ✅ All hooks updated to use Server Actions (14 hooks) ✅
- ✅ Admin pages migrated (users, groups, domains, categories, flashcards)
- ✅ All migrations follow React 19 patterns

**Remaining Work:**
- 🟡 Some advanced group management features (group members, analytics)
- 🟡 Some advanced invitation features (create invitation)
- 🟢 Phase 4: Removing old API routes (domains, categories, flashcards, admin users/stats, invitations, groups basic routes removed)
- 🔴 Continue removing remaining unused API routes (groups advanced features, admin paths) and hooks

**Last Updated:** 2026-01-19

