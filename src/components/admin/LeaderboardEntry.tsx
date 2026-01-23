"use client";

import Link from "next/link";
import type { GroupLeaderboardEntry as LeaderboardEntryType } from "@/application/dtos/groups.dto";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/shared/utils";

interface LeaderboardEntryProps {
  entry: LeaderboardEntryType;
  groupId: number;
}

export const LeaderboardEntry = ({ entry, groupId }: LeaderboardEntryProps) => {
  const rankColors = {
    1: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200",
    2: "bg-muted text-foreground",
    3: "bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200",
    default:
      "bg-muted text-muted-foreground dark:bg-muted/60 dark:text-muted-foreground",
  };

  const rankColor =
    entry.rank === 1
      ? rankColors[1]
      : entry.rank === 2
        ? rankColors[2]
        : entry.rank === 3
          ? rankColors[3]
          : rankColors.default;

  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-muted/60">
      <div className="flex flex-1 items-center gap-4">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${rankColor}`}
        >
          #{entry.rank}
        </div>
        <div className="flex-1">
          <div className="font-medium text-foreground">{entry.userName}</div>
          <div className="text-sm text-muted-foreground">
            {entry.lessonsCompleted} lessons • {formatTime(entry.timeSpent)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {entry.streak > 0 && (
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800 dark:bg-orange-900/60 dark:text-orange-200">
            🔥 {entry.streak} day streak
          </span>
        )}
        <div className="text-right">
          <div className="text-lg font-bold text-foreground">{entry.score}</div>
          <div className="text-xs text-muted-foreground">points</div>
        </div>
        <Link
          href={`/admin/groups/${groupId}/members/${entry.userId}/progress`}
          aria-label={`View progress for ${entry.userName}`}
        >
          <Button variant="outline" size="sm">
            View Progress
          </Button>
        </Link>
      </div>
    </div>
  );
};
