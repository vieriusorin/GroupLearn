# TypeScript Errors Tracking

Generated: $(date)
Total Errors: 47 across 20 files

## Error Categories

### 1. Missing Type Definitions
- [ ] `GroupListItem` - used in CreateGroupHandler.ts:93, GetGroupsHandler.ts:82
- [ ] `PathWithAccess` - used in GetUserPathsHandler.ts:120
- [ ] `AdminUser` - used in GetUsersHandler.ts:79
- [ ] `MyGroupListItem` - used in GetMyGroupsHandler.ts:67

### 2. Property Name Mismatches (snake_case vs camelCase)
- [ ] `is_visible` vs `isVisible` - app/groups/[id]/page.tsx:57
- [ ] `is_public` vs `isPublic` - app/admin/groups/[id]/paths/page.tsx:67
- [ ] `domain_id` vs `domainId` - app/admin/groups/[id]/paths/page.tsx:67

### 3. Type Mismatches in Lesson Handlers
- [ ] XP type mismatch - CompleteLessonHandler.ts:71,82
- [ ] Hearts type mismatch - CompleteLessonHandler.ts:98
- [ ] Missing methods: calculateAccuracyBonus, calculatePerfectBonus - CompleteLessonHandler.ts:123,128
- [ ] ReviewMode type mismatch - StartLessonHandler.ts:17
- [ ] visibility type mismatch - StartLessonHandler.ts:127
- [ ] Missing computedDifficulty in flashcards - StartLessonHandler.ts:131

### 4. Missing Properties in DTOs
- [ ] `computedDifficulty` missing in Flashcard DTOs
- [ ] `isDeprecated` missing in Category DTOs
- [ ] `unitCompleted`, `pathCompleted`, `nextLessonId` missing in CompleteLessonResult

### 5. Command Argument Mismatches
- [ ] createCategoryCommand expects string but gets number - category-service.ts:91,123
- [ ] deleteCategoryCommand missing argument - category-service.ts:140
- [ ] updateDomainCommand expects string but gets number - domain-service.ts:82
- [ ] deleteDomainCommand missing argument - domain-service.ts:101
- [ ] createDomainCommand description can be null - domain-service.ts:52

### 6. Next.js 16 API Changes
- [ ] revalidateTag requires 2 arguments - create-category.ts:47,48
- [ ] revalidateTag requires 2 arguments - delete-category.ts:40,42

### 7. Array and Type Conversions
- [ ] GetDomainsResult vs Domain[] - app/domains/page.tsx:18
- [ ] createdBy undefined handling - GetDomainsHandler.ts:15
- [ ] Category type conversion issues - category-service.ts:34,94
- [ ] Flashcard type conversion issues - GetFlashcardByIdHandler.ts:20

### 8. Other Issues
- [ ] instanceof Date check - app/lesson/[id]/page.tsx:55
- [ ] Missing getDomainById function - category-service.ts:72
- [ ] CreateCategoryResult, CreateDomainResult missing properties

---

## Progress Log

### Fixed
- ✅ Missing type imports (GroupListItem, PathWithAccess, AdminUser, MyGroupListItem)
- ✅ Property name mismatches (is_visible → isVisible, is_public → isPublic, domain_id → domainId)
- ✅ GetDomainsResult vs Domain[] array access
- ✅ LessonClient completionResult type (added CompletionResultWithContext)
- ✅ CompleteLessonHandler XP/Hearts type conversions
- ✅ StartLessonHandler ReviewMode mapping and computedDifficulty
- ✅ revalidateTag calls (Next.js 16 API)
- ✅ GetCategoryByIdHandler, GetFlashcardByIdHandler, GetDomainsHandler missing properties
- ✅ category-service and domain-service issues (userId parameters, result access, isDeprecated)
- ✅ start-lesson.ts reviewMode mapping

## ✅ ALL ERRORS FIXED!

**Final Status:** 0 TypeScript errors (down from 47 initial errors)

### Notes
- Starting with missing type definitions as they affect multiple files
- Will fix property name mismatches next (simple renames)
- Then move to type mismatches and missing properties

