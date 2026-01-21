/**
 * Lesson Use Cases - Application Layer
 *
 * This module exports all use cases related to lesson management.
 * These use cases orchestrate the domain logic for lesson sessions.
 */

// Request/Response DTOs for AbandonLesson
export type {
  AbandonLessonRequest,
  AbandonLessonResponse,
} from "./AbandonLessonUseCase";
export { AbandonLessonUseCase } from "./AbandonLessonUseCase";
// Request/Response DTOs for CompleteLesson
export type {
  CompleteLessonRequest,
  CompleteLessonResponse,
} from "./CompleteLessonUseCase";
export { CompleteLessonUseCase } from "./CompleteLessonUseCase";
// Request/Response DTOs for PauseLesson
export type {
  PauseLessonRequest,
  PauseLessonResponse,
} from "./PauseLessonUseCase";
export { PauseLessonUseCase } from "./PauseLessonUseCase";
// Request/Response DTOs for ResumeLesson
export type {
  ResumeLessonRequest,
  ResumeLessonResponse,
} from "./ResumeLessonUseCase";
export { ResumeLessonUseCase } from "./ResumeLessonUseCase";
// Request/Response DTOs for StartLesson
export type {
  StartLessonRequest,
  StartLessonResponse,
} from "./StartLessonUseCase";
// Use Cases
export { StartLessonUseCase } from "./StartLessonUseCase";
// Request/Response DTOs for SubmitAnswer
export type {
  SubmitAnswerRequest,
  SubmitAnswerResponse,
} from "./SubmitAnswerUseCase";
export { SubmitAnswerUseCase } from "./SubmitAnswerUseCase";
