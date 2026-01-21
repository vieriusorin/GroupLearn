import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { domainFormSchema } from "@/lib/validation";
import { createDomain, updateDomain } from "@/presentation/actions/content";
import type { Domain } from "@/types/domain";

type DomainFormData = z.infer<typeof domainFormSchema>;

interface UseDomainModalProps {
  domain: Domain | null;
  onSaved: () => void;
}

export function useDomainModal({ domain, onSaved }: UseDomainModalProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const defaultValues = useMemo<DomainFormData>(
    () => ({
      name: domain?.name || "",
      description: domain?.description || null,
      is_public: domain?.is_public === 1,
      group_id: domain?.group_id || null,
    }),
    [domain],
  );

  const form = useForm<DomainFormData>({
    resolver: zodResolver(domainFormSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [form, defaultValues]);

  const watchedValues = form.watch();

  const hasChanges = useMemo((): boolean => {
    if (!domain) return true;
    return (
      watchedValues.name.trim() !== domain.name.trim() ||
      (watchedValues.description || "") !== (domain.description || "") ||
      watchedValues.is_public !== (domain.is_public === 1) ||
      watchedValues.group_id !== domain.group_id
    );
  }, [watchedValues, domain]);

  const isFormValid = form.formState.isValid ?? false;

  async function handleSubmit(data: DomainFormData) {
    startTransition(async () => {
      try {
        let result;
        if (domain) {
          result = await updateDomain(
            domain.id,
            data.name.trim(),
            data.description?.trim() || null,
          );
        } else {
          result = await createDomain(
            data.name.trim(),
            data.description?.trim() || null,
          );
        }

        if (!result.success) {
          form.setError("root", {
            message: result.error || "Failed to save domain",
          });
          return;
        }

        router.refresh();
        onSaved();
      } catch (err) {
        console.error("Failed to save domain:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to save domain";
        form.setError("root", { message: errorMessage });
      }
    });
  }

  return {
    form,

    saving: isPending,
    isFormValid,
    hasChanges,

    onSubmit: handleSubmit,
  };
}
