import Link from "next/link";
import { AdminGroupDetailClient } from "@/components/admin/AdminGroupDetailClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getGroupDetail } from "@/presentation/actions/groups";

export default async function AdminGroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const groupId = Number(id);

  const result = await getGroupDetail(groupId);

  if (!result.success) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            {result.error || "Failed to load group. Please try again."}
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

  return (
    <AdminGroupDetailClient
      group={result.data.group}
      members={result.data.members}
      invitations={result.data.invitations}
    />
  );
}
