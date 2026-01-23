import type { IQuery } from "@/commands/types";

export interface GetDomainByIdQuery extends IQuery {
  readonly type: "GetDomainById";
  readonly id: number;
}

export const getDomainByIdQuery = (id: number): GetDomainByIdQuery => ({
  type: "GetDomainById",
  id,
});
