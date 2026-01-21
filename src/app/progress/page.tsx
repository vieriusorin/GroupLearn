import { ProgressHeader } from "@/components/progress";
import { ProgressPageClient } from "@/components/progress/ProgressPageClient";
import { getStats } from "@/presentation/actions/stats/get-stats";

export default async function ProgressPage() {
  const result = await getStats();

  if (!result.success) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        aria-live="polite"
      >
        <div className="text-destructive">
          {result.error || "Failed to load progress. Please try again."}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <ProgressHeader />
      <ProgressPageClient initialStats={result.data} />
    </div>
  );
}
