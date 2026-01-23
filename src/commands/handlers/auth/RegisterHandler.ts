import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt, sql } from "drizzle-orm";
import { z } from "zod";
import type { RegisterResult } from "@/application/dtos/auth.dto";
import type { RegisterCommand } from "@/commands/auth/Register.command";
import type { ICommandHandler } from "@/commands/types";
import { DomainError } from "@/domains/shared/errors";
import { db } from "@/infrastructure/database/drizzle";
import { groupInvitations, users } from "@/infrastructure/database/schema";
import {
  InvitationStatus,
  SubscriptionStatus,
  UserRole,
} from "@/infrastructure/database/schema/enums";
import { passwordSchema } from "@/lib/shared/validation";

const registerActionSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  callbackUrl: z.string().optional(),
});

export class RegisterHandler
  implements ICommandHandler<RegisterCommand, RegisterResult>
{
  async execute(command: RegisterCommand): Promise<RegisterResult> {
    const validation = registerActionSchema.safeParse({
      name: command.name,
      email: command.email,
      password: command.password,
      callbackUrl: command.callbackUrl,
    });

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      throw new DomainError(
        firstError?.message || "Validation failed",
        "VALIDATION_ERROR",
      );
    }

    const { name, email, password, callbackUrl = "" } = validation.data;

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser) {
      throw new DomainError(
        "An account with this email already exists. Please sign in instead.",
        "USER_ALREADY_EXISTS",
      );
    }

    const isInvitationFlow = callbackUrl.includes("/invitations/");

    const [pendingInvitation] = await db
      .select({ id: groupInvitations.id })
      .from(groupInvitations)
      .where(
        and(
          eq(groupInvitations.email, email.toLowerCase()),
          eq(groupInvitations.status, InvitationStatus.PENDING),
          gt(groupInvitations.expiresAt, sql`NOW()`),
        ),
      )
      .limit(1);

    const role =
      isInvitationFlow || pendingInvitation ? UserRole.MEMBER : UserRole.ADMIN;

    const hashedPassword = await bcrypt.hash(password, 10);

    const id = crypto.randomUUID();
    const now = new Date();

    await db.insert(users).values({
      id,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      subscriptionStatus: SubscriptionStatus.FREE,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      message: "Account created successfully",
    };
  }
}
