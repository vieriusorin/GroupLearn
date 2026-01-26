import type { ICommand } from "../types";

export type SessionType = "blitz_quiz" | "study_room" | "peer_review";

export interface LiveSessionConfig {
  cardCount: number;
  timeLimit: number; // seconds per card
  allowHints: boolean;
}

export interface CreateLiveSessionCommand extends ICommand {
  readonly type: "CreateLiveSession";
  readonly userId: string;
  readonly groupId: number;
  readonly categoryId?: number;
  readonly sessionType: SessionType;
  readonly config: LiveSessionConfig;
}

export const createLiveSessionCommand = (
  userId: string,
  groupId: number,
  sessionType: SessionType,
  config: LiveSessionConfig,
  categoryId?: number
): CreateLiveSessionCommand => ({
  type: "CreateLiveSession",
  userId,
  groupId,
  categoryId,
  sessionType,
  config,
});
