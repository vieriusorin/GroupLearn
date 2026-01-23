import type { ICommand } from "../types";

export interface CreateDomainCommand extends ICommand {
  readonly type: "CreateDomain";
  readonly userId: string;
  readonly name: string;
  readonly description?: string | null;
}

export const createDomainCommand = (
  userId: string,
  name: string,
  description?: string | null,
): CreateDomainCommand => ({
  type: "CreateDomain",
  userId,
  name,
  description,
});
