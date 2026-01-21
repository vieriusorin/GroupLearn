"use client";

export const LessonLoadingState = () => {
  return (
    <div
      className="flex items-center justify-center min-h-screen"
      aria-live="polite"
    >
      <div className="text-center space-y-4">
        <div className="text-6xl animate-bounce">🦉</div>
        <p className="text-muted-foreground">Loading lesson...</p>
      </div>
    </div>
  );
};
