"use client";

import { MemberCard } from "@/components/admin/MemberCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Member } from "@/presentation/actions/groups";

interface MembersSectionProps {
  members: Member[];
  isUpdatingRole: boolean;
  onUpdateRole: (userId: number, role: "member" | "admin") => void;
  onRemove: (userId: number) => void;
}

export const MembersSection = ({
  members,
  isUpdatingRole,
  onUpdateRole,
  onRemove,
}: MembersSectionProps) => {
  return (
    <section aria-label="Group members">
      <Card>
        <CardHeader>
          <CardTitle>Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {members.length > 0 ? (
              <ul>
                {members.map((member) => (
                  <li key={member.id}>
                    <MemberCard
                      member={member}
                      isUpdatingRole={isUpdatingRole}
                      onUpdateRole={onUpdateRole}
                      onRemove={onRemove}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-12 text-center text-muted-foreground">
                No members yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
