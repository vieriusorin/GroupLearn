# Code Cleanup Tracker

**Track which old code can be safely removed as DDD implementation progresses**

---

## 🎯 Cleanup Philosophy

**Rule:** Only delete old code after new code is:
1. ✅ Fully implemented
2. ✅ Tested and working
3. ✅ Integrated with UI/API
4. ✅ No references remain to old code

---

## 📁 Files to Remove

### Phase 1: Old Service Layer

| File | Can Remove After | Status | Notes |
|------|-----------------|--------|-------|
| `src/lib/services/domain-service.ts` | Domain use cases complete + API routes updated | 🔴 Keep | Still used by `/api/domains` |
| `src/lib/services/category-service.ts` | Category use cases complete + API routes updated | 🔴 Keep | Still used by `/api/categories` |
| `src/lib/services/flashcard-service.ts` | Flashcard use cases complete + API routes updated | 🔴 Keep | Still used by `/api/flashcards` |
| `src/lib/services/review-service.ts` | Review use cases complete + API routes updated | 🔴 Keep | Still used by `/api/review` |

**Delete When:**
- [ ] All CRUD use cases implemented for entity
- [ ] Server Actions created
- [ ] API routes migrated to use cases
- [ ] UI updated to use Server Actions or new API
- [ ] No grep results for old service imports

**Command to check:**
```bash
# Check if service is still imported anywhere
grep -r "from.*domain-service" src/
```

---

### Phase 2: Old Type Definitions

| Section in File | Can Remove After | Status | Notes |
|----------------|-----------------|--------|-------|
| `src/lib/types.ts` - Domain interface | Domain entity used everywhere | 🔴 Keep | Used by UI components |
| `src/lib/types.ts` - Category interface | Category entity used everywhere | 🔴 Keep | Used by UI components |
| `src/lib/types.ts` - Flashcard interface | Flashcard entity used everywhere | 🔴 Keep | Used by UI components |
| `src/lib/types.ts` - ReviewHistory interface | ReviewHistory entity created | 🔴 Keep | Used by review API |
| `src/lib/types.ts` - Path interfaces | Path entity created | 🔴 Keep | Not yet implemented in DDD |
| `src/lib/types.ts` - UserProgress interface | UserProgress entity used | 🔴 Keep | Not yet integrated |

**Strategy:**
- Don't delete entire `types.ts` - keep it for non-entity types
- Remove individual interfaces as they're replaced by entities
- Keep DTOs and response types that are presentation-layer concerns

**Safe to Keep in types.ts:**
- API response types
- Form input types
- UI component prop types
- Enum types

**Should Move to Domain:**
- Business entities (Domain, Category, etc.)
- Business rules enums (Difficulty, ReviewMode, etc.)

---

### Phase 3: Duplicate/Dead Code

| File/Code | Reason | Can Delete After | Status |
|-----------|--------|-----------------|--------|
| `src/lib/db-operations.ts` - Some functions | Replaced by repositories | Verify no usages | 🟡 Check |
| Console.logs in production code | Debug code | Always | 🔴 TODO |
| Commented-out code blocks | Old experiments | Review and remove | 🔴 TODO |
| Unused imports | Cleanup | Run linter | 🔴 TODO |

**Commands:**
```bash
# Find console.logs
grep -r "console.log" src/ | grep -v node_modules

# Find commented code blocks
grep -r "^[[:space:]]*\/\/" src/ | head -20

# Find unused imports (use ESLint)
npm run lint
```

---

### Phase 4: Old Documentation

| File | Status | Action |
|------|--------|--------|
| `IMPLEMENTATION_PLAN.md` | 🟡 Outdated | Add deprecation notice, point to `.specs/` |
| `API_ROUTES_REVIEW.md` | 🟡 May be outdated | Review and update or deprecate |
| `DUOLINGO_UI_IMPLEMENTATION.md` | 🟢 Still relevant | Keep |
| `DOMAIN_DRIVEN_DESIGN_MODEL.md` | 🟢 Still relevant | Keep, reference from .specs |
| `DDD_IMPLEMENTATION_STATUS.md` | 🟢 Still relevant | Keep, update progress |
| `ADMIN_REFACTORING_NOTES.md` | 🟡 Check relevance | Review and archive or delete |
| `CATEGORIES_REFACTORING_COMPLETE.md` | 🔴 Obsolete | Can delete after verifying categories work |

**Cleanup Actions:**
1. Add deprecation notices to old docs
2. Move historical docs to `.archive/` folder
3. Update README to point to `.specs/` as source of truth
4. Keep domain model and status docs updated

---

## 🧹 Cleanup Checklist (Per Feature)

### When Completing a Business Case:

#### Step 1: Code Removal
```bash
- [ ] Grep for old service imports
- [ ] Verify no API routes use old services
- [ ] Verify no components import old services
- [ ] Delete old service file
- [ ] Remove old types from types.ts (if applicable)
- [ ] Remove old db-operations functions (if applicable)
```

#### Step 2: Code Consolidation
```bash
- [ ] All domain logic in src/domains/
- [ ] All use cases in src/application/use-cases/
- [ ] All Server Actions in src/presentation/actions/
- [ ] All repositories in src/infrastructure/repositories/
- [ ] No duplicated logic between layers
```

#### Step 3: Quality Checks
```bash
- [ ] TypeScript compiles (npm run build)
- [ ] No linter errors (npm run lint)
- [ ] Code formatted (npm run format)
- [ ] Tests pass (npm run test)
- [ ] No console.logs in production code
- [ ] No commented code blocks
```

#### Step 4: Documentation
```bash
- [ ] Update .specs/BUSINESS_CASES.md progress
- [ ] Update .specs/DDD_MIGRATION_PLAN.md progress
- [ ] Update code comments where needed
- [ ] Update API documentation (if exists)
- [ ] Add migration notes (breaking changes)
```

---

## 📊 Cleanup Progress Tracker

### Services Removed: 0/4 (0%)
- [ ] domain-service.ts
- [ ] category-service.ts
- [ ] flashcard-service.ts
- [ ] review-service.ts

### Type Definitions Cleaned: 0/10 (0%)
- [ ] Domain interface
- [ ] Category interface
- [ ] Flashcard interface
- [ ] ReviewHistory interface
- [ ] Path interface
- [ ] Unit interface
- [ ] Lesson interface
- [ ] UserProgress interface
- [ ] ReviewSession interface
- [ ] LessonCompletion interface

### Documentation Updated: 0/7 (0%)
- [ ] README.md
- [ ] IMPLEMENTATION_PLAN.md (deprecation notice)
- [ ] API documentation
- [ ] Component documentation
- [ ] Architecture diagrams
- [ ] Setup instructions
- [ ] Contribution guide

### Dead Code Removed: 0% (Not Started)
- [ ] Console.logs removed
- [ ] Commented code removed
- [ ] Unused imports removed
- [ ] Unused functions removed

---

## 🚨 Breaking Changes Log

Track breaking changes that might affect deployment:

| Date | Change | Impact | Migration Required |
|------|--------|--------|-------------------|
| TBD | Changed API response format for /api/domains | Frontend breaking | Update frontend to use new format |
| TBD | Removed DomainService.create() | Backend breaking | Use CreateDomainUseCase instead |
| TBD | Changed Domain type to entity class | Type breaking | Import from @/domains instead of @/lib/types |

---

## 📝 Cleanup Commands

### Check for Old Imports
```bash
# Find all old service imports
find src -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l "from.*services/"

# Find all old type imports that should be entities
grep -r "import.*Domain.*from.*types" src/
```

### Remove Dead Code
```bash
# Remove all console.logs (careful!)
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '/console\.log/d' {} +

# Remove empty lines (3+ consecutive)
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '/^$/N;/^\n$/D' {} +
```

### Format Code
```bash
# Format all TypeScript files
npm run format

# Or manually
npx prettier --write "src/**/*.{ts,tsx}"
```

### Verify No Broken Imports
```bash
# TypeScript will catch broken imports
npm run build

# Or just check types
npx tsc --noEmit
```

---

## ⚠️ Safety Rules

### Never Delete:
1. ❌ Files still imported by any code
2. ❌ Types used in API responses (even if anemic)
3. ❌ Database migrations or schema
4. ❌ Test files (even if outdated - fix them instead)
5. ❌ Configuration files
6. ❌ Documentation that's still accurate

### Safe to Delete:
1. ✅ Services after use cases replace them
2. ✅ Duplicate code after consolidation
3. ✅ Commented-out code after review
4. ✅ Console.logs (except intentional logging)
5. ✅ Unused imports (linter will catch)
6. ✅ Deprecated docs (after archiving)

### Always Check First:
```bash
# Before deleting a file, grep for imports
grep -r "filename-to-delete" src/

# Before deleting a function, grep for usage
grep -r "functionName" src/

# Before deleting a type, grep for usage
grep -r "TypeName" src/
```

---

## 📅 Cleanup Schedule

### Daily (During Active Development)
- [ ] Remove console.logs added during debugging
- [ ] Remove commented code from same day
- [ ] Run prettier on changed files
- [ ] Update progress in BUSINESS_CASES.md

### Weekly (End of Sprint)
- [ ] Run full linter
- [ ] Check for unused imports
- [ ] Review and remove old services if replaced
- [ ] Update documentation
- [ ] Update cleanup progress percentages

### Monthly (Major Milestone)
- [ ] Full codebase audit
- [ ] Remove all deprecated code
- [ ] Archive old documentation
- [ ] Update all tracking files
- [ ] Performance profiling and optimization

---

## 🎯 Cleanup Goals

### Short Term (1-2 weeks)
- Remove old service layer for completed features
- Clean up types.ts
- Remove console.logs
- Format all code

### Medium Term (1 month)
- All old services removed
- All types migrated to domains
- Documentation fully updated
- Zero linter warnings

### Long Term (2-3 months)
- Codebase 100% DDD compliant
- No dead code
- Comprehensive test coverage
- Optimized bundle size

---

**Last Updated:** 2026-01-19
**Cleanup Status:** 🔴 Not Started (waiting for feature completion)

---

**Tip:** Use this file as a checklist. Mark items ✅ as you complete them. Keep it updated as you discover more code to clean up.
