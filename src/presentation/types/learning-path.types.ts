import type {
  LessonWithFlashcards,
  LessonWithProgress,
  PathWithProgress,
  UnitWithProgress,
} from "@/application/dtos";
import type { Lesson, Path, Unit } from "@/infrastructure/database/schema";

export interface PathCardProps {
  path: PathWithProgress;
  onStart?: (pathId: number) => void;
  onView?: (pathId: number) => void;
  isUnlocked?: boolean;
}

export interface PathListProps {
  paths: PathWithProgress[];
  onPathClick: (path: Path) => void;
  isLoading?: boolean;
}

export interface UnitCardProps {
  unit: UnitWithProgress;
  pathName?: string;
  onStart?: (unitId: number) => void;
}

export interface UnitListProps {
  units: UnitWithProgress[];
  pathId: number;
  onUnitClick: (unit: Unit) => void;
}

export interface LessonCardProps {
  lesson: LessonWithProgress;
  unitName?: string;
  onStart: (lessonId: number) => void;
  heartsAvailable?: number;
}

export interface LessonDisplayCardProps {
  title: string;
  content: string;
  variant?: "question" | "answer";
}

export interface LessonHeaderProps {
  currentCardIndex: number;
  totalCards: number;
  progressPercent: number;
  xpEarned: number;
  hearts: number;
  onExit: () => void;
}

export interface LessonAnswerButtonsProps {
  onAnswer: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export interface LessonErrorStateProps {
  title: string;
  message: string;
  onExit: () => void;
}

export interface LessonListProps {
  lessons: LessonWithProgress[];
  unitId: number;
  onLessonClick: (lesson: Lesson) => void;
}

export interface LessonSessionProps {
  lesson: LessonWithFlashcards;
  onComplete: (
    answers: Array<{ flashcardId: number; isCorrect: boolean }>,
  ) => void;
  onExit: () => void;
}
