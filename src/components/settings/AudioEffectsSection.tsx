"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { UserPreferences } from "@/lib/preferences";

interface AudioEffectsSectionProps {
  preferences: UserPreferences;
  onUpdate: (updates: Partial<UserPreferences>) => void;
}

export const AudioEffectsSection = ({
  preferences,
  onUpdate,
}: AudioEffectsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audio & Effects</CardTitle>
        <CardDescription>Control sounds and visual effects</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sound-effects">Sound Effects</Label>
            <p
              className="text-sm text-muted-foreground"
              id="sound-effects-description"
            >
              Play sounds for correct/incorrect answers
            </p>
          </div>
          <Switch
            id="sound-effects"
            checked={preferences.soundEnabled}
            onCheckedChange={(checked) => onUpdate({ soundEnabled: checked })}
            aria-describedby="sound-effects-description"
            aria-label={`Sound effects ${preferences.soundEnabled ? "enabled" : "disabled"}`}
          />
        </div>
      </CardContent>
    </Card>
  );
};
