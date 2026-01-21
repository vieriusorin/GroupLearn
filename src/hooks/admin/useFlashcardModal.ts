/**
 * Custom Hook for Flashcard Modal
 * Manages form state, validation, and submission logic for flashcard create/edit
 *
 * Separates business logic from UI presentation following separation of concerns
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useTransition } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import type { z } from "zod";
import type { AdminFlashcard } from "@/lib/types";
import { flashcardFormSchema } from "@/lib/validation";
import {
  createFlashcard,
  updateFlashcard,
} from "@/presentation/actions/content";

export type FlashcardFormData = z.infer<typeof flashcardFormSchema>;

interface UseFlashcardModalProps {
  flashcard: AdminFlashcard | null;
  categoryId: number;
  onSaved: () => void;
}

export function useFlashcardModal({
  flashcard,
  categoryId,
  onSaved,
}: UseFlashcardModalProps) {
  // Use React 19 useTransition for mutations
  const [saving, startTransition] = useTransition();

  // Initialize form with default values
  const defaultValues = useMemo<FlashcardFormData>(
    () => ({
      question: flashcard?.question || "",
      answer: flashcard?.answer || "",
      difficulty: flashcard?.difficulty || "medium",
    }),
    [flashcard],
  );

  const form = useForm<FlashcardFormData>({
    resolver: zodResolver(flashcardFormSchema) as any, // Type mismatch between optional and required difficulty
    defaultValues,
    mode: "onChange",
  });

  // Reset form when flashcard changes
  useEffect(() => {
    form.reset(defaultValues);
  }, [form, defaultValues]);

  // Watch form values to detect changes
  const watchedValues = form.watch();

  // Check if form has changed from original values
  const hasChanges = useMemo((): boolean => {
    if (!flashcard) return true; // For create mode, always allow submission if valid
    return (
      watchedValues.question.trim() !== flashcard.question.trim() ||
      watchedValues.answer.trim() !== flashcard.answer.trim() ||
      watchedValues.difficulty !== flashcard.difficulty
    );
  }, [watchedValues, flashcard]);

  // Check if form is valid
  const isFormValid = form.formState.isValid ?? false;

  // Handle form submission
  async function handleSubmit(data: FlashcardFormData) {
    startTransition(async () => {
      try {
        if (flashcard) {
          // Update existing flashcard using Server Action
          const result = await updateFlashcard(
            flashcard.id,
            data.question.trim(),
            data.answer.trim(),
            data.difficulty,
          );

          if (!result.success) {
            const errorMessage =
              result.error || "Failed to save flashcard. Please try again.";
            form.setError("root", { message: errorMessage });
            return;
          }
        } else {
          // Create new flashcard using Server Action
          const result = await createFlashcard(
            categoryId,
            data.question.trim(),
            data.answer.trim(),
            data.difficulty,
          );

          if (!result.success) {
            const errorMessage =
              result.error || "Failed to save flashcard. Please try again.";
            form.setError("root", { message: errorMessage });
            return;
          }
        }

        onSaved();
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to save flashcard. Please try again.";
        form.setError("root", { message: errorMessage });
      }
    });
  }

  return {
    // Form instance
    form: form as UseFormReturn<FlashcardFormData>,

    // State
    saving,
    isFormValid,
    hasChanges,

    // Actions
    onSubmit: handleSubmit,
  };
}
