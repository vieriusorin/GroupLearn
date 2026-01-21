/**
 * Groups & Collaboration Schema (PostgreSQL)
 *
 * Tables for group management, invitations, and path assignments.
 */

import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth.schema";
import { GroupRole, InvitationStatus } from "./enums";
import { paths } from "./learning-path.schema";

// ============================================
// Groups Table
// ============================================

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  adminId: text("admin_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// Group Members Table
// ============================================

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", {
    length: 20,
    enum: [GroupRole.ADMIN, GroupRole.MEMBER],
  })
    .notNull()
    .default(GroupRole.MEMBER),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  invitedBy: text("invited_by").references(() => users.id, {
    onDelete: "set null",
  }),
});

// ============================================
// Group Invitations Table
// ============================================

export const groupInvitations = pgTable("group_invitations", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", {
    length: 20,
    enum: [GroupRole.MEMBER, GroupRole.ADMIN],
  })
    .notNull()
    .default(GroupRole.MEMBER),
  token: varchar("token", { length: 255 }).notNull().unique(),
  invitedBy: text("invited_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", {
    length: 20,
    enum: [
      InvitationStatus.PENDING,
      InvitationStatus.ACCEPTED,
      InvitationStatus.REJECTED,
      InvitationStatus.EXPIRED,
    ],
  })
    .notNull()
    .default(InvitationStatus.PENDING),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  acceptedAt: timestamp("accepted_at"),
});

// ============================================
// Invitation Paths Table (Many-to-Many)
// ============================================

export const invitationPaths = pgTable("invitation_paths", {
  id: serial("id").primaryKey(),
  invitationId: integer("invitation_id")
    .notNull()
    .references(() => groupInvitations.id, { onDelete: "cascade" }),
  pathId: integer("path_id")
    .notNull()
    .references(() => paths.id, { onDelete: "cascade" }),
});

// ============================================
// Group Paths Table (Path Assignments)
// ============================================

export const groupPaths = pgTable("group_paths", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  pathId: integer("path_id")
    .notNull()
    .references(() => paths.id, { onDelete: "cascade" }),
  assignedBy: text("assigned_by")
    .notNull()
    .references(() => users.id, { onDelete: "set null" }),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
});

// ============================================
// Group Path Visibility Table
// ============================================

export const groupPathVisibility = pgTable("group_path_visibility", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  pathId: integer("path_id")
    .notNull()
    .references(() => paths.id, { onDelete: "cascade" }),
  isVisible: boolean("is_visible").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// Type Exports for TypeScript
// ============================================

export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;

export type GroupMember = typeof groupMembers.$inferSelect;
export type NewGroupMember = typeof groupMembers.$inferInsert;

export type GroupInvitation = typeof groupInvitations.$inferSelect;
export type NewGroupInvitation = typeof groupInvitations.$inferInsert;

export type InvitationPath = typeof invitationPaths.$inferSelect;
export type NewInvitationPath = typeof invitationPaths.$inferInsert;

export type GroupPath = typeof groupPaths.$inferSelect;
export type NewGroupPath = typeof groupPaths.$inferInsert;

export type GroupPathVisibility = typeof groupPathVisibility.$inferSelect;
export type NewGroupPathVisibility = typeof groupPathVisibility.$inferInsert;
