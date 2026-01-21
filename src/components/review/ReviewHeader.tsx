"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ReviewHeaderProps {
  currentIndex: number;
  totalCards: number;
}

export const ReviewHeader = ({
  currentIndex,
  totalCards,
}: ReviewHeaderProps) => {
  const progressPercent =
    totalCards > 0 ? Math.round((currentIndex / totalCards) * 100) : 0;

  return (
    <div className="mb-8">
      <Link href="/">
        <Button variant="ghost" className="mb-2">
          ← Back to Dashboard
        </Button>
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Review Session</h1>
          <p className="text-muted-foreground">
            Card {currentIndex + 1} of {totalCards}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{progressPercent}% Complete</Badge>
        </div>
      </div>
    </div>
  );
};
