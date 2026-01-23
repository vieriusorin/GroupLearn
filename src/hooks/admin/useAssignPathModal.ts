import { zodResolver } from "@hookform/resolvers/zod";
import { type Resolver, useForm } from "react-hook-form";
import type { z } from "zod";
import { assignPathFormSchema } from "@/lib/shared/validation";

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
    resolver: zodResolver(
      assignPathFormSchema,
    ) as unknown as Resolver<AssignPathFormData>,
    defaultValues: {
      pathId: 0, // Will be validated - 0 is invalid
      isVisible: true,
    },
    mode: "onChange",
  });

  const isFormValid = form.formState.isValid ?? false;

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
    form,
    isAssigning,
    isFormValid,
    onSubmit: form.handleSubmit(handleSubmit),
  };
}
