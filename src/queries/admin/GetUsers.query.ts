import type { IQuery } from "@/commands/types";

export interface GetUsersQuery extends IQuery {
  readonly type: "GetUsers";
}

export const getUsersQuery = (): GetUsersQuery => ({
  type: "GetUsers",
});
