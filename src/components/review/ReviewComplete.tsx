"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ReviewCompleteProps {
  sessionComplete: boolean;
}

export const ReviewComplete = ({ sessionComplete }: ReviewCompleteProps) => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>🎉 Review Session Complete!</CardTitle>
          <CardDescription>
            {sessionComplete
              ? "Great job! You've completed all due cards."
              : "No cards due for review right now."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {sessionComplete
              ? "Come back tomorrow to continue your learning journey."
              : "Check back later or create more flashcards to keep learning."}
          </p>
          <div className="flex gap-2">
            <Link href="/">
              <Button>Back to Dashboard</Button>
            </Link>
            <Link href="/domains">
              <Button variant="outline">Manage Domains</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
