import type {
  GroupId,
  PathId,
  UserId,
  UserProgressId,
} from "@/domains/shared/types/branded-types";
import type { UserProgress } from "../aggregates/UserProgress";

/**
 * Repository interface for UserProgress aggregate
 *
 * This interface defines the contract for persistence operations
 * on user progress records. Each user can have one progress record per path.
 */
export interface IUserProgressRepository {
  /**
   * Find user progress by ID
   *
   * @param id The user progress ID
   * @returns The user progress or null if not found
   */
  findById(id: UserProgressId): Promise<UserProgress | null>;

  /**
   * Find user progress for a specific user and path
   *
   * @param userId The user ID
   * @param pathId The path ID
   * @returns The user progress or null if not found
   */
  findByUserAndPath(
    userId: UserId,
    pathId: PathId,
  ): Promise<UserProgress | null>;

  /**
   * Find all progress records for a user
   *
   * @param userId The user ID
   * @returns Array of user progress records
   */
  findByUserId(userId: UserId): Promise<UserProgress[]>;

  /**
   * Find all progress records for a path
   *
   * @param pathId The path ID
   * @returns Array of user progress records
   */
  findByPathId(pathId: PathId): Promise<UserProgress[]>;

  /**
   * Find all progress records for users in a group
   *
   * @param groupId The group ID
   * @returns Array of user progress records
   */
  findByGroupId(groupId: GroupId): Promise<UserProgress[]>;

  /**
   * Find progress records for a specific path within a group
   *
   * @param groupId The group ID
   * @param pathId The path ID
   * @returns Array of user progress records
   */
  findByGroupAndPath(groupId: GroupId, pathId: PathId): Promise<UserProgress[]>;

  /**
   * Get leaderboard (top users by XP) for a path
   *
   * @param pathId The path ID
   * @param limit Maximum number of users to return
   * @returns Array of user progress records sorted by XP descending
   */
  getLeaderboard(pathId: PathId, limit: number): Promise<UserProgress[]>;

  /**
   * Get leaderboard for a group and path
   *
   * @param groupId The group ID
   * @param pathId The path ID
   * @param limit Maximum number of users to return
   * @returns Array of user progress records sorted by XP descending
   */
  getGroupLeaderboard(
    groupId: GroupId,
    pathId: PathId,
    limit: number,
  ): Promise<UserProgress[]>;

  /**
   * Get user's rank in a path
   *
   * @param userId The user ID
   * @param pathId The path ID
   * @returns The user's rank (1-indexed) or null if no progress
   */
  getUserRank(userId: UserId, pathId: PathId): Promise<number | null>;

  /**
   * Find users with active streaks
   *
   * @param pathId Optional path ID to filter by
   * @param minStreak Minimum streak count
   * @returns Array of user progress records
   */
  findActiveStreaks(
    pathId?: PathId,
    minStreak?: number,
  ): Promise<UserProgress[]>;

  /**
   * Find users who need heart refills
   *
   * @returns Array of user progress records with hearts < 5 and eligible for refill
   */
  findEligibleForHeartRefill(): Promise<UserProgress[]>;

  /**
   * Save user progress (create or update)
   *
   * @param progress The user progress to save
   * @returns The saved user progress with ID assigned
   */
  save(progress: UserProgress): Promise<UserProgress>;

  /**
   * Delete user progress
   *
   * @param id The user progress ID
   */
  delete(id: UserProgressId): Promise<void>;

  /**
   * Check if user has started a path
   *
   * @param userId The user ID
   * @param pathId The path ID
   * @returns True if progress exists
   */
  exists(userId: UserId, pathId: PathId): Promise<boolean>;

  /**
   * Count total users who have started a path
   *
   * @param pathId The path ID
   * @returns Number of users
   */
  countUsersOnPath(pathId: PathId): Promise<number>;

  /**
   * Count users who have completed a path
   *
   * @param pathId The path ID
   * @returns Number of users who completed the path
   */
  countCompletedPath(pathId: PathId): Promise<number>;

  /**
   * Get average XP for users on a path
   *
   * @param pathId The path ID
   * @returns Average XP amount
   */
  getAverageXP(pathId: PathId): Promise<number>;

  /**
   * Get average completion time for a path
   *
   * @param pathId The path ID
   * @returns Average time in seconds, or null if no completions
   */
  getAverageCompletionTime(pathId: PathId): Promise<number | null>;
}
