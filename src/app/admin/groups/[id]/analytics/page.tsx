import Link from "next/link";
import { AnalyticsHeader } from "@/components/admin/AnalyticsHeader";
import { AnalyticsStats } from "@/components/admin/AnalyticsStats";
import { AssignedPathsCard } from "@/components/admin/AssignedPathsCard";
import { Leaderboard } from "@/components/admin/Leaderboard";
import { QuickActions } from "@/components/admin/QuickActions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  getGroupAnalyticsAction,
  getGroupLeaderboardAction,
} from "@/presentation/actions/groups";

export default async function GroupAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const groupId = Number(id);

  const [analyticsResult, leaderboardResult] = await Promise.all([
    getGroupAnalyticsAction(groupId),
    getGroupLeaderboardAction(groupId, 10),
  ]);

  if (!analyticsResult.success || !leaderboardResult.success) {
    const errorMessage =
      (!analyticsResult.success && "error" in analyticsResult
        ? analyticsResult.error
        : undefined) ||
      (!leaderboardResult.success && "error" in leaderboardResult
        ? leaderboardResult.error
        : undefined) ||
      "Failed to load analytics. Please try again.";

    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
        <div className="text-center">
          <Link href={`/admin/groups/${groupId}`}>
            <Button variant="outline">Back to Group</Button>
          </Link>
        </div>
      </div>
    );
  }

  const analytics = analyticsResult.data;
  const leaderboard = leaderboardResult.data;

  const quickActions = [
    {
      href: `/admin/groups/${groupId}`,
      icon: "👥",
      title: "Manage Members",
      description: "Invite new members or manage roles",
      ariaLabel: "Manage group members",
    },
    {
      href: `/admin/groups/${groupId}/paths`,
      icon: "📚",
      title: "Assign Paths",
      description: "Add learning paths to your group",
      ariaLabel: "Assign learning paths to group",
    },
    {
      href: "#",
      icon: "📊",
      title: "Export Report",
      description: "Download CSV report (coming soon)",
      ariaLabel: "Export report (coming soon)",
      disabled: true,
    },
  ];

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        title={`Analytics - ${analytics.groupName}`}
        description="Performance metrics and member progress"
        backHref={`/admin/groups/${groupId}`}
        backLabel="← Back to Group"
      />

      <AnalyticsStats analytics={analytics} />

      <AssignedPathsCard
        groupId={groupId}
        totalPaths={analytics.totalPathsAssigned}
      />

      <Leaderboard leaderboard={leaderboard} groupId={groupId} />

      <QuickActions actions={quickActions} />
    </div>
  );
}
