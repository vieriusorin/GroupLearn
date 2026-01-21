"use client";

import { DomainProgressCard, StatsOverview } from "@/components/progress";
import type { DashboardStats } from "@/lib/types";

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
