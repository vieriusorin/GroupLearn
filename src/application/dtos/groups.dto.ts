import type {
  Group,
  GroupInvitation,
  GroupMember,
  GroupPath,
  NewGroup,
  NewGroupInvitation,
  NewGroupMember,
  Path,
} from "@/infrastructure/database/schema";

export type GroupWithStats = Group & {
  memberCount: number;
  pathCount?: number;
};

export type GroupWithAdmin = Group & {
  adminName?: string | null;
};

export type GroupExtended = Group & {
  memberCount?: number;
  pathCount?: number;
  adminName?: string | null;
};

export type GroupListItem = Pick<Group, "id" | "name" | "description"> & {
  createdBy: string; // adminId from Group
  createdAt: string; // ISO string from Group.createdAt
  adminName?: string | null;
  adminEmail?: string | null;
  memberCount?: number;
  pendingInvitations?: number;
  creatorName?: string; // alias for adminName
};

export type MyGroupListItem = Pick<Group, "id" | "name" | "description"> & {
  role: "member" | "admin";
  memberCount: number;
  pathCount: number;
  createdAt: string; // ISO string from Group.createdAt
};

export type GroupFormInput = Pick<Group, "name" | "description">;

export type CreateGroupInput = Omit<NewGroup, "id" | "createdAt" | "updatedAt">;

export type UpdateGroupInput = Partial<CreateGroupInput> & {
  id: number;
};

export type GroupMemberWithUser = GroupMember & {
  userName?: string | null;
  userEmail?: string | null;
};

export type GroupMemberExtended = GroupMember & {
  userName?: string | null;
  userEmail?: string | null;
  invitedByName?: string | null;
};

export type CreateGroupMemberInput = Omit<NewGroupMember, "id" | "joinedAt">;

export type GroupInvitationWithGroup = GroupInvitation & {
  groupName?: string;
  groupDescription?: string | null;
};

export type GroupInvitationExtended = GroupInvitation & {
  groupName?: string;
  groupDescription?: string | null;
  invitedByName?: string | null;
  paths?: Array<Pick<Path, "id" | "name" | "icon">>;
};

export type CreateGroupInvitationInput = Omit<
  NewGroupInvitation,
  "id" | "createdAt" | "status" | "token" | "acceptedAt"
> & {
  pathIds?: number[];
};

export type UpdateGroupInvitationInput = Partial<
  Pick<GroupInvitation, "status" | "acceptedAt">
> & {
  id: number;
};

export type GroupPathWithDetails = GroupPath & {
  path?: Pick<Path, "id" | "name" | "icon" | "description">;
  assignedByName?: string | null;
};

export type CreateGroupPathInput = Omit<GroupPath, "id" | "assignedAt">;

export type GroupPathListItem = Pick<Path, "id" | "name" | "description"> & {
  domainId: number;
  domainName?: string | null;
  isPublic: boolean; // from Path.visibility === 'public'
  unitCount?: number;
  assignedAt: string; // ISO string from GroupPath.assignedAt
  assignedBy: string; // from GroupPath.assignedBy
  assignedByName?: string | null;
  isVisible: boolean; // from GroupPathVisibility.isVisible
};

export type GroupDetailInvitation = Pick<
  GroupInvitation,
  "id" | "email" | "role" | "status"
> & {
  expiresAt: string; // ISO string from GroupInvitation.expiresAt
  createdAt: string; // ISO string from GroupInvitation.createdAt
  invitedByName?: string | null;
};

export type GroupDetailMember = Pick<GroupMember, "id" | "userId" | "role"> & {
  joinedAt: string; // ISO string from GroupMember.joinedAt
  userName?: string | null;
  userEmail?: string | null;
};

export type GroupDetailGroup = Pick<Group, "id" | "name" | "description"> & {
  createdAt: string; // ISO string from Group.createdAt
};

export type GroupDetail = {
  group: GroupDetailGroup;
  members: GroupDetailMember[];
  invitations: GroupDetailInvitation[];
};

/**
 * Create group result
 * Returned when creating a new group
 */
export type CreateGroupResult = {
  group: GroupListItem;
};

/**
 * Send invitation result
 * Returned when sending a group invitation
 */
export type SendInvitationResult = {
  invitationId: number;
  token: string;
};

/**
 * Accept invitation result
 * Returned when accepting a group invitation
 */
export type AcceptInvitationResult = {
  success: boolean;
  message: string;
  group: Pick<GroupListItem, "id" | "name" | "description"> & {
    adminName: string;
    memberCount: number;
  };
};

/**
 * Simple success result
 * Used for operations that only return success status
 */
export type SuccessResult = {
  success: boolean;
};

/**
 * Get assigned paths result
 * Returned when fetching paths assigned to a group
 */
export type GetAssignedPathsResult = {
  paths: GroupPathListItem[];
};

/**
 * Get group detail result
 * Returned when fetching detailed group information
 */
export type GetGroupDetailResult = GroupDetail;

/**
 * Group leaderboard entry
 * Different from global leaderboard - includes group-specific metrics
 */
export type GroupLeaderboardEntry = {
  userId: string;
  userName: string;
  score: number;
  lessonsCompleted: number;
  timeSpent: number;
  streak: number;
  rank: number;
};

/**
 * Get group leaderboard result
 * Returned when fetching group leaderboard
 */
export type GetGroupLeaderboardResult = {
  leaderboard: GroupLeaderboardEntry[];
};

/**
 * Group analytics data
 */
export type GroupAnalytics = {
  groupId: number;
  groupName: string;
  memberCount: number;
  totalPathsAssigned: number;
  totalLessonsCompleted: number;
  totalFlashcardsReviewed: number;
  totalTimeSpent: number; // seconds
  averageScore: number;
  activeMembers: number; // active in last 7 days
  completionRate: number; // percentage of assigned lessons completed
};

/**
 * Get group analytics result
 * Returned when fetching group analytics
 */
export type GetGroupAnalyticsResult = {
  analytics: GroupAnalytics;
};

/**
 * Path progress for member analytics
 */
export type PathProgress = {
  pathId: number;
  pathName: string;
  unitsCompleted: number;
  unitsTotal: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  completionRate: number;
  timeSpent: number;
  averageScore: number;
};

/**
 * Member progress data
 */
export type MemberProgress = {
  userId: string;
  userName: string;
  userEmail: string;
  lessonsCompleted: number;
  lessonsTotal: number;
  completionRate: number;
  flashcardsReviewed: number;
  totalTimeSpent: number;
  averageScore: number;
  currentStreak: number;
  lastActivityAt: string | null; // ISO string
  pathsProgress: PathProgress[];
};

/**
 * Get member progress result
 * Returned when fetching member progress in a group
 */
export type GetMemberProgressResult = {
  progress: MemberProgress;
};

/**
 * Get groups result
 * Returned when fetching all groups
 */
export type GetGroupsResult = {
  groups: GroupListItem[];
};

/**
 * Get my groups result
 * Returned when fetching groups for the current user
 */
export type GetMyGroupsResult = {
  groups: MyGroupListItem[];
};

/**
 * Get invitation result
 * Returned when fetching invitation details
 * Note: Uses InvitationData from types/invitation.ts for component compatibility
 */
export type GetInvitationResult = {
  data: {
    valid: boolean;
    invitation?: {
      id: number;
      groupId: number;
      email: string;
      invitedBy: string;
      invitedByName?: string;
      expiresAt: string; // ISO string
    };
    group?: {
      id: number;
      name: string;
      description: string | null;
      adminName: string;
      memberCount: number;
    };
    error?: string;
    message?: string;
  };
};
