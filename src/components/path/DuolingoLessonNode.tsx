"use client";

import { motion } from "framer-motion";
import { Check, Lock, Play, Star } from "lucide-react";
import { useState } from "react";
import { Mascot } from "@/components/mascot/Mascot";
import type { LessonWithProgress } from "@/lib/types";

interface DuolingoLessonNodeProps {
  lesson: LessonWithProgress;
  position: "left" | "center" | "right";
  isCurrent?: boolean;
  onClick: () => void;
}

export function DuolingoLessonNode({
  lesson,
  position,
  isCurrent,
  onClick,
}: DuolingoLessonNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { is_completed, is_unlocked, best_accuracy } = lesson;

  // Determine node style
  const getNodeStyle = () => {
    if (!is_unlocked) {
      return {
        bg: "bg-gray-300 dark:bg-gray-700",
        border: "border-gray-400 dark:border-gray-600",
        shadow: "shadow-md",
      };
    }
    if (is_completed) {
      return {
        bg: "bg-gradient-to-b from-yellow-400 to-yellow-500",
        border: "border-yellow-600",
        shadow: "shadow-lg shadow-yellow-500/50",
      };
    }
    return {
      bg: "bg-gradient-to-b from-green-500 to-green-600",
      border: "border-green-700",
      shadow: "shadow-lg shadow-green-500/50",
    };
  };

  const style = getNodeStyle();

  // Calculate position offset
  const getPositionClass = () => {
    if (position === "left") return "-translate-x-20";
    if (position === "right") return "translate-x-20";
    return "";
  };

  const getIcon = () => {
    if (!is_unlocked) return <Lock className="w-8 h-8 text-white" />;
    if (is_completed) return <Star className="w-8 h-8 text-white fill-white" />;
    return <Play className="w-8 h-8 text-white fill-white" />;
  };

  return (
    <div className={`relative flex justify-center ${getPositionClass()}`}>
      <motion.div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={is_unlocked ? { scale: 1.1 } : {}}
        animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 2, repeat: isCurrent ? Infinity : 0 }}
      >
        {/* Lesson Circle Button */}
        <button
          onClick={is_unlocked ? onClick : undefined}
          disabled={!is_unlocked}
          className={`
            relative w-24 h-24 rounded-full border-b-8
            flex items-center justify-center
            transition-all duration-200
            ${style.bg} ${style.border} ${style.shadow}
            ${is_unlocked ? "cursor-pointer hover:brightness-110" : "cursor-not-allowed opacity-70"}
            ${isCurrent ? "ring-4 ring-white ring-offset-4 ring-offset-background" : ""}
          `}
        >
          {getIcon()}
        </button>

        {/* Completion Badge */}
        {is_completed && best_accuracy !== null && best_accuracy === 100 && (
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-lg">
            <Check className="w-5 h-5 text-white" />
          </div>
        )}

        {/* Hover Tooltip */}
        {isHovered && is_unlocked && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-1/2 -translate-x-1/2 -bottom-24 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl z-50 whitespace-nowrap min-w-[200px]"
          >
            <div className="font-bold text-sm">{lesson.name}</div>
            {lesson.description && (
              <div className="text-xs opacity-75 mt-1">
                {lesson.description}
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-amber-300">
                ⚡ {lesson.xp_reward} XP
              </span>
              {best_accuracy !== null && (
                <span className="text-xs text-green-300">
                  ✓ {best_accuracy}%
                </span>
              )}
            </div>
            {/* Triangle pointer */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900" />
          </motion.div>
        )}

        {/* Mascot on current lesson */}
        {isCurrent && (
          <div className="absolute -right-32 top-1/2 -translate-y-1/2">
            <Mascot expression="happy" />
          </div>
        )}
      </motion.div>
    </div>
  );
}
