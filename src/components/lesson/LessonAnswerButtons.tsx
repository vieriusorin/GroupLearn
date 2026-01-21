"use client";

import { Button } from "@/components/ui/button";
import type { LessonAnswerButtonsProps } from "@/types/lesson";

export const LessonAnswerButtons = ({
  onAnswer,
  disabled,
}: LessonAnswerButtonsProps) => {
  return (
    <div className="flex gap-4 justify-center" aria-label="Answer options">
      <Button
        size="lg"
        variant="destructive"
        onClick={() => onAnswer(false)}
        className="min-w-32"
        aria-label="Mark answer as incorrect"
        disabled={disabled}
      >
        Incorrect
      </Button>
      <Button
        size="lg"
        onClick={() => onAnswer(true)}
        className="min-w-32"
        aria-label="Mark answer as correct"
        disabled={disabled}
      >
        Correct
      </Button>
    </div>
  );
};
