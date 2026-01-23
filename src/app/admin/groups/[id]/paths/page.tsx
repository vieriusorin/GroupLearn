import Link from "next/link";
import { AdminGroupPathsClient } from "@/components/admin/AdminGroupPathsClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  getAssignedPaths,
  getGroupDetail,
} from "@/presentation/actions/groups";
import { getPaths } from "@/presentation/actions/paths";

export default async function AdminGroupPathsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const groupId = Number(id);

  const [groupResult, assignedPathsResult, allPathsResult] = await Promise.all([
    getGroupDetail(groupId),
    getAssignedPaths(groupId),
    getPaths(),
  ]);

  if (!groupResult.success) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            {groupResult.error || "Failed to load group. Please try again."}
          </AlertDescription>
        </Alert>
        <div className="text-center">
          <Link href="/admin/groups">
            <Button variant="outline">Back to Groups</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!assignedPathsResult.success || !allPathsResult.success) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load paths. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const allPaths = allPathsResult.data.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    domainId: p.domainId,
    isPublic: p.visibility === "public",
    unitCount: p.totalUnits,
  }));

  return (
    <AdminGroupPathsClient
      group={groupResult.data.group}
      assignedPaths={assignedPathsResult.data}
      allPaths={allPaths}
    />
  );
}
