/**
 * Custom Hook for Assign Path Modal
 * Manages form state, validation, and submission logic for assigning paths to groups
 *
 * Separates business logic from UI presentation following separation of concerns
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { assignPathFormSchema } from "@/lib/validation";

type AssignPathFormData = z.infer<typeof assignPathFormSchema>;

interface UseAssignPathModalProps {
  onAssign: (pathId: number, isVisible: boolean) => Promise<void>;
  isAssigning: boolean;
}

export function useAssignPathModal({
  onAssign,
  isAssigning,
}: UseAssignPathModalProps) {
  const form = useForm<AssignPathFormData>({
    resolver: zodResolver(assignPathFormSchema) as any, // Type mismatch between optional and required isVisible
    defaultValues: {
      pathId: 0, // Will be validated - 0 is invalid
      isVisible: true,
    },
    mode: "onChange",
  });

  // Check if form is valid
  const isFormValid = form.formState.isValid ?? false;

  // Handle form submission
  async function handleSubmit(data: AssignPathFormData) {
    try {
      await onAssign(data.pathId, data.isVisible);
      form.reset();
    } catch (err) {
      console.error("Failed to assign path:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to assign path";
      form.setError("root", { message: errorMessage });
    }
  }

  return {
    // Form instance
    form,

    // State
    isAssigning,
    isFormValid,

    // Actions
    onSubmit: form.handleSubmit(handleSubmit),
  };
}
