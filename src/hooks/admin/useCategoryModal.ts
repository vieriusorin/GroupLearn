/**
 * Custom Hook for Category Modal
 * Manages form state, validation, and submission logic for category create/edit
 *
 * Separates business logic from UI presentation following separation of concerns
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { categoryFormSchema } from "@/lib/validation";
import { createCategory, updateCategory } from "@/presentation/actions/content";
import type { Category } from "@/types/category";

type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface UseCategoryModalProps {
  category: Category | null;
  domainId: number;
  onSaved: () => void;
}

export function useCategoryModal({
  category,
  domainId,
  onSaved,
}: UseCategoryModalProps) {
  // Use React 19 useTransition for mutations
  const [saving, startTransition] = useTransition();

  // Initialize form with default values
  const defaultValues = useMemo<CategoryFormData>(
    () => ({
      name: category?.name || "",
      description: category?.description || null,
    }),
    [category],
  );

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
    mode: "onChange",
  });

  // Reset form when category changes
  useEffect(() => {
    form.reset(defaultValues);
  }, [form, defaultValues]);

  // Watch form values to detect changes
  const watchedValues = form.watch();

  // Check if form has changed from original values
  const hasChanges = useMemo((): boolean => {
    if (!category) return true; // For create mode, always allow submission if valid
    return (
      watchedValues.name.trim() !== category.name.trim() ||
      (watchedValues.description || "") !== (category.description || "")
    );
  }, [watchedValues, category]);

  // Check if form is valid
  const isFormValid = form.formState.isValid ?? false;

  // Handle form submission
  async function handleSubmit(data: CategoryFormData) {
    startTransition(async () => {
      try {
        if (category) {
          // Update existing category using Server Action
          const result = await updateCategory(
            category.id,
            data.name.trim(),
            data.description?.trim() || null,
          );

          if (!result.success) {
            const errorMessage = result.error || "Failed to save category";
            form.setError("root", { message: errorMessage });
            return;
          }
        } else {
          // Create new category using Server Action
          const result = await createCategory(
            domainId,
            data.name.trim(),
            data.description?.trim() || null,
          );

          if (!result.success) {
            const errorMessage = result.error || "Failed to save category";
            form.setError("root", { message: errorMessage });
            return;
          }
        }

        onSaved();
      } catch (err) {
        console.error("Failed to save category:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to save category";
        form.setError("root", { message: errorMessage });
      }
    });
  }

  return {
    // Form instance
    form,

    // State
    saving,
    isFormValid,
    hasChanges,

    // Actions
    onSubmit: handleSubmit,
  };
}
