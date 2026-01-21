"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Flashcard, ReviewMode } from "@/lib/types";
import { FlashcardMode } from "./FlashcardMode";
import { QuizMode } from "./QuizMode";
import { RecallMode } from "./RecallMode";

interface ReviewModeSelectorProps {
  mode: ReviewMode;
  onModeChange: (mode: ReviewMode) => void;
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
      onValueChange={(val) => onModeChange(val as ReviewMode)}
      className="mb-6"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="flashcard">Flashcard</TabsTrigger>
        <TabsTrigger value="quiz">Quiz</TabsTrigger>
        <TabsTrigger value="recall">Recall</TabsTrigger>
      </TabsList>

      <TabsContent value="flashcard">
        <FlashcardMode
          card={card}
          isFlipped={isFlipped}
          onFlip={onFlip}
          onAnswer={onFlashcardAnswer}
          isPending={isPending}
        />
      </TabsContent>

      <TabsContent value="quiz">
        <QuizMode
          card={card}
          options={quizOptions}
          selectedAnswer={selectedAnswer}
          onSelectAnswer={onQuizAnswer}
        />
      </TabsContent>

      <TabsContent value="recall">
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
