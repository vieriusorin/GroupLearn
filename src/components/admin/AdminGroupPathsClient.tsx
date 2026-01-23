"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { AssignPathModal } from "@/components/admin/AssignPathModal";
import { ErrorMessage } from "@/components/admin/ErrorMessage";
import { GroupPathsContent } from "@/components/admin/GroupPathsContent";
import { GroupPathsHeader } from "@/components/admin/GroupPathsHeader";
import { PathVisibilityInfo } from "@/components/admin/PathVisibilityInfo";
import { Dialog } from "@/components/ui/dialog";
import {
  assignPath,
  type Group,
  type GroupPath,
  removePath,
  togglePathVisibility,
} from "@/presentation/actions/groups";

interface Path {
  id: number;
  name: string;
  description: string | null;
  domainId: number;
  domainName?: string;
  isPublic: boolean;
  unitCount?: number;
}

interface Props {
  group: Group;
  assignedPaths: GroupPath[];
  allPaths: Path[];
}

export function AdminGroupPathsClient({
  group,
  assignedPaths,
  allPaths,
}: Props) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const availablePaths = useMemo(() => {
    if (!assignedPaths || !allPaths) return [];
    const assignedIds = new Set(assignedPaths.map((p) => p.id));
    return allPaths.filter((p) => !assignedIds.has(p.id));
  }, [assignedPaths, allPaths]);

  const handleAssignPath = useCallback(
    async (pathId: number, isVisible: boolean = true) => {
      setError(null);
      startTransition(async () => {
        const result = await assignPath(group.id, pathId, isVisible);
        if (!result.success) {
          setError(result.error || "Failed to assign path");
        } else {
          setShowAssignModal(false);
          router.refresh();
        }
      });
    },
    [group.id, router],
  );

  const handleRemovePath = useCallback(
    async (pathId: number) => {
      setError(null);
      startTransition(async () => {
        const result = await removePath(group.id, pathId);
        if (!result.success) {
          setError(result.error || "Failed to remove path");
        } else {
          router.refresh();
        }
      });
    },
    [group.id, router],
  );

  const handleToggleVisibility = useCallback(
    async (pathId: number, currentVisibility: number) => {
      setError(null);
      startTransition(async () => {
        const result = await togglePathVisibility(
          group.id,
          pathId,
          !currentVisibility,
        );
        if (!result.success) {
          setError(result.error || "Failed to update visibility");
        } else {
          router.refresh();
        }
      });
    },
    [group.id, router],
  );

  return (
    <main className="space-y-6">
      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      <GroupPathsHeader
        groupId={group.id}
        groupName={group.name}
        onAssignClick={() => setShowAssignModal(true)}
      />

      <PathVisibilityInfo />

      <GroupPathsContent
        assignedPaths={assignedPaths}
        isTogglingVisibility={isPending}
        onToggleVisibility={handleToggleVisibility}
        onRemove={handleRemovePath}
        onAssignClick={() => setShowAssignModal(true)}
      />

      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <AssignPathModal
          availablePaths={availablePaths}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssignPath}
          isAssigning={isPending}
        />
      </Dialog>
    </main>
  );
}
