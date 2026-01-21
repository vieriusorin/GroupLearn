import { AdminDomainsClient } from "@/components/admin/AdminDomainsClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getDomains } from "@/presentation/actions/content";

export default async function AdminDomainsPage() {
  const result = await getDomains();
  if (!result.success) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Manage Domains</h1>
          <p className="text-muted-foreground">
            Create and manage learning domains
          </p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            {result.error || "Failed to load domains. Please try again."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <AdminDomainsClient initialDomains={result.data} />;
}
