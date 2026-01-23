"use client";

import { EmptyState } from "@/components/admin/EmptyState";
import { GroupPathCard } from "@/components/admin/GroupPathCard";
import type { GroupPath } from "@/presentation/actions/groups";

interface GroupPathsContentProps {
  assignedPaths: GroupPath[];
  isTogglingVisibility: boolean;
  onToggleVisibility: (pathId: number, currentVisibility: number) => void; // Keep number for backward compatibility with handler
  onRemove: (pathId: number) => void;
  onAssignClick: () => void;
}

export const GroupPathsContent = ({
  assignedPaths,
  isTogglingVisibility,
  onToggleVisibility,
  onRemove,
  onAssignClick,
}: GroupPathsContentProps) => {
  if (assignedPaths.length === 0) {
    return (
      <EmptyState
        icon="🎯"
        title="No paths assigned yet"
        description="Assign learning paths to make them available to group members"
        actionLabel="+ Assign Path"
        onAction={onAssignClick}
      />
    );
  }

  return (
    <section aria-label="Assigned learning paths">
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignedPaths.map((path) => (
          <li key={path.id}>
            <GroupPathCard
              path={path}
              isTogglingVisibility={isTogglingVisibility}
              onToggleVisibility={onToggleVisibility}
              onRemove={onRemove}
            />
          </li>
        ))}
      </ul>
    </section>
  );
};
