"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/drizzle";
import { users } from "@/infrastructure/database/schema/auth.schema";
import { GroupRole } from "@/infrastructure/database/schema/enums";
import {
  groupMembers,
  groups,
} from "@/infrastructure/database/schema/groups.schema";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export interface GroupListItem {
  id: number;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  admin_name?: string;
  admin_email?: string;
  member_count?: number;
}

export async function createGroup(
  name: string,
  description?: string | null,
): Promise<ActionResult<GroupListItem>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return {
        success: false,
        error: "Group name is required",
        code: "VALIDATION_ERROR",
      };
    }

    const [userRecord] = await db
      .select({
        role: users.role,
        subscriptionStatus: users.subscriptionStatus,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!userRecord) {
      return {
        success: false,
        error: "User not found",
        code: "NOT_FOUND",
      };
    }

    if (
      userRecord.role !== "admin" &&
      userRecord.subscriptionStatus === "free"
    ) {
      return {
        success: false,
        error: "Group creation requires a paid subscription",
        code: "FORBIDDEN",
      };
    }

    const [newGroup] = await db
      .insert(groups)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
        adminId: user.id,
      })
      .returning();

    const groupId = newGroup.id;

    await db.insert(groupMembers).values({
      groupId,
      userId: user.id,
      role: GroupRole.ADMIN,
    });

    const [group] = await db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        created_by: groups.adminId,
        created_at: sql<string>`${groups.createdAt}::text`.as("created_at"),
        admin_name: users.name,
        admin_email: users.email,
        member_count: sql<number>`1`.as("member_count"),
      })
      .from(groups)
      .innerJoin(users, eq(groups.adminId, users.id))
      .where(eq(groups.id, groupId))
      .limit(1);

    return {
      success: true,
      data: {
        ...group,
        admin_name: group.admin_name ?? undefined,
        created_at: group.created_at || new Date().toISOString(),
      },
    };
  });
}
