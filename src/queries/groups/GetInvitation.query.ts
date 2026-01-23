import type { IQuery } from "@/commands/types";

export interface GetInvitationQuery extends IQuery {
  readonly type: "GetInvitation";
  readonly token: string;
}

export const getInvitationQuery = (token: string): GetInvitationQuery => ({
  type: "GetInvitation",
  token,
});
