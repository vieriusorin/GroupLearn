"use client";

import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  ReviewComplete,
  ReviewHeader,
  ReviewModeSelector,
} from "@/components/review";
import type {
  Flashcard,
  ReviewModeType,
} from "@/infrastructure/database/schema";
import { recordReview } from "@/presentation/actions/review";

interface ReviewPageClientProps {
  initialDueCards: Flashcard[];
}

export function ReviewPageClient({ initialDueCards }: ReviewPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dueCards, _setDueCards] = useState<Flashcard[]>(initialDueCards);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [recallAnswer, setRecallAnswer] = useState("");
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);

  const [mode, setMode] = useQueryState<ReviewModeType>("mode", {
    defaultValue: "learn",
    parse: (value) => (value as ReviewModeType) || "learn",
  });

  const currentCard = dueCards[currentCardIndex];

  // Generate quiz options when card changes in review mode
  useEffect(() => {
    if (mode === "review" && currentCard && dueCards.length > 1) {
      const correctAnswer = currentCard.answer;
      const otherAnswers = dueCards
        .filter((c) => c.id !== currentCard.id)
        .map((c) => c.answer)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const options = [correctAnswer, ...otherAnswers].sort(
        () => Math.random() - 0.5,
      );
      setQuizOptions(options);
    } else if (mode !== "review") {
      setQuizOptions([]);
    }
  }, [currentCard, mode, dueCards]);

  const resetCardState = useCallback(() => {
    setIsFlipped(false);
    setSelectedAnswer(null);
    setRecallAnswer("");
  }, []);

  const handleAnswer = useCallback(
    async (isCorrect: boolean) => {
      if (!currentCard) return;

      startTransition(async () => {
        try {
          // Record review using Server Action
          const result = await recordReview(currentCard.id, mode, isCorrect);

          if (!result.success) {
            console.error("Failed to record review:", result.error);
            // Continue anyway - don't block user progress
          }

          // Move to next card
          if (currentCardIndex < dueCards.length - 1) {
            setCurrentCardIndex((prev) => prev + 1);
            resetCardState();
          } else {
            setSessionComplete(true);
          }

          // Refresh to get updated due cards
          router.refresh();
        } catch (error) {
          console.error("Error recording review:", error);
          // Continue anyway
          if (currentCardIndex < dueCards.length - 1) {
            setCurrentCardIndex((prev) => prev + 1);
            resetCardState();
          } else {
            setSessionComplete(true);
          }
        }
      });
    },
    [
      currentCard,
      mode,
      currentCardIndex,
      dueCards.length,
      resetCardState,
      router,
    ],
  );

  const handleModeChange = useCallback(
    (newMode: ReviewModeType) => {
      setMode(newMode);
      resetCardState();
    },
    [setMode, resetCardState],
  );

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleQuizAnswer = useCallback(
    (answer: string) => {
      setSelectedAnswer(answer);
      const isCorrect = answer === currentCard?.answer;
      setTimeout(() => {
        if (isCorrect !== undefined) {
          handleAnswer(isCorrect);
        }
      }, 1000);
    },
    [currentCard, handleAnswer],
  );

  const handleRecallSubmit = useCallback(() => {
    setIsFlipped(true);
  }, []);

  const handleRecallAnswerChange = useCallback((answer: string) => {
    setRecallAnswer(answer);
  }, []);

  if (dueCards.length === 0 || sessionComplete) {
    return <ReviewComplete sessionComplete={sessionComplete} />;
  }

  if (!currentCard) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <ReviewHeader
        currentIndex={currentCardIndex + 1}
        totalCards={dueCards.length}
      />
      <ReviewModeSelector
        mode={mode}
        onModeChange={handleModeChange}
        card={currentCard}
        isFlipped={isFlipped}
        onFlip={handleFlip}
        onFlashcardAnswer={handleAnswer}
        quizOptions={quizOptions}
        selectedAnswer={selectedAnswer}
        onQuizAnswer={handleQuizAnswer}
        recallAnswer={recallAnswer}
        onRecallAnswerChange={handleRecallAnswerChange}
        onCheckAnswer={handleRecallSubmit}
        onRecallAnswer={handleAnswer}
        isPending={isPending}
      />
    </div>
  );
}
