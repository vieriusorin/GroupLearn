import { count, eq } from "drizzle-orm";
import type { CreateGroupResult } from "@/application/dtos/groups.dto";
import type { CreateGroupCommand } from "@/commands/groups/CreateGroup.command";
import type { ICommandHandler } from "@/commands/types";
import { DomainError } from "@/domains/shared/errors";
import { db } from "@/infrastructure/database/drizzle";
import { users } from "@/infrastructure/database/schema/auth.schema";
import { GroupRole } from "@/infrastructure/database/schema/enums";
import {
  groupMembers,
  groups,
} from "@/infrastructure/database/schema/groups.schema";

export class CreateGroupHandler
  implements ICommandHandler<CreateGroupCommand, CreateGroupResult>
{
  async execute(command: CreateGroupCommand): Promise<CreateGroupResult> {
    if (
      !command.name ||
      typeof command.name !== "string" ||
      command.name.trim().length === 0
    ) {
      throw new DomainError("Group name is required", "VALIDATION_ERROR");
    }

    const [userRecord] = await db
      .select({
        role: users.role,
        subscriptionStatus: users.subscriptionStatus,
      })
      .from(users)
      .where(eq(users.id, command.userId))
      .limit(1);

    if (!userRecord) {
      throw new DomainError("User not found", "NOT_FOUND");
    }

    if (
      userRecord.role !== "admin" &&
      userRecord.subscriptionStatus === "free"
    ) {
      throw new DomainError(
        "Group creation requires a paid subscription",
        "FORBIDDEN",
      );
    }

    const [newGroup] = await db
      .insert(groups)
      .values({
        name: command.name.trim(),
        description: command.description?.trim() || null,
        adminId: command.userId,
      })
      .returning();

    const groupId = newGroup.id;

    await db.insert(groupMembers).values({
      groupId,
      userId: command.userId,
      role: GroupRole.ADMIN,
    });

    const [groupData] = await db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        createdBy: groups.adminId,
        createdAt: groups.createdAt,
        adminName: users.name,
        adminEmail: users.email,
      })
      .from(groups)
      .innerJoin(users, eq(groups.adminId, users.id))
      .where(eq(groups.id, groupId))
      .limit(1);

    if (!groupData) {
      throw new DomainError(
        "Failed to retrieve created group",
        "INTERNAL_ERROR",
      );
    }

    const [memberCountResult] = await db
      .select({ count: count() })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId));

    const group: GroupListItem = {
      id: groupData.id,
      name: groupData.name,
      description: groupData.description,
      createdBy: groupData.createdBy,
      createdAt: groupData.createdAt.toISOString(),
      adminName: groupData.adminName ?? null,
      adminEmail: groupData.adminEmail ?? null,
      memberCount: Number(memberCountResult?.count ?? 1),
      creatorName: groupData.adminName ?? undefined,
    };

    return {
      group,
    };
  }
}
