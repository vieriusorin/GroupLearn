import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import type { CategoryExtended } from "@/application/dtos";
import { categoryFormSchema } from "@/lib/shared/validation";
import { createCategory, updateCategory } from "@/presentation/actions/content";

type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface UseCategoryModalProps {
  category: CategoryExtended | null;
  domainId: number;
  onSaved: () => void;
}

export function useCategoryModal({
  category,
  domainId,
  onSaved,
}: UseCategoryModalProps) {
  const [saving, startTransition] = useTransition();

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

  useEffect(() => {
    form.reset(defaultValues);
  }, [form, defaultValues]);

  const watchedValues = form.watch();

  const hasChanges = useMemo((): boolean => {
    if (!category) return true; // For create mode, always allow submission if valid
    return (
      watchedValues.name.trim() !== category.name.trim() ||
      (watchedValues.description || "") !== (category.description || "")
    );
  }, [watchedValues, category]);

  const isFormValid = form.formState.isValid ?? false;

  async function handleSubmit(data: CategoryFormData) {
    startTransition(async () => {
      try {
        if (category) {
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
    form,
    saving,
    isFormValid,
    hasChanges,
    onSubmit: handleSubmit,
  };
}
