/**
 * Reset Groups and Invitations Script
 *
 * This script clears all data related to groups and invitations:
 * - invitation_paths (paths linked to invitations)
 * - group_invitations (all invitations)
 * - group_path_visibility (path visibility settings)
 * - group_paths (paths assigned to groups)
 * - group_members (all group members)
 * - groups (all groups)
 *
 * WARNING: This will permanently delete all group and invitation data!
 *
 * Run: npx tsx tools/reset-invitations.ts
 */

import { sql } from "drizzle-orm";
import { closeDb, db } from "../src/infrastructure/database/drizzle";
import {
  groupInvitations,
  groupMembers,
  groupPaths,
  groupPathVisibility,
  groups,
  invitationPaths,
} from "../src/infrastructure/database/schema";

async function countAll() {
  const getCount = async (table: any) => {
    const rows = await db.select({ count: sql<number>`COUNT(*)` }).from(table);
    return rows[0]?.count ?? 0;
  };

  const [
    invitationPathsCount,
    invitationsCount,
    groupPathsCount,
    groupVisibilityCount,
    groupMembersCount,
    groupsCount,
  ] = await Promise.all([
    getCount(invitationPaths),
    getCount(groupInvitations),
    getCount(groupPaths),
    getCount(groupPathVisibility),
    getCount(groupMembers),
    getCount(groups),
  ]);

  return {
    invitationPathsCount,
    invitationsCount,
    groupPathsCount,
    groupVisibilityCount,
    groupMembersCount,
    groupsCount,
    totalCount:
      invitationPathsCount +
      invitationsCount +
      groupPathsCount +
      groupVisibilityCount +
      groupMembersCount +
      groupsCount,
  };
}

async function resetGroupsAndInvitations() {
  console.log("🔄 Starting groups and invitations reset...\n");

  try {
    // Get counts before deletion
    const {
      invitationPathsCount,
      invitationsCount,
      groupPathsCount,
      groupVisibilityCount,
      groupMembersCount,
      groupsCount,
      totalCount,
    } = await countAll();

    console.log("📊 Current data:");
    console.log(`  - Invitation paths: ${invitationPathsCount}`);
    console.log(`  - Invitations: ${invitationsCount}`);
    console.log(`  - Group paths: ${groupPathsCount}`);
    console.log(`  - Group path visibility: ${groupVisibilityCount}`);
    console.log(`  - Group members: ${groupMembersCount}`);
    console.log(`  - Groups: ${groupsCount}\n`);

    if (totalCount === 0) {
      console.log(
        "✅ No group or invitation data to reset. Database is already clean.",
      );
      await closeDb();
      return;
    }

    console.log("🗑️  Deleting group and invitation data...");

    const {
      invitationPathsDeleted,
      invitationsDeleted,
      groupVisibilityDeleted,
      groupPathsDeleted,
      groupMembersDeleted,
      groupsDeleted,
    } = await db.transaction(async (tx) => {
      // Delete in dependency order (child tables first)

      // 1. Delete invitation_paths (references group_invitations)
      console.log("  - Deleting invitation_paths...");
      const deletedInvitationPathsRows = await tx
        .delete(invitationPaths)
        .returning({ id: invitationPaths.id });
      console.log(`    ✓ Deleted ${deletedInvitationPathsRows.length} rows`);

      // 2. Delete group_invitations (references groups)
      console.log("  - Deleting group_invitations...");
      const deletedInvitationsRows = await tx
        .delete(groupInvitations)
        .returning({ id: groupInvitations.id });
      console.log(`    ✓ Deleted ${deletedInvitationsRows.length} rows`);

      // 3. Delete group_path_visibility (references groups and paths)
      console.log("  - Deleting group_path_visibility...");
      const deletedGroupVisibilityRows = await tx
        .delete(groupPathVisibility)
        .returning({ id: groupPathVisibility.id });
      console.log(`    ✓ Deleted ${deletedGroupVisibilityRows.length} rows`);

      // 4. Delete group_paths (references groups and paths)
      console.log("  - Deleting group_paths...");
      const deletedGroupPathsRows = await tx
        .delete(groupPaths)
        .returning({ id: groupPaths.id });
      console.log(`    ✓ Deleted ${deletedGroupPathsRows.length} rows`);

      // 5. Delete group_members (references groups and users)
      console.log("  - Deleting group_members...");
      const deletedGroupMembersRows = await tx
        .delete(groupMembers)
        .returning({ id: groupMembers.id });
      console.log(`    ✓ Deleted ${deletedGroupMembersRows.length} rows`);

      // 6. Delete groups (parent table)
      console.log("  - Deleting groups...");
      const deletedGroupsRows = await tx
        .delete(groups)
        .returning({ id: groups.id });
      console.log(`    ✓ Deleted ${deletedGroupsRows.length} rows`);

      return {
        invitationPathsDeleted: deletedInvitationPathsRows.length,
        invitationsDeleted: deletedInvitationsRows.length,
        groupVisibilityDeleted: deletedGroupVisibilityRows.length,
        groupPathsDeleted: deletedGroupPathsRows.length,
        groupMembersDeleted: deletedGroupMembersRows.length,
        groupsDeleted: deletedGroupsRows.length,
      };
    });

    console.log("\n✅ Successfully reset all group and invitation data!");
    console.log(`   - Removed ${invitationPathsDeleted} invitation paths`);
    console.log(`   - Removed ${invitationsDeleted} invitations`);
    console.log(
      `   - Removed ${groupVisibilityDeleted} group path visibility settings`,
    );
    console.log(`   - Removed ${groupPathsDeleted} group paths`);
    console.log(`   - Removed ${groupMembersDeleted} group members`);
    console.log(`   - Removed ${groupsDeleted} groups`);
  } catch (error) {
    console.error("❌ Error resetting groups and invitations:", error);
    throw error;
  } finally {
    await closeDb();
  }
}

// Run the reset
resetGroupsAndInvitations().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
