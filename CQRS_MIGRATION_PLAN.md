# CQRS Migration Plan

This document outlines the migration from Use Cases to Command Query Responsibility Segregation (CQRS) pattern.

## Structure

```
src/
├── commands/
│   ├── types.ts                    # Base command interfaces
│   ├── content/                    # Content domain commands
│   │   ├── CreateDomain.command.ts
│   │   ├── UpdateDomain.command.ts
│   │   ├── DeleteDomain.command.ts
│   │   ├── CreateCategory.command.ts
│   │   ├── UpdateCategory.command.ts
│   │   ├── DeleteCategory.command.ts
│   │   ├── CreateFlashcard.command.ts
│   │   ├── UpdateFlashcard.command.ts
│   │   ├── DeleteFlashcard.command.ts
│   │   └── BulkCreateFlashcards.command.ts
│   ├── lesson/                     # Lesson domain commands
│   │   ├── StartLesson.command.ts
│   │   ├── PauseLesson.command.ts
│   │   ├── ResumeLesson.command.ts
│   │   ├── AbandonLesson.command.ts
│   │   ├── CompleteLesson.command.ts
│   │   └── SubmitAnswer.command.ts
│   ├── review/                     # Review domain commands
│   │   ├── StartReviewSession.command.ts
│   │   └── SubmitReview.command.ts
│   ├── progress/                   # Progress domain commands
│   │   ├── UpdateStreak.command.ts
│   │   └── RefillHearts.command.ts
│   ├── groups/                     # Groups domain commands
│   │   ├── CreateGroup.command.ts
│   │   ├── DeleteGroup.command.ts
│   │   ├── SendInvitation.command.ts
│   │   ├── RevokeInvitation.command.ts
│   │   ├── AssignPath.command.ts
│   │   ├── RemovePath.command.ts
│   │   ├── TogglePathVisibility.command.ts
│   │   ├── UpdateMemberRole.command.ts
│   │   └── RemoveMember.command.ts
│   ├── auth/                       # Auth domain commands
│   │   └── Register.command.ts
│   └── handlers/                   # Command handlers organized by domain
│       ├── content/
│       │   ├── CreateDomainHandler.ts
│       │   ├── UpdateDomainHandler.ts
│       │   ├── DeleteDomainHandler.ts
│       │   ├── CreateCategoryHandler.ts
│       │   ├── UpdateCategoryHandler.ts
│       │   ├── DeleteCategoryHandler.ts
│       │   ├── CreateFlashcardHandler.ts
│       │   ├── UpdateFlashcardHandler.ts
│       │   ├── DeleteFlashcardHandler.ts
│       │   └── BulkCreateFlashcardsHandler.ts
│       ├── lesson/
│       │   ├── StartLessonHandler.ts
│       │   ├── PauseLessonHandler.ts
│       │   ├── ResumeLessonHandler.ts
│       │   ├── AbandonLessonHandler.ts
│       │   ├── CompleteLessonHandler.ts
│       │   └── SubmitAnswerHandler.ts
│       ├── review/
│       │   ├── StartReviewSessionHandler.ts
│       │   └── SubmitReviewHandler.ts
│       ├── progress/
│       │   ├── UpdateStreakHandler.ts
│       │   └── RefillHeartsHandler.ts
│       ├── groups/
│       │   ├── CreateGroupHandler.ts
│       │   ├── DeleteGroupHandler.ts
│       │   ├── SendInvitationHandler.ts
│       │   ├── RevokeInvitationHandler.ts
│       │   ├── AssignPathHandler.ts
│       │   ├── RemovePathHandler.ts
│       │   ├── TogglePathVisibilityHandler.ts
│       │   ├── UpdateMemberRoleHandler.ts
│       │   └── RemoveMemberHandler.ts
│       └── auth/
│           └── RegisterHandler.ts
│
├── queries/
│   ├── types.ts                    # Re-export query types
│   ├── content/                    # Content domain queries
│   │   ├── GetDomains.query.ts
│   │   ├── GetCategories.query.ts
│   │   └── GetFlashcards.query.ts
│   ├── lesson/                     # Lesson domain queries
│   │   ├── GetLessonFlashcards.query.ts
│   │   ├── GetLessonProgress.query.ts
│   │   └── GetLessonInfo.query.ts
│   ├── review/                     # Review domain queries
│   │   ├── GetDueCards.query.ts
│   │   └── GetStrugglingCards.query.ts
│   ├── progress/                   # Progress domain queries
│   │   └── GetUserProgress.query.ts
│   ├── groups/                     # Groups domain queries
│   │   ├── GetGroups.query.ts
│   │   ├── GetMyGroups.query.ts
│   │   ├── GetGroupDetail.query.ts
│   │   ├── GetGroupAnalytics.query.ts
│   │   ├── GetGroupLeaderboard.query.ts
│   │   ├── GetAssignedPaths.query.ts
│   │   ├── GetMemberProgress.query.ts
│   │   └── GetInvitation.query.ts
│   ├── admin/                      # Admin domain queries
│   │   ├── GetAdminStats.query.ts
│   │   ├── GetUsers.query.ts
│   │   └── GetUserPaths.query.ts
│   ├── stats/                      # Stats domain queries
│   │   ├── GetStats.query.ts
│   │   ├── GetLeaderboard.query.ts
│   │   └── GetXPHistory.query.ts
│   ├── paths/                      # Paths domain queries
│   │   ├── GetPaths.query.ts
│   │   ├── GetUnits.query.ts
│   │   └── GetLessons.query.ts
│   └── handlers/                   # Query handlers organized by domain
│       ├── content/
│       │   ├── GetDomainsHandler.ts
│       │   ├── GetCategoriesHandler.ts
│       │   └── GetFlashcardsHandler.ts
│       ├── lesson/
│       │   ├── GetLessonFlashcardsHandler.ts
│       │   ├── GetLessonProgressHandler.ts
│       │   └── GetLessonInfoHandler.ts
│       ├── review/
│       │   ├── GetDueCardsHandler.ts
│       │   └── GetStrugglingCardsHandler.ts
│       ├── progress/
│       │   └── GetUserProgressHandler.ts
│       ├── groups/
│       │   ├── GetGroupsHandler.ts
│       │   ├── GetMyGroupsHandler.ts
│       │   ├── GetGroupDetailHandler.ts
│       │   ├── GetGroupAnalyticsHandler.ts
│       │   ├── GetGroupLeaderboardHandler.ts
│       │   ├── GetAssignedPathsHandler.ts
│       │   ├── GetMemberProgressHandler.ts
│       │   └── GetInvitationHandler.ts
│       ├── admin/
│       │   ├── GetAdminStatsHandler.ts
│       │   ├── GetUsersHandler.ts
│       │   └── GetUserPathsHandler.ts
│       ├── stats/
│       │   ├── GetStatsHandler.ts
│       │   ├── GetLeaderboardHandler.ts
│       │   └── GetXPHistoryHandler.ts
│       └── paths/
│           ├── GetPathsHandler.ts
│           ├── GetUnitsHandler.ts
│           └── GetLessonsHandler.ts
```

## Migration Strategy

### Phase 1: Foundation ✅
- [x] Create base command/query types
- [x] Create folder structure
- [x] Create example command (CreateDomain)
- [x] Create example query (GetDomains)

### Phase 2: Content Domain
- [ ] Migrate all Content commands (9 commands)
- [ ] Migrate all Content queries (3 queries)
- [ ] Update Content presentation actions

### Phase 3: Lesson Domain
- [ ] Migrate all Lesson commands (6 commands)
- [ ] Migrate all Lesson queries (3 queries)
- [ ] Update Lesson presentation actions

### Phase 4: Review Domain
- [ ] Migrate all Review commands (2 commands)
- [ ] Migrate all Review queries (2 queries)
- [ ] Update Review presentation actions

### Phase 5: Progress Domain
- [ ] Migrate all Progress commands (2 commands)
- [ ] Migrate all Progress queries (1 query)
- [ ] Update Progress presentation actions

### Phase 6: Groups Domain
- [ ] Migrate all Groups commands (9 commands)
- [ ] Migrate all Groups queries (8 queries)
- [ ] Update Groups presentation actions

### Phase 7: Admin Domain
- [ ] Migrate all Admin queries (3 queries)
- [ ] Update Admin presentation actions

### Phase 8: Stats Domain
- [ ] Migrate all Stats queries (3 queries)
- [ ] Update Stats presentation actions

### Phase 9: Paths Domain
- [ ] Migrate all Paths queries (3 queries)
- [ ] Update Paths presentation actions

### Phase 10: Auth Domain
- [ ] Migrate Auth command (1 command)
- [ ] Update Auth presentation actions

### Phase 11: Finalization
- [ ] Update dependency injection container
- [ ] Remove old use-cases folder
- [ ] Update all imports across codebase
- [ ] Run tests and fix any issues

## Domain Breakdown

### Content Domain
**Commands (Write Operations):**
1. CreateDomain
2. UpdateDomain
3. DeleteDomain
4. CreateCategory
5. UpdateCategory
6. DeleteCategory
7. CreateFlashcard
8. UpdateFlashcard
9. DeleteFlashcard
10. BulkCreateFlashcards

**Queries (Read Operations):**
1. GetDomains
2. GetCategories
3. GetFlashcards

### Lesson Domain
**Commands:**
1. StartLesson
2. PauseLesson
3. ResumeLesson
4. AbandonLesson
5. CompleteLesson
6. SubmitAnswer

**Queries:**
1. GetLessonFlashcards
2. GetLessonProgress
3. GetLessonInfo

### Review Domain
**Commands:**
1. StartReviewSession
2. SubmitReview

**Queries:**
1. GetDueCards
2. GetStrugglingCards

### Progress Domain
**Commands:**
1. UpdateStreak
2. RefillHearts

**Queries:**
1. GetUserProgress

### Groups Domain
**Commands:**
1. CreateGroup
2. DeleteGroup
3. SendInvitation
4. RevokeInvitation
5. AssignPath
6. RemovePath
7. TogglePathVisibility
8. UpdateMemberRole
9. RemoveMember

**Queries:**
1. GetGroups
2. GetMyGroups
3. GetGroupDetail
4. GetGroupAnalytics
5. GetGroupLeaderboard
6. GetAssignedPaths
7. GetMemberProgress
8. GetInvitation

### Admin Domain
**Queries:**
1. GetAdminStats
2. GetUsers
3. GetUserPaths

### Stats Domain
**Queries:**
1. GetStats
2. GetLeaderboard
3. GetXPHistory

### Paths Domain
**Queries:**
1. GetPaths
2. GetUnits
3. GetLessons

### Auth Domain
**Commands:**
1. Register

## Implementation Notes

1. **Command Pattern**: Commands represent intent to change state. They are immutable objects with all data needed for execution.

2. **Query Pattern**: Queries represent read operations. They should not modify state.

3. **Handlers**: Handlers contain the business logic previously in use cases. They use repositories for data access.

4. **Dependency Injection**: Handlers will be registered in the DI container and injected into presentation actions.

5. **Type Safety**: All commands and queries extend base interfaces for type safety.

6. **Migration**: We'll migrate domain by domain, ensuring each domain is complete before moving to the next.

## Benefits

1. **Separation of Concerns**: Clear separation between read and write operations
2. **Scalability**: Can scale read and write operations independently
3. **Maintainability**: Easier to understand and maintain code
4. **Testability**: Commands and queries can be tested independently
5. **Flexibility**: Can optimize read and write paths differently

