import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import type { DomainExtended } from "@/application/dtos";
import { domainFormSchema } from "@/lib/shared/validation";
import { createDomain, updateDomain } from "@/presentation/actions/content";

type DomainFormData = z.infer<typeof domainFormSchema>;

interface UseDomainModalProps {
  domain: DomainExtended | null;
  onSaved: () => void;
}

export function useDomainModal({ domain, onSaved }: UseDomainModalProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const defaultValues = useMemo<DomainFormData>(
    () => ({
      name: domain?.name || "",
      description: domain?.description || null,
      is_public: domain?.isPublic || false,
      group_id: domain?.groupId || null,
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
      watchedValues.is_public !== domain.isPublic ||
      watchedValues.group_id !== domain.groupId
    );
  }, [watchedValues, domain]);

  const isFormValid = form.formState.isValid ?? false;

  async function handleSubmit(data: DomainFormData) {
    startTransition(async () => {
      try {
        let result: any;
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
