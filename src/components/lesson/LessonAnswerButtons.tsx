"use client";

import { Button } from "@/components/ui/button";
import type { LessonAnswerButtonsProps } from "@/presentation/types";

export const LessonAnswerButtons = ({
  onAnswer,
  disabled,
}: LessonAnswerButtonsProps) => {
  return (
    <fieldset
      className="flex gap-4 justify-center border-0 p-0 m-0"
      aria-label="Answer options"
    >
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
    </fieldset>
  );
};
