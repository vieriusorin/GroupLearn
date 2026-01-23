export type {
  GroupMemberAnalytics,
  NewGroupMemberAnalytics,
  NewUserActivityLog,
  UserActivityLog,
} from "./analytics.schema";

export type {
  Account,
  NewAccount,
  NewSession,
  NewUser,
  NewVerification,
  Session,
  User,
  Verification,
} from "./auth.schema";
export type {
  Category,
  Domain,
  Flashcard,
  NewCategory,
  NewDomain,
  NewFlashcard,
  NewReviewHistory,
  NewStrugglingQueue,
  ReviewHistory,
  StrugglingQueue,
} from "./content.schema";

export type {
  DailyStreak,
  HeartsTransaction,
  NewDailyStreak,
  NewHeartsTransaction,
  NewUserProgress,
  NewXPTransaction,
  UserProgress,
  XPTransaction,
} from "./gamification.schema";

export type {
  Group,
  GroupInvitation,
  GroupMember,
  GroupPath,
  GroupPathVisibility,
  InvitationPath,
  NewGroup,
  NewGroupInvitation,
  NewGroupMember,
  NewGroupPath,
  NewGroupPathVisibility,
  NewInvitationPath,
} from "./groups.schema";
export type {
  Lesson,
  LessonCompletion,
  LessonFlashcard,
  NewLesson,
  NewLessonCompletion,
  NewLessonFlashcard,
  NewPath,
  NewPathApproval,
  NewUnit,
  Path,
  PathApproval,
  Unit,
} from "./learning-path.schema";

export type WithTimestamps<T> = T & {
  createdAt: Date;
  updatedAt?: Date;
};

export type WithId<T> = T & { id: number };
export type WithUserId<T> = T & { userId: string };
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type WithoutAutoFields<T> = Omit<T, "id" | "createdAt" | "updatedAt">;
export type UpdateInput<T extends { id: number }> = Partial<Omit<T, "id">> & {
  id: number;
};
