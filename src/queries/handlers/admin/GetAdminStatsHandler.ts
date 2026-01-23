import type { GetAdminStatsResult } from "@/application/dtos/admin.dto";
import type { IQueryHandler } from "@/commands/types";
import { AdminStatsRepository } from "@/lib/admin/admin-stats.repository";
import type { GetAdminStatsQuery } from "@/queries/admin/GetAdminStats.query";

export class GetAdminStatsHandler
  implements IQueryHandler<GetAdminStatsQuery, GetAdminStatsResult>
{
  async execute(_query: GetAdminStatsQuery): Promise<GetAdminStatsResult> {
    const dashboardData = await AdminStatsRepository.getDashboardData();

    return {
      dashboardData,
    };
  }
}
