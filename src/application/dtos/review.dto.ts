import type { Flashcard } from "@/infrastructure/database/schema";

export type DueCard = Pick<
  Flashcard,
  "id" | "question" | "answer" | "difficulty"
> & {
  lastReviewDate: string | null;
  nextReviewDate: string | null;
  intervalDays: number;
};

export type GetDueCardsResult = {
  cards: DueCard[];
  totalDue: number;
};

export type StrugglingCard = Pick<
  Flashcard,
  "id" | "question" | "answer" | "difficulty"
> & {
  timesFailed: number;
  lastFailedAt: string;
  addedAt: string;
};

export type GetStrugglingCardsResult = {
  cards: StrugglingCard[];
  total: number;
};

/**
 * Record review result
 * Returned when recording a single review
 */
export type RecordReviewResult = {
  id: number;
  flashcardId: number;
  reviewMode: "learn" | "review" | "cram";
  isCorrect: boolean;
  nextReviewDate: string; // ISO string
  intervalDays: number;
};

/**
 * Submit review result
 * Returned when submitting an answer during a review session
 */
export type SubmitReviewResult = {
  result: "advanced" | "completed";
  event: "mastered" | "struggled" | "marked_struggling";
  nextReviewDate: string; // ISO string
  intervalDays: number;
  progress: {
    reviewed: number;
    total: number;
    percent: number;
  };
  nextCard?: {
    id: number;
    question: string;
    answer: string;
    difficulty: "easy" | "medium" | "hard";
  };
  sessionComplete?: {
    totalReviewed: number;
    correctCount: number;
    accuracyPercent: number;
  };
};

/**
 * Start review session result
 * Returned when starting a new review session
 */
export type StartReviewSessionResult = {
  sessionId: string;
  mode: "flashcard" | "quiz" | "recall";
  totalCards: number;
  currentCard: {
    id: number;
    question: string;
    answer: string;
    difficulty: "easy" | "medium" | "hard";
  };
  progress: {
    current: number;
    total: number;
    percent: number;
  };
};
