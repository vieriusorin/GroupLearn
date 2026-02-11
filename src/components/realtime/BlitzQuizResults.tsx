"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LiveLeaderboard } from "./LiveLeaderboard";
import {
  Trophy,
  Target,
  Clock,
  Zap,
  RotateCcw,
  ArrowLeft,
  Users,
  Hash,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/shared/utils";
import confetti from "canvas-confetti";

interface ParticipantResult {
  userId: string;
  userName: string;
  score: number;
  rank: number;
  answeredCards: number;
  correctAnswers: number;
  xpEarned: number;
}

interface PersonalStats {
  accuracy: number; // percentage
  avgResponseTime: number; // milliseconds
  fastestAnswer: number; // milliseconds
  slowestAnswer: number; // milliseconds
  streak: number; // longest correct streak
}

interface BlitzQuizResultsProps {
  sessionId: string;
  groupId: number;
  participants: ParticipantResult[];
  currentUserId: string;
  personalStats: PersonalStats;
  totalCards: number;
  sessionType: string;
  onPlayAgain?: () => void;
}

export function BlitzQuizResults({
  sessionId,
  groupId,
  participants,
  currentUserId,
  personalStats,
  totalCards,
  sessionType,
  onPlayAgain,
}: BlitzQuizResultsProps) {
  const router = useRouter();
  const currentParticipant = participants.find((p) => p.userId === currentUserId);
  const isTopThree = currentParticipant ? currentParticipant.rank <= 3 : false;

  useEffect(() => {
    // Trigger confetti for top 3 finishers
    if (isTopThree) {
      const colors = {
        1: ["#FFD700", "#FFA500", "#FF8C00"], // Gold
        2: ["#C0C0C0", "#A9A9A9", "#808080"], // Silver
        3: ["#CD7F32", "#B8860B", "#D2691E"], // Bronze
      };

      const particleColors = currentParticipant
        ? colors[currentParticipant.rank as keyof typeof colors] || ["#10b981", "#3b82f6", "#8b5cf6"]
        : ["#10b981", "#3b82f6", "#8b5cf6"];

      // Burst confetti
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: particleColors,
      });

      // Side cannons
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: particleColors,
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: particleColors,
        });
      }, 250);
    }
  }, [isTopThree, currentParticipant]);

  const handleReturnToGroup = () => {
    router.push(`/groups/${groupId}`);
  };

  const getRankTitle = (rank: number) => {
    if (rank === 1) return "Champion!";
    if (rank === 2) return "Runner-up!";
    if (rank === 3) return "Third Place!";
    if (rank <= 5) return "Top 5!";
    return "Good Effort!";
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return "🏆";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    if (rank <= 5) return "⭐";
    return "👍";
  };

  const leaderboardParticipants = participants.map((p) => ({
    ...p,
    previousRank: undefined,
    isCurrentUser: p.userId === currentUserId,
  }));

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-6xl mb-2">{currentParticipant ? getRankEmoji(currentParticipant.rank) : "🎯"}</div>
        <h1 className="text-4xl font-bold">
          {currentParticipant ? getRankTitle(currentParticipant.rank) : "Quiz Complete"}
        </h1>
        <p className="text-muted-foreground">
          {sessionType === "blitz_quiz" ? "Blitz Quiz" : "Live Quiz"} Complete
        </p>
      </div>

      {/* Personal Performance Card */}
      {currentParticipant && (
        <Card className={cn(
          "border-2",
          isTopThree && "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
        )}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Performance</span>
              <Badge variant={isTopThree ? "default" : "outline"} className="gap-1 text-lg px-3 py-1">
                <Trophy className="h-4 w-4" />
                Rank #{currentParticipant.rank}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 rounded-lg bg-background">
                <Trophy className="h-6 w-6 mb-2 text-yellow-500" />
                <div className="text-2xl font-bold">{currentParticipant.score}</div>
                <div className="text-xs text-muted-foreground">Total Points</div>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-background">
                <Target className="h-6 w-6 mb-2 text-green-500" />
                <div className="text-2xl font-bold">{personalStats.accuracy}%</div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-background">
                <Clock className="h-6 w-6 mb-2 text-blue-500" />
                <div className="text-2xl font-bold">
                  {(personalStats.avgResponseTime / 1000).toFixed(1)}s
                </div>
                <div className="text-xs text-muted-foreground">Avg Time</div>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-background">
                <Zap className="h-6 w-6 mb-2 text-purple-500" />
                <div className="text-2xl font-bold">+{currentParticipant.xpEarned}</div>
                <div className="text-xs text-muted-foreground">XP Earned</div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted text-sm">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>Best Streak: <strong>{personalStats.streak}</strong></span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted text-sm">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Fastest: <strong>{(personalStats.fastestAnswer / 1000).toFixed(1)}s</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* XP Rewards Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">XP Rewards</h3>
              <p className="text-sm text-muted-foreground">
                🥇 1st Place: +100 XP bonus • 🥈 2nd Place: +50 XP bonus • 🥉 3rd Place: +25 XP bonus
              </p>
              <p className="text-sm text-muted-foreground">
                Plus points earned from correct answers and speed bonuses!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Leaderboard */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Final Rankings
        </h2>
        <LiveLeaderboard
          participants={leaderboardParticipants}
          currentUserId={currentUserId}
          compact={false}
          showHeader={false}
        />
      </div>

      {/* Session Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">
                <strong>{totalCards}</strong> cards completed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">
                <strong>{participants.length}</strong> {participants.length === 1 ? "participant" : "participants"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handleReturnToGroup}
          className="gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Return to Group
        </Button>
        {onPlayAgain && (
          <Button
            size="lg"
            onClick={onPlayAgain}
            className="gap-2"
          >
            <RotateCcw className="h-5 w-5" />
            Play Again
          </Button>
        )}
      </div>
    </div>
  );
}
