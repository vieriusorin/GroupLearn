import type { ICommand } from "../types";

export interface ApprovePathAccessCommand extends ICommand {
  readonly type: "ApprovePathAccess";
  readonly userId: string;
  readonly pathId: number;
  readonly approvedBy: string;
}

export const approvePathAccessCommand = (
  userId: string,
  pathId: number,
  approvedBy: string,
): ApprovePathAccessCommand => ({
  type: "ApprovePathAccess",
  userId,
  pathId,
  approvedBy,
});
