/**
 * Branded Types for Type-Safe IDs
 *
 * These types prevent accidentally mixing different kinds of IDs.
 * For example, you can't accidentally pass a UserId where a PathId is expected.
 */

// User and Auth
export type UserId = string & { readonly __brand: "UserId" };
export const UserId = (id: string): UserId => id as UserId;

// Content Domain
export type DomainId = number & { readonly __brand: "DomainId" };
export const DomainId = (id: number): DomainId => id as DomainId;

export type CategoryId = number & { readonly __brand: "CategoryId" };
export const CategoryId = (id: number): CategoryId => id as CategoryId;

export type FlashcardId = number & { readonly __brand: "FlashcardId" };
export const FlashcardId = (id: number): FlashcardId => id as FlashcardId;

// Learning Path Domain
export type PathId = number & { readonly __brand: "PathId" };
export const PathId = (id: number): PathId => id as PathId;

export type UnitId = number & { readonly __brand: "UnitId" };
export const UnitId = (id: number): UnitId => id as UnitId;

export type LessonId = number & { readonly __brand: "LessonId" };
export const LessonId = (id: number): LessonId => id as LessonId;

// Gamification Domain
export type UserProgressId = number & { readonly __brand: "UserProgressId" };
export const UserProgressId = (id: number): UserProgressId =>
  id as UserProgressId;

export type XPTransactionId = number & { readonly __brand: "XPTransactionId" };
export const XPTransactionId = (id: number): XPTransactionId =>
  id as XPTransactionId;

export type HeartTransactionId = number & {
  readonly __brand: "HeartTransactionId";
};
export const HeartTransactionId = (id: number): HeartTransactionId =>
  id as HeartTransactionId;

export type StreakId = number & { readonly __brand: "StreakId" };
export const StreakId = (id: number): StreakId => id as StreakId;

// Review Domain
export type ReviewHistoryId = number & { readonly __brand: "ReviewHistoryId" };
export const ReviewHistoryId = (id: number): ReviewHistoryId =>
  id as ReviewHistoryId;

export type StrugglingCardId = number & {
  readonly __brand: "StrugglingCardId";
};
export const StrugglingCardId = (id: number): StrugglingCardId =>
  id as StrugglingCardId;

// Collaboration Domain
export type GroupId = number & { readonly __brand: "GroupId" };
export const GroupId = (id: number): GroupId => id as GroupId;

export type GroupMemberId = number & { readonly __brand: "GroupMemberId" };
export const GroupMemberId = (id: number): GroupMemberId => id as GroupMemberId;

export type InvitationId = number & { readonly __brand: "InvitationId" };
export const InvitationId = (id: number): InvitationId => id as InvitationId;

export type GroupPathId = number & { readonly __brand: "GroupPathId" };
export const GroupPathId = (id: number): GroupPathId => id as GroupPathId;

// Lesson Completion
export type LessonCompletionId = number & {
  readonly __brand: "LessonCompletionId";
};
export const LessonCompletionId = (id: number): LessonCompletionId =>
  id as LessonCompletionId;

/**
 * Type guards for branded types
 */
export const isUserId = (id: unknown): id is UserId => typeof id === "string";
export const isDomainId = (id: unknown): id is DomainId =>
  typeof id === "number";
export const isPathId = (id: unknown): id is PathId => typeof id === "number";
export const isLessonId = (id: unknown): id is LessonId =>
  typeof id === "number";
