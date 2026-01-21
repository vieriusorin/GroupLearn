import { LessonClient } from "@/components/lesson/LessonClient";
import { LessonErrorClient } from "@/components/lesson/LessonErrorClient";
import { startLesson } from "@/presentation/actions/lesson/start-lesson";
import type { LessonPageProps } from "@/types/lesson";

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;
  const lessonId = parseInt(id, 10);

  if (Number.isNaN(lessonId)) {
    return (
      <LessonErrorClient
        title="Invalid Lesson ID"
        message="The lesson ID provided is not valid."
      />
    );
  }

  const result = await startLesson(lessonId);

  if (!result.success) {
    return (
      <LessonErrorClient
        title="Lesson not found"
        message={
          result.error ||
          "The lesson you're looking for doesn't exist or you don't have access to it."
        }
      />
    );
  }

  return (
    <LessonClient
      lessonId={lessonId}
      pathId={result.data.path.id}
      initialFlashcards={result.data.flashcards}
      initialHearts={result.data.hearts_available}
      xpReward={result.data.xp_reward}
    />
  );
}
