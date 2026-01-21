# .specs - Documentation Index

**Quick reference to all specification documents**

---

## 📖 Documentation Roadmap

### 1. Start Here 👈
**File:** `README.md`
**Purpose:** Orientation guide for new agents/developers
**Read First:** Yes
**5-Min Summary:** What .specs folder is, how to use it, workflow basics

### 2. Understand the Scope 🎯
**File:** `BUSINESS_CASES.md` ⭐ **NEW**
**Purpose:** Complete inventory of all 41 features in the application
**Read When:** Before starting any work
**Key Sections:**
- 9 Business Areas (Auth, Content, Review, Paths, Progress, Groups, Invitations, Admin, Analytics)
- 41 Features mapped to database tables
- Business rules for each feature
- Implementation priority matrix
- Cleanup plan per business case

### 3. Plan Your Work 📋
**File:** `DDD_MIGRATION_PLAN.md`
**Purpose:** Master task tracker with 74 tasks across 5 phases
**Read When:** Picking a task to work on
**Key Sections:**
- Overall progress (85% complete)
- Phase breakdown (Domain, Infrastructure, Application, Presentation, Integration)
- "Next Priority Tasks" - start here
- Agent instructions for each task
- Success criteria per phase

**File:** `SSR_MIGRATION_PLAN.md` ⭐ **NEW**
**Purpose:** Complete Server Actions + SSR migration plan (58 tasks)
**Read When:** Migrating from TanStack Query to Server Actions
**Key Sections:**
- Architecture decision (Server Actions vs TanStack Query)
- 4-phase migration strategy
- Detailed task breakdown with subtasks
- Implementation patterns
- Progress tracking

### 4. Write the Code 💻
**File:** `CODE_TEMPLATES.md`
**Purpose:** Copy-paste templates for all DDD patterns
**Read When:** Implementing a task
**Templates Included:**
- Use Case (Application Service)
- Repository (Infrastructure)
- Server Action (Presentation)
- ~~React Query Hook~~ (DEPRECATED - Use Server Actions instead)
- ~~API Route~~ (DEPRECATED - Use Server Actions instead)
- Event Handler (Infrastructure)
- Dependency Injection Container

**Note:** See `SSR_MIGRATION_PLAN.md` for Server Action patterns and Server Component examples.

### 5. Clean Up After 🧹
**File:** `CLEANUP_TRACKER.md` ⭐ **NEW**
**Purpose:** Track what old code to remove and when
**Read When:** After completing a feature
**Key Sections:**
- Files to remove (services, types, dead code)
- Cleanup checklist per feature
- Safety rules (what NOT to delete)
- Cleanup commands (grep, sed, prettier)
- Breaking changes log

---

## 🎯 Quick Workflows

### Workflow 1: Implementing a New Feature

```
1. Read BUSINESS_CASES.md → Find your feature
2. Read DDD_MIGRATION_PLAN.md → Find related tasks
3. Update task status to 🟡
4. Read CODE_TEMPLATES.md → Copy relevant template
5. Implement using domain-driven design
6. Update task status to ✅
7. Read CLEANUP_TRACKER.md → Remove old code if applicable
```

### Workflow 2: Understanding the Application

```
1. Read BUSINESS_CASES.md → See all 41 features
2. Read DDD_IMPLEMENTATION_STATUS.md (root) → See what's built
3. Read DOMAIN_DRIVEN_DESIGN_MODEL.md (root) → Understand architecture
4. Explore src/domains/ → See domain entities
5. Explore src/application/ → See use cases
```

### Workflow 3: Finding What to Work On

```
1. Open DDD_MIGRATION_PLAN.md
2. Go to "Next Priority Tasks" section
3. Pick a task matching your skills
4. Check BUSINESS_CASES.md for context
5. Use CODE_TEMPLATES.md to implement
6. Mark complete and move to next
```

---

## 📊 Document Relationships

```
BUSINESS_CASES.md (What needs to be built)
         ↓
DDD_MIGRATION_PLAN.md (How to build it - tasks)
         ↓
CODE_TEMPLATES.md (Templates to use)
         ↓
         [Build the feature]
         ↓
CLEANUP_TRACKER.md (Remove old code)
```

---

## 🔍 Finding Information

### "What features does this app have?"
→ Read `BUSINESS_CASES.md` (all 41 features listed)

### "What tasks are left to do?"
→ Read `DDD_MIGRATION_PLAN.md` (check 🔴 tasks)

### "How do I implement a use case?"
→ Read `CODE_TEMPLATES.md` (use case template)

### "What old code can I delete?"
→ Read `CLEANUP_TRACKER.md` (safe removal guide)

### "What's the architecture?"
→ Read `DOMAIN_DRIVEN_DESIGN_MODEL.md` (in root folder)

### "What's already built?"
→ Read `DDD_IMPLEMENTATION_STATUS.md` (in root folder)

---

## 📁 File Organization

### .specs Folder (Specification-Driven Development)
```
.specs/
├── INDEX.md (this file) - Documentation index
├── README.md - Orientation guide
├── BUSINESS_CASES.md - Feature inventory (41 features)
├── DDD_MIGRATION_PLAN.md - Task tracker (74 tasks)
├── SSR_MIGRATION_PLAN.md - Server Actions migration (58 tasks) ⭐ NEW
├── SSR_MIGRATION_SUMMARY.md - Quick SSR reference ⭐ NEW
├── CODE_TEMPLATES.md - Implementation templates
├── CLEANUP_TRACKER.md - Cleanup guide
└── IMPLEMENTATION_GAPS_ANALYSIS.md - Gap analysis
```

### Root Folder (Technical Documentation)
```
├── DDD_IMPLEMENTATION_STATUS.md - Current status
├── DOMAIN_DRIVEN_DESIGN_MODEL.md - Architecture spec
├── IMPLEMENTATION_PLAN.md - Old plan (deprecated)
├── AUTH_IMPLEMENTATION_SUMMARY.md - Auth notes
├── API_ROUTES_REVIEW.md - API review
└── [Other specific feature docs]
```

---

## 🎓 Learning Path for New Contributors

### Day 1: Understanding
1. Read `.specs/README.md` (15 min)
2. Read `.specs/BUSINESS_CASES.md` (30 min) - Skim all features
3. Read `DOMAIN_DRIVEN_DESIGN_MODEL.md` (30 min) - Understand DDD
4. Explore `src/domains/` (20 min) - See domain entities

### Day 2: Planning
1. Read `.specs/DDD_MIGRATION_PLAN.md` (20 min)
2. Pick a simple task (e.g., Create a use case)
3. Read `.specs/CODE_TEMPLATES.md` (20 min)
4. Review similar existing code (20 min)

### Day 3: Implementation
1. Implement your chosen task (2-3 hours)
2. Test it works
3. Update progress markers
4. Submit PR or mark complete

### Day 4: Cleanup
1. Read `.specs/CLEANUP_TRACKER.md`
2. Remove old code for your feature
3. Run linter and tests
4. Update documentation

---

## ✅ Quick Reference Checklist

### Before Starting Work:
- [ ] Read BUSINESS_CASES.md for context
- [ ] Read DDD_MIGRATION_PLAN.md for tasks
- [ ] Check CODE_TEMPLATES.md for patterns
- [ ] Update task status to 🟡

### While Working:
- [ ] Follow DDD principles (domain → application → presentation)
- [ ] Use branded types for IDs
- [ ] Emit domain events for state changes
- [ ] Write DTOs for request/response
- [ ] Keep use cases thin (delegate to domain)

### After Completing:
- [ ] Update task status to ✅
- [ ] Update progress percentage
- [ ] Check CLEANUP_TRACKER.md for old code to remove
- [ ] Run tests
- [ ] Update documentation if needed

---

## 🚨 Common Pitfalls

### ❌ Don't:
1. Start coding without reading BUSINESS_CASES.md
2. Put business logic in use cases (belongs in domain)
3. Delete old code while it's still in use
4. Skip updating progress markers
5. Ignore the templates (they save time!)

### ✅ Do:
1. Understand the business case first
2. Follow the layered architecture
3. Use the templates as starting points
4. Test your changes
5. Clean up as you go

---

## 📞 Need Help?

### Issue: "I don't know where to start"
→ Start with `.specs/BUSINESS_CASES.md` - pick one feature to implement

### Issue: "I don't understand DDD"
→ Read `DOMAIN_DRIVEN_DESIGN_MODEL.md` and look at existing entities in `src/domains/`

### Issue: "How do I implement X?"
→ Check `.specs/CODE_TEMPLATES.md` for the pattern

### Issue: "Can I delete this old code?"
→ Check `.specs/CLEANUP_TRACKER.md` for safety rules

### Issue: "What's the priority?"
→ Check `.specs/DDD_MIGRATION_PLAN.md` → "Next Priority Tasks"

---

## 🎯 Success Metrics

Track your progress:

- **Features Completed:** See BUSINESS_CASES.md progress section
- **Tasks Completed:** See DDD_MIGRATION_PLAN.md percentages
- **Code Cleaned:** See CLEANUP_TRACKER.md progress
- **Tests Written:** Run `npm run test` (TODO: add tests)
- **Documentation Updated:** Check last update dates

---

**Last Updated:** 2026-01-19
**Total Documents:** 5 spec files
**Total Features:** 41 business features
**Total Tasks:** 74 implementation tasks
**Current Progress:** 50% complete

**Next Steps:** Pick a task from `DDD_MIGRATION_PLAN.md` and start coding! 🚀
