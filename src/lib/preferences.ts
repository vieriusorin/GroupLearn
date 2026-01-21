import type { ReviewMode } from "./types";

export interface UserPreferences {
  theme: "light" | "dark";
  dailyGoal: number;
  soundEnabled: boolean;
  defaultReviewMode: ReviewMode;
}

const PREFERENCES_KEY = "learning-cards-preferences";

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "light",
  dailyGoal: 10,
  soundEnabled: true,
  defaultReviewMode: "flashcard",
};

export function loadPreferences(): UserPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (!stored) {
      return DEFAULT_PREFERENCES;
    }

    const parsed = JSON.parse(stored);
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
    };
  } catch (error) {
    console.error("Failed to load preferences:", error);
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(preferences: UserPreferences): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error("Failed to save preferences:", error);
  }
}

export function updatePreference<K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K],
): UserPreferences {
  const current = loadPreferences();
  const updated = {
    ...current,
    [key]: value,
  };
  savePreferences(updated);
  return updated;
}

export function applyTheme(theme: "light" | "dark"): void {
  if (typeof window === "undefined") {
    return;
  }

  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function detectSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}
