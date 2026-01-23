import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useTransition } from "react";
import { type Resolver, type UseFormReturn, useForm } from "react-hook-form";
import type { z } from "zod";
import type { FlashcardAdmin } from "@/application/dtos";
import { flashcardFormSchema } from "@/lib/shared/validation";
import {
  createFlashcard,
  updateFlashcard,
} from "@/presentation/actions/content";

export type FlashcardFormData = z.infer<typeof flashcardFormSchema>;

interface UseFlashcardModalProps {
  flashcard: FlashcardAdmin | null;
  categoryId: number;
  onSaved: () => void;
}

export function useFlashcardModal({
  flashcard,
  categoryId,
  onSaved,
}: UseFlashcardModalProps) {
  const [saving, startTransition] = useTransition();

  const defaultValues = useMemo<FlashcardFormData>(
    () => ({
      question: flashcard?.question || "",
      answer: flashcard?.answer || "",
      difficulty: flashcard?.difficulty || "medium",
    }),
    [flashcard],
  );

  const form = useForm<FlashcardFormData>({
    resolver: zodResolver(
      flashcardFormSchema,
    ) as unknown as Resolver<FlashcardFormData>,
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [form, defaultValues]);

  const watchedValues = form.watch();

  const hasChanges = useMemo((): boolean => {
    if (!flashcard) return true;
    return (
      watchedValues.question.trim() !== flashcard.question.trim() ||
      watchedValues.answer.trim() !== flashcard.answer.trim() ||
      watchedValues.difficulty !== flashcard.difficulty
    );
  }, [watchedValues, flashcard]);

  const isFormValid = form.formState.isValid ?? false;

  async function handleSubmit(data: FlashcardFormData) {
    startTransition(async () => {
      try {
        if (flashcard) {
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
    form: form as UseFormReturn<FlashcardFormData>,
    saving,
    isFormValid,
    hasChanges,
    onSubmit: handleSubmit,
  };
}
