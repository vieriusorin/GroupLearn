import type { ICommand } from "../types";

export interface StartLessonCommand extends ICommand {
  readonly type: "StartLesson";
  readonly userId: string;
  readonly lessonId: number;
  readonly pathId: number;
  readonly lesson?: {
    id: number;
    unitId: number;
    name: string;
    description: string | null;
    orderIndex: number;
    xpReward: number;
    flashcardCount: number;
    createdAt: string;
  };
  readonly unit?: {
    id: number;
    pathId: number;
    name: string;
    description: string | null;
    unitNumber: number;
    orderIndex: number;
    xpReward: number;
    createdAt: string;
  };
  readonly path?: {
    id: number;
    domainId: number;
    name: string;
    description: string | null;
    icon: string | null;
    orderIndex: number;
    isLocked: boolean;
    unlockRequirementType: string | null;
    unlockRequirementValue: number | null;
    visibility: string;
    createdBy: string | null;
    createdAt: string;
  };
}

export const startLessonCommand = (
  userId: string,
  lessonId: number,
  pathId: number,
  lesson?: StartLessonCommand["lesson"],
  unit?: StartLessonCommand["unit"],
  path?: StartLessonCommand["path"],
): StartLessonCommand => ({
  type: "StartLesson",
  userId,
  lessonId,
  pathId,
  lesson,
  unit,
  path,
});
