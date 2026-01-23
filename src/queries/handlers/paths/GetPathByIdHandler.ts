import { eq } from "drizzle-orm";
import type { IQueryHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import type { Path } from "@/infrastructure/database/schema";
import { paths } from "@/infrastructure/database/schema";
import type { GetPathByIdQuery } from "@/queries/paths/GetPathById.query";

export type GetPathByIdResult = {
  path: Path | null;
};

export class GetPathByIdHandler
  implements IQueryHandler<GetPathByIdQuery, GetPathByIdResult>
{
  async execute(query: GetPathByIdQuery): Promise<GetPathByIdResult> {
    const [path] = await db
      .select()
      .from(paths)
      .where(eq(paths.id, query.pathId))
      .limit(1);

    return {
      path: path || null,
    };
  }
}
