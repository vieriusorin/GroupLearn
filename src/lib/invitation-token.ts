import { randomBytes } from "node:crypto";
import { and, count, eq, gt } from "drizzle-orm";
import { db } from "@/infrastructure/database/drizzle";
import { users } from "@/infrastructure/database/schema/auth.schema";
import {
  GroupRole,
  InvitationStatus,
} from "@/infrastructure/database/schema/enums";
import {
  groupInvitations,
  groups,
} from "@/infrastructure/database/schema/groups.schema";

/**
 * Generate a secure random token for group invitations
 */
export function generateInvitationToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Create an invitation token with expiration
 */
export async function createInvitationToken(
  groupId: number,
  email: string,
  invitedBy: string,
  role: "member" | "admin" = "member",
  expiresInDays: number = 7,
): Promise<{ token: string; expiresAt: string; invitationId: number }> {
  const token = generateInvitationToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const [invitation] = await db
    .insert(groupInvitations)
    .values({
      groupId,
      email: email.toLowerCase(),
      role: role === "admin" ? GroupRole.ADMIN : GroupRole.MEMBER,
      token,
      invitedBy,
      expiresAt,
      status: InvitationStatus.PENDING,
    })
    .returning();

  return {
    token,
    expiresAt: expiresAt.toISOString(),
    invitationId: invitation.id,
  };
}

/**
 * Validate an invitation token
 */
export async function validateInvitationToken(token: string): Promise<{
  valid: boolean;
  invitation?: {
    id: number;
    groupId: number;
    email: string;
    role: "member" | "admin";
    invitedBy: string;
    expiresAt: string;
  };
  error?: "not_found" | "expired" | "already_used";
}> {
  const [invitation] = await db
    .select({
      id: groupInvitations.id,
      groupId: groupInvitations.groupId,
      email: groupInvitations.email,
      role: groupInvitations.role,
      invitedBy: groupInvitations.invitedBy,
      expiresAt: groupInvitations.expiresAt,
      status: groupInvitations.status,
    })
    .from(groupInvitations)
    .where(eq(groupInvitations.token, token))
    .limit(1);

  if (!invitation) {
    return { valid: false, error: "not_found" };
  }

  if (invitation.status !== InvitationStatus.PENDING) {
    return { valid: false, error: "already_used" };
  }

  const now = new Date();
  const expiresAt = invitation.expiresAt;

  if (now > expiresAt) {
    await db
      .update(groupInvitations)
      .set({ status: InvitationStatus.EXPIRED })
      .where(eq(groupInvitations.id, invitation.id));

    return { valid: false, error: "expired" };
  }

  return {
    valid: true,
    invitation: {
      id: invitation.id,
      groupId: invitation.groupId,
      email: invitation.email,
      role: invitation.role as "member" | "admin",
      invitedBy: invitation.invitedBy,
      expiresAt: invitation.expiresAt.toISOString(),
    },
  };
}

/**
 * Mark an invitation as accepted
 */
export async function acceptInvitation(
  invitationId: number,
  _userId: string,
): Promise<void> {
  await db
    .update(groupInvitations)
    .set({
      status: InvitationStatus.ACCEPTED,
      acceptedAt: new Date(),
    })
    .where(eq(groupInvitations.id, invitationId));
}

/**
 * Mark an invitation as declined
 */
export async function declineInvitation(invitationId: number): Promise<void> {
  await db
    .update(groupInvitations)
    .set({
      status: InvitationStatus.REJECTED,
    })
    .where(eq(groupInvitations.id, invitationId));
}

/**
 * Get pending invitations for an email
 */
export async function getPendingInvitations(email: string): Promise<any[]> {
  const now = new Date();

  const rows = await db
    .select({
      id: groupInvitations.id,
      token: groupInvitations.token,
      role: groupInvitations.role,
      created_at: groupInvitations.createdAt,
      expires_at: groupInvitations.expiresAt,
      group_id: groups.id,
      group_name: groups.name,
      group_description: groups.description,
      invited_by_name: users.name,
      invited_by_email: users.email,
    })
    .from(groupInvitations)
    .innerJoin(groups, eq(groupInvitations.groupId, groups.id))
    .innerJoin(users, eq(groupInvitations.invitedBy, users.id))
    .where(
      and(
        eq(groupInvitations.email, email.toLowerCase()),
        eq(groupInvitations.status, InvitationStatus.PENDING),
        gt(groupInvitations.expiresAt, now),
      ),
    )
    .orderBy(groupInvitations.createdAt);

  return rows.map((row) => ({
    ...row,
    created_at: row.created_at.toISOString(),
    expires_at: row.expires_at.toISOString(),
  }));
}

/**
 * Check if an email has already been invited to a group
 */
export async function hasActiveinvitation(
  groupId: number,
  email: string,
): Promise<boolean> {
  const now = new Date();

  const [result] = await db
    .select({ count: count() })
    .from(groupInvitations)
    .where(
      and(
        eq(groupInvitations.groupId, groupId),
        eq(groupInvitations.email, email.toLowerCase()),
        eq(groupInvitations.status, InvitationStatus.PENDING),
        gt(groupInvitations.expiresAt, now),
      ),
    );

  return Number(result?.count ?? 0) > 0;
}

/**
 * Get all invitations for a group (for admin view)
 */
export async function getGroupInvitations(groupId: number): Promise<any[]> {
  const rows = await db
    .select({
      id: groupInvitations.id,
      email: groupInvitations.email,
      role: groupInvitations.role,
      status: groupInvitations.status,
      created_at: groupInvitations.createdAt,
      expires_at: groupInvitations.expiresAt,
      accepted_at: groupInvitations.acceptedAt,
      invited_by_name: users.name,
      invited_by_email: users.email,
    })
    .from(groupInvitations)
    .innerJoin(users, eq(groupInvitations.invitedBy, users.id))
    .where(eq(groupInvitations.groupId, groupId))
    .orderBy(groupInvitations.createdAt);

  return rows.map((row) => ({
    ...row,
    created_at: row.created_at.toISOString(),
    expires_at: row.expires_at.toISOString(),
    accepted_at: row.accepted_at ? row.accepted_at.toISOString() : null,
  }));
}
