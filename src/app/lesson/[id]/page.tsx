import dynamic from "next/dynamic";
import { LessonErrorClient } from "@/components/lesson/LessonErrorClient";
import { startLesson } from "@/presentation/actions/lesson/start-lesson";

const LessonClient = dynamic(() =>
  import("@/components/lesson/LessonClient").then((mod) => ({
    default: mod.LessonClient,
  })),
);

interface LessonPageProps {
  params: Promise<{
    id: string;
  }>;
}

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

  // Map flashcards to match Flashcard type (with computedDifficulty and Date for createdAt)
  const flashcards = result.data.flashcards.map((f) => ({
    id: f.id,
    categoryId: f.categoryId,
    question: f.question,
    answer: f.answer,
    difficulty: f.difficulty,
    computedDifficulty: f.computedDifficulty ?? null,
    createdAt:
      typeof f.createdAt === "string"
        ? new Date(f.createdAt)
        : f.createdAt instanceof Date
          ? f.createdAt
          : new Date(),
  }));

  return (
    <LessonClient
      lessonId={lessonId}
      pathId={result.data.path.id}
      initialFlashcards={flashcards}
      initialHearts={result.data.heartsAvailable}
      xpReward={result.data.xpReward}
    />
  );
}
