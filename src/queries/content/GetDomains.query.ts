import type { IQuery } from "@/commands/types";

export interface GetDomainsQuery extends IQuery {
  readonly type: "GetDomains";
}

export const getDomainsQuery = (): GetDomainsQuery => ({
  type: "GetDomains",
});
