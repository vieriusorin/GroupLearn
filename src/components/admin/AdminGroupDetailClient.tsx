"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { ErrorMessage } from "@/components/admin/ErrorMessage";
import { GroupDetailHeader } from "@/components/admin/GroupDetailHeader";
import { InvitationsSection } from "@/components/admin/InvitationsSection";
import { InviteModal } from "@/components/admin/InviteModal";
import { MembersSection } from "@/components/admin/MembersSection";
import { Dialog } from "@/components/ui/dialog";
import {
  type Group,
  type Invitation,
  type Member,
  removeMember,
  revokeInvitation,
  sendInvitation,
  updateMemberRole,
} from "@/presentation/actions/groups";

interface Props {
  group: Group;
  members: Member[];
  invitations: Invitation[];
}

export function AdminGroupDetailClient({ group, members, invitations }: Props) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRemoveMember = useCallback(
    async (userId: number) => {
      setError(null);
      startTransition(async () => {
        const result = await removeMember(group.id, userId);
        if (!result.success) {
          setError(result.error || "Failed to remove member");
        } else {
          router.refresh();
        }
      });
    },
    [group.id, router],
  );

  const handleUpdateRole = useCallback(
    async (userId: number, newRole: "member" | "admin") => {
      setError(null);
      startTransition(async () => {
        const result = await updateMemberRole(group.id, userId, newRole);
        if (!result.success) {
          setError(result.error || "Failed to update role");
        } else {
          router.refresh();
        }
      });
    },
    [group.id, router],
  );

  const handleRevokeInvitation = useCallback(
    async (invitationId: number) => {
      setError(null);
      startTransition(async () => {
        const result = await revokeInvitation(group.id, invitationId);
        if (!result.success) {
          setError(result.error || "Failed to revoke invitation");
        } else {
          router.refresh();
        }
      });
    },
    [group.id, router],
  );

  const handleSendInvitation = useCallback(
    async (email: string, role: "member" | "admin", pathIds: number[]) => {
      setError(null);
      const result = await sendInvitation(group.id, email, role, pathIds);
      if (!result.success) {
        setError(result.error || "Failed to send invitation");
        throw new Error(result.error || "Failed to send invitation"); // Re-throw so modal can handle it
      } else {
        setShowInviteModal(false);
        router.refresh();
      }
    },
    [group.id, router],
  );

  return (
    <main className="space-y-6">
      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      <GroupDetailHeader
        group={group}
        groupId={group.id}
        onInviteClick={() => setShowInviteModal(true)}
      />

      <MembersSection
        members={members}
        isUpdatingRole={isPending}
        onUpdateRole={handleUpdateRole}
        onRemove={handleRemoveMember}
      />

      <InvitationsSection
        invitations={invitations}
        onRevoke={handleRevokeInvitation}
      />

      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <InviteModal
          groupId={group.id}
          onClose={() => setShowInviteModal(false)}
          onSent={() => setShowInviteModal(false)}
          isSending={isPending}
          onSend={handleSendInvitation}
        />
      </Dialog>
    </main>
  );
}
