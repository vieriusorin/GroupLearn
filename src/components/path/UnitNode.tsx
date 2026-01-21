"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { LessonWithProgress, UnitWithProgress } from "@/lib/types";
import { LessonNode } from "./LessonNode";

interface UnitNodeProps {
  unit: UnitWithProgress;
  lessons: LessonWithProgress[];
  currentLessonId?: number | null;
  onLessonClick: (lesson: LessonWithProgress) => void;
}

export function UnitNode({
  unit,
  lessons,
  currentLessonId,
  onLessonClick,
}: UnitNodeProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "medium":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "hard":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="relative mb-8">
      {/* Unit Header */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="text-xl font-bold">Unit {unit.unit_number}</h3>
          <Badge className={getDifficultyColor(unit.difficulty)}>
            {unit.difficulty}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{unit.name}</p>
        {unit.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {unit.description}
          </p>
        )}

        {/* Progress Bar */}
        <div className="mt-3 max-w-xs mx-auto">
          <Progress value={unit.completion_percent} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {unit.completed_lessons} / {unit.total_lessons} lessons
          </p>
        </div>
      </div>

      {/* Lessons */}
      <div className="flex flex-col items-center gap-4">
        {lessons.map((lesson) => (
          <LessonNode
            key={lesson.id}
            lesson={lesson}
            unitNumber={unit.unit_number}
            onClick={() => onLessonClick(lesson)}
            isCurrent={lesson.id === currentLessonId}
          />
        ))}
      </div>

      {/* Connecting Line */}
      {lessons.length > 0 && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-0.5 h-[calc(100%-8rem)] bg-border -z-10" />
      )}
    </div>
  );
}
