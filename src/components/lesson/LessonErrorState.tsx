"use client";

import { Button } from "@/components/ui/button";
import type { LessonErrorStateProps } from "@/types/lesson";

export const LessonErrorState = ({
  title,
  message,
  onExit,
}: LessonErrorStateProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-muted-foreground">{message}</p>
        <Button onClick={onExit}>Go Home</Button>
      </div>
    </div>
  );
};
