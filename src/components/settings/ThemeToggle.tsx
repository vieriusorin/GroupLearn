"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/hooks/usePreferences";

export function ThemeToggle() {
  const { preferences, setTheme } = usePreferences();

  const toggleTheme = () => {
    setTheme(preferences.theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${preferences.theme === "dark" ? "light" : "dark"} mode`}
    >
      {preferences.theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
