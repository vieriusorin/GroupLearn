import type { Flashcard } from "@/domains/content/entities";
import type { IUserProgressRepository } from "@/domains/gamification/repositories/IUserProgressRepository";
import {
  LessonSession,
  type ReviewMode,
  type SessionFlashcard,
} from "@/domains/learning-path/aggregates";
import type { ILessonRepository } from "@/domains/learning-path/repositories/ILessonRepository";
import type { ISessionRepository } from "@/domains/learning-path/repositories/ISessionRepository";
import { DomainError } from "@/domains/shared/errors";
import { LessonId, PathId, UserId } from "@/domains/shared/types/branded-types";
import type { DifficultyLevelType } from "@/infrastructure/database/schema/enums";

export interface StartLessonRequest {
  userId: string;
  lessonId: number;
  pathId: number;
  lesson?: {
    id: number;
    unit_id: number;
    name: string;
    description: string | null;
    order_index: number;
    xp_reward: number;
    flashcard_count: number;
    created_at: string;
  };
  unit?: {
    id: number;
    path_id: number;
    name: string;
    description: string | null;
    unit_number: number;
    order_index: number;
    xp_reward: number;
    created_at: string;
  };
  path?: {
    id: number;
    domain_id: number;
    name: string;
    description: string | null;
    icon: string | null;
    order_index: number;
    is_locked: boolean;
    unlock_requirement_type: string | null;
    unlock_requirement_value: number | null;
    visibility: string;
    created_by: string | null;
    created_at: string;
  };
}

export interface StartLessonResponse {
  lesson: {
    id: number;
    unit_id: number;
    name: string;
    description: string | null;
    order_index: number;
    xp_reward: number;
    flashcard_count: number;
    created_at: string;
  };
  unit: {
    id: number;
    path_id: number;
    name: string;
    description: string | null;
    unit_number: number;
    order_index: number;
    xp_reward: number;
    created_at: string;
  };
  path: {
    id: number;
    domain_id: number;
    name: string;
    description: string | null;
    icon: string | null;
    order_index: number;
    is_locked: boolean;
    unlock_requirement_type: string | null;
    unlock_requirement_value: number | null;
    visibility: string;
    created_by: string | null;
    created_at: string;
  };
  flashcards: Array<{
    id: number;
    category_id: number;
    question: string;
    answer: string;
    difficulty: DifficultyLevelType;
    created_at: string;
  }>;
  hearts_available: number;
  review_mode: ReviewMode;
}

export class StartLessonUseCase {
  constructor(
    private readonly lessonRepository: ILessonRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly userProgressRepository: IUserProgressRepository,
  ) {}

  async execute(request: StartLessonRequest): Promise<StartLessonResponse> {
    const userId = UserId(request.userId);
    const lessonId = LessonId(request.lessonId);
    const pathId = PathId(request.pathId);

    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new DomainError("Lesson not found", "LESSON_NOT_FOUND");
    }

    const flashcards =
      await this.lessonRepository.findFlashcardsForLesson(lessonId);
    if (flashcards.length === 0) {
      throw new DomainError("Lesson has no flashcards", "LESSON_NO_FLASHCARDS");
    }

    const sessionFlashcards: SessionFlashcard[] = flashcards.map((f) => ({
      id: f.getId(),
      question: f.getQuestion(),
      answer: f.getAnswer(),
      difficulty: f.getDifficulty(),
    }));

    const userProgress = await this.userProgressRepository.findByUserAndPath(
      userId,
      pathId,
    );
    const availableHearts = userProgress
      ? userProgress.getHearts().remaining()
      : 5;

    const session = LessonSession.start(
      lessonId,
      sessionFlashcards,
      availableHearts,
      "flashcard",
    );

    await this.sessionRepository.save(session, userId);

    // TODO: Publish domain events
    // const events = session.getEvents();
    // await this.eventPublisher.publishAll(events);
    // session.clearEvents();

    return this.toResponse(session, flashcards, request);
  }

  private toResponse(
    session: LessonSession,
    flashcards: Flashcard[],
    request: StartLessonRequest,
  ): StartLessonResponse {
    const flashcardsData = flashcards.map((f) => ({
      id: f.getId() as number,
      category_id: f.getCategoryId() as number,
      question: f.getQuestion(),
      answer: f.getAnswer(),
      difficulty: f.getDifficulty() as DifficultyLevelType,
      created_at: f.getCreatedAt().toISOString(),
    }));

    if (!request.lesson || !request.unit || !request.path) {
      throw new DomainError(
        "Lesson, unit, and path data required for response",
        "MISSING_DATA",
      );
    }

    return {
      lesson: request.lesson,
      unit: request.unit,
      path: request.path,
      flashcards: flashcardsData,
      hearts_available: session.getHearts().remaining(),
      review_mode: session.getReviewMode(),
    };
  }
}
