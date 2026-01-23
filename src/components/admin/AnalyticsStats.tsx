"use client";

import type { GroupAnalytics } from "@/application/dtos/groups.dto";
import { StatCard } from "@/components/admin/StatCard";
import { formatTime } from "@/lib/shared/utils";

interface AnalyticsStatsProps {
  analytics: GroupAnalytics;
}

export const AnalyticsStats = ({ analytics }: AnalyticsStatsProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
};
