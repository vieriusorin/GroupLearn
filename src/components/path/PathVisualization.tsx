"use client";

import { useEffect, useState, useTransition } from "react";
import { LessonStartDialog } from "@/components/lesson/LessonStartDialog";
import type { LessonWithProgress, UnitWithProgress } from "@/lib/types";
import { getLessons, getUnits } from "@/presentation/actions/paths";
import { DuolingoUnitNode } from "./DuolingoUnitNode";

interface PathVisualizationProps {
  pathId: number;
}

export function PathVisualization({ pathId }: PathVisualizationProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedLesson, setSelectedLesson] =
    useState<LessonWithProgress | null>(null);
  const [units, setUnits] = useState<UnitWithProgress[]>([]);
  const [lessonsByUnit, setLessonsByUnit] = useState<
    Map<number, LessonWithProgress[]>
  >(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch units and lessons when pathId changes
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    startTransition(async () => {
      try {
        // Fetch units
        const unitsResult = await getUnits(pathId);
        if (!unitsResult.success) {
          setError(unitsResult.error || "Failed to fetch units");
          setIsLoading(false);
          return;
        }

        const fetchedUnits = unitsResult.data || [];
        setUnits(fetchedUnits as any); // Type mismatch between server data and UnitWithProgress

        // Fetch lessons for all units in parallel
        const unitIds = fetchedUnits.map((u) => u.id);
        const lessonsResults = await Promise.all(
          unitIds.map(async (unitId) => {
            const result = await getLessons(unitId);
            return { unitId, lessons: result.success ? result.data || [] : [] };
          }),
        );

        // Build lessons map
        const lessonsMap = new Map<number, LessonWithProgress[]>();
        lessonsResults.forEach(({ unitId, lessons }) => {
          lessonsMap.set(unitId, lessons as any); // Type mismatch between server data and LessonWithProgress
        });
        setLessonsByUnit(lessonsMap);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        );
      } finally {
        setIsLoading(false);
      }
    });
  }, [pathId]);

  // Find current lesson (first unlocked + not completed)
  const allLessons = Array.from(lessonsByUnit.values()).flat();
  const currentLessonId = allLessons.find(
    (l) => l.is_unlocked && !l.is_completed,
  )?.id;

  if (isLoading || isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading path...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!units || units.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">
            No units found in this path.
          </p>
          <p className="text-sm text-muted-foreground">
            Create units and lessons to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      {units.map((unit) => {
        const unitLessons = lessonsByUnit.get(unit.id) || [];

        return (
          <DuolingoUnitNode
            key={unit.id}
            unit={unit}
            lessons={unitLessons}
            currentLessonId={currentLessonId}
            onLessonClick={setSelectedLesson}
          />
        );
      })}

      {/* Lesson Start Dialog */}
      {selectedLesson && (
        <LessonStartDialog
          lesson={selectedLesson}
          isOpen={!!selectedLesson}
          onClose={() => setSelectedLesson(null)}
        />
      )}
    </div>
  );
}
