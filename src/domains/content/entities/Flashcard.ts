import { ValidationError } from "@/domains/shared/errors";
import {
  type CategoryId,
  FlashcardId,
} from "@/domains/shared/types/branded-types";
import type { DifficultyLevelType } from "@/infrastructure/database/schema";

export type FlashcardDifficulty = DifficultyLevelType;

export class Flashcard {
  private constructor(
    public readonly id: FlashcardId,
    public readonly categoryId: CategoryId,
    private question: string,
    private answer: string,
    private difficulty: FlashcardDifficulty,
    private computedDifficulty: FlashcardDifficulty | null,
    public readonly createdAt: Date,
  ) {
    this.validate();
  }

  static create(
    categoryId: CategoryId,
    question: string,
    answer: string,
    difficulty: FlashcardDifficulty = "medium",
  ): Flashcard {
    return new Flashcard(
      FlashcardId(0),
      categoryId,
      question,
      answer,
      difficulty,
      null,
      new Date(),
    );
  }

  static reconstitute(
    id: FlashcardId,
    categoryId: CategoryId,
    question: string,
    answer: string,
    difficulty: FlashcardDifficulty,
    computedDifficulty: FlashcardDifficulty | null,
    createdAt: Date,
  ): Flashcard {
    return new Flashcard(
      id,
      categoryId,
      question,
      answer,
      difficulty,
      computedDifficulty,
      createdAt,
    );
  }

  updateQuestion(newQuestion: string): void {
    this.question = newQuestion;
    this.validate();
  }

  updateAnswer(newAnswer: string): void {
    this.answer = newAnswer;
    this.validate();
  }

  updateDifficulty(newDifficulty: FlashcardDifficulty): void {
    this.difficulty = newDifficulty;
  }

  updateComputedDifficulty(newComputedDifficulty: FlashcardDifficulty): void {
    this.computedDifficulty = newComputedDifficulty;
  }

  getEffectiveDifficulty(): FlashcardDifficulty {
    return this.computedDifficulty || this.difficulty;
  }

  isNew(): boolean {
    return this.id.valueOf() === 0;
  }

  belongsToCategory(categoryId: CategoryId): boolean {
    return this.categoryId === categoryId;
  }

  private validate(): void {
    if (!this.question || !this.question.trim()) {
      throw new ValidationError("Flashcard question cannot be empty");
    }

    if (this.question.length > 1000) {
      throw new ValidationError(
        "Flashcard question cannot exceed 1000 characters",
      );
    }

    if (!this.answer || !this.answer.trim()) {
      throw new ValidationError("Flashcard answer cannot be empty");
    }

    if (this.answer.length > 2000) {
      throw new ValidationError(
        "Flashcard answer cannot exceed 2000 characters",
      );
    }

    const validDifficulties: FlashcardDifficulty[] = ["easy", "medium", "hard"];
    if (!validDifficulties.includes(this.difficulty)) {
      throw new ValidationError("Invalid difficulty level");
    }

    if (
      this.computedDifficulty &&
      !validDifficulties.includes(this.computedDifficulty)
    ) {
      throw new ValidationError("Invalid computed difficulty level");
    }
  }

  getQuestion(): string {
    return this.question;
  }

  getAnswer(): string {
    return this.answer;
  }

  getDifficulty(): FlashcardDifficulty {
    return this.difficulty;
  }

  getComputedDifficulty(): FlashcardDifficulty | null {
    return this.computedDifficulty;
  }

  getCategoryId(): CategoryId {
    return this.categoryId;
  }

  getId(): FlashcardId {
    return this.id;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  toObject() {
    return {
      id: this.id,
      categoryId: this.categoryId,
      question: this.question,
      answer: this.answer,
      difficulty: this.difficulty,
      computedDifficulty: this.computedDifficulty,
      effectiveDifficulty: this.getEffectiveDifficulty(),
      createdAt: this.createdAt.toISOString(),
    };
  }
}
