"use client";

import { Settings } from "lucide-react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import type { Member } from "@/presentation/actions/groups";

interface MemberCardProps {
  member: Member;
  isUpdatingRole: boolean;
  onUpdateRole: (userId: number, role: "member" | "admin") => void;
  onRemove: (userId: number) => void;
}

export const MemberCard = ({
  member,
  isUpdatingRole,
  onUpdateRole,
  onRemove,
}: MemberCardProps) => {
  return (
    <div className="px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
      <div className="flex-1">
        <div className="font-medium text-foreground">
          {member.userName || "Unknown User"}
        </div>
        <div className="text-sm text-muted-foreground">
          {member.userEmail || "No email"}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Joined{" "}
          <time dateTime={member.joinedAt}>
            {new Date(member.joinedAt).toLocaleDateString()}
          </time>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label htmlFor={`role-${member.id}`} className="sr-only">
          Change role for {member.userName || "member"}
        </label>
        <select
          id={`role-${member.id}`}
          value={member.role}
          onChange={(e) =>
            onUpdateRole(
              Number(member.userId),
              e.target.value as "member" | "admin",
            )
          }
          disabled={isUpdatingRole}
          className="px-3 py-1 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Current role: ${member.role}. Change role for ${member.userName || "member"}`}
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <Link href={`/admin/users/${String(member.userId)}`}>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            aria-label={`Manage path access for ${member.userName || "member"}`}
          >
            <Settings className="h-4 w-4" />
            Manage Paths
          </Button>
        </Link>
        <ConfirmDialog
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Remove ${member.userName || "member"} from group`}
            >
              Remove
            </Button>
          }
          title="Remove Member"
          description={`Are you sure you want to remove ${member.userName || "this member"} from the group? This action cannot be undone.`}
          confirmText="Remove"
          cancelText="Cancel"
          variant="destructive"
          onConfirm={() => onRemove(Number(member.userId))}
        />
      </div>
    </div>
  );
};
