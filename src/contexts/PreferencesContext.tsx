"use client";

import { createContext, type ReactNode, useEffect, useState } from "react";
import {
  applyTheme,
  loadPreferences,
  savePreferences,
  type UserPreferences,
} from "@/lib/shared/preferences";

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  setTheme: (theme: "light" | "dark") => void;
}

export const PreferencesContext = createContext<PreferencesContextType | null>(
  null,
);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    loadPreferences(),
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    applyTheme(preferences.theme);
  }, [preferences.theme]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      savePreferences(next);
      return next;
    });
  };

  const setTheme = (theme: "light" | "dark") => {
    updatePreferences({ theme });
  };

  if (!mounted) {
    return null;
  }

  return (
    <PreferencesContext.Provider
      value={{ preferences, updatePreferences, setTheme }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}
