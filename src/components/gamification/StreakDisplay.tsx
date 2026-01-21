"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakDisplayProps {
  streakCount: number;
  className?: string;
}

export function StreakDisplay({ streakCount, className }: StreakDisplayProps) {
  return (
    <motion.div
      className={cn("flex items-center gap-1.5", className)}
      animate={streakCount > 0 ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      <Flame
        className={cn(
          "h-5 w-5",
          streakCount > 0
            ? "fill-orange-500 text-orange-500"
            : "text-muted-foreground",
        )}
      />
      <span
        className={cn(
          "font-bold text-sm",
          streakCount > 0 ? "text-orange-500" : "text-muted-foreground",
        )}
      >
        {streakCount}
      </span>
    </motion.div>
  );
}
