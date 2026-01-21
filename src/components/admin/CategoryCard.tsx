"use client";

import { FolderOpen, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CategoryCardProps } from "@/types/category";

export function CategoryCard({
  category,
  onEdit,
  onDelete,
  isDeleting = false,
  dragHandleProps,
}: CategoryCardProps) {
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

        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {category.description}
              </p>
            )}
          </div>
          <div className="ml-3 p-2 rounded-lg bg-primary/10">
            <FolderOpen className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Flashcards:</span>
            <span className="font-semibold">
              {category.flashcard_count || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Order:</span>
            <span className="font-semibold">#{category.display_order}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(category)}
            disabled={isDeleting}
            aria-label={`Edit category ${category.name}`}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
            onClick={() => onDelete(category.id)}
            disabled={isDeleting}
            aria-label={`Delete category ${category.name}`}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
