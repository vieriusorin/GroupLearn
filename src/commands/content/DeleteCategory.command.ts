import type { ICommand } from "../types";

export interface DeleteCategoryCommand extends ICommand {
  readonly type: "DeleteCategory";
  readonly userId: string;
  readonly categoryId: number;
}

export const deleteCategoryCommand = (
  userId: string,
  categoryId: number,
): DeleteCategoryCommand => ({
  type: "DeleteCategory",
  userId,
  categoryId,
});
