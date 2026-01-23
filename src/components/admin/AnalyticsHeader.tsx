"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AnalyticsHeaderProps {
  title: string;
  description: string;
  backHref: string;
  backLabel?: string;
}

export const AnalyticsHeader = ({
  title,
  description,
  backHref,
  backLabel = "← Back",
}: AnalyticsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link href={backHref}>
            <Button variant="outline" size="sm">
              {backLabel}
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};
