"use client";

import type { MyGroupListItem } from "@/presentation/actions/groups";
import { MyGroupsGrid } from "./MyGroupsGrid";
import { MyGroupsHeader } from "./MyGroupsHeader";
import { NoGroupsEmptyState } from "./NoGroupsEmptyState";

interface GroupsClientProps {
  initialGroups: MyGroupListItem[];
}

/**
 * Groups Client Component
 *
 * Displays the list of groups the user is a member of.
 * This is a simple read-only component - no mutations needed.
 */
export function GroupsClient({ initialGroups }: GroupsClientProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <MyGroupsHeader />

      {initialGroups.length > 0 ? (
        <MyGroupsGrid groups={initialGroups} />
      ) : (
        <NoGroupsEmptyState />
      )}
    </div>
  );
}
