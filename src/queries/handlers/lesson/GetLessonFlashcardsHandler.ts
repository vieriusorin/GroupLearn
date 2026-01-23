import type { GetLessonFlashcardsResult } from "@/application/dtos/learning-path.dto";
import type { IQueryHandler } from "@/commands/types";
import type { ILessonRepository } from "@/domains/learning-path/repositories/ILessonRepository";
import { DomainError } from "@/domains/shared/errors";
import { LessonId } from "@/domains/shared/types/branded-types";
import type { GetLessonFlashcardsQuery } from "@/queries/lesson/GetLessonFlashcards.query";

export class GetLessonFlashcardsHandler
  implements IQueryHandler<GetLessonFlashcardsQuery, GetLessonFlashcardsResult>
{
  constructor(private readonly lessonRepository: ILessonRepository) {}

  async execute(
    query: GetLessonFlashcardsQuery,
  ): Promise<GetLessonFlashcardsResult> {
    const lessonId = LessonId(query.lessonId);

    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new DomainError("Lesson not found", "LESSON_NOT_FOUND");
    }

    const flashcards =
      await this.lessonRepository.findFlashcardsForLesson(lessonId);

    return {
      lesson: {
        id: lesson.id,
        name: lesson.name,
        description: lesson.description,
        flashcardCount: lesson.flashcardCount,
      },
      flashcards: flashcards.map((fc) => ({
        id: fc.getId() as number,
        question: fc.getQuestion(),
        answer: fc.getAnswer(),
        difficulty: fc.getDifficulty(),
        createdAt: fc.getCreatedAt().toISOString(),
      })),
    };
  }
}
