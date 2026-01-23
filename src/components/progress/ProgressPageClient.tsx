"use client";

import type { DashboardStats } from "@/application/dtos";
import { DomainProgressCard, StatsOverview } from "@/components/progress";

interface ProgressPageClientProps {
  initialStats: DashboardStats;
}

export function ProgressPageClient({ initialStats }: ProgressPageClientProps) {
  return (
    <>
      <StatsOverview stats={initialStats} />
      <DomainProgressCard stats={initialStats} />
    </>
  );
}
