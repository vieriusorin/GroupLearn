import { AdminGroupsClient } from "@/components/admin/AdminGroupsClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getGroups } from "@/presentation/actions/groups";

export default async function AdminGroupsPage() {
  const result = await getGroups();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-muted-foreground mt-1">
            Manage learning groups and members
          </p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            {result.error || "Failed to load groups. Please try again."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <AdminGroupsClient initialGroups={result.data} />;
}
