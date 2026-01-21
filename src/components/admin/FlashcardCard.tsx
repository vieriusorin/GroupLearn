"use client";

import { CreditCard, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AdminFlashcard } from "@/lib/types";

interface FlashcardCardProps {
  flashcard: AdminFlashcard;
  isDeleting?: boolean;
  onEdit: (flashcard: AdminFlashcard) => void;
  onDelete: (id: number) => void;
  dragHandleProps?: any;
}

export const FlashcardCard = ({
  flashcard,
  isDeleting = false,
  onEdit,
  onDelete,
  dragHandleProps,
}: FlashcardCardProps) => {
  const difficultyColors = {
    easy: "bg-green-600 hover:bg-green-700",
    medium: "bg-yellow-600 hover:bg-yellow-700",
    hard: "bg-red-600 hover:bg-red-700",
  };

  return (
    <Card className="border-2 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Drag Handle */}
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="flex justify-center mb-2 -mt-2 py-1"
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="default"
                  className={
                    difficultyColors[
                      flashcard.difficulty as keyof typeof difficultyColors
                    ]
                  }
                >
                  {flashcard.difficulty}
                </Badge>
                <Badge
                  variant={flashcard.is_active ? "default" : "secondary"}
                  className={
                    flashcard.is_active ? "bg-green-600 hover:bg-green-700" : ""
                  }
                >
                  {flashcard.is_active ? "Active" : "Inactive"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Order: #{flashcard.display_order}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Question:
                </p>
                <p className="text-sm">{flashcard.question}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Answer:
                </p>
                <p className="text-sm">{flashcard.answer}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(flashcard)}
              disabled={isDeleting}
              aria-label={`Edit flashcard ${flashcard.id}`}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
              onClick={() => onDelete(flashcard.id)}
              disabled={isDeleting}
              aria-label={`Delete flashcard ${flashcard.id}`}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
