import type { ICommand } from "../types";

export interface DeleteDomainCommand extends ICommand {
  readonly type: "DeleteDomain";
  readonly userId: string;
  readonly domainId: number;
}

export const deleteDomainCommand = (
  userId: string,
  domainId: number,
): DeleteDomainCommand => ({
  type: "DeleteDomain",
  userId,
  domainId,
});
