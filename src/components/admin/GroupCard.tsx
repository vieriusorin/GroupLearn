"use client";

import { Users } from "lucide-react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { GroupListItem } from "@/presentation/actions/groups";

interface GroupCardProps {
  group: GroupListItem;
  onDelete: (id: number) => void;
}

export const GroupCard = ({ group, onDelete }: GroupCardProps) => {
  return (
    <Card className="border-2 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">{group.name}</h3>
            {group.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {group.description}
              </p>
            )}
          </div>
          <div className="ml-3 p-2 rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
        </div>

        <dl className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <dt className="text-muted-foreground">Members:</dt>
            <dd className="font-semibold">{group.memberCount || 0}</dd>
          </div>
          {(group.pendingInvitations || 0) > 0 && (
            <div className="flex items-center justify-between text-sm">
              <dt className="text-muted-foreground">Pending:</dt>
              <dd>
                <Badge
                  variant="outline"
                  className="text-xs text-yellow-600 dark:text-yellow-400 border-yellow-600/50"
                >
                  {group.pendingInvitations}
                </Badge>
              </dd>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <dt className="text-muted-foreground">Creator:</dt>
            <dd className="font-semibold">
              {group.creatorName || group.adminName || "Unknown"}
            </dd>
          </div>
          <div className="flex items-center justify-between text-sm">
            <dt className="text-muted-foreground">Created:</dt>
            <dd className="font-semibold">
              <time dateTime={group.createdAt}>
                {new Date(group.createdAt).toLocaleDateString()}
              </time>
            </dd>
          </div>
        </dl>

        <div className="flex items-center gap-2 pt-4 border-t">
          <Link href={`/admin/groups/${group.id}`} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              aria-label={`Manage ${group.name}`}
            >
              Manage
            </Button>
          </Link>
          <ConfirmDialog
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
                aria-label={`Delete ${group.name}`}
              >
                Delete
              </Button>
            }
            title="Delete Group"
            description={`Are you sure you want to delete "${group.name}"? This will remove all members and delete the group. This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            variant="destructive"
            onConfirm={() => onDelete(group.id)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
