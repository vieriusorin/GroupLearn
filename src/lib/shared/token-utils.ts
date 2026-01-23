import { randomBytes } from "node:crypto";

/**
 * Generate a secure random token for group invitations
 * Uses base64url encoding for URL-safe tokens
 */
export function generateInvitationToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Generate a secure random token (hex format)
 * Used for internal token generation
 */
export function generateTokenHex(): string {
  return randomBytes(32).toString("hex");
}
