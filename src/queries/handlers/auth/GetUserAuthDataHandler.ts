import { eq } from "drizzle-orm";
import type { IQueryHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import { users } from "@/infrastructure/database/schema/auth.schema";
import type { UserRole } from "@/lib/auth/rbac";
import type { GetUserAuthDataQuery } from "@/queries/auth/GetUserAuthData.query";

export type UserAuthData = {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  subscriptionStatus: "free" | "paid" | "trial";
  subscriptionExpiresAt: string | null;
};

export type GetUserAuthDataResult = {
  user: UserAuthData | null;
};

export class GetUserAuthDataHandler
  implements IQueryHandler<GetUserAuthDataQuery, GetUserAuthDataResult>
{
  async execute(query: GetUserAuthDataQuery): Promise<GetUserAuthDataResult> {
    const [row] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        subscriptionStatus: users.subscriptionStatus,
        subscriptionExpiresAt: users.subscriptionExpiresAt,
      })
      .from(users)
      .where(eq(users.id, query.userId))
      .limit(1);

    if (!row) {
      return { user: null };
    }

    const dbRole = (row.role as UserRole | null) ?? "member";
    const dbSubStatus =
      (row.subscriptionStatus as "free" | "premium" | "trial" | null) ?? "free";

    const subscriptionStatus: "free" | "paid" | "trial" =
      dbSubStatus === "premium" ? "paid" : dbSubStatus;

    return {
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        role: dbRole,
        subscriptionStatus,
        subscriptionExpiresAt: row.subscriptionExpiresAt?.toISOString() ?? null,
      },
    };
  }
}
