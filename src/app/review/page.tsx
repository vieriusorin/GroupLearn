import { ReviewPageClient } from "@/components/review/ReviewPageClient";
import { getDueCards } from "@/presentation/actions/review/get-due-cards";

export default async function ReviewPage() {
  const result = await getDueCards();

  if (!result.success) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        aria-live="polite"
      >
        <div className="text-destructive">
          {result.error || "Failed to load review session. Please try again."}
        </div>
      </div>
    );
  }

  const dueCards = result.data.cards.map((card) => ({
    id: card.id,
    categoryId: 0,
    question: card.question,
    answer: card.answer,
    difficulty: card.difficulty,
    createdAt: new Date(),
    computedDifficulty: null,
  }));

  return <ReviewPageClient initialDueCards={dueCards} />;
}
