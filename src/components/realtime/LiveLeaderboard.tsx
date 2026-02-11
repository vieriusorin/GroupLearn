"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, TrendingUp, TrendingDown, Minus, Users } from "lucide-react";
import { cn } from "@/lib/shared/utils";

interface LeaderboardParticipant {
  userId: string;
  userName: string;
  score: number;
  rank: number;
  previousRank?: number;
  answeredCards: number;
  isCurrentUser?: boolean;
}

interface LiveLeaderboardProps {
  participants: LeaderboardParticipant[];
  currentUserId?: string;
  compact?: boolean;
  className?: string;
  showHeader?: boolean;
}

export function LiveLeaderboard({
  participants,
  currentUserId,
  compact = false,
  className,
  showHeader = true,
}: LiveLeaderboardProps) {
  const [prevParticipants, setPrevParticipants] = useState<LeaderboardParticipant[]>(participants);
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());

  // Detect changes in participant scores/ranks for animations
  useEffect(() => {
    const changed = new Set<string>();

    participants.forEach((current) => {
      const previous = prevParticipants.find((p) => p.userId === current.userId);
      if (previous && (previous.score !== current.score || previous.rank !== current.rank)) {
        changed.add(current.userId);
      }
    });

    if (changed.size > 0) {
      setAnimatingIds(changed);
      const timeout = setTimeout(() => setAnimatingIds(new Set()), 1000);
      return () => clearTimeout(timeout);
    }

    setPrevParticipants(participants);
    
  }, [participants]);

  const getRankIcon = (rank: number, previousRank?: number) => {
    if (!previousRank || rank === previousRank) {
      return <Minus className="h-3 w-3 text-muted-foreground" />;
    }

    if (rank < previousRank) {
      return <TrendingUp className="h-3 w-3 text-green-500" />;
    }

    return <TrendingDown className="h-3 w-3 text-red-500" />;
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-500 text-white font-bold text-lg">
            🥇
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-400 text-white font-bold text-lg">
            🥈
          </div>
        );
      case 3:
        return (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-700 text-white font-bold text-lg">
            🥉
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-muted-foreground font-bold">
            #{rank}
          </div>
        );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (compact) {
    // Compact view for sidebar during quiz
    return (
      <Card className={cn("w-full", className)}>
        {showHeader && (
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Live Rankings
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="space-y-2 pt-0">
          {participants.slice(0, 5).map((participant) => {
            const isCurrentUser = participant.userId === currentUserId;
            const isAnimating = animatingIds.has(participant.userId);

            return (
              <div
                key={participant.userId}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg transition-all",
                  isCurrentUser && "bg-primary/10 border border-primary/20",
                  isAnimating && "animate-pulse bg-yellow-50 dark:bg-yellow-950"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="shrink-0 scale-75">
                    {getRankBadge(participant.rank)}
                  </div>
                  <span className={cn(
                    "text-sm font-medium truncate",
                    isCurrentUser && "text-primary font-bold"
                  )}>
                    {participant.userName}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-sm font-bold tabular-nums">
                    {participant.score}
                  </span>
                  {getRankIcon(participant.rank, participant.previousRank)}
                </div>
              </div>
            );
          })}
          {participants.length > 5 && (
            <div className="text-center text-xs text-muted-foreground pt-1">
              +{participants.length - 5} more
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full view for expanded leaderboard
  return (
    <Card className={cn("w-full", className)}>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Live Leaderboard
            </span>
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              {participants.length}
            </Badge>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {participants.map((participant, index) => {
          const isCurrentUser = participant.userId === currentUserId;
          const isAnimating = animatingIds.has(participant.userId);
          const isTopThree = participant.rank <= 3;

          return (
            <div
              key={participant.userId}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg border transition-all",
                isCurrentUser && "bg-primary/10 border-primary",
                isAnimating && "animate-pulse scale-[1.02] shadow-md",
                isTopThree && !isCurrentUser && "bg-muted/50"
              )}
            >
              {/* Rank Badge */}
              <div className="shrink-0">
                {getRankBadge(participant.rank)}
              </div>

              {/* Avatar */}
              <Avatar className="h-10 w-10">
                <AvatarFallback className={cn(
                  isCurrentUser && "bg-primary text-primary-foreground"
                )}>
                  {getInitials(participant.userName)}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-semibold truncate",
                    isCurrentUser && "text-primary"
                  )}>
                    {participant.userName}
                  </span>
                  {isCurrentUser && (
                    <Badge variant="default" className="shrink-0">You</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {participant.answeredCards} {participant.answeredCards === 1 ? "answer" : "answers"}
                </div>
              </div>

              {/* Score & Rank Change */}
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-xl font-bold tabular-nums">
                    {participant.score}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {getRankIcon(participant.rank, participant.previousRank)}
                  {participant.previousRank !== undefined && participant.previousRank !== participant.rank && (
                    <span className={cn(
                      "text-xs font-medium",
                      participant.rank < participant.previousRank ? "text-green-500" : "text-red-500"
                    )}>
                      {participant.rank < participant.previousRank ? "↑" : "↓"}
                      {Math.abs(participant.rank - participant.previousRank)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {participants.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No participants yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
