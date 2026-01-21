# .specs - Specification-Driven Development

**This folder contains specification files for the Domain-Driven Design migration**

---

## 📂 What's in This Folder?

| File | Purpose | When to Use |
|------|---------|-------------|
| `README.md` (this file) | **Guide** for using the .specs folder | First-time setup and orientation |
| `BUSINESS_CASES.md` | **Complete feature inventory** with all 41 business features mapped | Understand the full scope of the application |
| `DDD_MIGRATION_PLAN.md` | **Master plan** with all tasks, progress tracking, and agent instructions | Start here to see what needs to be done |
| `CODE_TEMPLATES.md` | **Code templates** and patterns for common implementations | Reference when implementing tasks |
| `CLEANUP_TRACKER.md` | **Cleanup checklist** for removing old code safely | Use after completing features to clean up |

---

## 🎯 For AI Agents: Quick Start

### If you're picking up this work:

1. **Read this file first** (you're doing it! ✅)
2. **Open `BUSINESS_CASES.md`** to understand all features
3. **Open `DDD_MIGRATION_PLAN.md`** to see overall progress
4. **Check "Next Priority Tasks"** section
5. **Pick a task** that matches your capabilities
6. **Use `CODE_TEMPLATES.md`** for implementation patterns
7. **Update progress** when you complete a task
8. **Use `CLEANUP_TRACKER.md`** after completing features

### Your workflow:

```
1. Find a 🔴 task in DDD_MIGRATION_PLAN.md
2. Update it to 🟡 (in progress)
3. Read "Agent Instructions" column
4. Copy template from CODE_TEMPLATES.md
5. Implement the code
6. Update task to ✅ (complete)
7. Update progress percentage at top
```

---

## 🏗️ What is Spec-Driven Development?

**Spec-Driven Development** means:
- Specifications come first (the plan)
- Implementation follows the spec
- Progress is tracked continuously
- Any agent can pick up where others left off

Think of it like a construction blueprint - anyone can read it and continue building.

---

## 📊 Current Status (Quick View)

Check `DDD_MIGRATION_PLAN.md` for up-to-date progress. As of last update:

```
Overall: 50% Complete

✅ Domain Layer        100% - All entities, aggregates, value objects done
🟡 Infrastructure      60%  - Repositories partially implemented
🔴 Application Layer   15%  - Use cases need completion
🔴 Presentation Layer  10%  - Server Actions need creation
🔴 Integration Layer   0%   - API routes need updating
```

---

## 🗺️ Architecture Overview

This project is migrating to a **layered DDD architecture**:

```
┌─────────────────────────────────────┐
│  Presentation Layer                 │  ← Server Actions, React components
│  (User Interface)                   │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  Application Layer                  │  ← Use Cases, orchestration
│  (Use Cases)                        │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  Domain Layer                       │  ← Business logic, entities
│  (Business Logic)          ✅ DONE  │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  Infrastructure Layer               │  ← Database, external services
│  (Data Access)                      │
└─────────────────────────────────────┘
```

---

## 🎓 Key Concepts

### Domain Layer ✅
- **Entities**: Objects with identity (Domain, Category, Flashcard)
- **Aggregates**: Cluster of entities treated as a unit (LessonSession)
- **Value Objects**: Immutable values (XP, Hearts, Accuracy)
- **Domain Events**: Things that happened (LessonCompleted, XPEarned)
- **Domain Services**: Complex logic that doesn't fit in one entity

### Application Layer 🔴
- **Use Cases**: Application-specific business logic
- **DTOs**: Data Transfer Objects (request/response)
- **Event Handlers**: React to domain events

### Presentation Layer 🔴
- **Server Actions**: Next.js server-side functions
- **React Hooks**: TanStack Query hooks for data fetching

### Infrastructure Layer 🟡
- **Repositories**: Database access (SQLite)
- **Event Publisher**: Publish/subscribe for domain events

---

## 📝 How to Update Progress

When you complete a task:

1. **Update the task status** in `DDD_MIGRATION_PLAN.md`:
   ```markdown
   | 3.1.3 | CompleteLessonUseCase | 🔴 | ... |
   ```
   Change `🔴` to `✅`

2. **Update the progress bar** at the top:
   ```markdown
   🔴 Application Layer:   15% (2/13 tasks)
   ```
   Change to:
   ```markdown
   🟡 Application Layer:   23% (3/13 tasks)
   ```

3. **Update overall progress** percentage:
   ```markdown
   █████████████████████░░░░░░░░░ 50% Complete
   ```
   Recalculate based on total completed tasks

4. **Add notes** in "Implementation Notes" section if needed

---

## 🔍 Finding the Right Task

### If you're good at:

**Backend/Domain Logic** → Pick tasks from:
- Phase 2: Infrastructure Layer (repositories)
- Phase 3: Application Layer (use cases)

**Frontend/UI** → Pick tasks from:
- Phase 4: Presentation Layer (Server Actions, hooks)
- Phase 5: Integration Layer (component updates)

**API Development** → Pick tasks from:
- Phase 5: Integration Layer (API routes)

**Testing** → Pick tasks from:
- Any phase - add tests for completed features

### Priority Order:

1. **HIGH**: Phase 3 - Application Layer (use cases)
2. **MEDIUM**: Phase 2 - Infrastructure Layer (repositories)
3. **MEDIUM**: Phase 4 - Presentation Layer (Server Actions)
4. **LOW**: Phase 5 - Integration Layer (API updates)

---

## 🛠️ Tools & Resources

### In this repository:

- **Domain docs**: `DOMAIN_DRIVEN_DESIGN_MODEL.md`
- **Implementation status**: `DDD_IMPLEMENTATION_STATUS.md`
- **Old plan**: `IMPLEMENTATION_PLAN.md`

### External resources:

- **DDD Patterns**: https://martinfowler.com/tags/domain%20driven%20design.html
- **Next.js Docs**: https://nextjs.org/docs
- **TanStack Query**: https://tanstack.com/query

---

## 🤝 Collaboration Guidelines

### When working with other agents:

1. **Always update progress** - Don't leave tasks in 🟡 state
2. **Add notes** - Document any blockers or decisions
3. **Follow patterns** - Use templates from CODE_TEMPLATES.md
4. **Test your work** - Ensure it integrates with existing code
5. **Ask questions** - If stuck, note it in "Implementation Notes"

### Communication:

- **Blockers**: Add to "Known Issues" section
- **Questions**: Add to "Implementation Notes"
- **Decisions**: Document in task description

---

## 🎯 Success Criteria

A task is **complete** when:

- [ ] Code is written following the template pattern
- [ ] File is saved in the correct location
- [ ] Code compiles without errors (TypeScript)
- [ ] Integration with existing code works
- [ ] Progress markers are updated
- [ ] Notes are added (if applicable)

A **phase** is complete when:

- [ ] All tasks in that phase are ✅
- [ ] Integration tests pass (if applicable)
- [ ] Documentation is updated

---

## 🚀 Quick Commands

### For agents implementing tasks:

**Start a task:**
```bash
# 1. Open DDD_MIGRATION_PLAN.md
# 2. Find your task (e.g., Task 3.1.3)
# 3. Change 🔴 to 🟡
# 4. Read "Agent Instructions"
```

**Implement the task:**
```bash
# 1. Open CODE_TEMPLATES.md
# 2. Find the relevant template
# 3. Copy template to new file
# 4. Modify for your use case
# 5. Test the implementation
```

**Complete the task:**
```bash
# 1. Change 🟡 to ✅ in DDD_MIGRATION_PLAN.md
# 2. Update progress percentage
# 3. Add notes if needed
```

---

## 📧 Questions?

If you're stuck:

1. Check `CODE_TEMPLATES.md` for examples
2. Look at existing implementations in `src/application/use-cases/lesson/`
3. Review domain model in `DOMAIN_DRIVEN_DESIGN_MODEL.md`
4. Add a note in "Implementation Notes" section

---

## 🎉 Getting Started

**New to this project?** Follow this path:

1. ✅ Read this README (you're here!)
2. ⏭️ Open `DDD_MIGRATION_PLAN.md` and read the "Quick Start Guide"
3. ⏭️ Look at "Next Priority Tasks"
4. ⏭️ Pick a task and start implementing!

**Ready to code?** Check `CODE_TEMPLATES.md` for patterns and examples.

---

**Remember**: The domain layer (business logic) is complete. Now we just need to connect it to the UI and database. You've got this! 💪

Last Updated: 2026-01-19
