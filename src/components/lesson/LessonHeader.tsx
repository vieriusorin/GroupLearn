"use client";

import { HeartsDisplay } from "@/components/gamification/HeartsDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { LessonHeaderProps } from "@/presentation/types";

export const LessonHeader = ({
  currentCardIndex,
  totalCards,
  progressPercent,
  xpEarned,
  hearts,
  onExit,
}: LessonHeaderProps) => {
  return (
    <header className="mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            aria-label="Exit lesson"
          >
            ← Exit
          </Button>
          <Badge
            variant="secondary"
            aria-label={`Card ${currentCardIndex + 1} of ${totalCards}`}
          >
            Card {currentCardIndex + 1} of {totalCards}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="font-bold"
              aria-label={`${xpEarned} experience points earned`}
            >
              {xpEarned} XP
            </Badge>
          </div>
          <HeartsDisplay currentHearts={hearts} maxHearts={5} />
        </div>
      </div>
      <Progress
        value={progressPercent}
        className="h-2"
        aria-label={`Lesson progress: ${Math.round(progressPercent)}%`}
      />
    </header>
  );
};
