import Link from "next/link";
import {
  GroupLearningHeader,
  GroupLearningPathsGrid,
} from "@/components/groups";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  getAssignedPaths,
  getGroupDetail,
} from "@/presentation/actions/groups";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GroupLearningPage({ params }: Props) {
  const { id } = await params;
  const groupId = Number(id);

  const [groupResult, pathsResult] = await Promise.all([
    getGroupDetail(groupId),
    getAssignedPaths(groupId),
  ]);

  if (!groupResult.success) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            {groupResult.error || "Failed to load group. Please try again."}
          </AlertDescription>
        </Alert>
        <div className="text-center py-12">
          <Link href="/groups">
            <Button variant="outline">Back to Groups</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!pathsResult.success) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <GroupLearningHeader group={groupResult.data.group} />
        <Alert variant="destructive">
          <AlertDescription>
            {pathsResult.error ||
              "Failed to load learning paths. Please try again."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const visiblePaths = pathsResult.data.filter((p) => Boolean(p.isVisible));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <GroupLearningHeader group={groupResult.data.group} />

      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Learning Paths</h2>
        <GroupLearningPathsGrid paths={visiblePaths} />
      </div>
    </div>
  );
}
