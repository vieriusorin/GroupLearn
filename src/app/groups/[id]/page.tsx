import Link from "next/link";
import {
  GroupLearningHeader,
  GroupLearningPathsGrid,
} from "@/components/groups";
import { SessionsList } from "@/components/realtime";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  getAssignedPaths,
  getGroupDetail,
} from "@/presentation/actions/groups";
import { getDomains, getCategories } from "@/presentation/actions/content";
import { auth } from "@/lib/auth/auth";
import { FeatureFlags } from "@/lib/shared/feature-flags";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GroupLearningPage({ params }: Props) {
  const { id } = await params;
  const groupId = Number(id);

  // Get current user session
  const session = await auth();
  const currentUserId = session?.user?.id;

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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <GroupLearningHeader group={groupResult.data.group} />

      {/* Live Sessions Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg border-2 border-purple-200 dark:border-purple-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
              ⚡ Live Quiz Sessions
            </h2>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Challenge your group members in real-time!
            </p>
          </div>
        </div>

        {FeatureFlags.LIVE_SESSIONS ? (
          <SessionsList
            groupId={groupId}
            currentUserId={currentUserId}
            categories={categories}
            autoRefresh={true}
          />
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              🔧 Live sessions feature is disabled. Enable it in .env.local:
              <br />
              <code className="bg-yellow-100 dark:bg-yellow-950 px-2 py-1 rounded text-xs mt-2 inline-block">
                NEXT_PUBLIC_FEATURE_LIVE_SESSIONS=true
              </code>
            </p>
          </div>
        )}
      </div>

      {/* Learning Paths Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Learning Paths</h2>
        <GroupLearningPathsGrid paths={visiblePaths} />
      </div>
    </div>
  );
}
