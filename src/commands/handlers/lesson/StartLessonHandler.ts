import type { StartLessonResponse } from "@/application/dtos/learning-path.dto";
import type { StartLessonCommand } from "@/commands/lesson/StartLesson.command";
import type { ICommandHandler } from "@/commands/types";
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

export interface StartLessonResult
  extends Omit<StartLessonResponse, "totalFlashcards" | "xpReward"> {
  reviewMode: "learn" | "review" | "cram";
}

export class StartLessonHandler
  implements ICommandHandler<StartLessonCommand, StartLessonResult>
{
  constructor(
    private readonly lessonRepository: ILessonRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly userProgressRepository: IUserProgressRepository,
  ) {}

  async execute(command: StartLessonCommand): Promise<StartLessonResult> {
    const userId = UserId(command.userId);
    const lessonId = LessonId(command.lessonId);
    const pathId = PathId(command.pathId);

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

    return this.toResponse(session, flashcards, command);
  }

  private toResponse(
    session: LessonSession,
    flashcards: Flashcard[],
    command: StartLessonCommand,
  ): StartLessonResult {
    const flashcardsData = flashcards.map((f) => ({
      id: f.getId() as number,
      categoryId: f.getCategoryId() as number,
      question: f.getQuestion(),
      answer: f.getAnswer(),
      difficulty: f.getDifficulty() as DifficultyLevelType,
      createdAt: f.getCreatedAt().toISOString(),
      computedDifficulty: null,
    }));

    if (!command.lesson || !command.unit || !command.path) {
      throw new DomainError(
        "Lesson, unit, and path data required for response",
        "MISSING_DATA",
      );
    }

    // Command now uses camelCase, no conversion needed
    return {
      lesson: {
        id: command.lesson.id,
        unitId: command.lesson.unitId,
        name: command.lesson.name,
        description: command.lesson.description,
        orderIndex: command.lesson.orderIndex,
        xpReward: command.lesson.xpReward,
        flashcardCount: command.lesson.flashcardCount,
        createdAt: command.lesson.createdAt,
      },
      unit: {
        id: command.unit.id,
        pathId: command.unit.pathId,
        name: command.unit.name,
        description: command.unit.description,
        unitNumber: command.unit.unitNumber,
        orderIndex: command.unit.orderIndex,
        xpReward: command.unit.xpReward,
        createdAt: command.unit.createdAt,
      },
      path: {
        id: command.path.id,
        domainId: command.path.domainId,
        name: command.path.name,
        description: command.path.description,
        icon: command.path.icon,
        orderIndex: command.path.orderIndex,
        isLocked: command.path.isLocked,
        unlockRequirementType: command.path.unlockRequirementType,
        unlockRequirementValue: command.path.unlockRequirementValue,
        visibility: command.path.visibility as "public" | "private",
        createdBy: command.path.createdBy,
        createdAt: command.path.createdAt,
      },
      flashcards: flashcardsData,
      heartsAvailable: session.getHearts().remaining(),
      reviewMode: this.mapReviewMode(session.getReviewMode()),
    };
  }

  private mapReviewMode(mode: ReviewMode): "learn" | "review" | "cram" {
    // Map domain ReviewMode to DTO ReviewMode
    if (mode === "flashcard") return "learn";
    if (mode === "quiz") return "review";
    if (mode === "recall") return "cram";
    return "learn"; // default
  }
}
