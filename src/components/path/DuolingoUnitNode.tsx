"use client";

import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LessonWithProgress, UnitWithProgress } from "@/lib/types";
import { DuolingoLessonNode } from "./DuolingoLessonNode";

interface DuolingoUnitNodeProps {
  unit: UnitWithProgress;
  lessons: LessonWithProgress[];
  currentLessonId?: number | null;
  onLessonClick: (lesson: LessonWithProgress) => void;
}

export function DuolingoUnitNode({
  unit,
  lessons,
  currentLessonId,
  onLessonClick,
}: DuolingoUnitNodeProps) {
  return (
    <div className="mb-16">
      {/* Unit Header */}
      <div className="relative mb-8">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl p-6 shadow-xl border-b-8 border-primary/50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-bold uppercase tracking-wider opacity-90">
                Unit {unit.unit_number}
              </div>
              <h2 className="text-3xl font-black mt-1">{unit.name}</h2>
              {unit.description && (
                <p className="text-sm mt-2 opacity-90 max-w-xl">
                  {unit.description}
                </p>
              )}
            </div>
            <Button variant="secondary" size="sm" className="ml-4 font-bold">
              <BookOpen className="w-4 h-4 mr-2" />
              GUIDEBOOK
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold">Progress</span>
              <span className="font-bold">{unit.completion_percent}%</span>
            </div>
            <div className="h-3 bg-primary-foreground/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-foreground transition-all duration-500 rounded-full"
                style={{ width: `${unit.completion_percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lessons in vertical path */}
      <div className="relative">
        {/* Vertical connecting line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 -translate-x-1/2 -z-10" />

        {/* Lessons */}
        <div className="space-y-8">
          {lessons.map((lesson, index) => {
            const positions: ("left" | "center" | "right")[] = [
              "center",
              "right",
              "left",
            ];
            const position = positions[index % 3];
            const isCurrent = lesson.id === currentLessonId;

            return (
              <DuolingoLessonNode
                key={lesson.id}
                lesson={lesson}
                position={position}
                isCurrent={isCurrent}
                onClick={() => onLessonClick(lesson)}
              />
            );
          })}
        </div>

        {/* Unit completion trophy */}
        {unit.completion_percent === 100 && (
          <div className="flex justify-center mt-8">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-xl border-4 border-yellow-300 font-bold text-lg">
              🏆 Unit Complete!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
