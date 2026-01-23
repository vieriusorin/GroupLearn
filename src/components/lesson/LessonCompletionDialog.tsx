"use client";

import confetti from "canvas-confetti";
import { Star, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import type { CompleteLessonResult } from "@/application/dtos/learning-path.dto";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CompletionResultWithContext = CompleteLessonResult & {
  unitCompleted: boolean;
  pathCompleted: boolean;
  nextLessonId: number | null;
};

interface LessonCompletionDialogProps {
  lessonId: number;
  isOpen: boolean;
  onClose: () => void;
  completionResult: CompletionResultWithContext;
}

export function LessonCompletionDialog({
  isOpen,
  onClose,
  completionResult,
}: LessonCompletionDialogProps) {
  const router = useRouter();

  // Map completion result to display format
  const displayData = useMemo(() => {
    const accuracyPercent = completionResult.accuracy;
    const xpEarned = completionResult.rewards.baseXP;
    const completionBonus =
      completionResult.rewards.accuracyBonus +
      completionResult.rewards.perfectBonus;
    const totalXp = completionResult.rewards.totalXP;
    const heartsRemaining = completionResult.heartsRemaining;

    return {
      xpEarned,
      completionBonus,
      totalXp,
      accuracyPercent,
      heartsRemaining,
      unitCompleted: completionResult.unitCompleted ?? false,
      pathCompleted: completionResult.pathCompleted ?? false,
      nextLessonId: completionResult.nextLessonId ?? null,
      isPerfect: completionResult.isPerfect,
    };
  }, [completionResult]);

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti
      if (displayData.accuracyPercent === 100) {
        // Perfect score - big confetti
        confetti({
          particleCount: 200,
          spread: 160,
          startVelocity: 45,
          origin: { y: 0.6 },
        });
      } else {
        // Regular completion
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  }, [isOpen, displayData.accuracyPercent]);

  const handleContinue = () => {
    onClose();
    // Navigate to next lesson if available, otherwise go home
    if (displayData.nextLessonId) {
      router.push(`/lesson/${displayData.nextLessonId}`);
    } else {
      router.push("/");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-3xl text-center">
            {displayData.accuracyPercent === 100
              ? "🎉 Perfect!"
              : "✨ Lesson Complete!"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Accuracy Circle */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
                <div className="flex items-center justify-center w-28 h-28 rounded-full bg-background">
                  <div className="text-center">
                    <p className="text-4xl font-bold">
                      {displayData.accuracyPercent}%
                    </p>
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                  </div>
                </div>
              </div>
              {displayData.accuracyPercent === 100 && (
                <Star className="absolute -top-2 -right-2 h-12 w-12 fill-yellow-400 text-yellow-400 animate-pulse" />
              )}
            </div>
          </div>

          {/* XP Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-blue-500" />
                <span>Lesson XP</span>
              </div>
              <Badge variant="outline" className="text-lg font-bold">
                +{displayData.xpEarned} XP
              </Badge>
            </div>

            {displayData.completionBonus > 0 && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>
                    {displayData.isPerfect ? "Perfect Bonus" : "Accuracy Bonus"}
                  </span>
                </div>
                <Badge variant="outline" className="text-lg font-bold">
                  +{displayData.completionBonus} XP
                </Badge>
              </div>
            )}

            <div className="flex items-center justify-between p-4 rounded-lg bg-primary text-primary-foreground">
              <span className="font-bold">Total XP Earned</span>
              <Badge className="text-lg font-bold bg-primary-foreground text-primary">
                {displayData.totalXp} XP
              </Badge>
            </div>
          </div>

          {/* Perfect Score Message */}
          {displayData.accuracyPercent === 100 && (
            <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 p-4 text-center">
              <p className="font-bold text-yellow-700 dark:text-yellow-300">
                Perfect score! Keep up the great work!
              </p>
            </div>
          )}

          {/* Unit Completion */}
          {displayData.unitCompleted && (
            <div className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-4 text-center">
              <p className="font-bold text-purple-700 dark:text-purple-300">
                🎊 Unit Complete! Amazing progress!
              </p>
            </div>
          )}

          {/* Path Completion */}
          {displayData.pathCompleted && (
            <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-4 text-center">
              <p className="font-bold text-green-700 dark:text-green-300">
                🏆 Path Complete! Congratulations!
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleContinue} size="lg" className="w-full">
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
