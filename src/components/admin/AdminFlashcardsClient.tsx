"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState, useTransition } from "react";
import type { FlashcardAdmin } from "@/application/dtos";
import type {
  Category,
  DifficultyLevelType,
} from "@/infrastructure/database/schema";
import { toDate } from "@/lib/shared/date-helpers";
import {
  deleteFlashcard,
  getCategories,
  getFlashcards,
} from "@/presentation/actions/content";
import { ErrorMessage } from "./ErrorMessage";
import { FlashcardsContent } from "./FlashcardsContent";
import { FlashcardsHeader } from "./FlashcardsHeader";
import { FlashcardsSelectors } from "./FlashcardsSelectors";

const DeleteFlashcardDialog = dynamic(
  () =>
    import("./DeleteFlashcardDialog").then((mod) => ({
      default: mod.DeleteFlashcardDialog,
    })),
  {
    ssr: false,
  },
);

const FlashcardModal = dynamic(
  () =>
    import("./FlashcardModal").then((mod) => ({ default: mod.FlashcardModal })),
  {
    ssr: false,
  },
);

interface AdminFlashcardsClientProps {
  initialDomains: Array<{
    id: number;
    name: string;
    description: string | null;
    createdAt: string;
  }>;
  initialSelectedDomainId: number | null;
  initialCategories: Array<{
    id: number;
    domainId: number;
    name: string;
    description: string | null;
    createdAt: string;
  }>;
  initialSelectedCategoryId: number | null;
  initialFlashcards: Array<{
    id: number;
    categoryId: number;
    question: string;
    answer: string;
    difficulty: DifficultyLevelType;
    computedDifficulty: DifficultyLevelType | null;
    createdAt: string;
  }>;
}

export function AdminFlashcardsClient({
  initialDomains,
  initialSelectedDomainId,
  initialCategories,
  initialSelectedCategoryId,
  initialFlashcards,
}: AdminFlashcardsClientProps) {
  const [isPending, startTransition] = useTransition();

  const [selectedDomainId, setSelectedDomainId] = useState<number | null>(
    initialSelectedDomainId,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    initialSelectedCategoryId,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFlashcard, setEditingFlashcard] =
    useState<FlashcardAdmin | null>(null);
  const [flashcardToDelete, setFlashcardToDelete] =
    useState<FlashcardAdmin | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [_isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(false);

  // Helper function to map flashcard data
  const mapFlashcard = useCallback(
    (
      f: {
        id: number;
        categoryId: number;
        question: string;
        answer: string;
        difficulty: DifficultyLevelType;
        computedDifficulty: DifficultyLevelType | null;
        createdAt: string;
      },
      index: number,
    ): FlashcardAdmin => ({
      id: f.id,
      categoryId: f.categoryId,
      question: f.question,
      answer: f.answer,
      difficulty: f.difficulty,
      computedDifficulty: f.computedDifficulty,
      createdAt: toDate(f.createdAt),
      displayOrder: index,
      isActive: true,
    }),
    [],
  );

  const [domains] = useState(
    initialDomains.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      createdAt: toDate(d.createdAt),
    })),
  );

  const [categories, setCategories] = useState<Category[]>(
    initialCategories.map((c) => ({
      id: c.id,
      domainId: c.domainId,
      name: c.name,
      description: c.description,
      isDeprecated: false,
      createdAt: toDate(c.createdAt),
    })),
  );

  const [flashcards, setFlashcards] = useState<FlashcardAdmin[]>(
    initialFlashcards.map((f, index) => mapFlashcard(f, index)),
  );

  useEffect(() => {
    if (!selectedDomainId) {
      setCategories([]);
      setSelectedCategoryId(null);
      return;
    }

    setIsLoadingCategories(true);
    setError(null);

    startTransition(async () => {
      try {
        const result = await getCategories(selectedDomainId);
        if (result.success) {
          const newCategories = result.data.map((c) => ({
            id: c.id,
            domainId: c.domainId,
            name: c.name,
            description: c.description,
            isDeprecated: c.isDeprecated ?? false,
            createdAt: toDate(c.createdAt),
          }));
          setCategories(newCategories);

          if (newCategories.length > 0) {
            setSelectedCategoryId(newCategories[0].id);
          } else {
            setSelectedCategoryId(null);
          }
        } else {
          setError(result.error || "Failed to load categories");
          setCategories([]);
          setSelectedCategoryId(null);
        }
      } catch (_err) {
        setError("Failed to load categories");
        setCategories([]);
        setSelectedCategoryId(null);
      } finally {
        setIsLoadingCategories(false);
      }
    });
  }, [selectedDomainId]);

  useEffect(() => {
    if (!selectedCategoryId) {
      setFlashcards([]);
      return;
    }

    setIsLoadingFlashcards(true);
    setError(null);

    startTransition(async () => {
      try {
        const result = await getFlashcards(selectedCategoryId);
        if (result.success) {
          setFlashcards(
            result.data.flashcards.map((f, index) => mapFlashcard(f, index)),
          );
        } else {
          setError(result.error || "Failed to load flashcards");
          setFlashcards([]);
        }
      } catch (_err) {
        setError("Failed to load flashcards");
        setFlashcards([]);
      } finally {
        setIsLoadingFlashcards(false);
      }
    });
    // mapFlashcard is a stable function that doesn't depend on props/state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, mapFlashcard]);

  const handleDelete = (id: number) => {
    const flashcard = flashcards.find((f) => f.id === id);
    if (flashcard) {
      setFlashcardToDelete(flashcard);
    }
  };

  const confirmDelete = async () => {
    if (!flashcardToDelete) return;

    setError(null);
    startTransition(async () => {
      try {
        const result = await deleteFlashcard(flashcardToDelete.id);

        if (!result.success) {
          setError(
            result.error || "Failed to delete flashcard. Please try again.",
          );
          return;
        }

        setFlashcardToDelete(null);
        if (selectedCategoryId) {
          const flashcardsResult = await getFlashcards(selectedCategoryId);
          if (flashcardsResult.success) {
            setFlashcards(
              flashcardsResult.data.flashcards.map((f, index) =>
                mapFlashcard(f, index),
              ),
            );
          }
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to delete flashcard. Please try again.",
        );
      }
    });
  };

  const handleReorder = async (_reorderedFlashcards: FlashcardAdmin[]) => {
    // TODO: Implement reordering with Server Action
    setError("Reordering not yet implemented in SSR version");
  };

  const handleDomainChange = (domainId: number) => {
    setSelectedDomainId(domainId);
    setSelectedCategoryId(null);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingFlashcard(null);
    if (selectedCategoryId) {
      startTransition(async () => {
        const result = await getFlashcards(selectedCategoryId);
        if (result.success) {
          setFlashcards(
            result.data.flashcards.map((f, index) => mapFlashcard(f, index)),
          );
        }
      });
    }
  };

  // Open create modal
  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  // Close delete dialog
  const closeDeleteDialog = () => {
    setFlashcardToDelete(null);
  };

  // Dismiss error
  const dismissError = () => {
    setError(null);
  };

  return (
    <div className="space-y-6">
      <FlashcardsHeader
        onCreateClick={openCreateModal}
        disabled={!selectedCategoryId}
      />

      {error && <ErrorMessage message={error} onDismiss={dismissError} />}

      <FlashcardsSelectors
        domains={domains}
        categories={categories}
        selectedDomainId={selectedDomainId}
        selectedCategoryId={selectedCategoryId}
        onDomainChange={handleDomainChange}
        onCategoryChange={setSelectedCategoryId}
      />

      {selectedCategoryId && (
        <FlashcardsContent
          flashcards={flashcards}
          isLoading={isLoadingFlashcards}
          isReordering={false}
          flashcardToDelete={flashcardToDelete}
          isDeleting={isPending}
          onReorder={handleReorder}
          onEdit={setEditingFlashcard}
          onDelete={handleDelete}
          onCreateClick={openCreateModal}
        />
      )}

      {(showCreateModal || editingFlashcard) && selectedCategoryId && (
        <FlashcardModal
          flashcard={editingFlashcard}
          categoryId={selectedCategoryId}
          onClose={handleModalClose}
          onSaved={handleModalClose}
        />
      )}

      <DeleteFlashcardDialog
        flashcard={flashcardToDelete}
        isDeleting={isPending}
        onConfirm={confirmDelete}
        onCancel={closeDeleteDialog}
      />
    </div>
  );
}
