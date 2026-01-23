export const CACHE_TAGS = {
  paths: "paths",
  categories: (domainId: number) => `categories:${domainId}`,
  categoriesAll: "categories:all",
  userStats: (userId: string) => `user-stats:${userId}`,
  userProgress: (userId: string | number, pathId: string | number) =>
    `user-progress:${userId}:${pathId}`,
} as const;

export type UserStatsTag = ReturnType<typeof CACHE_TAGS.userStats>;
export type UserProgressTag = ReturnType<typeof CACHE_TAGS.userProgress>;
