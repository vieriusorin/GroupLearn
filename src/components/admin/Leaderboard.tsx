"use client";

import type { GroupLeaderboardEntry as LeaderboardEntryType } from "@/application/dtos/groups.dto";
import { EmptyState } from "@/components/admin/EmptyState";
import { LeaderboardEntry } from "@/components/admin/LeaderboardEntry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeaderboardProps {
  leaderboard: LeaderboardEntryType[];
  groupId: number;
}

export const Leaderboard = ({ leaderboard, groupId }: LeaderboardProps) => {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-xl">Top Performers</CardTitle>
      </CardHeader>
      <CardContent className="p-0" aria-label="Leaderboard">
        {leaderboard.length > 0 ? (
          <div className="divide-y">
            {leaderboard.map((entry) => (
              <LeaderboardEntry
                key={entry.userId}
                entry={entry}
                groupId={groupId}
              />
            ))}
          </div>
        ) : (
          <div className="px-6 py-12" aria-live="polite">
            <EmptyState
              icon="🏆"
              title="No activity data yet"
              description="Members will appear here as they complete lessons"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
