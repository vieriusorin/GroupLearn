import { LessonId, UserId } from "@/domains/shared/types/branded-types";

export interface PauseLessonRequest {
  userId: string;
  lessonId: number;
}

export interface PauseLessonResponse {
  success: boolean;
  data: {
    lessonId: number;
    sessionId: string;
    pausedAt: string;
    progress: {
      current: number;
      total: number;
      percent: number;
    };
    heartsRemaining: number;
    accuracy: number;
    message: string;
  };
}

export class PauseLessonUseCase {
  private readonly sessionExpirationHours = 24;

  async execute(request: PauseLessonRequest): Promise<PauseLessonResponse> {
    const userId = UserId(request.userId);
    const lessonId = LessonId(request.lessonId);

    const sessionId = this.generateSessionId(userId, lessonId);

    const mockProgress = {
      current: 3,
      total: 10,
      percent: 30,
    };
    const mockHearts = 4;
    const mockAccuracy = 85;

    return {
      success: true,
      data: {
        lessonId: request.lessonId,
        sessionId,
        pausedAt: new Date().toISOString(),
        progress: mockProgress,
        heartsRemaining: mockHearts,
        accuracy: mockAccuracy,
        message: `Lesson paused. You can resume within ${this.sessionExpirationHours} hours.`,
      },
    };
  }

  private generateSessionId(userId: UserId, lessonId: LessonId): string {
    const timestamp = Date.now();
    return `session_${userId}_${lessonId}_${timestamp}`;
  }
}
