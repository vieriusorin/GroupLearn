/**
 * Lesson Types
 * All lesson-related types and interfaces for pages and components
 */

/**
 * Page component props
 */
export interface LessonPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Component prop types
 */
export interface LessonHeaderProps {
  currentCardIndex: number;
  totalCards: number;
  progressPercent: number;
  xpEarned: number;
  hearts: number;
  onExit: () => void;
}

export interface LessonCardProps {
  title: string;
  content: string;
  variant?: "question" | "answer";
}

export interface LessonErrorStateProps {
  title: string;
  message: string;
  onExit: () => void;
}

export interface LessonAnswerButtonsProps {
  onAnswer: (isCorrect: boolean) => void;
  disabled?: boolean;
}
