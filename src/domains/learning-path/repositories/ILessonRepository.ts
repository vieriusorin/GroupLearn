import type { Flashcard } from "@/domains/content/entities/Flashcard";
import type { LessonId, UnitId } from "@/domains/shared/types/branded-types";

/**
 * Simple lesson data structure (not a domain entity yet)
 */
export interface LessonData {
  id: number;
  unitId: number;
  name: string;
  description: string | null;
  orderIndex: number;
  xpReward: number;
  flashcardCount: number;
  createdAt: Date;
}

/**
 * Repository interface for lesson data access
 *
 * Note: Lessons are not yet domain entities, so this repository
 * works with simple data structures. In the future, this should
 * be replaced with a proper Lesson entity.
 */
export interface ILessonRepository {
  /**
   * Find lesson by ID
   */
  findById(id: LessonId): Promise<LessonData | null>;

  /**
   * Find all lessons in a unit
   */
  findByUnit(unitId: UnitId): Promise<LessonData[]>;

  /**
   * Find flashcards for a lesson
   */
  findFlashcardsForLesson(lessonId: LessonId): Promise<Flashcard[]>;
}
