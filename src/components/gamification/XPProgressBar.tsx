"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/shared/utils";

interface XPProgressBarProps {
  currentXP: number;
  goalXP: number;
  label?: string;
  className?: string;
}

export function XPProgressBar({
  currentXP,
  goalXP,
  label,
  className,
}: XPProgressBarProps) {
  const progress = Math.min((currentXP / goalXP) * 100, 100);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span className="font-medium">
            {currentXP} / {goalXP} XP
          </span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
