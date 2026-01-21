"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { LeaderboardEntry as LeaderboardEntryType } from "@/lib/analytics";
import { formatTime } from "@/lib/utils";

interface LeaderboardEntryProps {
  entry: LeaderboardEntryType;
  groupId: number;
}

export function LeaderboardEntry({ entry, groupId }: LeaderboardEntryProps) {
  const rankColors = {
    1: "bg-yellow-100 text-yellow-700",
    2: "bg-gray-200 text-gray-700",
    3: "bg-orange-100 text-orange-700",
    default: "bg-gray-100 text-gray-600",
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
    <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
      <div className="flex items-center gap-4 flex-1">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${rankColor}`}
        >
          #{entry.rank}
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900">{entry.userName}</div>
          <div className="text-sm text-gray-600">
            {entry.lessonsCompleted} lessons • {formatTime(entry.timeSpent)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {entry.streak > 0 && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
            🔥 {entry.streak} day streak
          </span>
        )}
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">{entry.score}</div>
          <div className="text-xs text-gray-500">points</div>
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
}
