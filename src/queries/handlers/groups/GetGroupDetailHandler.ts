import { and, asc, desc, eq } from "drizzle-orm";
import type {
  GetGroupDetailResult,
  GroupDetailGroup,
  GroupDetailInvitation,
  GroupDetailMember,
} from "@/application/dtos/groups.dto";
import type { IQueryHandler } from "@/commands/types";
import { DomainError } from "@/domains/shared/errors";
import { db } from "@/infrastructure/database/drizzle";
import { users } from "@/infrastructure/database/schema/auth.schema";
import {
  groupInvitations,
  groupMembers,
  groups,
} from "@/infrastructure/database/schema/groups.schema";
import type { GetGroupDetailQuery } from "@/queries/groups/GetGroupDetail.query";

export class GetGroupDetailHandler
  implements IQueryHandler<GetGroupDetailQuery, GetGroupDetailResult>
{
  async execute(query: GetGroupDetailQuery): Promise<GetGroupDetailResult> {
    const [membership] = await db
      .select({ role: groupMembers.role })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, query.groupId),
          eq(groupMembers.userId, query.userId),
        ),
      )
      .limit(1);

    const [userRecord] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, query.userId))
      .limit(1);

    if (!userRecord || (userRecord.role !== "admin" && !membership)) {
      throw new DomainError(
        "You do not have permission to view this group",
        "FORBIDDEN",
      );
    }

    const [groupRow] = await db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        createdAt: groups.createdAt,
      })
      .from(groups)
      .where(eq(groups.id, query.groupId))
      .limit(1);

    if (!groupRow) {
      throw new DomainError("Group not found", "NOT_FOUND");
    }

    const group: GroupDetailGroup = {
      id: groupRow.id,
      name: groupRow.name,
      description: groupRow.description,
      createdAt: groupRow.createdAt.toISOString(),
    };

    const membersRows = await db
      .select({
        id: groupMembers.id,
        userId: groupMembers.userId,
        role: groupMembers.role,
        joinedAt: groupMembers.joinedAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(eq(groupMembers.groupId, query.groupId))
      .orderBy(asc(groupMembers.joinedAt));

    const members: GroupDetailMember[] = membersRows.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role as "member" | "admin",
      joinedAt: m.joinedAt.toISOString(),
      userName: m.userName ?? null,
      userEmail: m.userEmail ?? null,
    }));

    let invitations: GroupDetailInvitation[] = [];
    if (userRecord.role === "admin" || membership?.role === "admin") {
      const invitationsRows = await db
        .select({
          id: groupInvitations.id,
          email: groupInvitations.email,
          role: groupInvitations.role,
          status: groupInvitations.status,
          expiresAt: groupInvitations.expiresAt,
          createdAt: groupInvitations.createdAt,
          invitedByName: users.name,
        })
        .from(groupInvitations)
        .leftJoin(users, eq(groupInvitations.invitedBy, users.id))
        .where(eq(groupInvitations.groupId, query.groupId))
        .orderBy(desc(groupInvitations.createdAt));

      invitations = invitationsRows.map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role as "member" | "admin",
        status: inv.status as "pending" | "accepted" | "expired" | "rejected",
        expiresAt: inv.expiresAt.toISOString(),
        createdAt: inv.createdAt.toISOString(),
        invitedByName: inv.invitedByName ?? null,
      }));
    }

    return {
      group,
      members,
      invitations,
    };
  }
}
