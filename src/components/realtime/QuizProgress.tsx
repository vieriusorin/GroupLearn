"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Hash, Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/shared/utils";

interface QuizProgressProps {
  currentCard: number;
  totalCards: number;
  currentScore: number;
  currentRank?: number;
  previousRank?: number;
  className?: string;
}

export function QuizProgress({
  currentCard,
  totalCards,
  currentScore,
  currentRank,
  previousRank,
  className,
}: QuizProgressProps) {
  const progressPercent = (currentCard / totalCards) * 100;

  const getRankIcon = () => {
    if (!currentRank || !previousRank) return null;

    if (currentRank < previousRank) {
      return <TrendingUp className="h-3 w-3 text-green-500" />;
    } else if (currentRank > previousRank) {
      return <TrendingDown className="h-3 w-3 text-red-500" />;
    } else {
      return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <Badge className="gap-1 bg-yellow-500 hover:bg-yellow-600">
            🥇 1st Place
          </Badge>
        );
      case 2:
        return (
          <Badge className="gap-1 bg-gray-400 hover:bg-gray-500">
            🥈 2nd Place
          </Badge>
        );
      case 3:
        return (
          <Badge className="gap-1 bg-amber-700 hover:bg-amber-800">
            🥉 3rd Place
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <Hash className="h-3 w-3" />
            {rank}
          </Badge>
        );
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Question {currentCard} of {totalCards}
          </span>
          <span className="text-muted-foreground">
            {Math.round(progressPercent)}% complete
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Score and Rank */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span className="font-semibold text-lg">{currentScore} points</span>
        </div>

        {currentRank && (
          <div className="flex items-center gap-2">
            {getRankBadge(currentRank)}
            {getRankIcon()}
          </div>
        )}
      </div>

      {/* Progress Dots */}
      <div className="flex items-center gap-1 flex-wrap">
        {Array.from({ length: totalCards }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              index < currentCard
                ? "bg-primary"
                : index === currentCard - 1
                  ? "bg-primary/60 animate-pulse"
                  : "bg-muted",
            )}
          />
        ))}
      </div>
    </div>
  );
}
