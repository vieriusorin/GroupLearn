import {
  LessonSession,
  type SessionFlashcard,
} from "@/domains/learning-path/aggregates";
import { DomainError } from "@/domains/shared/errors";
import {
  type FlashcardId,
  LessonId,
  UserId,
} from "@/domains/shared/types/branded-types";

export interface ResumeLessonRequest {
  userId: string;
  sessionId: string;
}

export interface ResumeLessonResponse {
  success: boolean;
  data: {
    lessonId: number;
    currentCard: {
      id: number;
      question: string;
      answer: string;
      difficulty: string;
    };
    progress: {
      current: number;
      total: number;
      percent: number;
    };
    heartsRemaining: number;
    accuracy: number;
    timeSpentSeconds: number;
    reviewMode: string;
    message: string;
  };
}

export class ResumeLessonUseCase {
  async execute(request: ResumeLessonRequest): Promise<ResumeLessonResponse> {
    const _userId = UserId(request.userId);

    // TODO: Load paused session from repository/cache
    // const pausedSession = await this.sessionRepository.findBySessionId(request.sessionId);
    // if (!pausedSession) {
    //   throw new DomainError('Session not found', 'SESSION_NOT_FOUND');
    // }

    // Validate session ownership
    // if (pausedSession.userId !== userId) {
    //   throw new DomainError('Unauthorized: Session does not belong to this user', 'SESSION_UNAUTHORIZED');
    // }

    // Check if session has expired
    // if (new Date() > pausedSession.expiresAt) {
    //   throw new DomainError('Session has expired', 'SESSION_EXPIRED');
    // }

    // Validate session status
    // if (pausedSession.status !== 'paused') {
    //   throw new DomainError('Session is not paused', 'SESSION_NOT_PAUSED');
    // }

    // TODO: Deserialize session state
    // const sessionState = pausedSession.state;
    // const session = this.restoreSession(sessionState);

    // TODO: Update session status to active
    // pausedSession.status = 'active';
    // pausedSession.resumedAt = new Date();
    // await this.sessionRepository.save(pausedSession);

    // Mock session data for demonstration
    const mockLessonId = this.extractLessonIdFromSessionId(request.sessionId);
    const mockSession = this.createMockSession(LessonId(mockLessonId));

    const timeSpentSeconds = mockSession.getTimeSpentSeconds();

    return {
      success: true,
      data: {
        lessonId: mockLessonId,
        currentCard: {
          id: mockSession.getCurrentFlashcard().id as number,
          question: mockSession.getCurrentFlashcard().question,
          answer: mockSession.getCurrentFlashcard().answer,
          difficulty: mockSession.getCurrentFlashcard().difficulty,
        },
        progress: {
          current: mockSession.getProgress().getCompleted(),
          total: mockSession.getProgress().getTotal(),
          percent: mockSession.getProgress().getPercentage(),
        },
        heartsRemaining: mockSession.getHearts().remaining(),
        accuracy: mockSession.getAccuracy().getPercent(),
        timeSpentSeconds,
        reviewMode: mockSession.getReviewMode(),
        message: "Lesson resumed. Continue where you left off!",
      },
    };
  }

  private extractLessonIdFromSessionId(sessionId: string): number {
    const parts = sessionId.split("_");
    if (parts.length < 3) {
      throw new DomainError("Invalid session ID format", "INVALID_SESSION_ID");
    }
    return parseInt(parts[2], 10);
  }

  private createMockSession(lessonId: LessonId): LessonSession {
    const mockFlashcards: SessionFlashcard[] = [
      {
        id: 1 as FlashcardId,
        question: "Already answered question",
        answer: "Already answered",
        difficulty: "easy",
      },
      {
        id: 2 as FlashcardId,
        question: "Current question - pick up here",
        answer: "Current answer",
        difficulty: "medium",
      },
      {
        id: 3 as FlashcardId,
        question: "Future question",
        answer: "Future answer",
        difficulty: "hard",
      },
    ];

    const session = LessonSession.start(
      lessonId,
      mockFlashcards,
      4,
      "flashcard",
    );

    session.submitAnswer(true, 10);

    return session;
  }
}
