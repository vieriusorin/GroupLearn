"use client";

import { EmptyState } from "@/components/admin/EmptyState";
import { GroupCard } from "@/components/admin/GroupCard";
import type { GroupListItem } from "@/presentation/actions/groups";

interface GroupsContentProps {
  groups: GroupListItem[];
  onDelete: (id: number) => void;
  onCreateClick: () => void;
}

export const GroupsContent = ({
  groups,
  onDelete,
  onCreateClick,
}: GroupsContentProps) => {
  if (groups.length === 0) {
    return (
      <EmptyState
        icon="👥"
        title="No groups yet"
        description="Create your first group to start organizing learners"
        actionLabel="+ Create Group"
        onAction={onCreateClick}
      />
    );
  }

  return (
    <section aria-label="Groups list">
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <li key={group.id}>
            <GroupCard group={group} onDelete={onDelete} />
          </li>
        ))}
      </ul>
    </section>
  );
};
