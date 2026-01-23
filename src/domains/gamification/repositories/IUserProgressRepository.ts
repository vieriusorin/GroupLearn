import type {
  GroupId,
  PathId,
  UserId,
  UserProgressId,
} from "@/domains/shared/types/branded-types";
import type { UserProgress } from "../aggregates/UserProgress";

export interface IUserProgressRepository {
  findById(id: UserProgressId): Promise<UserProgress | null>;
  findByUserAndPath(
    userId: UserId,
    pathId: PathId,
  ): Promise<UserProgress | null>;
  findByUserId(userId: UserId): Promise<UserProgress[]>;
  findByPathId(pathId: PathId): Promise<UserProgress[]>;
  findByGroupId(groupId: GroupId): Promise<UserProgress[]>;
  findByGroupAndPath(groupId: GroupId, pathId: PathId): Promise<UserProgress[]>;
  getLeaderboard(pathId: PathId, limit: number): Promise<UserProgress[]>;
  getGroupLeaderboard(
    groupId: GroupId,
    pathId: PathId,
    limit: number,
  ): Promise<UserProgress[]>;
  getUserRank(userId: UserId, pathId: PathId): Promise<number | null>;
  findActiveStreaks(
    pathId?: PathId,
    minStreak?: number,
  ): Promise<UserProgress[]>;
  findEligibleForHeartRefill(): Promise<UserProgress[]>;
  save(progress: UserProgress): Promise<UserProgress>;
  delete(id: UserProgressId): Promise<void>;
  exists(userId: UserId, pathId: PathId): Promise<boolean>;
  countUsersOnPath(pathId: PathId): Promise<number>;
  countCompletedPath(pathId: PathId): Promise<number>;
  getAverageXP(pathId: PathId): Promise<number>;
  getAverageCompletionTime(pathId: PathId): Promise<number | null>;
}
