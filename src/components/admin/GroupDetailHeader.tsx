"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Group } from "@/presentation/actions/groups";

interface GroupDetailHeaderProps {
  group: Group;
  groupId: number;
  onInviteClick: () => void;
}

export const GroupDetailHeader = ({
  group,
  groupId,
  onInviteClick,
}: GroupDetailHeaderProps) => {
  return (
    <header className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link href="/admin/groups">
            <Button variant="outline" size="sm" aria-label="Back to groups">
              ← Back
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
        {group.description && (
          <p className="text-gray-600 mt-1">{group.description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Link href={`/admin/groups/${groupId}/analytics`}>
          <Button variant="outline" aria-label="View analytics">
            📊 Analytics
          </Button>
        </Link>
        <Link href={`/admin/groups/${groupId}/paths`}>
          <Button variant="outline" aria-label="Manage learning paths">
            📚 Manage Paths
          </Button>
        </Link>
        <Button onClick={onInviteClick} aria-label="Invite a new member">
          + Invite Member
        </Button>
      </div>
    </header>
  );
};
