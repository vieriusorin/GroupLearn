"use client";

import {
  AboutSection,
  AppearanceSection,
  AudioEffectsSection,
  LearningPreferencesSection,
  SettingsHeader,
} from "@/components/settings";
import { usePreferences } from "@/hooks/usePreferences";

const SettingsPage = () => {
  const { preferences, updatePreferences } = usePreferences();

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <SettingsHeader />
      <div className="space-y-6">
        <AppearanceSection preferences={preferences} />
        <LearningPreferencesSection
          preferences={preferences}
          onUpdate={updatePreferences}
        />
        <AudioEffectsSection
          preferences={preferences}
          onUpdate={updatePreferences}
        />
        <AboutSection />
      </div>
    </div>
  );
};

export default SettingsPage;
