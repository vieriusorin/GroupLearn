/**
 * Custom Hook for Invite Modal
 * Manages form state, validation, submission logic, and path organization for sending invitations
 *
 * Separates business logic from UI presentation following separation of concerns
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import type { z } from "zod";
import type { PathWithProgress } from "@/lib/types";
import { invitationFormSchema } from "@/lib/validation";
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
  domain_name?: string;
};

/**
 * Group paths by domain name for better organization
 */
function groupPathsByDomain(
  paths: InvitePath[] | undefined,
): Record<string, InvitePath[]> {
  if (!paths) return {};

  const grouped: Record<string, InvitePath[]> = {};
  paths.forEach((path) => {
    const domainName = path.domain_name || "Uncategorized";
    if (!grouped[domainName]) {
      grouped[domainName] = [];
    }
    grouped[domainName].push(path);
  });

  return grouped;
}

/**
 * Toggle a path ID in the selected paths array
 */
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
  // Local state for paths loaded via Server Action
  const [allPaths, setAllPaths] = useState<InvitePath[]>([]);
  const [isLoadingPaths, setIsLoadingPaths] = useState(true);

  // Load all paths once when the modal hook is used
  useEffect(() => {
    let cancelled = false;

    async function loadPaths() {
      setIsLoadingPaths(true);

      try {
        const result = await getPaths();

        if (cancelled) return;

        if (!result.success) {
          // On error, keep paths empty; caller can decide how to show errors
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

  // Initialize form with default values
  const defaultValues = useMemo<InvitationFormData>(
    () => ({
      email: "",
      role: "member",
      selectedPathIds: [],
    }),
    [],
  );

  const form = useForm<InvitationFormData>({
    resolver: zodResolver(invitationFormSchema) as any, // Type mismatch between optional and required fields
    defaultValues,
    mode: "onChange",
  });

  // Group paths by domain for better organization
  const pathsByDomain = useMemo(() => {
    return groupPathsByDomain(allPaths);
  }, [allPaths]);

  // Check if form is valid
  const isFormValid = form.formState.isValid ?? false;

  // Handle path toggle
  function handlePathToggle(pathId: number, currentPathIds: number[]) {
    return togglePathId(pathId, currentPathIds);
  }

  // Handle form submission
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
    // Form instance
    form: form as UseFormReturn<InvitationFormData>,

    // State
    isSending,
    isFormValid,
    isLoadingPaths,
    allPaths,
    pathsByDomain,

    // Actions
    onSubmit: handleSubmit,
    handlePathToggle,
  };
}
