"use client";

import { DragDropList } from "@/components/admin/DragDropList";
import { EmptyState } from "@/components/admin/EmptyState";
import { FlashcardCard } from "@/components/admin/FlashcardCard";
import type { AdminFlashcard } from "@/lib/types";

interface FlashcardsContentProps {
  flashcards: AdminFlashcard[];
  isLoading: boolean;
  isReordering: boolean;
  flashcardToDelete: AdminFlashcard | null;
  isDeleting: boolean;
  onReorder: (flashcards: AdminFlashcard[]) => Promise<void>;
  onEdit: (flashcard: AdminFlashcard) => void;
  onDelete: (id: number) => void;
  onCreateClick: () => void;
}

export const FlashcardsContent = ({
  flashcards,
  isLoading,
  isReordering,
  flashcardToDelete,
  isDeleting,
  onReorder,
  onEdit,
  onDelete,
  onCreateClick,
}: FlashcardsContentProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading flashcards...</div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <EmptyState
        icon="🎴"
        title="No flashcards yet"
        description="Create your first flashcard to start learning"
        actionLabel="+ Create Flashcard"
        onAction={onCreateClick}
      />
    );
  }

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
        <span className="text-blue-700 text-sm font-medium">
          💡 Tip: Drag and drop flashcards to reorder them
        </span>
        {isReordering && (
          <span className="text-blue-600 text-sm ml-auto" aria-live="polite">
            Reordering...
          </span>
        )}
      </div>
      <DragDropList
        items={flashcards}
        onReorder={onReorder}
        className="space-y-4"
        renderItem={(flashcard, dragHandleProps) => (
          <FlashcardCard
            key={flashcard.id}
            flashcard={flashcard}
            isDeleting={isDeleting && flashcardToDelete?.id === flashcard.id}
            onEdit={onEdit}
            onDelete={onDelete}
            dragHandleProps={dragHandleProps}
          />
        )}
      />
    </>
  );
};
