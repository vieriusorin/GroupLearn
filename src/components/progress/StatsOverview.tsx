"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardStats } from "@/lib/types";

interface StatsOverviewProps {
  stats: DashboardStats | undefined;
}

export const StatsOverview = ({ stats }: StatsOverviewProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Cards</CardDescription>
          <CardTitle className="text-3xl">{stats?.total_cards || 0}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Due Today</CardDescription>
          <CardTitle className="text-3xl text-orange-600">
            {stats?.cards_due_today || 0}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Reviewed Today</CardDescription>
          <CardTitle className="text-3xl text-green-600">
            {stats?.cards_reviewed_today || 0}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Current Streak</CardDescription>
          <CardTitle className="text-3xl">
            🔥 {stats?.current_streak || 0}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Struggling</CardDescription>
          <CardTitle className="text-3xl text-red-600">
            {stats?.struggling_cards || 0}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
};
