import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getMemberProgressAction } from "@/presentation/actions/groups";

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export default async function MemberProgressPage({
  params,
}: {
  params: Promise<{ id: string; userId: string }>;
}) {
  const { id, userId } = await params;
  const groupId = Number(id);

  const result = await getMemberProgressAction(groupId, userId);

  if (!result.success) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            {result.error || "Failed to load progress. Please try again."}
          </AlertDescription>
        </Alert>
        <div className="text-center">
          <Link href={`/admin/groups/${groupId}/analytics`}>
            <Button variant="outline">Back to Analytics</Button>
          </Link>
        </div>
      </div>
    );
  }

  const progress = result.data;

  return (
    <main className="space-y-6">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <Link href={`/admin/groups/${groupId}/analytics`}>
            <Button variant="outline" size="sm" aria-label="Back to analytics">
              ← Back to Analytics
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          {progress.userName}'s Progress
        </h1>
        <p className="text-gray-600 mt-1">{progress.userEmail}</p>
      </header>

      <section aria-label="Progress summary statistics">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <article className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-2xl mb-2" aria-hidden="true">
              📚
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              <span className="sr-only">Lessons completed: </span>
              {progress.lessonsCompleted}
              <span className="text-lg text-gray-500">
                /{progress.lessonsTotal}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-600">
              Lessons Completed
            </div>
            <div className="mt-2">
              <div
                className="w-full bg-gray-200 rounded-full h-2"
                aria-valuenow={Math.min(progress.completionRate, 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Completion rate: ${progress.completionRate}%`}
              >
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(progress.completionRate, 100)}%`,
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {progress.completionRate.toFixed(1)}% complete
              </div>
            </div>
          </article>

          <article className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-2xl mb-2" aria-hidden="true">
              🎴
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              <span className="sr-only">Flashcards reviewed: </span>
              {progress.flashcardsReviewed.toLocaleString()}
            </div>
            <div className="text-sm font-medium text-gray-600">
              Flashcards Reviewed
            </div>
          </article>

          <article className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-2xl mb-2" aria-hidden="true">
              ⏱️
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              <span className="sr-only">Total time spent: </span>
              {formatTime(progress.totalTimeSpent)}
            </div>
            <div className="text-sm font-medium text-gray-600">Time Spent</div>
            <div className="text-xs text-gray-500 mt-1">
              Avg score: {Math.round(progress.averageScore)}%
            </div>
          </article>

          <article className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-2xl mb-2" aria-hidden="true">
              🔥
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              <span className="sr-only">Current streak: </span>
              {progress.currentStreak}
            </div>
            <div className="text-sm font-medium text-gray-600">Day Streak</div>
            {progress.lastActivityAt && (
              <div className="text-xs text-gray-500 mt-1">
                Last:{" "}
                <time dateTime={progress.lastActivityAt}>
                  {new Date(progress.lastActivityAt).toLocaleDateString()}
                </time>
              </div>
            )}
          </article>
        </div>
      </section>

      <section aria-label="Learning path progress">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Learning Path Progress
            </h2>
          </div>
          {progress.pathsProgress.length > 0 ? (
            <ul className="divide-y">
              {progress.pathsProgress.map((path) => (
                <li key={path.pathId} className="px-6 py-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {path.pathName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>
                          <span className="sr-only">Units: </span>
                          {path.unitsCompleted}/{path.unitsTotal} units
                        </span>
                        <span aria-hidden="true">•</span>
                        <span>
                          <span className="sr-only">Lessons: </span>
                          {path.lessonsCompleted}/{path.lessonsTotal} lessons
                        </span>
                        <span aria-hidden="true">•</span>
                        <span>
                          <span className="sr-only">Time spent: </span>
                          {formatTime(path.timeSpent)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        <span className="sr-only">Completion rate: </span>
                        {path.completionRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        Avg: {path.averageScore.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div
                    className="w-full bg-gray-200 rounded-full h-2"
                    aria-valuenow={Math.min(path.completionRate, 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${path.pathName} completion: ${path.completionRate.toFixed(1)}%`}
                  >
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(path.completionRate, 100)}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              No learning paths started yet
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
