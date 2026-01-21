/**
 * Admin Recent Activity Section Component
 */

import { RecentActivityCard } from "@/components/admin/RecentActivityCard";
import type { RecentDomain, RecentGroup } from "@/types/admin";

interface AdminRecentActivityProps {
  recentGroups: RecentGroup[];
  recentDomains: RecentDomain[];
}

export const AdminRecentActivity = ({
  recentGroups,
  recentDomains,
}: AdminRecentActivityProps) => {
  return (
    <section aria-label="Recent activity">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivityCard
          title="Recent Groups"
          items={recentGroups}
          emptyMessage="No groups yet"
        />
        <RecentActivityCard
          title="Recent Domains"
          items={recentDomains}
          emptyMessage="No domains yet"
        />
      </div>
    </section>
  );
};
