"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/shared/utils";

interface HeartsDisplayProps {
  currentHearts: number;
  maxHearts?: number;
  nextRefillMinutes?: number;
  className?: string;
}

export function HeartsDisplay({
  currentHearts,
  maxHearts = 5,
  nextRefillMinutes,
  className,
}: HeartsDisplayProps) {
  const hearts = Array.from({ length: maxHearts }, (_, i) => ({
    id: `heart-${i}`,
    index: i,
  }));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-0.5">
        {hearts.map((heart) => {
          const isFilled = heart.index < currentHearts;

          return (
            <motion.div
              key={heart.id}
              initial={{ scale: 1 }}
              animate={isFilled ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.3, delay: heart.index * 0.05 }}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  isFilled
                    ? "fill-red-500 text-red-500"
                    : "fill-muted text-muted-foreground/30",
                )}
              />
            </motion.div>
          );
        })}
      </div>

      {currentHearts < maxHearts && nextRefillMinutes !== undefined && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          +1 in {nextRefillMinutes}m
        </span>
      )}
    </div>
  );
}
