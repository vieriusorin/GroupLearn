import type { DifficultyLevelType } from "@/infrastructure/database/schema";
import {
  createFlashcard as dbCreateFlashcard,
  deleteFlashcard as dbDeleteFlashcard,
  updateFlashcard as dbUpdateFlashcard,
  getCategoryById,
  getFlashcardById,
  getFlashcardReviewHistory,
  getFlashcardsByCategory,
  getLastReview,
} from "../db-operations";
import type { Flashcard, ReviewHistory } from "../types";

/**
 * Flashcard Service
 * Handles business logic for flashcard management
 */
export class FlashcardService {
  /**
   * Get all flashcards for a category with pagination
   * @throws Error if category not found
   */
  static async getByCategory(
    categoryId: number,
    page?: number,
    limit?: number,
  ): Promise<
    | { data: Flashcard[]; total: number; page: number; limit: number }
    | Flashcard[]
  > {
    // Verify category exists
    const category = await getCategoryById(categoryId);
    if (!category) {
      throw new Error(`Category with ID ${categoryId} not found`);
    }

    const allFlashcards = await getFlashcardsByCategory(categoryId);

    // If no pagination params, return all flashcards (backward compatible)
    if (page === undefined || limit === undefined) {
      return allFlashcards;
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedData = allFlashcards.slice(offset, offset + limit);

    return {
      data: paginatedData,
      total: allFlashcards.length,
      page,
      limit,
    };
  }

  /**
   * Get a flashcard by ID
   * @throws Error if flashcard not found
   */
  static async getById(id: number): Promise<Flashcard> {
    const flashcard = await getFlashcardById(id);
    if (!flashcard) {
      throw new Error(`Flashcard with ID ${id} not found`);
    }
    return flashcard;
  }

  /**
   * Create a new flashcard
   * @throws Error if validation fails
   */
  static async create(
    categoryId: number,
    question: string,
    answer: string,
    difficulty: DifficultyLevelType = "medium",
  ): Promise<Flashcard> {
    // Verify category exists
    const category = await getCategoryById(categoryId);
    if (!category) {
      throw new Error(`Category with ID ${categoryId} not found`);
    }

    // Business logic: validate question
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      throw new Error("Question cannot be empty");
    }
    if (trimmedQuestion.length > 1000) {
      throw new Error("Question cannot exceed 1000 characters");
    }

    // Business logic: validate answer
    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer) {
      throw new Error("Answer cannot be empty");
    }
    if (trimmedAnswer.length > 2000) {
      throw new Error("Answer cannot exceed 2000 characters");
    }

    // Business logic: validate difficulty
    const validDifficulties = ["easy", "medium", "hard"];
    if (!validDifficulties.includes(difficulty)) {
      throw new Error("Difficulty must be easy, medium, or hard");
    }

    return dbCreateFlashcard(
      categoryId,
      trimmedQuestion,
      trimmedAnswer,
      difficulty,
    );
  }

  /**
   * Update an existing flashcard
   * @throws Error if flashcard not found or validation fails
   */
  static async update(
    id: number,
    question: string,
    answer: string,
    difficulty: DifficultyLevelType,
  ): Promise<Flashcard> {
    // Verify flashcard exists
    const _existing = await FlashcardService.getById(id);

    // Business logic: validate question
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      throw new Error("Question cannot be empty");
    }
    if (trimmedQuestion.length > 1000) {
      throw new Error("Question cannot exceed 1000 characters");
    }

    // Business logic: validate answer
    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer) {
      throw new Error("Answer cannot be empty");
    }
    if (trimmedAnswer.length > 2000) {
      throw new Error("Answer cannot exceed 2000 characters");
    }

    // Business logic: validate difficulty
    const validDifficulties = ["easy", "medium", "hard"];
    if (!validDifficulties.includes(difficulty)) {
      throw new Error("Difficulty must be easy, medium, or hard");
    }

    await dbUpdateFlashcard(id, trimmedQuestion, trimmedAnswer, difficulty);
    return FlashcardService.getById(id);
  }

  /**
   * Delete a flashcard
   */
  static async delete(id: number): Promise<void> {
    // Verify flashcard exists
    await FlashcardService.getById(id);

    // Note: Review history will be cascade deleted by database
    await dbDeleteFlashcard(id);
  }

  /**
   * Get review history for a flashcard
   */
  static async getReviewHistory(id: number): Promise<ReviewHistory[]> {
    // Verify flashcard exists
    await FlashcardService.getById(id);
    return getFlashcardReviewHistory(id);
  }

  /**
   * Get the last review for a flashcard
   */
  static async getLastReview(id: number): Promise<ReviewHistory | undefined> {
    // Verify flashcard exists
    await FlashcardService.getById(id);
    return getLastReview(id);
  }

  /**
   * Check if a flashcard is due for review
   */
  static async isDue(id: number): Promise<boolean> {
    const lastReview = await FlashcardService.getLastReview(id);
    if (!lastReview) {
      return true; // Never reviewed, so it's due
    }

    const today = new Date().toISOString().split("T")[0];
    return lastReview.next_review_date <= today;
  }

  /**
   * Get mastery level for a flashcard
   */
  static async getMasteryLevel(
    id: number,
  ): Promise<"new" | "learning" | "mastered"> {
    const history = await FlashcardService.getReviewHistory(id);

    if (history.length === 0) {
      return "new";
    }

    // Calculate success rate from last 5 reviews
    const recentReviews = history.slice(0, 5);
    const successCount = recentReviews.filter((r) => r.is_correct).length;
    const successRate = successCount / recentReviews.length;

    if (successRate >= 0.8 && history.length >= 3) {
      return "mastered";
    }

    return "learning";
  }
}
