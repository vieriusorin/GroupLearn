"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { PreferencesProvider } from "@/contexts/PreferencesContext";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <NuqsAdapter>
      <PreferencesProvider>{children}</PreferencesProvider>
    </NuqsAdapter>
  );
};
