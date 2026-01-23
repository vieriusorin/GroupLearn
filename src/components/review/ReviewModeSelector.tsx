"use client";

import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Flashcard,
  ReviewModeType,
} from "@/infrastructure/database/schema";

const FlashcardMode = dynamic(
  () =>
    import("./FlashcardMode").then((mod) => ({ default: mod.FlashcardMode })),
  {
    ssr: false,
  },
);

const QuizMode = dynamic(
  () => import("./QuizMode").then((mod) => ({ default: mod.QuizMode })),
  {
    ssr: false,
  },
);

const RecallMode = dynamic(
  () => import("./RecallMode").then((mod) => ({ default: mod.RecallMode })),
  {
    ssr: false,
  },
);

interface ReviewModeSelectorProps {
  mode: ReviewModeType;
  onModeChange: (mode: ReviewModeType) => void;
  card: Flashcard;
  // Flashcard mode props
  isFlipped: boolean;
  onFlip: () => void;
  onFlashcardAnswer: (isCorrect: boolean) => void;
  // Quiz mode props
  quizOptions: string[];
  selectedAnswer: string | null;
  onQuizAnswer: (answer: string) => void;
  // Recall mode props
  recallAnswer: string;
  onRecallAnswerChange: (answer: string) => void;
  onCheckAnswer: () => void;
  onRecallAnswer: (isCorrect: boolean) => void;
  isPending: boolean;
}

export const ReviewModeSelector = ({
  mode,
  onModeChange,
  card,
  isFlipped,
  onFlip,
  onFlashcardAnswer,
  quizOptions,
  selectedAnswer,
  onQuizAnswer,
  recallAnswer,
  onRecallAnswerChange,
  onCheckAnswer,
  onRecallAnswer,
  isPending,
}: ReviewModeSelectorProps) => {
  return (
    <Tabs
      value={mode}
      onValueChange={(val) => onModeChange(val as ReviewModeType)}
      className="mb-6"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="learn">Flashcard</TabsTrigger>
        <TabsTrigger value="review">Quiz</TabsTrigger>
        <TabsTrigger value="cram">Recall</TabsTrigger>
      </TabsList>

      <TabsContent value="learn">
        <FlashcardMode
          card={card}
          isFlipped={isFlipped}
          onFlip={onFlip}
          onAnswer={onFlashcardAnswer}
          isPending={isPending}
        />
      </TabsContent>

      <TabsContent value="review">
        <QuizMode
          card={card}
          options={quizOptions}
          selectedAnswer={selectedAnswer}
          onSelectAnswer={onQuizAnswer}
        />
      </TabsContent>

      <TabsContent value="cram">
        <RecallMode
          card={card}
          recallAnswer={recallAnswer}
          isFlipped={isFlipped}
          onAnswerChange={onRecallAnswerChange}
          onCheckAnswer={onCheckAnswer}
          onAnswer={onRecallAnswer}
          isPending={isPending}
        />
      </TabsContent>
    </Tabs>
  );
};
