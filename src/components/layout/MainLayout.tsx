"use client";

import type { ReactNode } from "react";
import { TopBar } from "./TopBar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
