"use client";

import { Calendar, Trophy, Zap } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SidebarProps {
  totalXP: number;
  streakCount: number;
  lessonsCompletedToday: number;
  dailyGoalLessons: number;
  xpEarnedToday?: number;
  isAuthenticated?: boolean;
}

export function DuolingoSidebar({
  totalXP,
  streakCount,
  lessonsCompletedToday,
  dailyGoalLessons,
  xpEarnedToday = 0,
  isAuthenticated = false,
}: SidebarProps) {
  const _dailyGoalProgress = (lessonsCompletedToday / dailyGoalLessons) * 100;
  const leaderboardProgress = (lessonsCompletedToday / 10) * 100;

  return (
    <aside className="w-96 border-l bg-background/95 backdrop-blur p-6 overflow-y-auto space-y-6">
      {/* Unlock Leaderboards */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
              <Trophy className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-1">Unlock Leaderboards!</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Complete 10 lessons to start competing
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">
                    {lessonsCompletedToday} / 10
                  </span>
                </div>
                <Progress value={leaderboardProgress} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Missions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Daily Missions</h3>
            <Link href="/progress">
              <Button
                variant="link"
                size="sm"
                className="text-primary p-0 h-auto"
              >
                VIEW ALL
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {/* Daily XP Goal */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950">
                <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm mb-2">
                  Earn {dailyGoalLessons * 5} XP
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {xpEarnedToday} / {dailyGoalLessons * 5}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      📦
                    </Badge>
                  </div>
                  <Progress
                    value={Math.min(
                      100,
                      (xpEarnedToday / (dailyGoalLessons * 5)) * 100,
                    )}
                    className="h-2"
                  />
                </div>
              </div>
            </div>

            {/* Daily Streak */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950">
                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm mb-2">
                  Maintain {streakCount > 0 ? streakCount : 1} day streak
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Complete at least 1 lesson today
                </p>
                {lessonsCompletedToday >= 1 && (
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <span className="font-semibold">✓ Completed</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Profile CTA - Only show if not authenticated */}
      {!isAuthenticated && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <h3 className="font-bold mb-2">Save Your Progress!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a profile to sync across devices
            </p>
            <div className="space-y-2">
              <Link href="/auth/signin">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  CREATE PROFILE
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button className="w-full" variant="outline">
                  SIGN IN
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-bold mb-4">Your Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total XP</span>
              <span className="font-bold text-amber-600">{totalXP}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Current Streak
              </span>
              <span className="font-bold text-orange-600">
                {streakCount} days 🔥
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Lessons Today
              </span>
              <span className="font-bold text-green-600">
                {lessonsCompletedToday}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
