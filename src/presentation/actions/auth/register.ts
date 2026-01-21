"use server";

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/infrastructure/database/drizzle";
import { groupInvitations, users } from "@/infrastructure/database/schema";
import {
  InvitationStatus,
  SubscriptionStatus,
  UserRole,
} from "@/infrastructure/database/schema/enums";
import { passwordSchema } from "@/lib/validation";
import type { ActionResult } from "@/presentation/types/action-result";

// Server-side registration schema
const registerActionSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  callbackUrl: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerActionSchema>;

interface RegisterResponse {
  success: boolean;
  message: string;
}

/**
 * Server Action: Register a new user account
 *
 * Creates a user account with role determined by invitation context.
 * If user is registering via invitation, they get 'member' role.
 * Otherwise, they get 'admin' role (direct sign-up).
 *
 * @param input - Registration data (name, email, password, callbackUrl)
 * @returns ActionResult with success message or error
 */
export async function registerUser(
  input: RegisterInput,
): Promise<ActionResult<RegisterResponse>> {
  try {
    // Validate input
    const validation = registerActionSchema.safeParse(input);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Validation failed",
      };
    }

    const { name, email, password, callbackUrl = "" } = validation.data;

    // Check if user already exists
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser) {
      return {
        success: false,
        error:
          "An account with this email already exists. Please sign in instead.",
      };
    }

    // Determine role based on registration context
    // If callbackUrl contains '/invitations/', user is registering via invitation → 'member'
    // Otherwise, direct sign-up → 'admin'
    const isInvitationFlow = callbackUrl.includes("/invitations/");

    // Also check if there's a pending invitation for this email
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

    // If there's a pending invitation OR callbackUrl indicates invitation flow, user is a member
    // Otherwise, they're an admin (direct sign-up)
    const role =
      isInvitationFlow || pendingInvitation ? UserRole.MEMBER : UserRole.ADMIN;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
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
      data: {
        success: true,
        message: "Account created successfully",
      },
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "Failed to create account. Please try again.",
    };
  }
}
