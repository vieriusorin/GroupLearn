import { eq } from "drizzle-orm";
import type { IQueryHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import type { Unit } from "@/infrastructure/database/schema";
import { units } from "@/infrastructure/database/schema";
import type { GetUnitByIdQuery } from "@/queries/paths/GetUnitById.query";

export type GetUnitByIdResult = {
  unit: Unit | null;
};

export class GetUnitByIdHandler
  implements IQueryHandler<GetUnitByIdQuery, GetUnitByIdResult>
{
  async execute(query: GetUnitByIdQuery): Promise<GetUnitByIdResult> {
    const [unit] = await db
      .select()
      .from(units)
      .where(eq(units.id, query.unitId))
      .limit(1);

    return {
      unit: unit || null,
    };
  }
}
