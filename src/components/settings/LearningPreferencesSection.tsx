"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserPreferences } from "@/lib/preferences";
import type { ReviewMode } from "@/lib/types";

interface LearningPreferencesSectionProps {
  preferences: UserPreferences;
  onUpdate: (updates: Partial<UserPreferences>) => void;
}

const DAILY_GOAL_OPTIONS = [5, 10, 15, 20] as const;
const REVIEW_MODE_OPTIONS: ReviewMode[] = ["flashcard", "quiz", "recall"];

export const LearningPreferencesSection = ({
  preferences,
  onUpdate,
}: LearningPreferencesSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Preferences</CardTitle>
        <CardDescription>
          Adjust your learning goals and defaults
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="daily-goal">Daily Goal</Label>
            <p
              className="text-sm text-muted-foreground"
              id="daily-goal-description"
            >
              Number of lessons to complete each day
            </p>
          </div>
          <Select
            value={preferences.dailyGoal.toString()}
            onValueChange={(value) =>
              onUpdate({ dailyGoal: parseInt(value, 10) })
            }
          >
            <SelectTrigger
              id="daily-goal"
              className="w-32"
              aria-describedby="daily-goal-description"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAILY_GOAL_OPTIONS.map((goal) => (
                <SelectItem key={goal} value={goal.toString()}>
                  {goal} lessons
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="review-mode">Default Review Mode</Label>
            <p
              className="text-sm text-muted-foreground"
              id="review-mode-description"
            >
              Preferred mode for reviewing flashcards
            </p>
          </div>
          <Select
            value={preferences.defaultReviewMode}
            onValueChange={(value) =>
              onUpdate({ defaultReviewMode: value as ReviewMode })
            }
          >
            <SelectTrigger
              id="review-mode"
              className="w-40"
              aria-describedby="review-mode-description"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REVIEW_MODE_OPTIONS.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
