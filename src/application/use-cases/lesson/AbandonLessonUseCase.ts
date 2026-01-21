import { LessonId, UserId } from "@/domains/shared/types/branded-types";

/**
 * Request DTO for abandoning a lesson
 */
export interface AbandonLessonRequest {
  userId: string;
  lessonId: number;
  reason?: string; // Optional reason for analytics
}

/**
 * Response DTO for abandoning a lesson
 */
export interface AbandonLessonResponse {
  success: boolean;
  data: {
    lessonId: number;
    abandonedAt: string;
    progress: {
      cardsReviewed: number;
      totalCards: number;
      accuracy: number;
    };
    message: string;
  };
}

/**
 * AbandonLessonUseCase
 *
 * Application service that handles abandoning an active lesson session.
 * The user chooses to quit the lesson without completing it.
 *
 * Flow:
 * 1. Validate there's an active session for this lesson
 * 2. Check if the lesson can be abandoned (not already complete)
 * 3. Record the abandonment for analytics (optional)
 * 4. Delete the session state from cache/repository
 * 5. No XP is awarded
 * 6. Hearts remain as they are (not refilled)
 * 7. Return abandonment summary
 *
 * Business Rules:
 * - Can abandon any active or paused lesson
 * - Cannot abandon a completed lesson
 * - No XP is awarded for abandoned lessons
 * - Hearts do not refill (user loses any hearts spent)
 * - Streak is NOT broken by abandoning a lesson (optional rule)
 * - Abandoned lessons can be restarted fresh
 * - Abandonment is tracked for analytics (to identify difficult lessons)
 */
export class AbandonLessonUseCase {
  /**
   * Execute the use case
   *
   * In a real implementation, this would:
   * - Accept repository dependencies via constructor (ISessionRepository, IAnalyticsRepository)
   * - Load the active/paused session from cache/repository
   * - Validate the session can be abandoned
   * - Record abandonment event for analytics
   * - Delete the session from storage
   * - Optionally emit a LessonAbandonedEvent for tracking
   */
  async execute(request: AbandonLessonRequest): Promise<AbandonLessonResponse> {
    // Convert primitives to branded types
    const _userId = UserId(request.userId);
    const _lessonId = LessonId(request.lessonId);

    // TODO: Load active or paused session from repository/cache
    // const session = await this.sessionRepository.findByLessonAndUser(lessonId, userId);
    // if (!session) {
    //   throw new DomainError('No active session found for this lesson', 'SESSION_NOT_FOUND');
    // }

    // Validate session can be abandoned
    // if (session.isComplete()) {
    //   throw new DomainError('Cannot abandon a completed lesson', 'LESSON_ALREADY_COMPLETE');
    // }

    // TODO: Record abandonment for analytics
    // await this.analyticsRepository.recordLessonAbandonment({
    //   userId,
    //   lessonId,
    //   abandonedAt: new Date(),
    //   progress: session.getProgress(),
    //   accuracy: session.getAccuracy(),
    //   cardsReviewed: session.getAnswers().length,
    //   reason: request.reason,
    // });

    // TODO: Delete the session from storage
    // await this.sessionRepository.delete(session.id);

    // TODO: Optionally emit domain event
    // const event = LessonAbandonedEvent.create(
    //   lessonId,
    //   userId,
    //   session.getAccuracy(),
    //   session.getAnswers().length
    // );
    // await this.eventPublisher.publish(event);

    // Mock session progress (in real implementation, get from session)
    const mockProgress = {
      cardsReviewed: 3,
      totalCards: 10,
      accuracy: 66,
    };

    return {
      success: true,
      data: {
        lessonId: request.lessonId,
        abandonedAt: new Date().toISOString(),
        progress: mockProgress,
        message: "Lesson abandoned. You can restart this lesson anytime.",
      },
    };
  }
}

/**
 * EXAMPLE USAGE IN API ROUTE:
 *
 * // src/app/api/lessons/[id]/abandon/route.ts
 * export async function POST(
 *   request: Request,
 *   { params }: { params: { id: string } }
 * ) {
 *   const body = await request.json();
 *
 *   const useCase = new AbandonLessonUseCase();
 *   const result = await useCase.execute({
 *     userId: body.userId,
 *     lessonId: parseInt(params.id),
 *     reason: body.reason, // Optional
 *   });
 *
 *   return NextResponse.json(result);
 * }
 *
 * EXAMPLE RESPONSE:
 * {
 *   "success": true,
 *   "data": {
 *     "lessonId": 1,
 *     "abandonedAt": "2026-01-19T10:45:00.000Z",
 *     "progress": {
 *       "cardsReviewed": 3,
 *       "totalCards": 10,
 *       "accuracy": 66
 *     },
 *     "message": "Lesson abandoned. You can restart this lesson anytime."
 *   }
 * }
 */
