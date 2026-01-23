import type { ICommand } from "../types";

export interface CreateCategoryCommand extends ICommand {
  readonly type: "CreateCategory";
  readonly userId: string;
  readonly domainId: number;
  readonly name: string;
  readonly description?: string | null;
}

export const createCategoryCommand = (
  userId: string,
  domainId: number,
  name: string,
  description?: string | null,
): CreateCategoryCommand => ({
  type: "CreateCategory",
  userId,
  domainId,
  name,
  description,
});
