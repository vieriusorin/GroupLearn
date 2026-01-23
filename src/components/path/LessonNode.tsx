"use client";

import { motion } from "framer-motion";
import { Check, Lock, Star } from "lucide-react";
import type { LessonWithProgress } from "@/application/dtos";
import { cn } from "@/lib/shared/utils";

interface LessonNodeProps {
  lesson: LessonWithProgress;
  unitNumber: number;
  onClick: () => void;
  isCurrent?: boolean;
}

export function LessonNode({
  lesson,
  unitNumber,
  onClick,
  isCurrent,
}: LessonNodeProps) {
  const isLocked = !lesson.isUnlocked;
  const isCompleted = lesson.isCompleted;
  const isAvailable = lesson.isUnlocked && !lesson.isCompleted;

  // Color based on unit number (difficulty)
  const getColor = () => {
    if (isLocked) return "bg-muted text-muted-foreground";
    if (isCompleted) return "bg-yellow-500 text-white";
    if (unitNumber <= 3) return "bg-blue-500 text-white";
    if (unitNumber <= 6) return "bg-green-500 text-white";
    return "bg-purple-500 text-white";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        onClick={isLocked ? undefined : onClick}
        disabled={isLocked}
        className={cn(
          "relative flex h-16 w-16 items-center justify-center rounded-full font-bold text-lg transition-all",
          getColor(),
          isAvailable && "hover:scale-110 hover:shadow-lg",
          isCurrent && "ring-4 ring-primary ring-offset-2",
          isLocked && "cursor-not-allowed opacity-50",
        )}
        whileHover={isAvailable ? { scale: 1.1 } : {}}
        whileTap={isAvailable ? { scale: 0.95 } : {}}
        animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
      >
        {isLocked && <Lock className="h-6 w-6" />}
        {isCompleted && <Star className="h-6 w-6 fill-current" />}
        {isAvailable && <span>{lesson.orderIndex + 1}</span>}
      </motion.button>

      {isCompleted && lesson.bestAccuracy !== null && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Check className="h-3 w-3" />
          <span>{lesson.bestAccuracy}%</span>
        </div>
      )}
    </div>
  );
}
