"use client";

import { Button } from "@/components/ui/button";

interface CategoriesHeaderProps {
  onCreateClick: () => void;
  disabled?: boolean;
}

export const CategoriesHeader = ({
  onCreateClick,
  disabled,
}: CategoriesHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-muted-foreground mt-1">
          Organize flashcards by category
        </p>
      </div>
      <Button
        onClick={onCreateClick}
        disabled={disabled}
        aria-label="Create new category"
      >
        + Create Category
      </Button>
    </div>
  );
};
