import type {
  DifficultyLevelType,
  XPSourceTypeType,
} from "@/infrastructure/database/schema";

export interface Domain {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Category {
  id: number;
  domain_id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Flashcard {
  id: number;
  category_id: number;
  question: string;
  answer: string;
  difficulty: DifficultyLevelType;
  created_at: string;
}

/**
 * Admin flashcard type with additional fields for admin management
 */
export interface AdminFlashcard extends Flashcard {
  display_order: number;
  is_active: number;
}

export type ReviewMode = "flashcard" | "quiz" | "recall";

export interface ReviewHistory {
  id: number;
  flashcard_id: number;
  review_mode: ReviewMode;
  is_correct: boolean;
  review_date: string;
  next_review_date: string;
  interval_days: number; // 1, 3, or 7
}

export interface StrugglingCard {
  id: number;
  flashcard_id: number;
  added_at: string;
  times_failed: number;
  last_failed_at: string;
}

export interface ReviewSession {
  flashcard: Flashcard;
  category: Category;
  domain: Domain;
  review_mode: ReviewMode;
  is_struggling: boolean;
}

export interface DashboardStats {
  total_cards: number;
  cards_due_today: number;
  cards_reviewed_today: number;
  current_streak: number;
  struggling_cards: number;
  domains_progress: DomainProgress[];
}

export interface DomainProgress {
  domain: Domain;
  total_cards: number;
  mastered_cards: number;
  due_cards: number;
}

// Quiz option for multiple choice
export interface QuizOption {
  text: string;
  is_correct: boolean;
}

// ===== PATH-BASED LEARNING TYPES =====

export type UnlockRequirementType = "none" | "previous_path" | "xp_threshold";
export type Difficulty = DifficultyLevelType;
export type XPSourceType = XPSourceTypeType;
export type HeartReason =
  | "incorrect_answer"
  | "time_refill"
  | "daily_refill"
  | "purchase"
  | "reward";

export type PathVisibility = "public" | "private";

export interface Path {
  id: number;
  domain_id: number;
  name: string;
  description: string | null;
  icon: string | null;
  order_index: number;
  is_locked: boolean;
  unlock_requirement_type: UnlockRequirementType | null;
  unlock_requirement_value: number | null;
  visibility: PathVisibility;
  created_by: string | null;
  created_at: string;
}

export interface PathApproval {
  id: number;
  path_id: number;
  user_id: string;
  approved_by: string;
  approved_at: string;
}

export interface Unit {
  id: number;
  path_id: number;
  name: string;
  description: string | null;
  unit_number: number;
  order_index: number;
  xp_reward: number;
  created_at: string;
}

export interface Lesson {
  id: number;
  unit_id: number;
  name: string;
  description: string | null;
  order_index: number;
  xp_reward: number;
  flashcard_count: number;
  created_at: string;
}

export interface LessonFlashcard {
  id: number;
  lesson_id: number;
  flashcard_id: number;
  order_index: number;
}

export interface UserProgress {
  id: number;
  path_id: number;
  current_unit_id: number | null;
  current_lesson_id: number | null;
  total_xp: number;
  hearts: number;
  last_heart_refill: string;
  streak_count: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface LessonCompletion {
  id: number;
  lesson_id: number;
  completed_at: string;
  xp_earned: number;
  accuracy_percent: number;
  time_spent_seconds: number | null;
  hearts_remaining: number;
}

export interface XPTransaction {
  id: number;
  path_id: number;
  amount: number;
  source_type: XPSourceType;
  source_id: number | null;
  created_at: string;
}

export interface HeartTransaction {
  id: number;
  amount: number;
  reason: HeartReason;
  lesson_id: number | null;
  created_at: string;
}

// Enhanced types with computed fields

export interface PathWithProgress extends Path {
  completion_percent: number;
  total_units: number;
  completed_units: number;
  total_lessons: number;
  completed_lessons: number;
  total_xp: number;
  is_unlocked: boolean;
}

export interface UnitWithProgress extends Unit {
  difficulty: Difficulty; // computed from unit_number
  total_lessons: number;
  completed_lessons: number;
  completion_percent: number;
  is_unlocked: boolean;
}

export interface LessonWithProgress extends Lesson {
  is_completed: boolean;
  is_unlocked: boolean;
  best_accuracy: number | null;
  completion_count: number;
  times_failed: number;
}

export interface LessonSession {
  lesson: Lesson;
  unit: Unit;
  path: Path;
  flashcards: Flashcard[];
  hearts_available: number;
  review_mode: ReviewMode;
}

export interface LessonAnswer {
  flashcard_id: number;
  is_correct: boolean;
  time_spent_seconds?: number;
}

export interface LessonResult {
  xp_earned: number;
  completion_bonus: number;
  total_xp: number;
  accuracy_percent: number;
  hearts_remaining: number;
  unit_completed: boolean;
  path_completed: boolean;
  next_lesson_id: number | null;
}
