import type { SubmitAnswerResult } from "@/application/dtos/learning-path.dto";
import type { SubmitAnswerCommand } from "@/commands/lesson/SubmitAnswer.command";
import type { ICommandHandler } from "@/commands/types";
import type { LessonSession } from "@/domains/learning-path/aggregates";
import {
  CardAdvancedEvent,
  HeartLostEvent,
  LessonCompletedEvent,
  LessonFailedEvent,
} from "@/domains/learning-path/events";
import type { ISessionRepository } from "@/domains/learning-path/repositories/ISessionRepository";
import { DomainError } from "@/domains/shared/errors";
import { LessonId, UserId } from "@/domains/shared/types/branded-types";

export class SubmitAnswerHandler
  implements ICommandHandler<SubmitAnswerCommand, SubmitAnswerResult>
{
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async execute(command: SubmitAnswerCommand): Promise<SubmitAnswerResult> {
    const userId = UserId(command.userId);
    const lessonId = LessonId(command.lessonId);

    const session = await this.sessionRepository.findByUserAndLesson(
      userId,
      lessonId,
    );
    if (!session) {
      throw new DomainError(
        "No active session found. Please start the lesson first.",
        "SESSION_NOT_FOUND",
      );
    }

    const event = session.submitAnswer(
      command.isCorrect,
      command.timeSpentSeconds,
    );

    const events = session.getEvents();

    let response: SubmitAnswerResult;

    if (event instanceof LessonCompletedEvent) {
      response = await this.handleLessonCompleted(session, event);
    } else if (event instanceof LessonFailedEvent) {
      response = await this.handleLessonFailed(session, event);
    } else if (event instanceof CardAdvancedEvent) {
      response = this.handleCardAdvanced(session, event);
    } else {
      throw new Error("Unexpected event type");
    }

    response.events = events.map((e) => ({
      type: e.constructor.name,
      data: this.serializeEvent(e),
    }));

    await this.sessionRepository.save(session, userId);

    return response;
  }

  private async handleLessonCompleted(
    session: LessonSession,
    _event: LessonCompletedEvent,
  ): Promise<SubmitAnswerResult> {
    const xpEarned = 10; // Placeholder
    const progress = session.getProgress();

    return {
      result: "completed",
      accuracy: session.getAccuracy().getPercent(),
      heartsRemaining: session.getHearts().remaining(),
      progress: {
        current: progress.getCompleted(),
        total: progress.getTotal(),
        percent: progress.getPercentage(),
      },
      lessonResult: {
        accuracy: session.getAccuracy().getPercent(),
        xpEarned,
        isPerfect: session.isPerfect(),
        cardsReviewed: session.getAnswers().length,
      },
      events: [],
    };
  }

  private async handleLessonFailed(
    session: LessonSession,
    _event: LessonFailedEvent,
  ): Promise<SubmitAnswerResult> {
    const progress = session.getProgress();

    return {
      result: "failed",
      accuracy: session.getAccuracy().getPercent(),
      heartsRemaining: 0,
      progress: {
        current: progress.getCompleted(),
        total: progress.getTotal(),
        percent: progress.getPercentage(),
      },
      lessonResult: {
        accuracy: session.getAccuracy().getPercent(),
        xpEarned: 0,
        isPerfect: false,
        cardsReviewed: session.getAnswers().length,
      },
      events: [],
    };
  }

  private handleCardAdvanced(
    session: LessonSession,
    _event: CardAdvancedEvent,
  ): SubmitAnswerResult {
    const currentCard = session.getCurrentFlashcard();
    const progress = session.getProgress();

    return {
      result: "advanced",
      accuracy: session.getAccuracy().getPercent(),
      heartsRemaining: session.getHearts().remaining(),
      progress: {
        current: progress.getCompleted(),
        total: progress.getTotal(),
        percent: progress.getPercentage(),
      },
      nextCard: {
        id: currentCard.id as number,
        question: currentCard.question,
        answer: currentCard.answer,
        difficulty: currentCard.difficulty,
      },
      events: [],
    };
  }

  private serializeEvent(event: any): any {
    const serialized: any = {
      lessonId: event.lessonId as number,
      occurredAt:
        event.occurredAt instanceof Date
          ? event.occurredAt.toISOString()
          : event.occurredAt,
    };

    if (event instanceof CardAdvancedEvent) {
      serialized.currentIndex = event.currentIndex;
      serialized.totalCards = event.totalCards;
    } else if (event instanceof LessonCompletedEvent) {
      serialized.accuracy = event.accuracy.getPercent();
      serialized.heartsRemaining = event.heartsRemaining;
      serialized.cardsReviewed = event.cardsReviewed;
    } else if (event instanceof LessonFailedEvent) {
      serialized.accuracy = event.accuracy.getPercent();
      serialized.cardsReviewed = event.cardsReviewed;
    } else if (event instanceof HeartLostEvent) {
      serialized.heartsRemaining = event.heartsRemaining;
    }

    return serialized;
  }
}
