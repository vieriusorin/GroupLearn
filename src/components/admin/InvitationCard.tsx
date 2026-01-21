"use client";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import type { Invitation } from "@/presentation/actions/groups";

interface InvitationCardProps {
  invitation: Invitation;
  onRevoke: (invitationId: number) => void;
}

export const InvitationCard = ({
  invitation,
  onRevoke,
}: InvitationCardProps) => {
  return (
    <div className="px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
      <div className="flex-1">
        <div className="font-medium text-foreground">{invitation.email}</div>
        <div className="text-sm text-muted-foreground">
          Role: {invitation.role}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Invited{" "}
          <time dateTime={invitation.created_at}>
            {new Date(invitation.created_at).toLocaleDateString()}
          </time>{" "}
          • Expires{" "}
          <time dateTime={invitation.expires_at}>
            {new Date(invitation.expires_at).toLocaleDateString()}
          </time>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            invitation.status === "pending"
              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
              : invitation.status === "accepted"
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : "bg-muted text-muted-foreground"
          }`}
          aria-label={`Invitation status: ${invitation.status}`}
        >
          {invitation.status}
        </span>
        {invitation.status === "pending" && (
          <ConfirmDialog
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Revoke invitation for ${invitation.email}`}
              >
                Revoke
              </Button>
            }
            title="Revoke Invitation"
            description={`Are you sure you want to revoke the invitation for ${invitation.email}? This action cannot be undone.`}
            confirmText="Revoke"
            cancelText="Cancel"
            variant="destructive"
            onConfirm={() => onRevoke(invitation.id)}
          />
        )}
      </div>
    </div>
  );
};
