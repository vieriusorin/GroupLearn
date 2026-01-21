"use server";

import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/drizzle";
import { users } from "@/infrastructure/database/schema/auth.schema";
import {
  groupInvitations,
  groupMembers,
  groups,
} from "@/infrastructure/database/schema/groups.schema";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export interface Group {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Member {
  id: number;
  user_id: string;
  role: "member" | "admin";
  joined_at: string;
  user_name?: string;
  user_email?: string;
}

export interface Invitation {
  id: number;
  email: string;
  role: "member" | "admin";
  status: "pending" | "accepted" | "expired";
  expires_at: string;
  created_at: string;
  invited_by_name?: string;
}

export interface GroupDetail {
  group: Group;
  members: Member[];
  invitations: Invitation[];
}

export async function getGroupDetail(
  groupId: number,
): Promise<ActionResult<GroupDetail>> {
  return withAuth(["admin", "member"], async (user) => {
    const [membership] = await db
      .select({ role: groupMembers.role })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, user.id),
        ),
      )
      .limit(1);

    if (user.role !== "admin" && !membership) {
      return {
        success: false,
        error: "You do not have permission to view this group",
      };
    }

    const [groupRow] = await db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        created_at: groups.createdAt,
      })
      .from(groups)
      .where(eq(groups.id, groupId))
      .limit(1);

    if (!groupRow) {
      return {
        success: false,
        error: "Group not found",
      };
    }

    const group: Group = {
      id: groupRow.id,
      name: groupRow.name,
      description: groupRow.description,
      created_at: groupRow.created_at.toISOString(),
    };

    const membersRows = await db
      .select({
        id: groupMembers.id,
        user_id: groupMembers.userId,
        role: groupMembers.role,
        joined_at: groupMembers.joinedAt,
        user_name: users.name,
        user_email: users.email,
      })
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(eq(groupMembers.groupId, groupId))
      .orderBy(asc(groupMembers.joinedAt));

    const members: Member[] = membersRows.map((m) => ({
      id: m.id,
      user_id: m.user_id,
      role: m.role as "member" | "admin",
      joined_at: m.joined_at.toISOString(),
      user_name: m.user_name ?? undefined,
      user_email: m.user_email ?? undefined,
    }));

    let invitations: Invitation[] = [];
    if (user.role === "admin" || membership?.role === "admin") {
      const invitationsRows = await db
        .select({
          id: groupInvitations.id,
          email: groupInvitations.email,
          role: groupInvitations.role,
          status: groupInvitations.status,
          expires_at: groupInvitations.expiresAt,
          created_at: groupInvitations.createdAt,
          invited_by_name: sql<string | null>`${users.name}`.as(
            "invited_by_name",
          ),
        })
        .from(groupInvitations)
        .leftJoin(users, eq(groupInvitations.invitedBy, users.id))
        .where(eq(groupInvitations.groupId, groupId))
        .orderBy(desc(groupInvitations.createdAt));

      invitations = invitationsRows.map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role as "member" | "admin",
        status: inv.status as "pending" | "accepted" | "expired",
        expires_at: inv.expires_at.toISOString(),
        created_at: inv.created_at.toISOString(),
        invited_by_name: inv.invited_by_name ?? undefined,
      }));
    }

    return {
      success: true,
      data: {
        group,
        members,
        invitations,
      },
    };
  });
}
