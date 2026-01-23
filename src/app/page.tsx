import Link from "next/link";
import { LearnPageClient } from "@/components/learn/LearnPageClient";
import { Button } from "@/components/ui/button";
import { getPaths } from "@/presentation/actions/paths/get-paths";
import { getUserProgress } from "@/presentation/actions/progress/get-user-progress";
import { getUserStats } from "@/presentation/actions/user/get-user-stats";

export default async function LearnPage() {
  const [pathsResult, userStatsResult] = await Promise.all([
    getPaths(),
    getUserStats(),
  ]);

  if (!pathsResult.success) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        aria-live="polite"
      >
        <div className="text-destructive">
          {pathsResult.error ||
            "Failed to load learning paths. Please try again."}
        </div>
      </div>
    );
  }

  const paths = pathsResult.data || [];

  if (paths.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl py-16 px-4">
        <div className="text-center space-y-6">
          <div className="text-8xl mb-4">🦉</div>
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome to Learning Cards!
            </h1>
            <p className="text-muted-foreground text-lg">
              Create your first learning path to get started
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/domains">
              <Button size="lg" className="text-lg py-6 px-8">
                Set Up Domains & Paths
              </Button>
            </Link>
            <Link href="/review">
              <Button size="lg" variant="outline" className="text-lg py-6 px-8">
                Practice Existing Cards
              </Button>
            </Link>
          </div>

          <div className="mt-12 p-6 bg-secondary rounded-lg">
            <h2 className="font-semibold mb-2">Getting Started</h2>
            <ol className="text-sm text-muted-foreground space-y-2 text-left max-w-md mx-auto">
              <li>
                1. Create a domain (e.g., &quot;Spanish&quot;,
                &quot;Biology&quot;)
              </li>
              <li>
                2. Add a path to your domain (e.g., &quot;Beginner
                Spanish&quot;)
              </li>
              <li>3. Create units and lessons within your path</li>
              <li>4. Start learning and track your progress!</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  const initialPathId = paths[0]?.id || null;

  let initialProgress = null;
  if (initialPathId) {
    const progressResult = await getUserProgress(initialPathId);
    if (progressResult.success && progressResult.data) {
      const progressData = progressResult.data.progress;
      initialProgress = {
        id: progressData.id || 0,
        userId: progressData.userId,
        pathId: progressData.pathId,
        currentUnitId: progressData.currentUnitId,
        currentLessonId: progressData.currentLessonId,
        totalXp: progressData.totalXP,
        hearts: progressData.hearts,
        lastHeartRefill: new Date(progressData.lastHeartRefill),
        streakCount: progressData.streakCount,
        lastActivityDate: progressData.lastActivityDate
          ? new Date(progressData.lastActivityDate)
          : null,
        startedAt: progressData.startedAt
          ? new Date(progressData.startedAt)
          : null,
        completedAt: progressData.completedAt
          ? new Date(progressData.completedAt)
          : null,
        timeSpentTotal: progressData.timeSpentTotal || 0,
        createdAt: new Date(progressData.startedAt),
        updatedAt: new Date(progressData.startedAt),
        groupId: null, // GetUserProgressResponse doesn't include groupId
      };
    }
  }

  return (
    <LearnPageClient
      initialPaths={paths}
      initialPathId={initialPathId}
      initialProgress={initialProgress}
      initialUserStats={userStatsResult.success ? userStatsResult.data : null}
    />
  );
}
