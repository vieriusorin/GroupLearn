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

/**
 * Request DTO for submitting an answer
 */
export interface SubmitAnswerRequest {
  userId: string;
  lessonId: number;
  flashcardId: number;
  isCorrect: boolean;
  timeSpentSeconds?: number;
}

/**
 * Response DTO for answer submission
 */
export interface SubmitAnswerResponse {
  result: "advanced" | "completed" | "failed";
  accuracy: number;
  heartsRemaining: number;
  progress: {
    current: number;
    total: number;
    percent: number;
  };
  nextCard?: {
    id: number;
    question: string;
    answer: string;
    difficulty: string;
  };
  lessonResult?: {
    accuracy: number;
    xpEarned: number;
    isPerfect: boolean;
    cardsReviewed: number;
  };
  events: Array<{
    type: string;
    data: any;
  }>;
}

/**
 * SubmitAnswerUseCase
 *
 * Application service that handles answer submission during a lesson.
 *
 * Flow:
 * 1. Load active lesson session
 * 2. Submit answer to session (domain logic)
 * 3. Handle domain events (LessonCompleted, LessonFailed, CardAdvanced)
 * 4. Calculate XP if lesson complete
 * 5. Update user progress
 * 6. Save session state
 * 7. Return appropriate response
 */
export class SubmitAnswerUseCase {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async execute(request: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
    const userId = UserId(request.userId);
    const lessonId = LessonId(request.lessonId);

    // Load active session from repository
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

    // Submit answer - this is where domain logic executes
    const event = session.submitAnswer(
      request.isCorrect,
      request.timeSpentSeconds,
    );

    // Get all events from the session
    const events = session.getEvents();

    // Determine response based on event type
    let response: SubmitAnswerResponse;

    if (event instanceof LessonCompletedEvent) {
      // Lesson completed successfully
      response = await this.handleLessonCompleted(session, event);
    } else if (event instanceof LessonFailedEvent) {
      // Lesson failed (ran out of hearts)
      response = await this.handleLessonFailed(session, event);
    } else if (event instanceof CardAdvancedEvent) {
      // Advanced to next card
      response = this.handleCardAdvanced(session, event);
    } else {
      throw new Error("Unexpected event type");
    }

    // Add all events to response for debugging/logging
    // Serialize events to plain objects (convert Date to string, extract value objects)
    response.events = events.map((e) => ({
      type: e.constructor.name,
      data: this.serializeEvent(e),
    }));

    // Save updated session state
    await this.sessionRepository.save(session, userId);

    // TODO: Publish domain events
    // await this.eventPublisher.publishAll(events);
    // session.clearEvents();

    return response;
  }

  /**
   * Handle lesson completion
   */
  private async handleLessonCompleted(
    session: LessonSession,
    _event: LessonCompletedEvent,
  ): Promise<SubmitAnswerResponse> {
    // TODO: Calculate XP using XPCalculationService
    // const xpService = new XPCalculationService();
    // const baseXP = 10; // TODO: Get from lesson config
    // const xpEarned = xpService.calculateLessonXP(
    //   baseXP,
    //   session.getAccuracy(),
    //   session.isPerfect()
    // );

    const xpEarned = 10; // Placeholder

    // TODO: Update user progress
    // const progress = await this.userProgressRepository.findByUserAndPath(userId, pathId);
    // progress.completeLesson(session.lessonId, session.getAccuracy(), xpEarned, session.getHearts());
    // await this.userProgressRepository.save(progress);

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

  /**
   * Handle lesson failure
   */
  private async handleLessonFailed(
    session: LessonSession,
    _event: LessonFailedEvent,
  ): Promise<SubmitAnswerResponse> {
    // TODO: Update user progress to reflect failure
    // const progress = await this.userProgressRepository.findByUserAndPath(userId, pathId);
    // progress.breakStreak(); // Maybe break streak on failure?
    // await this.userProgressRepository.save(progress);

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

  /**
   * Handle advancing to next card
   */
  private handleCardAdvanced(
    session: LessonSession,
    _event: CardAdvancedEvent,
  ): SubmitAnswerResponse {
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

  /**
   * Serialize domain event to plain object for client component compatibility
   * Converts Date objects to ISO strings and extracts values from value objects
   */
  private serializeEvent(event: any): any {
    const serialized: any = {
      lessonId: event.lessonId as number,
      occurredAt:
        event.occurredAt instanceof Date
          ? event.occurredAt.toISOString()
          : event.occurredAt,
    };

    // Handle specific event types
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

/**
 * EXAMPLE USAGE IN API ROUTE:
 *
 * // src/app/api/lessons/[id]/submit/route.ts
 * export async function POST(
 *   request: Request,
 *   { params }: { params: { id: string } }
 * ) {
 *   const body = await request.json();
 *
 *   const useCase = new SubmitAnswerUseCase();
 *   const result = await useCase.execute({
 *     lessonId: parseInt(params.id),
 *     flashcardId: body.flashcardId,
 *     isCorrect: body.isCorrect,
 *     timeSpentSeconds: body.timeSpentSeconds,
 *   });
 *
 *   return NextResponse.json(result);
 * }
 *
 * EXAMPLE RESPONSE:
 * {
 *   "result": "advanced",
 *   "accuracy": 100,
 *   "heartsRemaining": 5,
 *   "progress": {
 *     "current": 2,
 *     "total": 10,
 *     "percent": 20
 *   },
 *   "nextCard": {
 *     "id": 123,
 *     "question": "What is the capital of France?",
 *     "answer": "Paris",
 *     "difficulty": "easy"
 *   },
 *   "events": [
 *     {
 *       "type": "CardAdvancedEvent",
 *       "data": { ... }
 *     }
 *   ]
 * }
 */
