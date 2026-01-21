"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface GroupPathsHeaderProps {
  groupId: number;
  groupName: string;
  onAssignClick: () => void;
}

export const GroupPathsHeader = ({
  groupId,
  groupName,
  onAssignClick,
}: GroupPathsHeaderProps) => {
  return (
    <header className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link href={`/admin/groups/${groupId}`}>
            <Button variant="outline" size="sm" aria-label="Back to group">
              ← Back to Group
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Learning Paths - {groupName}
        </h1>
        <p className="text-gray-600 mt-1">
          Manage which paths are available to group members
        </p>
      </div>
      <Button onClick={onAssignClick} aria-label="Assign a new learning path">
        + Assign Path
      </Button>
    </header>
  );
};
