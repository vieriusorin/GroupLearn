"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CreateGroupModal } from "@/components/admin/CreateGroupModal";
import { ErrorMessage } from "@/components/admin/ErrorMessage";
import { GroupsContent } from "@/components/admin/GroupsContent";
import { GroupsHeader } from "@/components/admin/GroupsHeader";
import { Dialog } from "@/components/ui/dialog";
import type { GroupListItem } from "@/presentation/actions/groups";
import { createGroup, deleteGroup } from "@/presentation/actions/groups";

interface AdminGroupsClientProps {
  initialGroups: GroupListItem[];
}

/**
 * Admin Groups Client Component
 *
 * Handles all interactivity for the admin groups page using React 19 patterns.
 * Uses useTransition for mutations and router.refresh() for revalidation.
 */
export function AdminGroupsClient({ initialGroups }: AdminGroupsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // UI state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<GroupListItem[]>(initialGroups);

  // Handle create group
  const handleCreateGroup = async (name: string, description?: string) => {
    setError(null);
    startTransition(async () => {
      const result = await createGroup(name, description);

      if (!result.success) {
        setError(result.error || "Failed to create group. Please try again.");
        throw new Error(result.error || "Failed to create group");
      }

      // Optimistically update UI
      if (result.data) {
        setGroups((prev) => [result.data!, ...prev]);
      }

      // Close modal and refresh
      setShowCreateModal(false);
      router.refresh();
    });
  };

  // Handle delete group
  const handleDeleteGroup = async (id: number) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await deleteGroup(id);

        if (!result.success) {
          setError(result.error || "Failed to delete group. Please try again.");
          return;
        }

        // Optimistically update UI
        setGroups((prev) => prev.filter((g) => g.id !== id));

        // Refresh to get latest data
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to delete group. Please try again.",
        );
      }
    });
  };

  return (
    <main className="space-y-6">
      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      <GroupsHeader onCreateClick={() => setShowCreateModal(true)} />

      <GroupsContent
        groups={groups}
        onDelete={handleDeleteGroup}
        onCreateClick={() => setShowCreateModal(true)}
      />

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => setShowCreateModal(false)}
          isCreating={isPending}
          onCreate={handleCreateGroup}
        />
      </Dialog>
    </main>
  );
}
