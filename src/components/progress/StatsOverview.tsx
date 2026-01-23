"use client";

import type { DashboardStats } from "@/application/dtos";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatsOverviewProps {
  stats: DashboardStats | undefined;
}

export const StatsOverview = ({ stats }: StatsOverviewProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Cards</CardDescription>
          <CardTitle className="text-3xl">{stats?.totalCards || 0}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Due Today</CardDescription>
          <CardTitle className="text-3xl text-orange-600">
            {stats?.cardsDueToday || 0}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Reviewed Today</CardDescription>
          <CardTitle className="text-3xl text-green-600">
            {stats?.cardsReviewedToday || 0}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Current Streak</CardDescription>
          <CardTitle className="text-3xl">
            🔥 {stats?.currentStreak || 0}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Struggling</CardDescription>
          <CardTitle className="text-3xl text-red-600">
            {stats?.strugglingCards || 0}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
};
