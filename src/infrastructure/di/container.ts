import { getDb } from "@/infrastructure/database/db";
import { SqliteCategoryRepository } from "@/infrastructure/repositories/content/SqliteCategoryRepository";
import { SqliteDomainRepository } from "@/infrastructure/repositories/content/SqliteDomainRepository";
import { SqliteFlashcardRepository } from "@/infrastructure/repositories/content/SqliteFlashcardRepository";
import { SqliteUserProgressRepository } from "@/infrastructure/repositories/gamification/SqliteUserProgressRepository";
import { InMemorySessionRepository } from "@/infrastructure/repositories/lesson/InMemorySessionRepository";
import { SqliteLessonCompletionRepository } from "@/infrastructure/repositories/lesson/SqliteLessonCompletionRepository";
import { SqliteLessonRepository } from "@/infrastructure/repositories/lesson/SqliteLessonRepository";
import { SqliteReviewHistoryRepository } from "@/infrastructure/repositories/review/SqliteReviewHistoryRepository";

/**
 * Dependency Injection Container
 *
 * Singleton pattern for repositories and services.
 * Provides centralized access to infrastructure dependencies.
 */
class Container {
  private static instance: Container;
  private db = getDb();

  // Repositories
  public readonly repositories = {
    // Content repositories
    domain: new SqliteDomainRepository(this.db),
    category: new SqliteCategoryRepository(this.db),
    flashcard: new SqliteFlashcardRepository(this.db),

    // Learning path repositories
    lesson: new SqliteLessonRepository(this.db),
    lessonCompletion: new SqliteLessonCompletionRepository(this.db),
    session: new InMemorySessionRepository(),

    // Gamification repositories
    userProgress: new SqliteUserProgressRepository(this.db),

    // Review repositories
    reviewHistory: new SqliteReviewHistoryRepository(this.db),
  };

  // Use Cases (optional - can instantiate in Server Actions instead)
  // Uncomment and add use cases here if you want to pre-instantiate them
  // public readonly useCases = {
  //   // Example:
  //   // completeLesson: new CompleteLessonUseCase(
  //   //   this.repositories.lessonCompletion,
  //   //   this.repositories.userProgress
  //   // ),
  // };

  private constructor() {}

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }
}

// Export singleton instance
export const container = Container.getInstance();
export const repositories = container.repositories;
// export const useCases = container.useCases; // Uncomment if using pre-instantiated use cases
