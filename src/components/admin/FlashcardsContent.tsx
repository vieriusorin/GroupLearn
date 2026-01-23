"use client";

import type { FlashcardAdmin } from "@/application/dtos";
import { DragDropList } from "@/components/admin/DragDropList";
import { EmptyState } from "@/components/admin/EmptyState";
import { FlashcardCard } from "@/components/admin/FlashcardCard";

interface FlashcardsContentProps {
  flashcards: FlashcardAdmin[];
  isLoading: boolean;
  isReordering: boolean;
  flashcardToDelete: FlashcardAdmin | null;
  isDeleting: boolean;
  onReorder: (flashcards: FlashcardAdmin[]) => Promise<void>;
  onEdit: (flashcard: FlashcardAdmin) => void;
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
