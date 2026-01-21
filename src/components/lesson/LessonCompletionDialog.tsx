"use client";

import confetti from "canvas-confetti";
import { Star, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LessonCompletionDialogProps {
  lessonId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function LessonCompletionDialog({
  lessonId,
  isOpen,
  onClose,
}: LessonCompletionDialogProps) {
  const router = useRouter();

  // Fetch completion result - in real implementation, this would be passed as prop
  // For now, we'll show a mock result
  const mockResult = {
    xp_earned: 50,
    completion_bonus: 10,
    total_xp: 60,
    accuracy_percent: 100,
    hearts_remaining: 4,
    unit_completed: false,
    path_completed: false,
    next_lesson_id: null,
  };

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti
      if (mockResult.accuracy_percent === 100) {
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
  }, [isOpen]);

  const handleContinue = () => {
    onClose();
    router.push("/");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-3xl text-center">
            {mockResult.accuracy_percent === 100
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
                      {mockResult.accuracy_percent}%
                    </p>
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                  </div>
                </div>
              </div>
              {mockResult.accuracy_percent === 100 && (
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
                +{mockResult.xp_earned} XP
              </Badge>
            </div>

            {mockResult.completion_bonus > 0 && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Perfect Bonus</span>
                </div>
                <Badge variant="outline" className="text-lg font-bold">
                  +{mockResult.completion_bonus} XP
                </Badge>
              </div>
            )}

            <div className="flex items-center justify-between p-4 rounded-lg bg-primary text-primary-foreground">
              <span className="font-bold">Total XP Earned</span>
              <Badge className="text-lg font-bold bg-primary-foreground text-primary">
                {mockResult.total_xp} XP
              </Badge>
            </div>
          </div>

          {/* Perfect Score Message */}
          {mockResult.accuracy_percent === 100 && (
            <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 p-4 text-center">
              <p className="font-bold text-yellow-700 dark:text-yellow-300">
                Perfect score! Keep up the great work!
              </p>
            </div>
          )}

          {/* Unit Completion */}
          {mockResult.unit_completed && (
            <div className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-4 text-center">
              <p className="font-bold text-purple-700 dark:text-purple-300">
                🎊 Unit Complete! Amazing progress!
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
