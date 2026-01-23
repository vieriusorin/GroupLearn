"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { UserPreferences } from "@/lib/shared/preferences";
import { ThemeToggle } from "./ThemeToggle";

interface AppearanceSectionProps {
  preferences: UserPreferences;
}

export const AppearanceSection = ({ preferences }: AppearanceSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize how the app looks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="theme-toggle">Theme</Label>
            <p className="text-sm text-muted-foreground" id="theme-description">
              Switch between light and dark mode
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" aria-live="polite">
              {preferences.theme === "dark" ? "Dark" : "Light"}
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
