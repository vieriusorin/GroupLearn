"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const AboutSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About</CardTitle>
        <CardDescription>Application information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">
              Learning Cards
            </span>{" "}
            - DuoLingo-style learning platform
          </p>
          <p>Built with Next.js, React, and Tailwind CSS</p>
          <p className="text-xs">Version 2.0.0</p>
        </div>
      </CardContent>
    </Card>
  );
};
