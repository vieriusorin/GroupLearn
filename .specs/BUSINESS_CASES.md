# Business Cases - Learning Cards Application

**Complete Feature Inventory & Implementation Roadmap**

**Last Updated:** 2026-01-19
**Status:** Comprehensive Analysis Complete

---

## 📊 Feature Coverage Summary

| Business Area | Features | DDD Ready | Priority | Status |
|--------------|----------|-----------|----------|--------|
| **Authentication** | 3 features | ⚠️ Partial | HIGH | 🟡 In Progress |
| **Content Management** | 4 features | ✅ Yes | HIGH | 🟡 In Progress |
| **Review System** | 3 features | ✅ Yes | HIGH | 🔴 Needs Implementation |
| **Learning Paths** | 6 features | ✅ Yes | HIGH | 🔴 Needs Implementation |
| **User Progress** | 5 features | ✅ Yes | HIGH | 🔴 Needs Implementation |
| **Groups** | 7 features | 🔴 No | MEDIUM | 🔴 Not Started |
| **Invitations** | 4 features | 🔴 No | MEDIUM | 🔴 Not Started |
| **Admin Panel** | 5 features | 🔴 No | MEDIUM | 🔴 Not Started |
| **Analytics** | 4 features | 🔴 No | LOW | 🔴 Not Started |

**Total: 41 Business Features**

---

## 🎯 Business Case 1: Authentication & User Management

### Database Tables
- `users` - User accounts
- `accounts` - OAuth provider accounts
- `sessions` - Active sessions
- `verification_tokens` - Email verification

### Features

#### 1.1 User Registration 🟡
**Current Status:** Implemented with NextAuth
- **API:** `/api/auth/register`
- **DDD Domain:** Not modeled (using NextAuth directly)
- **Tasks:**
  - [ ] Create User entity in domain layer (optional - NextAuth handles this)
  - [ ] Add email verification flow
  - [ ] Add password strength validation
  - [ ] Add user profile setup wizard

#### 1.2 User Login 🟡
**Current Status:** Implemented with NextAuth
- **API:** `/api/auth/[...nextauth]`
- **DDD Domain:** Not modeled
- **Tasks:**
  - [x] OAuth providers (Google, GitHub)
  - [x] Email/password login
  - [ ] Two-factor authentication
  - [ ] Remember me functionality

#### 1.3 User Profile Management 🔴
**Current Status:** Not implemented
- **Page:** `/settings` (exists but minimal)
- **DDD Domain:** Needs User aggregate
- **Tasks:**
  - [ ] Create UpdateUserProfileUseCase
  - [ ] Create ChangePasswordUseCase
  - [ ] Create UploadAvatarUseCase
  - [ ] Create DeleteAccountUseCase
  - [ ] Build profile settings UI

**Business Rules:**
- Email must be unique
- Password must meet complexity requirements
- Profile changes require re-authentication for sensitive data

---

## 🎯 Business Case 2: Content Management

### Database Tables
- `domains` - Top-level learning domains
- `categories` - Subcategories within domains
- `flashcards` - Individual flashcards

### Features

#### 2.1 Domain Management ✅
**Current Status:** Partially implemented
- **API:** `/api/domains` (exists)
- **Pages:** `/domains` (exists)
- **DDD Domain:** ✅ Complete (Domain entity, DomainRepository, CreateDomainUseCase)
- **Tasks:**
  - [x] Domain entity with validation
  - [x] SqliteDomainRepository
  - [ ] Create all use cases (Create, Update, Delete, List)
  - [ ] Create Server Actions
  - [ ] Update API routes to use DDD
  - [ ] Add domain icons/images
  - [ ] Add domain statistics (card count, completion %)

#### 2.2 Category Management 🟡
**Current Status:** API implemented, DDD partial
- **API:** `/api/categories` (exists)
- **DDD Domain:** ✅ Category entity, 🟡 Repository partial
- **Tasks:**
  - [x] Category entity with validation
  - [x] SqliteCategoryRepository
  - [ ] CreateCategoryUseCase
  - [ ] UpdateCategoryUseCase
  - [ ] DeleteCategoryUseCase
  - [ ] ListCategoriesUseCase
  - [ ] Create Server Actions
  - [ ] Add category deprecation workflow
  - [ ] Add category reorganization (move to different domain)

#### 2.3 Flashcard Management 🟡
**Current Status:** API implemented, DDD partial
- **API:** `/api/flashcards` (exists)
- **Pages:** `/flashcards` (exists)
- **DDD Domain:** ✅ Flashcard entity, 🔴 Repository not implemented
- **Tasks:**
  - [x] Flashcard entity with validation
  - [ ] SqliteFlashcardRepository
  - [ ] CreateFlashcardUseCase
  - [ ] UpdateFlashcardUseCase
  - [ ] DeleteFlashcardUseCase
  - [ ] BulkCreateFlashcardsUseCase
  - [ ] ImportFlashcardsUseCase (CSV, JSON)
  - [ ] ExportFlashcardsUseCase
  - [ ] Add flashcard difficulty auto-calculation
  - [ ] Add flashcard tagging system

#### 2.4 Content Search & Filter 🔴
**Current Status:** Not implemented
- **DDD Domain:** Needs SearchService
- **Tasks:**
  - [ ] Create SearchContentUseCase
  - [ ] Full-text search across questions/answers
  - [ ] Filter by domain/category/difficulty
  - [ ] Search history tracking
  - [ ] Recent items tracking

**Business Rules:**
- Domains cannot be deleted if they have categories
- Categories cannot be deleted if they have flashcards
- Flashcard question/answer cannot be empty
- Difficulty must be easy/medium/hard

---

## 🎯 Business Case 3: Review System (Spaced Repetition)

### Database Tables
- `review_history` - Record of all reviews
- `struggling_queue` - Cards user struggles with

### Features

#### 3.1 Review Session 🔴
**Current Status:** API exists, DDD ready but not integrated
- **API:** `/api/review` (exists)
- **Pages:** `/review` (exists)
- **DDD Domain:** ✅ ReviewSession aggregate, ReviewInterval value object
- **Tasks:**
  - [x] ReviewSession aggregate
  - [x] SpacedRepetitionService
  - [ ] SqliteReviewHistoryRepository
  - [ ] StartReviewSessionUseCase
  - [ ] SubmitReviewUseCase
  - [ ] CompleteReviewSessionUseCase
  - [ ] Create Server Actions
  - [ ] Update review UI to use aggregates
  - [ ] Add review statistics dashboard

#### 3.2 Due Cards Calculation 🔴
**Current Status:** Basic logic in API route
- **DDD Domain:** Needs GetDueCardsUseCase
- **Tasks:**
  - [ ] GetDueCardsUseCase
  - [ ] GetDueCountUseCase
  - [ ] PrioritizeDueCardsUseCase (by difficulty, failure rate)
  - [ ] Add "study all due cards" mode
  - [ ] Add "study by domain" mode

#### 3.3 Struggling Cards Management 🔴
**Current Status:** Table exists, not fully utilized
- **DDD Domain:** Needs StrugglingCardService
- **Tasks:**
  - [ ] GetStrugglingCardsUseCase
  - [ ] AddToStrugglingQueueUseCase (automatic via events)
  - [ ] RemoveFromStrugglingQueueUseCase
  - [ ] StudyStrugglingCardsUseCase
  - [ ] Create struggling cards UI page
  - [ ] Add "intensive review" mode for struggling cards

**Business Rules:**
- Review intervals: 1, 3, or 7 days
- Correct answer → increase interval
- Incorrect answer → reset to 1 day
- Card marked as struggling after 3 consecutive failures
- Struggling queue has max 50 cards

---

## 🎯 Business Case 4: Learning Paths (Duolingo-Style)

### Database Tables
- `paths` - Learning tracks
- `path_approvals` - User path access
- `units` - Groups of lessons
- `lessons` - Individual lessons
- `lesson_flashcards` - Lesson contents

### Features

#### 4.1 Path Management 🔴
**Current Status:** Database ready, not implemented
- **DDD Domain:** Needs Path entity, PathRepository
- **Tasks:**
  - [ ] Create Path entity (with unlock requirements)
  - [ ] Create PathRepository
  - [ ] CreatePathUseCase (admin only)
  - [ ] UpdatePathUseCase
  - [ ] DeletePathUseCase
  - [ ] ListPathsUseCase (with visibility filtering)
  - [ ] ApprovePath UseCase (for private paths)
  - [ ] Build path builder UI (admin)
  - [ ] Build path selection UI (user)

#### 4.2 Unit Management 🔴
**Current Status:** Database ready, not implemented
- **DDD Domain:** Needs Unit entity
- **Tasks:**
  - [ ] Create Unit entity
  - [ ] CreateUnitUseCase
  - [ ] UpdateUnitUseCase
  - [ ] DeleteUnitUseCase
  - [ ] ReorderUnitsUseCase
  - [ ] Build unit editor UI

#### 4.3 Lesson Management 🔴
**Current Status:** Database ready, page exists but minimal
- **Pages:** `/lesson/[id]` (exists but basic)
- **DDD Domain:** Needs Lesson entity, LessonRepository
- **Tasks:**
  - [ ] Create Lesson entity
  - [ ] Create LessonRepository
  - [ ] CreateLessonUseCase
  - [ ] UpdateLessonUseCase
  - [ ] DeleteLessonUseCase
  - [ ] AssignFlashcardsToLessonUseCase
  - [ ] ReorderFlashcardsInLessonUseCase
  - [ ] Build lesson editor UI

#### 4.4 Lesson Playing 🟡
**Current Status:** DDD domain ready, not integrated
- **Pages:** `/lesson/[id]` (exists)
- **DDD Domain:** ✅ LessonSession aggregate complete
- **Tasks:**
  - [x] LessonSession aggregate
  - [x] Answer value object
  - [x] Progress value object
  - [x] Accuracy value object
  - [x] StartLessonUseCase (example done)
  - [x] SubmitAnswerUseCase (example done)
  - [ ] CompleteLessonUseCase
  - [ ] PauseLessonUseCase
  - [ ] ResumeLessonUseCase
  - [ ] AbandonLessonUseCase
  - [ ] Create Server Actions
  - [ ] Rebuild lesson UI with aggregates
  - [ ] Add lesson preview mode
  - [ ] Add lesson retry functionality

#### 4.5 Path Visibility & Access Control 🔴
**Current Status:** Database ready, logic not implemented
- **DDD Domain:** Needs PathAccessService
- **Tasks:**
  - [ ] CreatePathApprovalUseCase
  - [ ] RevokePathApprovalUseCase
  - [ ] CheckPathAccessUseCase
  - [ ] ListAccessiblePathsUseCase
  - [ ] Add path access request workflow
  - [ ] Add admin approval UI

#### 4.6 Path Progress Tracking 🔴
**Current Status:** Database ready, basic API
- **API:** `/api/progress` (exists)
- **Pages:** `/progress` (exists)
- **DDD Domain:** Needs PathProgress entity
- **Tasks:**
  - [ ] GetPathProgressUseCase
  - [ ] GetUnitProgressUseCase
  - [ ] GetLessonProgressUseCase
  - [ ] CalculateCompletionPercentageUseCase
  - [ ] Build progress visualization UI
  - [ ] Add progress export (PDF report)

**Business Rules:**
- Paths can be public or private
- Private paths require admin approval
- Units unlock sequentially
- Lessons unlock sequentially within units
- Lesson requires min accuracy to pass (60%)
- Unit completion awards bonus XP

---

## 🎯 Business Case 5: User Progress & Gamification

### Database Tables
- `user_progress` - Overall progress per path
- `lesson_completions` - Historical completions
- `xp_transactions` - XP audit trail
- `hearts_transactions` - Hearts audit trail

### Features

#### 5.1 XP (Experience Points) System ✅
**Current Status:** DDD domain complete, not integrated
- **DDD Domain:** ✅ XP value object, XPCalculationService
- **Tasks:**
  - [x] XP value object
  - [x] XPCalculationService
  - [ ] AwardXPUseCase
  - [ ] GetXPHistoryUseCase
  - [ ] GetXPLeaderboardUseCase (per path, per group)
  - [ ] CalculateLevelUseCase (level = XP / 100)
  - [ ] Add XP visualization in UI
  - [ ] Add level-up animations

#### 5.2 Hearts System ✅
**Current Status:** DDD domain complete, not integrated
- **DDD Domain:** ✅ Hearts value object, HeartRefillService
- **Tasks:**
  - [x] Hearts value object
  - [x] HeartRefillService
  - [ ] DeductHeartUseCase
  - [ ] RefillHeartsUseCase
  - [ ] PurchaseHeartsUseCase (with XP)
  - [ ] GetHeartStatusUseCase (time until refill)
  - [ ] Add hearts display in UI header
  - [ ] Add hearts purchase modal

#### 5.3 Streak System ✅
**Current Status:** DDD domain complete, not integrated
- **DDD Domain:** ✅ Streak value object
- **Tasks:**
  - [x] Streak value object
  - [ ] UpdateStreakUseCase (daily check)
  - [ ] BreakStreakUseCase
  - [ ] GetStreakHistoryUseCase
  - [ ] AwardStreakBonusUseCase (3, 7, 14, 30, 100 days)
  - [ ] Add streak display in UI
  - [ ] Add streak milestone notifications
  - [ ] Add streak freeze (premium feature)

#### 5.4 Progress Dashboard 🔴
**Current Status:** Page exists, needs enhancement
- **Pages:** `/progress` (exists)
- **DDD Domain:** Ready
- **Tasks:**
  - [ ] GetOverallProgressUseCase
  - [ ] GetRecentActivityUseCase
  - [ ] GetAchievementsUseCase
  - [ ] GetLearningGoalsUseCase
  - [ ] Build comprehensive dashboard
  - [ ] Add progress charts (daily XP, accuracy trends)
  - [ ] Add calendar heatmap (activity)

#### 5.5 Lesson Completion History 🔴
**Current Status:** Database ready, UI basic
- **DDD Domain:** Needs LessonCompletion entity
- **Tasks:**
  - [ ] RecordLessonCompletionUseCase
  - [ ] GetLessonCompletionHistoryUseCase
  - [ ] GetBestScoreForLessonUseCase
  - [ ] GetRetryCountUseCase
  - [ ] Add completion certificate generation
  - [ ] Add "share score" feature

**Business Rules:**
- Max 5 hearts
- Hearts refill: 1 per 4 hours, or full refill after 24 hours
- XP awarded for: lesson completion, accuracy bonus, perfect score, streak milestones
- Streak breaks if no activity for 24 hours
- Level = Total XP / 100

---

## 🎯 Business Case 6: Group Learning

### Database Tables
- `groups` - Learning groups
- `group_members` - Membership
- `group_paths` - Assigned paths
- `group_path_visibility` - Path visibility per group

### Features

#### 6.1 Group Management 🔴
**Current Status:** Basic CRUD API exists
- **API:** `/api/groups` (exists)
- **Pages:** `/groups` (exists)
- **DDD Domain:** 🔴 Not modeled
- **Tasks:**
  - [ ] Create Group entity (aggregate root)
  - [ ] Create GroupRepository
  - [ ] CreateGroupUseCase
  - [ ] UpdateGroupUseCase
  - [ ] DeleteGroupUseCase
  - [ ] ListGroupsUseCase
  - [ ] GetGroupDetailsUseCase
  - [ ] Build group creation wizard
  - [ ] Build group dashboard

#### 6.2 Group Membership 🔴
**Current Status:** API exists
- **API:** `/api/groups/[id]/members` (exists)
- **DDD Domain:** Needs GroupMember entity
- **Tasks:**
  - [ ] Create GroupMember entity
  - [ ] AddMemberToGroupUseCase
  - [ ] RemoveMemberFromGroupUseCase
  - [ ] PromoteMemberToAdminUseCase
  - [ ] DemoteAdminToMemberUseCase
  - [ ] ListGroupMembersUseCase
  - [ ] Build member management UI

#### 6.3 Group Path Assignment 🔴
**Current Status:** API exists
- **API:** `/api/groups/[id]/paths` (exists)
- **DDD Domain:** Needs GroupPath entity
- **Tasks:**
  - [ ] AssignPathToGroupUseCase
  - [ ] UnassignPathFromGroupUseCase
  - [ ] SetPathVisibilityUseCase
  - [ ] ListGroupPathsUseCase
  - [ ] Build path assignment UI
  - [ ] Add bulk path assignment

#### 6.4 Group Analytics 🔴
**Current Status:** API exists
- **API:** `/api/groups/[id]/analytics` (exists)
- **DDD Domain:** Needs AnalyticsService
- **Tasks:**
  - [ ] GetGroupAnalyticsUseCase
  - [ ] GetMemberProgressUseCase
  - [ ] GetGroupLeaderboardUseCase
  - [ ] GetGroupActivityUseCase
  - [ ] Build analytics dashboard
  - [ ] Export analytics reports

#### 6.5 Group Leaderboard 🔴
**Current Status:** API exists
- **API:** `/api/groups/[id]/leaderboard` (exists)
- **DDD Domain:** Needs LeaderboardService
- **Tasks:**
  - [ ] GetLeaderboardUseCase (by XP, by completion, by accuracy)
  - [ ] GetUserRankUseCase
  - [ ] GetTopPerformersUseCase
  - [ ] Build leaderboard UI
  - [ ] Add leaderboard filters (weekly, monthly, all-time)

**Business Rules:**
- Group creator is automatically admin
- Only admins can assign paths, manage members
- Groups can have multiple admins
- Removing last admin requires designating new admin first
- Group deletion removes all member associations

---

## 🎯 Business Case 7: Invitations

### Database Tables
- `group_invitations` - Invitation records
- `invitation_paths` - Paths to assign on acceptance

### Features

#### 7.1 Send Invitation 🔴
**Current Status:** API exists
- **API:** `/api/groups/[id]/invitations` (exists)
- **DDD Domain:** Needs Invitation entity
- **Tasks:**
  - [ ] Create Invitation entity (aggregate root)
  - [ ] Create InvitationRepository
  - [ ] SendInvitationUseCase
  - [ ] SendBulkInvitationsUseCase
  - [ ] GenerateInvitationTokenUseCase
  - [ ] Build invitation form UI
  - [ ] Add email template for invitations

#### 7.2 Accept/Decline Invitation 🔴
**Current Status:** API exists
- **API:** `/api/invitations/me` (exists)
- **Pages:** `/invitations` (exists)
- **DDD Domain:** Needs invitation workflow
- **Tasks:**
  - [ ] AcceptInvitationUseCase (adds user to group, assigns paths)
  - [ ] DeclineInvitationUseCase
  - [ ] GetPendingInvitationsUseCase
  - [ ] Build invitation acceptance page
  - [ ] Add notification for new invitations

#### 7.3 Invitation Management 🔴
**Current Status:** Basic API
- **DDD Domain:** Needs invitation lifecycle
- **Tasks:**
  - [ ] CancelInvitationUseCase
  - [ ] ResendInvitationUseCase
  - [ ] ExpireInvitationUseCase (background job)
  - [ ] ListSentInvitationsUseCase
  - [ ] Build invitation management UI (admin)

#### 7.4 Invitation with Paths 🔴
**Current Status:** Database ready
- **DDD Domain:** Needs PathAssignmentService
- **Tasks:**
  - [ ] AssignPathsToInvitationUseCase
  - [ ] AutoAssignPathsOnAcceptanceUseCase
  - [ ] Build path selection in invitation flow

**Business Rules:**
- Invitation expires after 7 days
- One invitation per email per group
- Accepting invitation auto-assigns specified paths
- Can't invite existing group members
- Email must be valid format

---

## 🎯 Business Case 8: Admin Panel

### Features

#### 8.1 User Management 🔴
**Current Status:** API exists
- **API:** `/api/admin/users` (exists)
- **Pages:** `/admin` (exists but minimal)
- **DDD Domain:** Needs AdminService
- **Tasks:**
  - [ ] ListAllUsersUseCase
  - [ ] SearchUsersUseCase
  - [ ] UpdateUserRoleUseCase
  - [ ] UpdateUserSubscriptionUseCase
  - [ ] DeactivateUserUseCase
  - [ ] DeleteUserUseCase
  - [ ] Build user management table
  - [ ] Add user detail modal

#### 8.2 Content Moderation 🔴
**Current Status:** Not implemented
- **DDD Domain:** Needs ModerationService
- **Tasks:**
  - [ ] FlagContentUseCase
  - [ ] ReviewFlaggedContentUseCase
  - [ ] DeleteInappropriateContentUseCase
  - [ ] Build content moderation queue
  - [ ] Add reporting system for users

#### 8.3 Path Approval System 🔴
**Current Status:** API exists
- **API:** `/api/admin/paths/[id]/approvals` (exists)
- **DDD Domain:** Needs PathApprovalService
- **Tasks:**
  - [ ] GetPendingPathApprovalsUseCase
  - [ ] ApprovePathRequestUseCase
  - [ ] RejectPathRequestUseCase
  - [ ] Build approval queue UI

#### 8.4 System Statistics 🔴
**Current Status:** API exists
- **API:** `/api/admin/stats` (exists)
- **DDD Domain:** Needs StatisticsService
- **Tasks:**
  - [ ] GetSystemStatsUseCase
  - [ ] GetUserStatsUseCase
  - [ ] GetContentStatsUseCase
  - [ ] GetUsageStatsUseCase
  - [ ] Build admin dashboard
  - [ ] Add real-time monitoring

#### 8.5 Data Export/Import 🔴
**Current Status:** Not implemented
- **DDD Domain:** Needs DataMigrationService
- **Tasks:**
  - [ ] ExportAllDataUseCase
  - [ ] ImportDataUseCase
  - [ ] BackupDatabaseUseCase
  - [ ] RestoreDatabaseUseCase
  - [ ] Build backup/restore UI

**Business Rules:**
- Only users with role='admin' can access admin panel
- Path approvals require admin action
- User deactivation prevents login but preserves data
- User deletion is permanent and cascades

---

## 🎯 Business Case 9: Analytics & Reporting

### Database Tables
- `user_activity_log` - Activity tracking

### Features

#### 9.1 User Activity Tracking 🔴
**Current Status:** Table exists, not utilized
- **DDD Domain:** Needs ActivityTrackingService
- **Tasks:**
  - [ ] LogActivityUseCase
  - [ ] GetUserActivityUseCase
  - [ ] GetActivityTimelineUseCase
  - [ ] AnalyzeActivityPatternsUseCase
  - [ ] Build activity feed UI

#### 9.2 Learning Analytics 🔴
**Current Status:** Not implemented
- **DDD Domain:** Needs LearningAnalyticsService
- **Tasks:**
  - [ ] CalculateLearningVelocityUseCase
  - [ ] IdentifyKnowledgeGapsUseCase
  - [ ] PredictCardDifficultyUseCase
  - [ ] RecommendNextLessonsUseCase
  - [ ] Build analytics insights page

#### 9.3 Performance Reports 🔴
**Current Status:** Not implemented
- **DDD Domain:** Needs ReportingService
- **Tasks:**
  - [ ] GenerateProgressReportUseCase
  - [ ] GenerateGroupReportUseCase
  - [ ] ScheduleRecurringReportsUseCase
  - [ ] ExportReportToPDFUseCase
  - [ ] Build report generator UI

#### 9.4 A/B Testing & Experiments 🔴
**Current Status:** Not implemented
- **DDD Domain:** Needs ExperimentService
- **Tasks:**
  - [ ] CreateExperimentUseCase
  - [ ] AssignUserToVariantUseCase
  - [ ] TrackExperimentMetricsUseCase
  - [ ] AnalyzeExperimentResultsUseCase
  - [ ] Build experiment dashboard (admin)

**Business Rules:**
- Activity logged for: login, lesson start, lesson complete, review, group join
- Analytics data retained for 2 years
- Reports can be scheduled (daily, weekly, monthly)
- Personal data in reports follows GDPR compliance

---

## 🧹 Code Cleanup Plan

After implementing each business case, follow this cleanup process:

### Cleanup Checklist (Per Business Case)

#### Phase 1: Remove Old Code
- [ ] Identify old service files in `src/lib/services/`
- [ ] Verify no API routes still use old services
- [ ] Delete old service files
- [ ] Remove old type definitions from `src/lib/types.ts`
- [ ] Remove unused imports

#### Phase 2: Consolidate DDD Structure
- [ ] Ensure all domain logic in `src/domains/`
- [ ] Ensure all use cases in `src/application/use-cases/`
- [ ] Ensure all Server Actions in `src/presentation/actions/`
- [ ] Ensure all repositories in `src/infrastructure/repositories/`
- [ ] Remove any duplicated logic

#### Phase 3: Update Documentation
- [ ] Update API documentation (if using Swagger/OpenAPI)
- [ ] Update README with new architecture
- [ ] Update component documentation
- [ ] Add inline code comments where complex
- [ ] Update type definitions

#### Phase 4: Code Quality
- [ ] Run TypeScript compiler (`tsc --noEmit`)
- [ ] Run ESLint and fix warnings
- [ ] Format code with Prettier
- [ ] Remove console.logs (except intentional logging)
- [ ] Remove commented-out code
- [ ] Remove unused dependencies from package.json

#### Phase 5: Testing
- [ ] Write unit tests for domain entities
- [ ] Write unit tests for value objects
- [ ] Write integration tests for use cases
- [ ] Write E2E tests for critical flows
- [ ] Verify all tests pass

#### Phase 6: Performance
- [ ] Add database indexes where needed
- [ ] Optimize N+1 queries
- [ ] Add caching where appropriate
- [ ] Lazy load heavy components
- [ ] Optimize bundle size

### Files to Remove After Migration

```bash
# Old service layer (after use cases are complete)
src/lib/services/domain-service.ts
src/lib/services/category-service.ts
src/lib/services/flashcard-service.ts
src/lib/services/review-service.ts

# Old types (after domain entities are used everywhere)
# Keep types.ts but remove anemic interfaces that are now entities
src/lib/types.ts (cleanup, don't delete)

# Old API utils (if replaced)
# Only if you create better alternatives in infrastructure layer
```

### Documentation to Update

```bash
# Core documentation
README.md
DOMAIN_DRIVEN_DESIGN_MODEL.md
DDD_IMPLEMENTATION_STATUS.md
IMPLEMENTATION_PLAN.md (mark as deprecated, point to .specs/)

# New documentation
.specs/BUSINESS_CASES.md (this file)
.specs/DDD_MIGRATION_PLAN.md
.specs/CODE_TEMPLATES.md
```

---

## 📊 Implementation Priority Matrix

### Phase 1: Core Learning Flow (HIGH PRIORITY)
**Goal:** Users can learn effectively
```
1. Content Management (Domains, Categories, Flashcards)
2. Review System (Spaced Repetition)
3. User Progress (XP, Hearts, Streaks)
4. Learning Paths (Path playing, Lesson playing)
```

### Phase 2: Collaboration (MEDIUM PRIORITY)
**Goal:** Groups can learn together
```
5. Group Management
6. Invitations
7. Group Analytics
```

### Phase 3: Administration (MEDIUM PRIORITY)
**Goal:** Admins can manage platform
```
8. Admin Panel
9. Path Approval System
10. User Management
```

### Phase 4: Intelligence (LOW PRIORITY)
**Goal:** Platform learns and optimizes
```
11. Analytics & Reporting
12. Learning Analytics
13. A/B Testing
```

---

## 🎯 Next Steps

### Immediate Actions (Pick One)

1. **Complete Core Learning Path:**
   - Finish use cases for lessons (Start, Submit, Complete)
   - Implement lesson playing UI with DDD aggregates
   - Add lesson completion flow with XP rewards

2. **Complete Content Management:**
   - Finish all CRUD use cases for domains/categories/flashcards
   - Create Server Actions for all operations
   - Update API routes to use use cases
   - Remove old service layer

3. **Complete Review System:**
   - Implement all review use cases
   - Build review session with DDD aggregates
   - Add struggling cards workflow
   - Create review dashboard

### Long-term Roadmap

**Sprint 1-2:** Core Learning (Lessons + Review)
**Sprint 3-4:** Content Management + Progress
**Sprint 5-6:** Groups + Invitations
**Sprint 7-8:** Admin Panel + Analytics
**Sprint 9:** Polish + Performance
**Sprint 10:** Testing + Documentation

---

## 📝 Progress Tracking

Update this section as you complete features:

### Completed Business Cases
- [ ] BC1: Authentication ✅/🟡/🔴
- [ ] BC2: Content Management ✅/🟡/🔴
- [ ] BC3: Review System ✅/🟡/🔴
- [ ] BC4: Learning Paths ✅/🟡/🔴
- [ ] BC5: User Progress ✅/🟡/🔴
- [ ] BC6: Group Learning ✅/🟡/🔴
- [ ] BC7: Invitations ✅/🟡/🔴
- [ ] BC8: Admin Panel ✅/🟡/🔴
- [ ] BC9: Analytics ✅/🟡/🔴

### Code Cleanup Status
- [ ] Old services removed
- [ ] DDD structure consolidated
- [ ] Documentation updated
- [ ] Tests written
- [ ] Performance optimized

---

**Remember:** Focus on one business case at a time. Complete the full cycle (domain → application → presentation → integration → cleanup) before moving to the next.

This ensures each feature is production-ready and the codebase stays clean throughout the migration.
