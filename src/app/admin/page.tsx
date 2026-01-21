import { AdminDashboardHeader } from "@/components/admin/AdminDashboardHeader";
import { AdminQuickActions } from "@/components/admin/AdminQuickActions";
import { AdminRecentActivity } from "@/components/admin/AdminRecentActivity";
import { AdminStatsGrid } from "@/components/admin/AdminStatsGrid";
import { AdminStatsRepository } from "@/lib/repositories/admin-stats.repository";

export default async function AdminDashboard() {
  const { stats, recentGroups, recentDomains } =
    await AdminStatsRepository.getDashboardData();

  return (
    <div className="space-y-6">
      <AdminDashboardHeader />

      <AdminStatsGrid stats={stats} />

      <AdminRecentActivity
        recentGroups={recentGroups}
        recentDomains={recentDomains}
      />

      <AdminQuickActions />
    </div>
  );
}
