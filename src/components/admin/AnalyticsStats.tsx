"use client";

import { StatCard } from "@/components/admin/StatCard";
import type { GroupAnalytics } from "@/lib/analytics";
import { formatTime } from "@/lib/utils";

interface AnalyticsStatsProps {
  analytics: GroupAnalytics;
}

export function AnalyticsStats({ analytics }: AnalyticsStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Members"
        value={analytics.memberCount}
        icon="👥"
        color="blue"
        subtitle={`${analytics.activeMembers} active (7 days)`}
      />
      <StatCard
        title="Lessons Completed"
        value={analytics.totalLessonsCompleted}
        icon="📚"
        color="green"
        subtitle={`${analytics.completionRate}% completion rate`}
      />
      <StatCard
        title="Flashcards Reviewed"
        value={analytics.totalFlashcardsReviewed}
        icon="🎴"
        color="purple"
      />
      <StatCard
        title="Time Spent"
        value={formatTime(analytics.totalTimeSpent)}
        icon="⏱️"
        color="orange"
        subtitle={`Avg score: ${Math.round(analytics.averageScore)}%`}
      />
    </div>
  );
}
