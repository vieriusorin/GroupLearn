"use client";

import { Button } from "@/components/ui/button";

interface FlashcardsHeaderProps {
  onCreateClick: () => void;
  disabled?: boolean;
}

export const FlashcardsHeader = ({
  onCreateClick,
  disabled,
}: FlashcardsHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">Flashcards</h1>
        <p className="text-muted-foreground mt-1">Manage learning content</p>
      </div>
      <Button
        onClick={onCreateClick}
        disabled={disabled}
        aria-label="Create new flashcard"
      >
        + Create Flashcard
      </Button>
    </div>
  );
};
