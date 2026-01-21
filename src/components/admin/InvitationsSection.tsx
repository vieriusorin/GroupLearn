"use client";

import { InvitationCard } from "@/components/admin/InvitationCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Invitation } from "@/presentation/actions/groups";

interface InvitationsSectionProps {
  invitations: Invitation[];
  onRevoke: (invitationId: number) => void;
}

export const InvitationsSection = ({
  invitations,
  onRevoke,
}: InvitationsSectionProps) => {
  const pendingCount = invitations.filter((i) => i.status === "pending").length;

  return (
    <section aria-label="Pending invitations">
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations ({pendingCount})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {invitations.length > 0 ? (
              <ul>
                {invitations.map((invitation) => (
                  <li key={invitation.id}>
                    <InvitationCard
                      invitation={invitation}
                      onRevoke={onRevoke}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-12 text-center text-muted-foreground">
                No invitations sent
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
