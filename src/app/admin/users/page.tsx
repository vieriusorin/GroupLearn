import { AdminUsersClient } from "@/components/admin/AdminUsersClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getUsers } from "@/presentation/actions/admin";

export default async function AdminUsersPage() {
  const result = await getUsers();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage user access to learning paths
          </p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            {result.error || "Failed to load users. Please try again."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <AdminUsersClient initialUsers={result.data} />;
}
