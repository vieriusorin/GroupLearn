"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import {
  LessonAnswerButtons,
  LessonCard,
  LessonCompletionDialog,
  LessonHeader,
} from "@/components/lesson";
import { Button } from "@/components/ui/button";
import type { Flashcard } from "@/lib/types";
import { completeLesson } from "@/presentation/actions/lesson/complete-lesson";
import { submitAnswer } from "@/presentation/actions/lesson/submit-answer";

export interface LessonAnswer {
  flashcard_id: number;
  is_correct: boolean;
}

/**
 * Calculate XP gain based on flashcard difficulty
 */
function calculateXPGain(difficulty: Flashcard["difficulty"]): number {
  switch (difficulty) {
    case "easy":
      return 5;
    case "medium":
      return 10;
    case "hard":
      return 15;
    default:
      return 5;
  }
}

type LessonClientProps = {
  lessonId: number;
  pathId: number;
  initialFlashcards: Flashcard[];
  initialHearts: number;
  xpReward: number;
};

export function LessonClient({
  lessonId,
  pathId,
  initialFlashcards,
  initialHearts,
  xpReward,
}: LessonClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // UI state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [hearts, setHearts] = useState(initialHearts);
  const [xpEarned, setXpEarned] = useState(0);
  const [answers, setAnswers] = useState<LessonAnswer[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Computed values
  const currentCard = useMemo(
    () => initialFlashcards[currentCardIndex],
    [initialFlashcards, currentCardIndex],
  );
  const totalCards = useMemo(
    () => initialFlashcards.length,
    [initialFlashcards],
  );
  const progressPercent = useMemo(
    () => (totalCards > 0 ? ((currentCardIndex + 1) / totalCards) * 100 : 0),
    [currentCardIndex, totalCards],
  );

  /**
   * Handle answer submission
   */
  const handleAnswer = useCallback(
    async (isCorrect: boolean) => {
      if (!currentCard) return;

      startTransition(async () => {
        try {
          // Submit answer to server
          const result = await submitAnswer(
            lessonId,
            currentCard.id,
            isCorrect,
          );

          if (!result.success) {
            console.error("Failed to submit answer:", result.error);
            throw new Error(result.error || "Failed to submit answer");
          }

          const responseData = result.data;
          if (!responseData) {
            throw new Error("No response data from server");
          }

          // Update hearts from server response
          setHearts(responseData.heartsRemaining);

          // Record answer locally
          const newAnswer: LessonAnswer = {
            flashcard_id: currentCard.id,
            is_correct: isCorrect,
          };
          const updatedAnswers = [...answers, newAnswer];
          setAnswers(updatedAnswers);

          // Handle different result types
          if (responseData.result === "failed") {
            // Lesson failed (hearts depleted)
            router.push("/");
            return;
          }

          if (responseData.result === "completed") {
            // Lesson is complete, now call completeLesson
            const accuracy = responseData.accuracy || 0;
            const heartsRemaining = responseData.heartsRemaining || 0;

            const completeResult = await completeLesson(
              lessonId,
              pathId,
              0, // timeSpentSeconds
              accuracy,
              heartsRemaining,
            );

            if (!completeResult.success) {
              console.error("Failed to complete lesson:", completeResult.error);
            }

            setIsComplete(true);
            return;
          }

          // Result is 'advanced' - move to next card
          if (responseData.result === "advanced") {
            if (isCorrect) {
              // Add XP for correct answer
              const xpGain = calculateXPGain(currentCard.difficulty);
              setXpEarned((prev) => prev + xpGain);
            }

            // Move to next card
            if (currentCardIndex < totalCards - 1) {
              setCurrentCardIndex((prev) => prev + 1);
              setShowAnswer(false);
            }
          }
        } catch (error) {
          console.error("Error submitting answer:", error);
          // Continue with local state update for better UX
          const newAnswer: LessonAnswer = {
            flashcard_id: currentCard.id,
            is_correct: isCorrect,
          };
          const updatedAnswers = [...answers, newAnswer];
          setAnswers(updatedAnswers);

          if (!isCorrect) {
            const newHearts = hearts - 1;
            setHearts(newHearts);
            if (newHearts <= 0) {
              router.push("/");
              return;
            }
          } else {
            const xpGain = calculateXPGain(currentCard.difficulty);
            setXpEarned((prev) => prev + xpGain);
          }

          if (currentCardIndex < totalCards - 1) {
            setCurrentCardIndex((prev) => prev + 1);
            setShowAnswer(false);
          }
        }
      });
    },
    [
      currentCard,
      answers,
      hearts,
      currentCardIndex,
      totalCards,
      router,
      lessonId,
      pathId,
    ],
  );

  /**
   * Show answer button handler
   */
  const handleShowAnswer = useCallback(() => {
    setShowAnswer(true);
  }, []);

  /**
   * Exit lesson handler
   */
  const handleExit = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <div className="container mx-auto max-w-3xl py-6 px-4">
      {/* Loading indicator */}
      {isPending && (
        <div className="fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg">
          Loading...
        </div>
      )}

      <LessonHeader
        currentCardIndex={currentCardIndex}
        totalCards={totalCards}
        progressPercent={progressPercent}
        xpEarned={xpEarned}
        hearts={hearts}
        onExit={handleExit}
      />

      <main>
        {currentCard && (
          <div className="space-y-6">
            <LessonCard
              title="Question"
              content={currentCard.question}
              variant="question"
            />

            {!showAnswer ? (
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleShowAnswer}
                  aria-label="Show answer"
                  disabled={isPending}
                >
                  Show Answer
                </Button>
              </div>
            ) : (
              <>
                <LessonCard
                  title="Answer"
                  content={currentCard.answer}
                  variant="answer"
                />
                <LessonAnswerButtons
                  onAnswer={handleAnswer}
                  disabled={isPending}
                />
              </>
            )}
          </div>
        )}
      </main>

      {isComplete && (
        <LessonCompletionDialog
          lessonId={lessonId}
          isOpen={isComplete}
          onClose={handleExit}
        />
      )}
    </div>
  );
}
