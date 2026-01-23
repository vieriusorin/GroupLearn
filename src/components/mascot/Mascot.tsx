"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/shared/utils";

type MascotExpression = "idle" | "happy" | "sad" | "celebrating";

interface MascotProps {
  expression?: MascotExpression;
  message?: string;
  className?: string;
}

export function Mascot({
  expression = "happy",
  message,
  className,
}: MascotProps) {
  const getEmoji = () => {
    switch (expression) {
      case "happy":
        return "🦉";
      case "sad":
        return "😔";
      case "celebrating":
        return "🎉";
      default:
        return "🦉";
    }
  };

  const getAnimation = () => {
    switch (expression) {
      case "celebrating":
        return {
          scale: [1, 1.2, 1, 1.1, 1],
          rotate: [-5, 5, -5, 5, 0],
          y: [0, -10, 0, -5, 0],
        };
      case "happy":
        return {
          y: [0, -8, 0],
          rotate: [0, 5, -5, 0],
        };
      case "sad":
        return { y: [0, 3, 0] };
      default:
        return { y: [0, -5, 0] };
    }
  };

  return (
    <motion.div
      className={cn("inline-block", className)}
      animate={getAnimation()}
      transition={{
        duration: expression === "celebrating" ? 1.5 : 2.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <motion.div
        className="relative drop-shadow-2xl"
        whileHover={{ scale: 1.15, rotate: 10 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="text-6xl select-none">{getEmoji()}</div>

        {expression === "celebrating" && (
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity },
            }}
          >
            <Sparkles className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          </motion.div>
        )}
      </motion.div>

      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-xl border-2 border-gray-200 dark:border-gray-700 whitespace-nowrap"
        >
          <p className="text-sm font-medium">{message}</p>
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white dark:border-t-gray-800" />
        </motion.div>
      )}
    </motion.div>
  );
}
