import type { ILessonRepository } from "@/domains/learning-path/repositories/ILessonRepository";
import { DomainError } from "@/domains/shared/errors";
import { LessonId } from "@/domains/shared/types/branded-types";
import type { DifficultyLevelType } from "@/infrastructure/database/schema/enums";

export interface GetLessonFlashcardsRequest {
  lessonId: number;
}

export interface GetLessonFlashcardsResponse {
  lesson: {
    id: number;
    name: string;
    description: string | null;
    flashcardCount: number;
  };
  flashcards: Array<{
    id: number;
    question: string;
    answer: string;
    difficulty: DifficultyLevelType;
    createdAt: string;
  }>;
}

export class GetLessonFlashcardsUseCase {
  constructor(private readonly lessonRepository: ILessonRepository) {}

  async execute(
    request: GetLessonFlashcardsRequest,
  ): Promise<GetLessonFlashcardsResponse> {
    const lessonId = LessonId(request.lessonId);

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
