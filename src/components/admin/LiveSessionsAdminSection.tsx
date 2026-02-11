"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Radio, Users, Clock, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateSessionDialog } from "@/components/realtime/CreateSessionDialog";
import type { LiveSessionWithParticipants } from "@/application/dtos/realtime.dto";
import { getActiveLiveSessions } from "@/presentation/actions/realtime/liveSession.actions";

interface LiveSessionsAdminSectionProps {
  groupId: number;
  categories?: Array<{ id: number; name: string }>;
  onSessionCountChange?: (count: number) => void;
}

export function LiveSessionsAdminSection({
  groupId,
  categories = [],
  onSessionCountChange,
}: LiveSessionsAdminSectionProps) {
  const [sessions, setSessions] = useState<LiveSessionWithParticipants[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setError(null);
      const result = await getActiveLiveSessions(groupId);

      if (result.success && result.data) {
        setSessions(result.data);
        onSessionCountChange?.(result.data.length);
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
    fetchSessions();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, [groupId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Waiting</Badge>;
      case "active":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <Radio className="h-5 w-5 text-white" />
            </div>
            {sessions.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 text-white text-xs font-bold items-center justify-center">
                  {sessions.length}
                </span>
              </span>
            )}
          </div>
          <div>
            <CardTitle className="text-xl text-purple-900 dark:text-purple-100">
              Live Quiz Sessions
            </CardTitle>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Challenge your group in real-time!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/groups/${groupId}`}>
            <Button variant="outline" size="sm" className="gap-1">
              <ExternalLink className="h-3 w-3" />
              Member View
            </Button>
          </Link>
          <CreateSessionDialog
            groupId={groupId}
            categories={categories}
            trigger={
              <Button
                size="sm"
                className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Radio className="h-4 w-4" />
                Create Session
              </Button>
            }
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
            <p className="text-sm text-destructive mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchSessions}>
              Try Again
            </Button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-900 p-8 text-center">
            <div className="mx-auto flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 mb-4">
                <Radio className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Active Sessions
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Start a live quiz to challenge your group members!
              </p>
              <CreateSessionDialog
                groupId={groupId}
                categories={categories}
                trigger={
                  <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Radio className="h-4 w-4" />
                    Create First Session
                  </Button>
                }
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border bg-white dark:bg-gray-900 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                    <Radio className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {session.sessionType === "blitz_quiz" ? "Blitz Quiz" : session.sessionType}
                      </span>
                      {getStatusBadge(session.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {session.participants?.length || 0} participants
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.config?.totalCards || 10} cards
                      </span>
                    </div>
                  </div>
                </div>
                <Link href={`/groups/${groupId}/sessions/${session.id}`}>
                  <Button variant="outline" size="sm" className="gap-1">
                    {session.status === "waiting" ? "Enter Lobby" : "View Session"}
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
