import type {
  Lesson,
  LessonCompletion,
  LessonFlashcard,
  NewLesson,
  NewLessonCompletion,
  NewPath,
  NewUnit,
  Path,
  Unit,
} from "@/infrastructure/database/schema";

export type PathWithProgress = Path & {
  completionPercent: number;
  totalUnits: number;
  completedUnits: number;
  totalLessons: number;
  completedLessons: number;
  totalXp: number;
  isUnlocked: boolean;
};

export type PathWithCreator = Path & {
  creatorName?: string | null;
};

export type PathFormInput = Pick<
  Path,
  "name" | "description" | "icon" | "orderIndex" | "visibility"
>;

export type CreatePathInput = Omit<
  NewPath,
  "id" | "createdAt" | "createdBy"
> & {
  createdBy?: string | null;
};

export type UpdatePathInput = Partial<CreatePathInput> & {
  id: number;
};

export type UnitWithProgress = Unit & {
  difficulty: "easy" | "medium" | "hard";
  totalLessons: number;
  completedLessons: number;
  completionPercent: number;
  isUnlocked: boolean;
};

export type UnitWithPath = Unit & {
  pathName?: string;
};

export type UnitFormInput = Pick<
  Unit,
  "name" | "description" | "unitNumber" | "orderIndex" | "xpReward"
>;

export type CreateUnitInput = Omit<NewUnit, "id" | "createdAt">;

export type UpdateUnitInput = Partial<CreateUnitInput> & {
  id: number;
};

export type LessonWithProgress = Lesson & {
  isCompleted: boolean;
  isUnlocked: boolean;
  bestAccuracy: number | null;
  completionCount: number;
  timesFailed: number;
};

export type LessonWithContext = Lesson & {
  unit?: Pick<Unit, "id" | "name" | "unitNumber">;
  path?: Pick<Path, "id" | "name" | "icon">;
};

export type LessonWithFlashcards = Lesson & {
  flashcards: Array<{
    id: number;
    question: string;
    answer: string;
    difficulty: string;
    orderIndex: number;
  }>;
};

export type LessonFormInput = Pick<
  Lesson,
  "name" | "description" | "orderIndex" | "xpReward" | "flashcardCount"
>;

export type CreateLessonInput = Omit<NewLesson, "id" | "createdAt">;

export type UpdateLessonInput = Partial<CreateLessonInput> & {
  id: number;
};

export type LessonFlashcardWithDetails = LessonFlashcard & {
  flashcard?: {
    id: number;
    question: string;
    answer: string;
    difficulty: string;
  };
};

export type CreateLessonFlashcardInput = Omit<LessonFlashcard, "id">;

export type LessonCompletionWithDetails = LessonCompletion & {
  lessonName?: string;
  unitName?: string;
  pathName?: string;
};

export type CreateLessonCompletionInput = Omit<
  NewLessonCompletion,
  "id" | "completedAt"
>;

export type LessonSession = {
  lesson: Lesson;
  unit: Unit;
  path: Path;
  flashcards: Array<{
    id: number;
    question: string;
    answer: string;
    difficulty: string;
  }>;
  heartsAvailable: number;
  reviewMode: "learn" | "review" | "cram";
};

/**
 * Lesson session flashcard item
 * Based on Flashcard type with computed fields
 */
export type LessonSessionFlashcard = {
  id: number;
  categoryId: number;
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  createdAt: string; // ISO string
  computedDifficulty: null;
};

export type StartLessonResponse = {
  lesson: Pick<
    Lesson,
    "id" | "name" | "description" | "orderIndex" | "xpReward" | "flashcardCount"
  > & {
    unitId: number;
    createdAt: string; // ISO string
  };
  unit: Pick<
    Unit,
    "id" | "name" | "description" | "orderIndex" | "xpReward"
  > & {
    pathId: number;
    unitNumber: number;
    createdAt: string; // ISO string
  };
  path: Pick<
    Path,
    | "id"
    | "name"
    | "description"
    | "icon"
    | "orderIndex"
    | "isLocked"
    | "visibility"
  > & {
    domainId: number;
    unlockRequirementType: string | null;
    unlockRequirementValue: number | null;
    createdBy: string | null;
    createdAt: string; // ISO string
  };
  flashcards: LessonSessionFlashcard[];
  heartsAvailable: number;
  reviewMode: "learn" | "review" | "cram";
  totalFlashcards: number;
  xpReward: number;
};

export type LessonAnswer = {
  flashcardId: number;
  isCorrect: boolean;
  timeSpentSeconds?: number;
};

export type LessonResult = {
  xpEarned: number;
  completionBonus: number;
  totalXp: number;
  accuracyPercent: number;
  heartsRemaining: number;
  unitCompleted: boolean;
  pathCompleted: boolean;
  nextLessonId: number | null;
};

/**
 * Complete lesson result
 * Returned when a lesson is successfully completed
 */
export type CompleteLessonResult = {
  lessonId: number;
  accuracy: number;
  xpEarned: number;
  heartsRemaining: number;
  isPerfect: boolean;
  cardsReviewed: number;
  timeSpentSeconds: number;
  rewards: {
    baseXP: number;
    accuracyBonus: number;
    perfectBonus: number;
    totalXP: number;
  };
  userProgress: {
    totalXP: number;
    level: number;
    heartsRefilled: boolean;
  };
};

/**
 * Submit answer result
 * Returned when submitting an answer during a lesson
 */
export type SubmitAnswerResult = {
  result: "advanced" | "completed" | "failed";
  accuracy: number;
  heartsRemaining: number;
  progress: {
    current: number;
    total: number;
    percent: number;
  };
  nextCard?: {
    id: number;
    question: string;
    answer: string;
    difficulty: string;
  };
  lessonResult?: {
    accuracy: number;
    xpEarned: number;
    isPerfect: boolean;
    cardsReviewed: number;
  };
  events: Array<{
    type: string;
    data: any;
  }>;
};

/**
 * Get lesson flashcards result
 * Returned when fetching flashcards for a lesson
 */
export type GetLessonFlashcardsResult = {
  lesson: {
    id: number;
    name: string;
    description: string | null;
    flashcardCount: number;
  };
  flashcards: Array<{
    id: number;
    question: string;
    answer: string;
    difficulty: "easy" | "medium" | "hard";
    createdAt: string; // ISO string
  }>;
};

/**
 * Get lesson progress result
 * Returned when fetching progress for a specific lesson
 */
export type GetLessonProgressResult = {
  lesson: {
    id: number;
    name: string;
    description: string | null;
    xpReward: number;
    flashcardCount: number;
  };
  progress: {
    completed: boolean;
    completionCount: number;
    bestAccuracy: number | null;
    lastCompletedAt: string | null; // ISO string
    averageAccuracy: number | null;
  };
  userProgress: {
    totalXP: number;
    level: number;
    hearts: number;
  };
};

/**
 * Get paths result
 * Returned when fetching paths
 */
export type GetPathsResult = {
  paths: PathWithProgress[];
};

/**
 * Get units result
 * Returned when fetching units for a path
 */
export type GetUnitsResult = {
  units: UnitWithProgress[];
};

/**
 * Get lessons result
 * Returned when fetching lessons for a unit
 */
export type GetLessonsResult = {
  lessons: LessonWithProgress[];
};

/**
 * Get lesson info result
 * Returned when fetching basic lesson information
 */
export type GetLessonInfoResult = {
  lessonId: number;
  unitId: number;
  pathId: number;
};
