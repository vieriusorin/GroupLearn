"use client";

import { useEffect, useState } from "react";
import { SessionCard } from "./SessionCard";
import { CreateSessionDialog } from "./CreateSessionDialog";
import type { LiveSessionWithParticipants } from "@/application/dtos/realtime.dto";
import { getActiveLiveSessions } from "@/presentation/actions/realtime/liveSession.actions";
import { Loader2, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionsListProps {
  groupId: number;
  currentUserId?: string;
  initialSessions?: LiveSessionWithParticipants[];
  categories?: Array<{ id: number; name: string }>;
  autoRefresh?: boolean;
}

export function SessionsList({
  groupId,
  currentUserId,
  initialSessions = [],
  categories = [],
  autoRefresh = true,
}: SessionsListProps) {
  const [sessions, setSessions] = useState<LiveSessionWithParticipants[]>(initialSessions);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getActiveLiveSessions(groupId);

      if (result.success && result.data) {
        setSessions(result.data);
      } else {
        setError(result.error || "Failed to load sessions");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Failed to fetch sessions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch sessions on mount if no initial sessions provided
    if (initialSessions.length === 0) {
      fetchSessions();
    }

    // Set up auto-refresh interval
    if (autoRefresh) {
      const interval = setInterval(fetchSessions, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [groupId, autoRefresh]);

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
        <p className="text-sm text-destructive mb-4">{error}</p>
        <Button variant="outline" onClick={fetchSessions}>
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sessions Grid or Empty State */}
      {sessions.length > 0 ? (
        <>
          {/* Header with session count */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Radio className="h-5 w-5 text-green-500" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </div>
              <span className="text-sm font-medium">
                {sessions.length} active {sessions.length === 1 ? "session" : "sessions"}
              </span>
            </div>
            <CreateSessionDialog
              groupId={groupId}
              categories={categories}
              trigger={
                <Button size="sm" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Radio className="h-4 w-4" />
                  Create Session
                </Button>
              }
            />
          </div>

          {/* Sessions Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                groupId={groupId}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </>
      ) : (
        <EmptyState groupId={groupId} categories={categories} />
      )}
    </div>
  );
}

function EmptyState({
  groupId,
  categories,
}: {
  groupId: number;
  categories: Array<{ id: number; name: string }>;
}) {
  return (
    <div className="rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-900 p-12 text-center">
      <div className="mx-auto flex max-w-[480px] flex-col items-center justify-center text-center">
        {/* Large animated icon */}
        <div className="relative mb-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
            <Radio className="h-12 w-12 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold animate-bounce">
            NEW
          </div>
        </div>

        {/* Heading */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          No Live Sessions Yet
        </h3>

        {/* Description */}
        <p className="text-base text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          🎮 Create a <span className="font-semibold text-purple-600 dark:text-purple-400">Blitz Quiz</span> and challenge your group members!
          <br />
          Compete in real-time, climb the leaderboard, and earn XP rewards.
        </p>

        {/* Large prominent button */}
        <CreateSessionDialog
          groupId={groupId}
          categories={categories}
          trigger={
            <Button
              size="lg"
              className="gap-3 h-14 px-8 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Radio className="h-5 w-5" />
              Create Live Session
            </Button>
          }
        />

        {/* Feature highlights */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">⚡</span>
            <span>Real-time</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">🏆</span>
            <span>Leaderboard</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">🎁</span>
            <span>XP Rewards</span>
          </div>
        </div>
      </div>
    </div>
  );
}
