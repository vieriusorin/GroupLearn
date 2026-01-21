import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AdminUserPathAccessClient } from "@/components/admin/AdminUserPathAccessClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getUserPaths } from "@/presentation/actions/admin";

interface UserPathAccessPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserPathAccessPage({
  params,
}: UserPathAccessPageProps) {
  const { id } = await params;
  const userId = id;

  const result = await getUserPaths(userId);

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="icon" aria-label="Back to users">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Manage Path Access</h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            {result.error || "Failed to load user paths. Please try again."}
          </AlertDescription>
        </Alert>
        <div className="text-center">
          <Link href="/admin/users">
            <Button variant="outline">Back to Users</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { user, paths } = result.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon" aria-label="Back to users">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Manage Path Access</h1>
          <p className="text-muted-foreground mt-1">
            {user.name || "Unnamed User"} ({user.email})
          </p>
        </div>
      </div>

      <AdminUserPathAccessClient user={user} paths={paths} />
    </div>
  );
}
