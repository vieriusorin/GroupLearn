"use client";

import { EmptyState } from "@/components/admin/EmptyState";
import { LeaderboardEntry } from "@/components/admin/LeaderboardEntry";
import type { LeaderboardEntry as LeaderboardEntryType } from "@/lib/analytics";

interface LeaderboardProps {
  leaderboard: LeaderboardEntryType[];
  groupId: number;
}

export function Leaderboard({ leaderboard, groupId }: LeaderboardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Top Performers</h2>
      </div>
      <div className="divide-y" aria-label="Leaderboard">
        {leaderboard.length > 0 ? (
          leaderboard.map((entry) => (
            <LeaderboardEntry
              key={entry.userId}
              entry={entry}
              groupId={groupId}
            />
          ))
        ) : (
          <div className="px-6 py-12" aria-live="polite">
            <EmptyState
              icon="🏆"
              title="No activity data yet"
              description="Members will appear here as they complete lessons"
            />
          </div>
        )}
      </div>
    </div>
  );
}
