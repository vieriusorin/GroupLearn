/**
 * Gamification Aggregates
 *
 * This module exports all aggregate roots from the gamification domain.
 */

export type {
  HeartsRefilledEvent,
  LevelUpEvent,
  StreakBrokenEvent,
  StreakUpdatedEvent,
  XPEarnedEvent,
} from "./UserProgress";
export { UserProgress } from "./UserProgress";
