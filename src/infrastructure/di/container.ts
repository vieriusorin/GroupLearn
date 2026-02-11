import { RegisterHandler } from "@/commands/handlers/auth/RegisterHandler";
import { BulkCreateFlashcardsHandler } from "@/commands/handlers/content/BulkCreateFlashcardsHandler";
import { CreateCategoryHandler } from "@/commands/handlers/content/CreateCategoryHandler";
import { CreateDomainHandler } from "@/commands/handlers/content/CreateDomainHandler";
import { CreateFlashcardHandler } from "@/commands/handlers/content/CreateFlashcardHandler";
import { DeleteCategoryHandler } from "@/commands/handlers/content/DeleteCategoryHandler";
import { DeleteDomainHandler } from "@/commands/handlers/content/DeleteDomainHandler";
import { DeleteFlashcardHandler } from "@/commands/handlers/content/DeleteFlashcardHandler";
import { UpdateCategoryHandler } from "@/commands/handlers/content/UpdateCategoryHandler";
import { UpdateDomainHandler } from "@/commands/handlers/content/UpdateDomainHandler";
import { UpdateFlashcardHandler } from "@/commands/handlers/content/UpdateFlashcardHandler";
import { AcceptInvitationHandler } from "@/commands/handlers/groups/AcceptInvitationHandler";
import { AssignPathHandler } from "@/commands/handlers/groups/AssignPathHandler";
import { CreateGroupHandler } from "@/commands/handlers/groups/CreateGroupHandler";
import { DeleteGroupHandler } from "@/commands/handlers/groups/DeleteGroupHandler";
import { RemoveMemberHandler } from "@/commands/handlers/groups/RemoveMemberHandler";
import { RemovePathHandler } from "@/commands/handlers/groups/RemovePathHandler";
import { RevokeInvitationHandler } from "@/commands/handlers/groups/RevokeInvitationHandler";
import { SendInvitationHandler } from "@/commands/handlers/groups/SendInvitationHandler";
import { TogglePathVisibilityHandler } from "@/commands/handlers/groups/TogglePathVisibilityHandler";
import { UpdateMemberRoleHandler } from "@/commands/handlers/groups/UpdateMemberRoleHandler";
import { CompleteLessonHandler } from "@/commands/handlers/lesson/CompleteLessonHandler";
import { StartLessonHandler } from "@/commands/handlers/lesson/StartLessonHandler";
import { SubmitAnswerHandler } from "@/commands/handlers/lesson/SubmitAnswerHandler";
import { ApprovePathAccessHandler } from "@/commands/handlers/paths/ApprovePathAccessHandler";
import { RevokePathAccessHandler } from "@/commands/handlers/paths/RevokePathAccessHandler";
import { CheckAndResetStreaksHandler } from "@/commands/handlers/progress/CheckAndResetStreaksHandler";
import { RefillHeartsHandler } from "@/commands/handlers/progress/RefillHeartsHandler";
import { UpdateStreakHandler } from "@/commands/handlers/progress/UpdateStreakHandler";
import { AddToStrugglingQueueHandler } from "@/commands/handlers/review/AddToStrugglingQueueHandler";
import { RemoveFromStrugglingQueueHandler } from "@/commands/handlers/review/RemoveFromStrugglingQueueHandler";
import { StartReviewSessionHandler } from "@/commands/handlers/review/StartReviewSessionHandler";
import { SubmitReviewHandler } from "@/commands/handlers/review/SubmitReviewHandler";
import { getDb } from "@/infrastructure/database/db";
import { DatabaseAIGeneratedContentRepository } from "@/infrastructure/repositories/ai/DatabaseAIGeneratedContentRepository";
import { DatabaseKnowledgeGapRepository } from "@/infrastructure/repositories/ai/DatabaseKnowledgeGapRepository";
import { DatabaseCategoryRepository } from "@/infrastructure/repositories/content/DatabaseCategoryRepository";
import { DatabaseDomainRepository } from "@/infrastructure/repositories/content/DatabaseDomainRepository";
import { DatabaseFlashcardRepository } from "@/infrastructure/repositories/content/DatabaseFlashcardRepository";
import { DatabaseUserProgressRepository } from "@/infrastructure/repositories/gamification/DatabaseUserProgressRepository";
import { DatabaseLessonCompletionRepository } from "@/infrastructure/repositories/lesson/DatabaseLessonCompletionRepository";
import { DatabaseLessonRepository } from "@/infrastructure/repositories/lesson/DatabaseLessonRepository";
import { InMemorySessionRepository } from "@/infrastructure/repositories/lesson/InMemorySessionRepository";
import { DatabaseReviewHistoryRepository } from "@/infrastructure/repositories/review/DatabaseReviewHistoryRepository";
import { GetAdminStatsHandler } from "@/queries/handlers/admin/GetAdminStatsHandler";
import { GetUserPathsHandler } from "@/queries/handlers/admin/GetUserPathsHandler";
import { GetUsersHandler } from "@/queries/handlers/admin/GetUsersHandler";
import { GetUserAuthDataHandler } from "@/queries/handlers/auth/GetUserAuthDataHandler";
import { GetCategoriesHandler } from "@/queries/handlers/content/GetCategoriesHandler";
import { GetCategoryByIdHandler } from "@/queries/handlers/content/GetCategoryByIdHandler";
import { GetDomainByIdHandler } from "@/queries/handlers/content/GetDomainByIdHandler";
import { GetDomainsHandler } from "@/queries/handlers/content/GetDomainsHandler";
import { GetFlashcardByIdHandler } from "@/queries/handlers/content/GetFlashcardByIdHandler";
import { GetFlashcardsHandler } from "@/queries/handlers/content/GetFlashcardsHandler";
import { GetAssignedPathsHandler } from "@/queries/handlers/groups/GetAssignedPathsHandler";
import { GetGroupAnalyticsHandler } from "@/queries/handlers/groups/GetGroupAnalyticsHandler";
import { GetGroupDetailHandler } from "@/queries/handlers/groups/GetGroupDetailHandler";
import { GetGroupLeaderboardHandler } from "@/queries/handlers/groups/GetGroupLeaderboardHandler";
import { GetGroupsHandler } from "@/queries/handlers/groups/GetGroupsHandler";
import { GetInvitationHandler } from "@/queries/handlers/groups/GetInvitationHandler";
import { GetMemberProgressHandler } from "@/queries/handlers/groups/GetMemberProgressHandler";
import { GetMyGroupsHandler } from "@/queries/handlers/groups/GetMyGroupsHandler";
import { GetLessonFlashcardsHandler } from "@/queries/handlers/lesson/GetLessonFlashcardsHandler";
import { GetLessonProgressHandler } from "@/queries/handlers/lesson/GetLessonProgressHandler";
import { GetLessonByIdHandler } from "@/queries/handlers/paths/GetLessonByIdHandler";
import { GetLessonsHandler } from "@/queries/handlers/paths/GetLessonsHandler";
import { GetNextLessonAfterCompletionHandler } from "@/queries/handlers/paths/GetNextLessonAfterCompletionHandler";
import { GetNextLessonHandler } from "@/queries/handlers/paths/GetNextLessonHandler";
import { GetPathByIdHandler } from "@/queries/handlers/paths/GetPathByIdHandler";
import { GetPathsHandler } from "@/queries/handlers/paths/GetPathsHandler";
import { GetUnitByIdHandler } from "@/queries/handlers/paths/GetUnitByIdHandler";
import { GetUnitsHandler } from "@/queries/handlers/paths/GetUnitsHandler";
import { IsLessonCompletedHandler } from "@/queries/handlers/paths/IsLessonCompletedHandler";
import { IsLessonUnlockedHandler } from "@/queries/handlers/paths/IsLessonUnlockedHandler";
import { IsPathCompletedHandler } from "@/queries/handlers/paths/IsPathCompletedHandler";
import { IsPathUnlockedHandler } from "@/queries/handlers/paths/IsPathUnlockedHandler";
import { IsUnitCompletedHandler } from "@/queries/handlers/paths/IsUnitCompletedHandler";
import { IsUnitUnlockedHandler } from "@/queries/handlers/paths/IsUnitUnlockedHandler";
import { GetConsecutiveDaysStreakHandler } from "@/queries/handlers/progress/GetConsecutiveDaysStreakHandler";
import { GetUserProgressHandler } from "@/queries/handlers/progress/GetUserProgressHandler";
import { GetCurrentStreakHandler } from "@/queries/handlers/review/GetCurrentStreakHandler";
import { GetDueCardsHandler } from "@/queries/handlers/review/GetDueCardsHandler";
import { GetDueFlashcardsLegacyHandler } from "@/queries/handlers/review/GetDueFlashcardsLegacyHandler";
import { GetFlashcardReviewHistoryHandler } from "@/queries/handlers/review/GetFlashcardReviewHistoryHandler";
import { GetLastReviewHandler } from "@/queries/handlers/review/GetLastReviewHandler";
import { GetStrugglingCardsHandler } from "@/queries/handlers/review/GetStrugglingCardsHandler";
import { GetTodayReviewCountHandler } from "@/queries/handlers/review/GetTodayReviewCountHandler";
import { IsCardStrugglingHandler } from "@/queries/handlers/review/IsCardStrugglingHandler";
import { GetLeaderboardHandler } from "@/queries/handlers/stats/GetLeaderboardHandler";
import { GetStatsHandler } from "@/queries/handlers/stats/GetStatsHandler";
import { GetUserStatsHandler } from "@/queries/handlers/stats/GetUserStatsHandler";
import { GetXPHistoryHandler } from "@/queries/handlers/stats/GetXPHistoryHandler";

class Container {
  private static instance: Container;
  private db = getDb();

  public readonly repositories = {
    domain: new DatabaseDomainRepository(this.db),
    category: new DatabaseCategoryRepository(this.db),
    flashcard: new DatabaseFlashcardRepository(this.db),
    lesson: new DatabaseLessonRepository(this.db),
    lessonCompletion: new DatabaseLessonCompletionRepository(this.db),
    session: new InMemorySessionRepository(),
    userProgress: new DatabaseUserProgressRepository(this.db),
    reviewHistory: new DatabaseReviewHistoryRepository(this.db),
    aiGeneratedContent: new DatabaseAIGeneratedContentRepository(),
    knowledgeGap: new DatabaseKnowledgeGapRepository(),
  };

  // Command handlers
  public readonly commandHandlers = {
    content: {
      createDomain: new CreateDomainHandler(this.repositories.domain),
      updateDomain: new UpdateDomainHandler(this.repositories.domain),
      deleteDomain: new DeleteDomainHandler(
        this.repositories.domain,
        this.repositories.category,
      ),
      createCategory: new CreateCategoryHandler(
        this.repositories.category,
        this.repositories.domain,
      ),
      updateCategory: new UpdateCategoryHandler(this.repositories.category),
      deleteCategory: new DeleteCategoryHandler(
        this.repositories.category,
        this.repositories.flashcard,
      ),
      createFlashcard: new CreateFlashcardHandler(
        this.repositories.flashcard,
        this.repositories.category,
      ),
      updateFlashcard: new UpdateFlashcardHandler(this.repositories.flashcard),
      deleteFlashcard: new DeleteFlashcardHandler(this.repositories.flashcard),
      bulkCreateFlashcards: new BulkCreateFlashcardsHandler(
        this.repositories.flashcard,
        this.repositories.category,
      ),
    },
    lesson: {
      startLesson: new StartLessonHandler(
        this.repositories.lesson,
        this.repositories.session,
        this.repositories.userProgress,
      ),
      submitAnswer: new SubmitAnswerHandler(
        this.repositories.session,
        this.repositories.lesson,
      ),
      completeLesson: new CompleteLessonHandler(
        this.repositories.session,
        this.repositories.lessonCompletion,
        this.repositories.userProgress,
      ),
    },
    review: {
      startReviewSession: new StartReviewSessionHandler(
        this.repositories.reviewHistory,
        this.repositories.flashcard,
      ),
      submitReview: new SubmitReviewHandler(this.repositories.reviewHistory),
      addToStrugglingQueue: new AddToStrugglingQueueHandler(),
      removeFromStrugglingQueue: new RemoveFromStrugglingQueueHandler(),
    },
    progress: {
      checkAndResetStreaks: new CheckAndResetStreaksHandler(
        new GetConsecutiveDaysStreakHandler(),
      ),
      updateStreak: new UpdateStreakHandler(this.repositories.userProgress),
      refillHearts: new RefillHeartsHandler(this.repositories.userProgress),
    },
    auth: {
      register: new RegisterHandler(),
    },
    paths: {
      approvePathAccess: new ApprovePathAccessHandler(),
      revokePathAccess: new RevokePathAccessHandler(),
    },
    groups: {
      createGroup: new CreateGroupHandler(),
      deleteGroup: new DeleteGroupHandler(),
      sendInvitation: new SendInvitationHandler(),
      revokeInvitation: new RevokeInvitationHandler(),
      acceptInvitation: new AcceptInvitationHandler(),
      assignPath: new AssignPathHandler(),
      removePath: new RemovePathHandler(),
      togglePathVisibility: new TogglePathVisibilityHandler(),
      updateMemberRole: new UpdateMemberRoleHandler(),
      removeMember: new RemoveMemberHandler(),
    },
  };

  // Query handlers
  public readonly queryHandlers = {
    content: {
      getDomains: new GetDomainsHandler(this.repositories.domain),
      getDomainById: new GetDomainByIdHandler(this.repositories.domain),
      getCategories: new GetCategoriesHandler(this.repositories.category),
      getCategoryById: new GetCategoryByIdHandler(this.repositories.category),
      getFlashcards: new GetFlashcardsHandler(this.repositories.flashcard),
      getFlashcardById: new GetFlashcardByIdHandler(
        this.repositories.flashcard,
      ),
    },
    lesson: {
      getLessonFlashcards: new GetLessonFlashcardsHandler(
        this.repositories.lesson,
      ),
      getLessonProgress: new GetLessonProgressHandler(
        this.repositories.lesson,
        this.repositories.lessonCompletion,
        this.repositories.userProgress,
      ),
    },
    review: {
      getDueCards: new GetDueCardsHandler(
        this.repositories.reviewHistory,
        this.repositories.flashcard,
      ),
      getStrugglingCards: new GetStrugglingCardsHandler(),
      getFlashcardReviewHistory: new GetFlashcardReviewHistoryHandler(),
      getLastReview: new GetLastReviewHandler(),
      isCardStruggling: new IsCardStrugglingHandler(),
      getDueFlashcardsLegacy: new GetDueFlashcardsLegacyHandler(),
      getTodayReviewCount: new GetTodayReviewCountHandler(),
      getCurrentStreak: new GetCurrentStreakHandler(),
    },
    progress: {
      getConsecutiveDaysStreak: new GetConsecutiveDaysStreakHandler(),
      getUserProgress: new GetUserProgressHandler(
        this.repositories.userProgress,
      ),
    },
    admin: {
      getAdminStats: new GetAdminStatsHandler(),
      getUsers: new GetUsersHandler(),
      getUserPaths: new GetUserPathsHandler(),
    },
    stats: {
      getStats: new GetStatsHandler(),
      getLeaderboard: new GetLeaderboardHandler(),
      getXPHistory: new GetXPHistoryHandler(),
      getUserStats: new GetUserStatsHandler(),
    },
    paths: {
      getPaths: new GetPathsHandler(),
      // Unlock system queries - order matters due to dependencies
      isLessonCompleted: new IsLessonCompletedHandler(),
      isUnitCompleted: new IsUnitCompletedHandler(),
      isPathCompleted: new IsPathCompletedHandler(new IsUnitCompletedHandler()),
      isLessonUnlocked: new IsLessonUnlockedHandler(
        new IsLessonCompletedHandler(),
        new IsUnitCompletedHandler(),
      ),
      isUnitUnlocked: new IsUnitUnlockedHandler(new IsUnitCompletedHandler()),
      isPathUnlocked: new IsPathUnlockedHandler(
        new IsPathCompletedHandler(new IsUnitCompletedHandler()),
      ),
      getNextLesson: new GetNextLessonHandler(
        new IsLessonCompletedHandler(),
        new IsLessonUnlockedHandler(
          new IsLessonCompletedHandler(),
          new IsUnitCompletedHandler(),
        ),
      ),
      getNextLessonAfterCompletion: new GetNextLessonAfterCompletionHandler(),
      // Handlers that depend on unlock system queries
      getUnits: new GetUnitsHandler(
        new IsUnitUnlockedHandler(new IsUnitCompletedHandler()),
      ),
      getLessons: new GetLessonsHandler(
        new IsLessonCompletedHandler(),
        new IsLessonUnlockedHandler(
          new IsLessonCompletedHandler(),
          new IsUnitCompletedHandler(),
        ),
      ),
      getPathById: new GetPathByIdHandler(),
      getUnitById: new GetUnitByIdHandler(),
      getLessonById: new GetLessonByIdHandler(),
    },
    groups: {
      getGroups: new GetGroupsHandler(),
      getMyGroups: new GetMyGroupsHandler(),
      getGroupDetail: new GetGroupDetailHandler(),
      getGroupAnalytics: new GetGroupAnalyticsHandler(),
      getGroupLeaderboard: new GetGroupLeaderboardHandler(),
      getAssignedPaths: new GetAssignedPathsHandler(),
      getMemberProgress: new GetMemberProgressHandler(),
      getInvitation: new GetInvitationHandler(),
    },
    auth: {
      getUserAuthData: new GetUserAuthDataHandler(),
    },
  };

  private constructor() {}

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }
}

export const container = Container.getInstance();
export const repositories = container.repositories;
export const commandHandlers = container.commandHandlers;
export const queryHandlers = container.queryHandlers;
