import type { IQuery } from "@/commands/types";

export interface GetUserAuthDataQuery extends IQuery {
  readonly type: "GetUserAuthData";
  readonly userId: string;
}

export const getUserAuthDataQuery = (userId: string): GetUserAuthDataQuery => ({
  type: "GetUserAuthData",
  userId,
});
