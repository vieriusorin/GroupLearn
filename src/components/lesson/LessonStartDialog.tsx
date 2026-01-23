"use client";

import { BookOpen, Heart, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { LessonWithProgress } from "@/application/dtos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { startLesson } from "@/presentation/actions/lesson/start-lesson";

interface LessonStartDialogProps {
  lesson: LessonWithProgress;
  isOpen: boolean;
  onClose: () => void;
}

export function LessonStartDialog({
  lesson,
  isOpen,
  onClose,
}: LessonStartDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && !sessionData && !isPending && !error) {
      setError(null);
      startTransition(async () => {
        try {
          const result = await startLesson(lesson.id);
          if (!result.success) {
            setError(result.error || "Failed to start lesson");
            return;
          }
          setSessionData(result.data);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "An unexpected error occurred",
          );
        }
      });
    }
  }, [isOpen, sessionData, isPending, error, lesson.id]);

  useEffect(() => {
    if (!isOpen) {
      setSessionData(null);
      setError(null);
    }
  }, [isOpen]);

  const handleStart = () => {
    onClose();
    router.push(`/lesson/${lesson.id}`);
  };

  const hasHearts = sessionData && sessionData.heartsAvailable > 0;
  const isLoading = isPending || (isOpen && !sessionData && !error);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">{lesson.name}</DialogTitle>
          <DialogDescription>
            {lesson.description || "Ready to start this lesson?"}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="py-4 text-center text-muted-foreground">
            Loading lesson...
          </div>
        )}

        {error && (
          <div className="py-4 text-center text-destructive">{error}</div>
        )}

        {sessionData && !error && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="font-medium">Hearts</span>
              </div>
              <Badge variant={hasHearts ? "default" : "destructive"}>
                {sessionData.heartsAvailable} / 5
              </Badge>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Flashcards</span>
              </div>
              <Badge variant="outline">
                {sessionData.totalFlashcards || 0}
              </Badge>
            </div>

            {sessionData.xpReward && (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">XP Reward</span>
                </div>
                <Badge variant="outline">+{sessionData.xpReward} XP</Badge>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleStart}
            disabled={isPending || !hasHearts || isLoading || !!error}
          >
            {isLoading ? "Loading..." : "Start Lesson"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
