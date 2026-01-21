"use client";

import { Lightbulb } from "lucide-react";
import { CategoryCard } from "@/components/admin/CategoryCard";
import { DragDropList } from "@/components/admin/DragDropList";
import { EmptyState } from "@/components/admin/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import type { Category } from "@/types/category";

interface CategoriesContentProps {
  categories: Category[];
  isLoading: boolean;
  isReordering: boolean;
  categoryToDelete: Category | null;
  isDeleting: boolean;
  onReorder: (categories: Category[]) => Promise<void>;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  onCreateClick: () => void;
}

export const CategoriesContent = ({
  categories,
  isLoading,
  isReordering,
  categoryToDelete,
  isDeleting,
  onReorder,
  onEdit,
  onDelete,
  onCreateClick,
}: CategoriesContentProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading categories...</div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        icon="📁"
        title="No categories yet"
        description="Create your first category to organize flashcards"
        actionLabel="+ Create Category"
        onAction={onCreateClick}
      />
    );
  }

  return (
    <>
      {/* Drag and drop tip */}
      <Card className="border-2 border-blue-500/50 bg-blue-500/10">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">
              Tip: Drag and drop categories to reorder them
            </span>
            {isReordering && (
              <span
                className="text-blue-600 dark:text-blue-400 text-sm ml-auto"
                aria-live="polite"
              >
                Reordering...
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid with Drag and Drop */}
      <DragDropList
        items={categories}
        onReorder={onReorder}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        renderItem={(category, dragHandleProps) => (
          <CategoryCard
            category={category}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={isDeleting && categoryToDelete?.id === category.id}
            dragHandleProps={dragHandleProps}
          />
        )}
      />
    </>
  );
};
