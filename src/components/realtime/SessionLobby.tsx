"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LiveSessionDetail } from "@/application/dtos/realtime.dto";
import { startLiveSession } from "@/presentation/actions/realtime/liveSession.actions";
import { useLiveSession } from "@/hooks/useSocket";
import {
  Users,
  Crown,
  Clock,
  Hash,
  Zap,
  LogOut,
  Loader2,
  Play,
  CheckCircle2,
  Radio,
} from "lucide-react";

interface SessionLobbyProps {
  session: LiveSessionDetail;
  groupId: number;
  currentUserId: string;
}

export function SessionLobby({ session, groupId, currentUserId }: SessionLobbyProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isHost = currentUserId === session.hostId;
  const config = session.config as any || {};
  const minParticipants = 1; // Minimum participants to start

  // Connect to Socket.io and listen for session events
  const { sessionState, isConnected } = useLiveSession(session.id, true);

  // Auto-navigate to quiz when session starts (for non-hosts)
  useEffect(() => {
    if (sessionState.status === 'active' && !isHost) {
      router.push(`/groups/${groupId}/sessions/${session.id}/quiz`);
    }
  }, [sessionState.status, isHost, router, groupId, session.id]);

  const handleStart = () => {
    if (session.participantCount < minParticipants) {
      setError(`Need at least ${minParticipants} participant${minParticipants > 1 ? 's' : ''} to start`);
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        const result = await startLiveSession(session.id);

        if (result.success) {
          // Navigate to quiz interface
          router.push(`/groups/${groupId}/sessions/${session.id}/quiz`);
        } else {
          setError(result.error || "Failed to start session");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error("Failed to start session:", err);
      }
    });
  };

  const handleLeave = () => {
    // TODO: Implement leave session
    router.push(`/groups/${groupId}`);
  };

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case "blitz_quiz":
        return "Blitz Quiz";
      case "study_room":
        return "Study Room";
      case "peer_review":
        return "Peer Review";
      default:
        return type;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Zap className="h-8 w-8" />
              {getSessionTypeLabel(session.sessionType)}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              Hosted by {session.hostName || "Unknown"}
              {isConnected && (
                <Badge variant="outline" className="gap-1 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">
                  <Radio className="h-3 w-3 animate-pulse" />
                  Live
                </Badge>
              )}
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2 bg-yellow-50">
            Waiting to Start
          </Badge>
        </div>
      </div>

      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center p-4 rounded-lg bg-muted">
            <Hash className="h-5 w-5 mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">{config.cardCount || 10}</div>
            <div className="text-xs text-muted-foreground">Cards</div>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-muted">
            <Clock className="h-5 w-5 mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">{config.timeLimit || 30}s</div>
            <div className="text-xs text-muted-foreground">Per Card</div>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-muted">
            <Users className="h-5 w-5 mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">{session.participantCount}</div>
            <div className="text-xs text-muted-foreground">Participants</div>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-muted">
            <Zap className="h-5 w-5 mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">{config.allowHints ? "Yes" : "No"}</div>
            <div className="text-xs text-muted-foreground">AI Hints</div>
          </div>
        </CardContent>
      </Card>

      {/* Participants List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participants ({session.participantCount})
            </span>
            {session.participantCount >= minParticipants && (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {session.participants.map((participant) => (
              <div
                key={participant.userId}
                className="flex items-center justify-between p-3 rounded-lg bg-muted"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    {(participant.userName || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">
                      {participant.userName || "Anonymous"}
                    </div>
                    {participant.userId === session.hostId && (
                      <Badge variant="default" className="gap-1 h-5 text-xs">
                        <Crown className="h-3 w-3" />
                        Host
                      </Badge>
                    )}
                  </div>
                </div>
                {participant.userId === currentUserId && (
                  <Badge variant="outline">You</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={handleLeave}
          disabled={isPending}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Leave Session
        </Button>

        {isHost && (
          <Button
            size="lg"
            onClick={handleStart}
            disabled={isPending || session.participantCount < minParticipants}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Start Quiz
              </>
            )}
          </Button>
        )}

        {!isHost && (
          <div className="text-sm text-muted-foreground">
            Waiting for host to start the quiz...
          </div>
        )}
      </div>

      {/* Instructions */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">How to Play:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Answer each question within the time limit</li>
            <li>Earn 10 points for correct answers + speed bonus (up to 10 points)</li>
            <li>Top performers earn XP rewards at the end</li>
            <li>Watch the live leaderboard to track your ranking</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
