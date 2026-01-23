import type { ICommand } from "../types";

export interface UpdateDomainCommand extends ICommand {
  readonly type: "UpdateDomain";
  readonly userId: string;
  readonly domainId: number;
  readonly name?: string;
  readonly description?: string | null;
}

export const updateDomainCommand = (
  userId: string,
  domainId: number,
  name?: string,
  description?: string | null,
): UpdateDomainCommand => ({
  type: "UpdateDomain",
  userId,
  domainId,
  name,
  description,
});
