import Link from "next/link";
import { AdminGroupDetailClient } from "@/components/admin/AdminGroupDetailClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getGroupDetail } from "@/presentation/actions/groups";
import { getDomains, getCategories } from "@/presentation/actions/content";
import { FeatureFlags } from "@/lib/shared/feature-flags";

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

  // Fetch categories for live sessions (if feature is enabled)
  let categories: Array<{ id: number; name: string }> = [];
  if (FeatureFlags.LIVE_SESSIONS) {
    const domainsResult = await getDomains();
    if (domainsResult.success && domainsResult.data.domains.length > 0) {
      const firstDomain = domainsResult.data.domains[0];
      const categoriesResult = await getCategories(firstDomain.id);
      if (categoriesResult.success) {
        categories = categoriesResult.data.map((cat) => ({
          id: cat.id,
          name: cat.name,
        }));
      }
    }
  }

  return (
    <AdminGroupDetailClient
      group={result.data.group}
      members={result.data.members}
      invitations={result.data.invitations}
      categories={categories}
    />
  );
}
