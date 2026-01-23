import { eq } from "drizzle-orm";
import type { IQueryHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import type { Lesson } from "@/infrastructure/database/schema";
import { lessons } from "@/infrastructure/database/schema";
import type { GetLessonByIdQuery } from "@/queries/paths/GetLessonById.query";

export type GetLessonByIdResult = {
  lesson: Lesson | null;
};

export class GetLessonByIdHandler
  implements IQueryHandler<GetLessonByIdQuery, GetLessonByIdResult>
{
  async execute(query: GetLessonByIdQuery): Promise<GetLessonByIdResult> {
    const [lesson] = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, query.lessonId))
      .limit(1);

    return {
      lesson: lesson || null,
    };
  }
}
