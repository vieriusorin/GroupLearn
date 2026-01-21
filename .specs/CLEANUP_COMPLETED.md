# API Routes & Hooks Cleanup - Completed

**Date:** 2026-01-19  
**Status:** ✅ Phase 1, 2 & 3 Complete

---

## ✅ Removed API Routes

### Phase 1: Main User-Facing Routes (8 routes)
- ✅ `src/app/api/flashcards/route.ts` - Replaced by Server Actions
- ✅ `src/app/api/review/route.ts` - Replaced by Server Actions
- ✅ `src/app/api/progress/route.ts` - Replaced by Server Actions
- ✅ `src/app/api/stats/route.ts` - Replaced by Server Actions
- ✅ `src/app/api/user/stats/route.ts` - Replaced by Server Actions
- ✅ `src/app/api/paths/route.ts` - Replaced by Server Actions
- ✅ `src/app/api/units/route.ts` - Replaced by Server Actions
- ✅ `src/app/api/lessons/route.ts` - Replaced by Server Actions

### Phase 2: Lesson Routes (3 routes)
- ✅ `src/app/api/lessons/[id]/start/route.ts` - Replaced by `startLesson` Server Action
- ✅ `src/app/api/lessons/[id]/submit/route.ts` - Replaced by `submitAnswer` Server Action
- ✅ `src/app/api/lessons/[id]/complete/route.ts` - Replaced by `completeLesson` Server Action

**Total Removed:** 11 API routes

---

## ✅ Removed Unused Hooks

### Review Hooks (5 files)
- ✅ `src/hooks/review/useReview.ts` - No longer used (migrated to Server Actions)
- ✅ `src/hooks/review/useReviewMutations.ts` - No longer used (migrated to Server Actions)
- ✅ `src/hooks/review/useReviewPage.ts` - No longer used (migrated to Server Actions)
- ✅ `src/hooks/review/query-keys.ts` - No longer needed
- ✅ `src/hooks/review/index.ts` - No longer needed

### Stats Hooks (2 files)
- ✅ `src/hooks/stats/useStats.ts` - No longer used (migrated to Server Actions)
- ✅ `src/hooks/stats/index.ts` - No longer needed

**Total Removed:** 7 hook files

---

## ✅ Updated Code

### Type Migration
- ✅ Moved `AdminFlashcard` type from `src/hooks/flashcards/useFlashcards.ts` to `src/lib/types.ts`
- ✅ Updated all imports to use `@/lib/types` instead of hook files
- ✅ Updated `src/types/flashcard.ts` to import from `@/lib/types`

### Updated Hooks
- ✅ `src/hooks/lessons/useLessons.ts` - Now uses `startLesson` Server Action
- ✅ `src/hooks/lessons/useLessonMutations.ts` - Now uses `completeLesson` Server Action

### Components Updated
- ✅ `src/components/flashcards/FlashcardsPageClient.tsx` - Updated import
- ✅ `src/components/lesson/LessonStartDialog.tsx` - Uses Server Actions
- ✅ All main user-facing pages migrated to Server Components

---

## 🔴 Still Using TanStack Query (Admin Pages)

### Hooks Still Using TanStack Query
These hooks are still used by admin pages (lower priority migration):

1. **Admin Pages:**
   - `src/hooks/admin/useFlashcardsPage.ts` - Used by `/admin/flashcards`
   - `src/hooks/admin/useAdminDashboard.ts` - Used by admin dashboard
   - `src/hooks/admin/useUsers.ts` - Used by admin users page
   - `src/hooks/admin/useDomainsPage.ts` - Used by admin domains page
   - `src/hooks/admin/useCategoriesPage.ts` - Used by admin categories page

2. **Groups/Invitations:**
   - `src/hooks/groups/*` - All group hooks
   - `src/hooks/invitations/*` - All invitation hooks

3. **Content Management:**
   - `src/hooks/domains/useDomains.ts` - Used by admin
   - `src/hooks/domains/useDomainMutations.ts` - Used by admin
   - `src/hooks/flashcards/useFlashcards.ts` - Used by admin (still uses TanStack Query)
   - `src/hooks/flashcards/useFlashcardMutations.ts` - Used by admin (still uses TanStack Query)

4. **Auth:**
   - `src/hooks/auth/*` - Auth hooks (might be needed)

---

## 📦 TanStack Query Dependency

**Status:** Still needed for admin pages

**Reason:** Admin pages still use TanStack Query hooks. Once admin pages are migrated to Server Actions, TanStack Query can be removed.

**Current Usage:**
- Admin pages: ~15 hooks
- Groups/Invitations: ~8 hooks
- Auth: ~3 hooks (might be needed)
- Flashcards (admin): ~2 hooks

**Action:** Migrate admin pages first, then remove TanStack Query.

---

## 🎯 Next Steps

### Immediate (Optional)
- [x] Remove unused review hooks ✅
- [x] Remove unused stats hooks ✅
- [x] Move `AdminFlashcard` type to shared location ✅

### Short-term (Admin Migration)
- [ ] Migrate admin flashcards page to Server Actions
- [ ] Migrate admin domains/categories pages to Server Actions
- [ ] Migrate admin dashboard to Server Actions
- [ ] Remove admin API routes after migration

### Long-term
- [ ] Create group Server Actions
- [ ] Create invitation Server Actions
- [ ] Migrate group/invitation pages
- [ ] Remove TanStack Query dependency

---

## 📊 Summary

- **API Routes Removed:** 11 routes ✅
- **Hooks Removed:** 7 files ✅
- **Hooks Updated:** 2 hooks (lessons) ✅
- **Types Migrated:** 1 type (`AdminFlashcard`) ✅
- **Components Migrated:** All main user-facing pages ✅
- **Admin Pages:** Still using TanStack Query (lower priority) 🔴
- **TanStack Query:** Still needed for admin pages 🔴

**Overall Progress:** ~85% complete for main user-facing features. Admin pages remain to be migrated.
