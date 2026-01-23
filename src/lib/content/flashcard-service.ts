import {
  createFlashcardCommand,
  deleteFlashcardCommand,
  updateFlashcardCommand,
} from "@/commands";
import type {
  DifficultyLevelType,
  Flashcard,
  ReviewHistory,
} from "@/infrastructure/database/schema";
import { commandHandlers, queryHandlers } from "@/infrastructure/di/container";
import {
  getCategoryByIdQuery,
  getFlashcardByIdQuery,
  getFlashcardReviewHistoryQuery,
  getFlashcardsQuery,
  getLastReviewQuery,
} from "@/queries";

export class FlashcardService {
  static async getByCategory(
    categoryId: number,
    page?: number,
    limit?: number,
  ): Promise<
    | { data: Flashcard[]; total: number; page: number; limit: number }
    | Flashcard[]
  > {
    const categoryQuery = getCategoryByIdQuery(categoryId);
    const category =
      await queryHandlers.content.getCategoryById.execute(categoryQuery);
    if (!category) {
      throw new Error(`Category with ID ${categoryId} not found`);
    }

    const flashcardsQuery = getFlashcardsQuery(
      categoryId,
      page ?? 1,
      limit ?? 20,
    );
    const flashcardsResult =
      await queryHandlers.content.getFlashcards.execute(flashcardsQuery);
    const allFlashcards = flashcardsResult.flashcards.map((card) => ({
      id: card.id,
      categoryId: card.categoryId,
      question: card.question,
      answer: card.answer,
      difficulty: card.difficulty,
      computedDifficulty: card.computedDifficulty,
      createdAt: new Date(card.createdAt),
      createdBy: null,
    })) as Flashcard[];

    if (page === undefined || limit === undefined) {
      return allFlashcards;
    }

    const offset = (page - 1) * limit;
    const paginatedData = allFlashcards.slice(offset, offset + limit);

    return {
      data: paginatedData,
      total: allFlashcards.length,
      page,
      limit,
    };
  }

  static async getById(id: number): Promise<Flashcard> {
    const query = getFlashcardByIdQuery(id);
    const flashcard =
      await queryHandlers.content.getFlashcardById.execute(query);
    if (!flashcard) {
      throw new Error(`Flashcard with ID ${id} not found`);
    }
    return flashcard;
  }

  static async create(
    userId: string,
    categoryId: number,
    question: string,
    answer: string,
    difficulty: DifficultyLevelType = "medium",
  ): Promise<Flashcard> {
    const categoryQuery = getCategoryByIdQuery(categoryId);
    const category =
      await queryHandlers.content.getCategoryById.execute(categoryQuery);
    if (!category) {
      throw new Error(`Category with ID ${categoryId} not found`);
    }

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      throw new Error("Question cannot be empty");
    }
    if (trimmedQuestion.length > 1000) {
      throw new Error("Question cannot exceed 1000 characters");
    }

    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer) {
      throw new Error("Answer cannot be empty");
    }
    if (trimmedAnswer.length > 2000) {
      throw new Error("Answer cannot exceed 2000 characters");
    }

    const validDifficulties = ["easy", "medium", "hard"];
    if (!validDifficulties.includes(difficulty)) {
      throw new Error("Difficulty must be easy, medium, or hard");
    }

    const command = createFlashcardCommand(
      userId,
      categoryId,
      trimmedQuestion,
      trimmedAnswer,
      difficulty,
    );
    const result =
      await commandHandlers.content.createFlashcard.execute(command);
    return {
      id: result.data.id,
      categoryId: result.data.categoryId,
      question: result.data.question,
      answer: result.data.answer,
      difficulty: result.data.difficulty,
      computedDifficulty: null,
      createdAt: new Date(result.data.createdAt),
      createdBy: null,
    } as Flashcard;
  }

  static async update(
    userId: string,
    id: number,
    question: string,
    answer: string,
    difficulty: DifficultyLevelType,
  ): Promise<Flashcard> {
    const _existing = await FlashcardService.getById(id);

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      throw new Error("Question cannot be empty");
    }
    if (trimmedQuestion.length > 1000) {
      throw new Error("Question cannot exceed 1000 characters");
    }

    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer) {
      throw new Error("Answer cannot be empty");
    }
    if (trimmedAnswer.length > 2000) {
      throw new Error("Answer cannot exceed 2000 characters");
    }

    const validDifficulties = ["easy", "medium", "hard"];
    if (!validDifficulties.includes(difficulty)) {
      throw new Error("Difficulty must be easy, medium, or hard");
    }

    const command = updateFlashcardCommand(
      userId,
      id,
      trimmedQuestion,
      trimmedAnswer,
      difficulty,
    );
    await commandHandlers.content.updateFlashcard.execute(command);
    return FlashcardService.getById(id);
  }

  static async delete(userId: string, id: number): Promise<void> {
    await FlashcardService.getById(id);

    const command = deleteFlashcardCommand(userId, id);
    await commandHandlers.content.deleteFlashcard.execute(command);
  }

  static async getReviewHistory(id: number): Promise<ReviewHistory[]> {
    // Verify flashcard exists
    await FlashcardService.getById(id);
    const query = getFlashcardReviewHistoryQuery(id);
    return await queryHandlers.review.getFlashcardReviewHistory.execute(query);
  }

  static async getLastReview(id: number): Promise<ReviewHistory | undefined> {
    // Verify flashcard exists
    await FlashcardService.getById(id);
    const query = getLastReviewQuery(id);
    return await queryHandlers.review.getLastReview.execute(query);
  }

  static async isDue(id: number): Promise<boolean> {
    const lastReview = await FlashcardService.getLastReview(id);
    if (!lastReview) {
      return true;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextReviewDate =
      lastReview.nextReviewDate instanceof Date
        ? lastReview.nextReviewDate
        : new Date(lastReview.nextReviewDate);
    nextReviewDate.setHours(0, 0, 0, 0);

    return nextReviewDate <= today;
  }

  static async getMasteryLevel(
    id: number,
  ): Promise<"new" | "learning" | "mastered"> {
    const history = await FlashcardService.getReviewHistory(id);

    if (history.length === 0) {
      return "new";
    }

    const recentReviews = history.slice(0, 5);
    const successCount = recentReviews.filter((r) => r.isCorrect).length;
    const successRate = successCount / recentReviews.length;

    if (successRate >= 0.8 && history.length >= 3) {
      return "mastered";
    }

    return "learning";
  }
}
