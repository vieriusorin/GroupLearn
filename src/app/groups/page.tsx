import { GroupsClient } from "@/components/groups/GroupsClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getMyGroups } from "@/presentation/actions/groups";

export default async function GroupsPage() {
  const result = await getMyGroups();

  if (!result.success) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            {result.error || "Failed to load groups. Please try again."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <GroupsClient initialGroups={result.data} />;
}
