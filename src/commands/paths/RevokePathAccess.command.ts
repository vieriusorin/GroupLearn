import type { ICommand } from "../types";

export interface RevokePathAccessCommand extends ICommand {
  readonly type: "RevokePathAccess";
  readonly userId: string;
  readonly pathId: number;
}

export const revokePathAccessCommand = (
  userId: string,
  pathId: number,
): RevokePathAccessCommand => ({
  type: "RevokePathAccess",
  userId,
  pathId,
});
