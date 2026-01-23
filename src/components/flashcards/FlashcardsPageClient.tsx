"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { FlashcardAdmin } from "@/application/dtos";
import {
  FlashcardDialog,
  FlashcardsGrid,
  FlashcardsHeader,
} from "@/components/flashcards";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { difficultyEnum } from "@/lib/shared/validation";
import {
  createFlashcard,
  deleteFlashcard,
  updateFlashcard,
} from "@/presentation/actions/content";

const flashcardFormSchema = z.object({
  question: z
    .string()
    .min(1, "Question is required")
    .max(1000, "Question must be 1000 characters or less"),
  answer: z
    .string()
    .min(1, "Answer is required")
    .max(2000, "Answer must be 2000 characters or less"),
  difficulty: difficultyEnum,
  id: z.number().int().positive().optional(),
});

type FlashcardFormData = z.infer<typeof flashcardFormSchema>;

interface FlashcardsPageClientProps {
  categoryId: number;
  initialFlashcards: FlashcardAdmin[];
}

export function FlashcardsPageClient({
  categoryId,
  initialFlashcards,
}: FlashcardsPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [flashcards, setFlashcards] =
    useState<FlashcardAdmin[]>(initialFlashcards);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<FlashcardAdmin | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FlashcardFormData>({
    resolver: zodResolver(flashcardFormSchema),
    defaultValues: {
      question: "",
      answer: "",
      difficulty: "medium",
    },
    mode: "onChange",
  });

  const resetForm = useCallback(() => {
    form.reset({
      question: "",
      answer: "",
      difficulty: "medium",
    });
    setEditingCard(null);
    setError(null);
  }, [form]);

  const handleOpenDialog = useCallback(() => {
    resetForm();
    setDialogOpen(true);
  }, [resetForm]);

  const handleCloseDialog = useCallback(
    (open: boolean) => {
      setDialogOpen(open);
      if (!open) {
        resetForm();
      }
    },
    [resetForm],
  );

  const handleEdit = useCallback(
    (card: FlashcardAdmin) => {
      setEditingCard(card);
      form.reset({
        id: card.id,
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
      });
      setDialogOpen(true);
    },
    [form],
  );

  const handleSubmit = useCallback(
    async (data: FlashcardFormData) => {
      setError(null);

      startTransition(async () => {
        try {
          if (editingCard && data.id) {
            const result = await updateFlashcard(
              data.id,
              data.question,
              data.answer,
              data.difficulty,
            );

            if (!result.success) {
              setError(result.error || "Failed to update flashcard");
              return;
            }

            setFlashcards((prev) =>
              prev.map((card) =>
                card.id === data.id
                  ? {
                      ...card,
                      question: result.data.question,
                      answer: result.data.answer,
                      difficulty: result.data.difficulty,
                    }
                  : card,
              ),
            );
          } else {
            const result = await createFlashcard(
              categoryId,
              data.question,
              data.answer,
              data.difficulty,
            );

            if (!result.success) {
              setError(result.error || "Failed to create flashcard");
              return;
            }

            setFlashcards((prev) => [
              {
                id: result.data.id,
                categoryId: result.data.categoryId,
                question: result.data.question,
                answer: result.data.answer,
                difficulty: result.data.difficulty,
                computedDifficulty: null,
                createdAt:
                  typeof result.data.createdAt === "string"
                    ? new Date(result.data.createdAt)
                    : result.data.createdAt &&
                        typeof result.data.createdAt === "object" &&
                        result.data.createdAt !== null &&
                        "getTime" in result.data.createdAt
                      ? (result.data.createdAt as Date)
                      : new Date(),
                displayOrder: prev.length,
                isActive: true,
              },
              ...prev,
            ]);
          }

          resetForm();
          setDialogOpen(false);
          router.refresh();
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "An unexpected error occurred",
          );
        }
      });
    },
    [categoryId, editingCard, resetForm, router],
  );

  const handleDelete = useCallback(
    async (card: FlashcardAdmin) => {
      setError(null);

      startTransition(async () => {
        try {
          const result = await deleteFlashcard(card.id);

          if (!result.success) {
            setError(result.error || "Failed to delete flashcard");
            return;
          }

          setFlashcards((prev) => prev.filter((c) => c.id !== card.id));
          router.refresh();
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "An unexpected error occurred",
          );
        }
      });
    },
    [router],
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <FlashcardsHeader
        onCreateClick={handleOpenDialog}
        disabled={!categoryId}
        hasError={Boolean(error)}
      />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <FlashcardDialog
        open={dialogOpen}
        onOpenChange={handleCloseDialog}
        title={editingCard ? "Edit Flashcard" : "Create Flashcard"}
        description={
          editingCard
            ? "Update the flashcard details"
            : "Add a new flashcard to this category"
        }
        form={form}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        isFormValid={form.formState.isValid}
      />

      <FlashcardsGrid
        isLoading={false}
        flashcards={flashcards}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={isPending}
      />
    </div>
  );
}
