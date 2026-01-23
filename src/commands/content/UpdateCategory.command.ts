import type { ICommand } from "../types";

export interface UpdateCategoryCommand extends ICommand {
  readonly type: "UpdateCategory";
  readonly userId: string;
  readonly categoryId: number;
  readonly name?: string;
  readonly description?: string | null;
}

export const updateCategoryCommand = (
  userId: string,
  categoryId: number,
  name?: string,
  description?: string | null,
): UpdateCategoryCommand => ({
  type: "UpdateCategory",
  userId,
  categoryId,
  name,
  description,
});
