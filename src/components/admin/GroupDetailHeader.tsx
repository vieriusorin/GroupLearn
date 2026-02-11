"use client";

import Link from "next/link";
import { Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Group } from "@/presentation/actions/groups";

interface GroupDetailHeaderProps {
  group: Group;
  groupId: number;
  onInviteClick: () => void;
  activeSessionCount?: number;
}

export const GroupDetailHeader = ({
  group,
  groupId,
  onInviteClick,
  activeSessionCount = 0,
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{group.name}</h1>
        {group.description && (
          <p className="text-gray-600 dark:text-gray-400 mt-1">{group.description}</p>
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
        <Link href={`/groups/${groupId}`}>
          <Button
            variant="outline"
            className="gap-2 relative bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 hover:from-purple-700 hover:to-pink-700 hover:text-white"
            aria-label="Go to live sessions"
          >
            <Radio className="h-4 w-4" />
            Live Sessions
            {activeSessionCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 text-white text-xs font-bold items-center justify-center">
                  {activeSessionCount}
                </span>
              </span>
            )}
          </Button>
        </Link>
        <Button onClick={onInviteClick} aria-label="Invite a new member">
          + Invite Member
        </Button>
      </div>
    </header>
  );
};
