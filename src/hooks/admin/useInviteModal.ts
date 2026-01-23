import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { type Resolver, type UseFormReturn, useForm } from "react-hook-form";
import type { z } from "zod";
import type { PathWithProgress } from "@/application/dtos";
import { invitationFormSchema } from "@/lib/shared/validation";
import { getPaths } from "@/presentation/actions/paths/get-paths";

export type InvitationFormData = z.infer<typeof invitationFormSchema>;

interface UseInviteModalProps {
  isSending: boolean;
  onSend: (
    email: string,
    role: "member" | "admin",
    pathIds: number[],
  ) => Promise<void>;
  onSent: () => void;
}

type InvitePath = PathWithProgress & {
  domainName?: string;
};

function groupPathsByDomain(
  paths: InvitePath[] | undefined,
): Record<string, InvitePath[]> {
  if (!paths) return {};

  const grouped: Record<string, InvitePath[]> = {};
  paths.forEach((path) => {
    const domainName = (path as any).domainName || "Uncategorized";
    if (!grouped[domainName]) {
      grouped[domainName] = [];
    }
    grouped[domainName].push(path);
  });

  return grouped;
}

function togglePathId(pathId: number, currentPathIds: number[]): number[] {
  const isSelected = currentPathIds.includes(pathId);
  if (isSelected) {
    return currentPathIds.filter((id) => id !== pathId);
  }
  return [...currentPathIds, pathId];
}

export function useInviteModal({
  isSending,
  onSend,
  onSent,
}: UseInviteModalProps) {
  const [allPaths, setAllPaths] = useState<InvitePath[]>([]);
  const [isLoadingPaths, setIsLoadingPaths] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPaths() {
      setIsLoadingPaths(true);

      try {
        const result = await getPaths();

        if (cancelled) return;

        if (!result.success) {
          setAllPaths([]);
          return;
        }

        setAllPaths(result.data as InvitePath[]);
      } catch {
        if (!cancelled) {
          setAllPaths([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPaths(false);
        }
      }
    }

    loadPaths();

    return () => {
      cancelled = true;
    };
  }, []);

  const defaultValues = useMemo<InvitationFormData>(
    () => ({
      email: "",
      role: "member",
      selectedPathIds: [],
    }),
    [],
  );

  const form = useForm<InvitationFormData>({
    resolver: zodResolver(
      invitationFormSchema,
    ) as unknown as Resolver<InvitationFormData>,
    defaultValues,
    mode: "onChange",
  });

  const pathsByDomain = useMemo(() => {
    return groupPathsByDomain(allPaths);
  }, [allPaths]);

  const isFormValid = form.formState.isValid ?? false;

  function handlePathToggle(pathId: number, currentPathIds: number[]) {
    return togglePathId(pathId, currentPathIds);
  }

  async function handleSubmit(data: InvitationFormData) {
    try {
      await onSend(data.email.trim(), data.role, data.selectedPathIds);
      form.reset();
      onSent();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to send invitation. Please try again.";
      form.setError("root", { message: errorMessage });
    }
  }

  return {
    form: form as UseFormReturn<InvitationFormData>,
    isSending,
    isFormValid,
    isLoadingPaths,
    allPaths,
    pathsByDomain,
    onSubmit: handleSubmit,
    handlePathToggle,
  };
}
