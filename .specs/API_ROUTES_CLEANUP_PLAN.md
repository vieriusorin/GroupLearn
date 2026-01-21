# API Routes Cleanup Plan

**Date:** 2026-01-19  
**Status:** 🟡 Ready for Cleanup  
**Goal:** Remove API routes that have been replaced by Server Actions

---

## ✅ Routes That Can Be Removed (Replaced by Server Actions)

### Content Routes
- ✅ **`src/app/api/flashcards/route.ts`** 
  - **Replaced by:** `createFlashcard`, `updateFlashcard`, `deleteFlashcard`, `getFlashcards` Server Actions
  - **Status:** Can be removed
  - **Note:** Still used by admin pages, but those can be migrated too

- ✅ **`src/app/api/review/route.ts`**
  - **Replaced by:** `getDueCards`, `recordReview` Server Actions
  - **Status:** Can be removed
  - **Note:** Review page fully migrated

- ✅ **`src/app/api/progress/route.ts`**
  - **Replaced by:** `getUserProgress` Server Action
  - **Status:** Can be removed
  - **Note:** Progress page and TopBar fully migrated

- ✅ **`src/app/api/stats/route.ts`**
  - **Replaced by:** `getStats` Server Action
  - **Status:** Can be removed
  - **Note:** Progress page fully migrated

- ✅ **`src/app/api/user/stats/route.ts`**
  - **Replaced by:** `getUserStats` Server Action
  - **Status:** Can be removed
  - **Note:** Main page and TopBar fully migrated

- ✅ **`src/app/api/paths/route.ts`**
  - **Replaced by:** `getPaths` Server Action
  - **Status:** Can be removed
  - **Note:** Main page fully migrated

- ✅ **`src/app/api/units/route.ts`**
  - **Replaced by:** `getUnits` Server Action
  - **Status:** Can be removed
  - **Note:** PathVisualization fully migrated

- ✅ **`src/app/api/lessons/route.ts`**
  - **Replaced by:** `getLessons` Server Action
  - **Status:** Can be removed
  - **Note:** PathVisualization fully migrated

---

## 🟡 Routes That Can Be Migrated (Server Actions Exist)

### Lesson Routes
- 🟡 **`src/app/api/lessons/[id]/start/route.ts`**
  - **Server Action exists:** `startLesson`
  - **Status:** Can be migrated
  - **Note:** LessonStartDialog updated to use Server Action
  - **Action:** Remove after verifying LessonStartDialog works

- 🟡 **`src/app/api/lessons/[id]/submit/route.ts`**
  - **Server Action exists:** `submitAnswer`
  - **Status:** Can be migrated
  - **Note:** Lesson page should use Server Action
  - **Action:** Check lesson page implementation

- 🟡 **`src/app/api/lessons/[id]/complete/route.ts`**
  - **Server Action exists:** `completeLesson`
  - **Status:** Can be migrated
  - **Note:** LessonCompletionDialog should use Server Action
  - **Action:** Check lesson page implementation

---

## 🔴 Routes Still Needed (No Server Actions Yet)

### Content Routes
- 🔴 **`src/app/api/domains/route.ts`**
  - **Status:** Still needed
  - **Note:** Server Actions exist but admin pages may still use API
  - **Action:** Migrate admin pages first

- 🔴 **`src/app/api/categories/route.ts`**
  - **Status:** Still needed
  - **Note:** Server Actions exist but admin pages may still use API
  - **Action:** Migrate admin pages first

### Groups Routes
- 🔴 **`src/app/api/groups/route.ts`**
  - **Status:** Still needed
  - **Note:** No Server Actions created yet
  - **Action:** Create group Server Actions

- 🔴 **`src/app/api/groups/[id]/route.ts`**
  - **Status:** Still needed
  - **Note:** No Server Actions created yet
  - **Action:** Create group Server Actions

- 🔴 **`src/app/api/groups/[id]/members/route.ts`**
  - **Status:** Still needed
  - **Note:** No Server Actions created yet
  - **Action:** Create group Server Actions

- 🔴 **`src/app/api/groups/[id]/analytics/route.ts`**
  - **Status:** Still needed
  - **Note:** No Server Actions created yet
  - **Action:** Create group Server Actions

### Invitations Routes
- 🔴 **`src/app/api/invitations/route.ts`**
  - **Status:** Still needed
  - **Note:** No Server Actions created yet
  - **Action:** Create invitation Server Actions

- 🔴 **`src/app/api/invitations/[token]/route.ts`**
  - **Status:** Still needed
  - **Note:** No Server Actions created yet
  - **Action:** Create invitation Server Actions

### Admin Routes
- 🔴 **`src/app/api/admin/stats/route.ts`**
  - **Status:** Still needed
  - **Note:** No Server Actions created yet
  - **Action:** Create admin Server Actions

- 🔴 **`src/app/api/admin/users/route.ts`**
  - **Status:** Still needed
  - **Note:** No Server Actions created yet
  - **Action:** Create admin Server Actions

### Auth Routes (Keep)
- ✅ **`src/app/api/auth/[...nextauth]/route.ts`**
  - **Status:** Keep (NextAuth requirement)

- ✅ **`src/app/api/auth/register/route.ts`**
  - **Status:** Keep (Registration endpoint)

---

## 📋 Cleanup Checklist

### Phase 1: Safe to Remove Now ✅ COMPLETED
- [x] Remove `src/app/api/flashcards/route.ts` ✅
- [x] Remove `src/app/api/review/route.ts` ✅
- [x] Remove `src/app/api/progress/route.ts` ✅
- [x] Remove `src/app/api/stats/route.ts` ✅
- [x] Remove `src/app/api/user/stats/route.ts` ✅
- [x] Remove `src/app/api/paths/route.ts` ✅
- [x] Remove `src/app/api/units/route.ts` ✅
- [x] Remove `src/app/api/lessons/route.ts` ✅

### Phase 2: After Verification ✅ COMPLETED
- [x] Verify LessonStartDialog works with Server Action ✅
- [x] Remove `src/app/api/lessons/[id]/start/route.ts` ✅
- [x] Update lesson hooks to use Server Actions ✅
- [x] Remove `src/app/api/lessons/[id]/submit/route.ts` ✅
- [x] Remove `src/app/api/lessons/[id]/complete/route.ts` ✅

### Phase 3: After Admin Migration
- [ ] Migrate admin pages to Server Actions
- [ ] Remove `src/app/api/domains/route.ts`
- [ ] Remove `src/app/api/categories/route.ts`

### Phase 4: After Group/Invitation/Admin Server Actions
- [ ] Create group Server Actions
- [ ] Remove group API routes
- [ ] Create invitation Server Actions
- [ ] Remove invitation API routes
- [ ] Create admin Server Actions
- [ ] Remove admin API routes

---

## ⚠️ Important Notes

1. **Test Before Removing:** Always test that the functionality works with Server Actions before removing API routes
2. **Check All References:** Use `grep` to find all references to API routes before removing
3. **Keep Auth Routes:** Never remove NextAuth routes
4. **Backup First:** Consider creating a backup branch before removing routes
5. **Update Documentation:** Update any documentation that references removed routes

---

## 🎯 Next Steps

1. **Immediate:** Remove Phase 1 routes (safe to remove)
2. **Short-term:** Verify and remove Phase 2 routes
3. **Medium-term:** Migrate admin pages and remove Phase 3 routes
4. **Long-term:** Create remaining Server Actions and remove Phase 4 routes

