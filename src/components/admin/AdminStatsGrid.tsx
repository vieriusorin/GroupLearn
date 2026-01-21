/**
 * Admin Stats Grid Component
 */

import { StatCard } from "@/components/admin/StatCard";
import type { AdminStats } from "@/types/admin";

interface AdminStatsGridProps {
  stats: AdminStats;
}

export const AdminStatsGrid = ({ stats }: AdminStatsGridProps) => {
  return (
    <section aria-label="Platform statistics">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Domains"
          value={stats.domains}
          icon="🌐"
          href="/admin/domains"
          color="blue"
        />
        <StatCard
          title="Categories"
          value={stats.categories}
          icon="📁"
          href="/admin/categories"
          color="green"
        />
        <StatCard
          title="Flashcards"
          value={stats.flashcards}
          icon="🎴"
          href="/admin/flashcards"
          color="purple"
        />
        <StatCard
          title="Learning Paths"
          value={stats.paths}
          icon="🛤️"
          href="/admin/paths"
          color="orange"
        />
        <StatCard
          title="Groups"
          value={stats.groups}
          icon="👥"
          href="/admin/groups"
          color="pink"
        />
        <StatCard
          title="Users"
          value={stats.users}
          icon="👤"
          href="/admin/users"
          color="indigo"
        />
      </div>
    </section>
  );
};
