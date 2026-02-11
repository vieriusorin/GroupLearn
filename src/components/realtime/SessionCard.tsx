"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import type { LiveSessionWithParticipants } from "@/application/dtos/realtime.dto";
import { joinLiveSession } from "@/presentation/actions/realtime/liveSession.actions";
import {
  Zap,
  Users,
  FileCheck,
  Clock,
  Hash,
  User,
  Sparkles,
  Loader2
} from "lucide-react";
import { formatDistance } from "date-fns";

interface SessionCardProps {
  session: LiveSessionWithParticipants;
  groupId: number;
  currentUserId?: string;
}

export function SessionCard({ session, groupId, currentUserId }: SessionCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isHost = currentUserId === session.hostId;
  const isParticipant = session.participants.some(p => p.userId === currentUserId);
  const canJoin = !isParticipant && session.status === "waiting";
  const isFull = false; // TODO: Add max participants check if needed

  const handleJoin = () => {
    startTransition(async () => {
      try {
        setError(null);
        const result = await joinLiveSession(session.id);

        if (result.success) {
          // Navigate to session lobby
          router.push(`/groups/${groupId}/sessions/${session.id}`);
        } else {
          setError(result.error || "Failed to join session");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error("Failed to join session:", err);
      }
    });
  };

  const handleEnter = () => {
    router.push(`/groups/${groupId}/sessions/${session.id}`);
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case "blitz_quiz":
        return <Zap className="h-4 w-4" />;
      case "study_room":
        return <Users className="h-4 w-4" />;
      case "peer_review":
        return <FileCheck className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getSessionTypeName = (type: string) => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return <Badge variant="outline" className="bg-yellow-50">Waiting</Badge>;
      case "in_progress":
        return <Badge className="bg-green-500">Live</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const config = session.config as any || {};

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {getSessionTypeIcon(session.sessionType)}
              <CardTitle className="text-lg">
                {getSessionTypeName(session.sessionType)}
              </CardTitle>
              {getStatusBadge(session.status)}
            </div>
            <CardDescription className="flex items-center gap-2">
              <User className="h-3 w-3" />
              Hosted by {session.hostName || "Unknown"}
            </CardDescription>
          </div>
          {isHost && (
            <Badge variant="default" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Host
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Session Stats */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{session.participantCount} joined</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Hash className="h-3 w-3" />
            <span>{config.cardCount || 10} cards</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{config.timeLimit || 30}s each</span>
          </div>
        </div>

        {/* Participants Preview */}
        {session.participants.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {session.participants.slice(0, 5).map((participant) => (
                <div
                  key={participant.userId}
                  className="relative inline-block rounded-full ring-2 ring-background"
                  title={participant.userName || "Anonymous"}
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                    {(participant.userName || "?").charAt(0).toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
            {session.participantCount > 5 && (
              <span className="text-sm text-muted-foreground">
                +{session.participantCount - 5} more
              </span>
            )}
          </div>
        )}

        {/* Time Created */}
        <p className="text-xs text-muted-foreground">
          Created {formatDistance(new Date(session.createdAt), new Date(), { addSuffix: true })}
        </p>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}
      </CardContent>

      <CardFooter>
        {canJoin && (
          <Button
            onClick={handleJoin}
            disabled={isPending || isFull}
            className="w-full"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : isFull ? (
              "Session Full"
            ) : (
              "Join Session"
            )}
          </Button>
        )}

        {isParticipant && (
          <Button onClick={handleEnter} className="w-full" variant="default">
            {session.status === "waiting" ? "Enter Lobby" : "Join Quiz"}
          </Button>
        )}

        {session.status === "completed" && !isParticipant && (
          <Button variant="outline" className="w-full" disabled>
            Session Ended
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
