"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { DuolingoSidebar } from "@/components/layout/DuolingoSidebar";
import { PathSelector } from "@/components/path/PathSelector";
import { PathVisualization } from "@/components/path/PathVisualization";
import type { PathWithProgress, UserProgress } from "@/lib/types";
import { getUserProgress } from "@/presentation/actions/progress/get-user-progress";
import { getUserStats } from "@/presentation/actions/user/get-user-stats";

const SELECTED_PATH_KEY = "selectedPathId";

interface LearnPageClientProps {
  initialPaths: PathWithProgress[];
  initialPathId: number | null;
  initialProgress: UserProgress | null;
  initialUserStats: {
    total_xp: number;
    streak_count: number;
    lessons_completed_today: number;
    total_lessons_completed: number;
    xp_earned_today: number;
  } | null;
}

export function LearnPageClient({
  initialPaths,
  initialPathId,
  initialProgress,
  initialUserStats,
}: LearnPageClientProps) {
  const router = useRouter();
  const [_isPending, startTransition] = useTransition();
  const [paths] = useState(initialPaths);
  const [selectedPathId, setSelectedPathId] = useState<number | null>(
    initialPathId,
  );
  const [_progress, setProgress] = useState<UserProgress | null>(
    initialProgress,
  );
  const [userStats, setUserStats] = useState(initialUserStats);

  // Load selected path from localStorage on mount
  useEffect(() => {
    if (paths.length > 0 && typeof window !== "undefined") {
      const savedPathId = localStorage.getItem(SELECTED_PATH_KEY);
      if (savedPathId) {
        const pathId = parseInt(savedPathId, 10);
        const pathExists = paths.some((p) => p.id === pathId);
        if (pathExists) {
          setSelectedPathId(pathId);
          // Fetch progress for saved path
          startTransition(async () => {
            const result = await getUserProgress(pathId);
            if (result.success) {
              setProgress(result.data.progress as unknown as UserProgress);
            }
          });
        }
      }
    }
  }, [paths]);

  // Refresh user stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      startTransition(async () => {
        const result = await getUserStats();
        if (result.success) {
          setUserStats(result.data);
        }
      });
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSelectPath = async (pathId: number) => {
    setSelectedPathId(pathId);
    if (typeof window !== "undefined") {
      localStorage.setItem(SELECTED_PATH_KEY, pathId.toString());
    }

    // Fetch progress for selected path
    startTransition(async () => {
      const result = await getUserProgress(pathId);
      if (result.success) {
        setProgress(result.data.progress as unknown as UserProgress);
      }
      // Refresh page to get updated data
      router.refresh();
    });
  };

  const selectedPath = paths.find((p) => p.id === selectedPathId);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Path Selector */}
      {paths.length > 1 && selectedPathId && (
        <PathSelector
          paths={paths}
          selectedPathId={selectedPathId}
          onSelectPath={handleSelectPath}
        />
      )}

      {/* Main content area */}
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {selectedPath && <PathVisualization pathId={selectedPath.id} />}
        </div>

        {/* Right sidebar */}
        <aside aria-label="User progress and statistics">
          <DuolingoSidebar
            totalXP={userStats?.total_xp || 0}
            streakCount={userStats?.streak_count || 0}
            lessonsCompletedToday={userStats?.lessons_completed_today || 0}
            dailyGoalLessons={10}
            xpEarnedToday={userStats?.xp_earned_today || 0}
            isAuthenticated={true}
          />
        </aside>
      </main>
    </div>
  );
}
