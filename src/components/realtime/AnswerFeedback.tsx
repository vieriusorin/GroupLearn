"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/shared/utils";
import confetti from "canvas-confetti";

interface AnswerFeedbackProps {
  isCorrect: boolean;
  pointsEarned: number;
  speedBonus: number;
  correctAnswer?: string;
  responseTime: number;
  onComplete?: () => void;
  autoAdvanceMs?: number;
}

export function AnswerFeedback({
  isCorrect,
  pointsEarned,
  speedBonus,
  correctAnswer,
  responseTime,
  onComplete,
  autoAdvanceMs = 3000,
}: AnswerFeedbackProps) {
  useEffect(() => {
    // Trigger confetti for correct answers
    if (isCorrect) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#3b82f6", "#8b5cf6"],
      });
    }

    // Auto-advance after delay
    if (onComplete && autoAdvanceMs > 0) {
      const timer = setTimeout(onComplete, autoAdvanceMs);
      return () => clearTimeout(timer);
    }
  }, [isCorrect, onComplete, autoAdvanceMs]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "bg-background/80 backdrop-blur-sm animate-in fade-in",
      )}
    >
      <div
        className={cn(
          "w-full max-w-md rounded-lg border-2 p-8 text-center shadow-lg animate-in zoom-in-95",
          isCorrect
            ? "border-green-500 bg-green-50 dark:bg-green-950"
            : "border-red-500 bg-red-50 dark:bg-red-950",
        )}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          {isCorrect ? (
            <div className="rounded-full bg-green-500 p-4">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
          ) : (
            <div className="rounded-full bg-red-500 p-4">
              <XCircle className="h-12 w-12 text-white" />
            </div>
          )}
        </div>

        {/* Title */}
        <h2
          className={cn(
            "text-3xl font-bold mb-2",
            isCorrect ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300",
          )}
        >
          {isCorrect ? "Correct!" : "Incorrect"}
        </h2>

        {/* Points Display */}
        {isCorrect && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-green-700 dark:text-green-300">
              <Zap className="h-6 w-6" />
              <span>+{pointsEarned} points</span>
            </div>
            {speedBonus > 0 && (
              <p className="text-sm text-green-600 dark:text-green-400">
                Speed bonus: +{speedBonus} points
              </p>
            )}
          </div>
        )}

        {/* Correct Answer Display */}
        {!isCorrect && correctAnswer && (
          <div className="mt-4 p-4 rounded-lg bg-white dark:bg-gray-900 border">
            <p className="text-sm text-muted-foreground mb-1">Correct answer:</p>
            <p className="font-medium text-foreground">{correctAnswer}</p>
          </div>
        )}

        {/* Response Time */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Answered in {(responseTime / 1000).toFixed(1)}s</span>
        </div>

        {/* Progress Indicator */}
        {autoAdvanceMs > 0 && (
          <div className="mt-6">
            <div className="h-1 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all ease-linear"
                style={{
                  width: "100%",
                  animation: `shrink ${autoAdvanceMs}ms linear`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
