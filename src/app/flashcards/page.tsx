import { FlashcardsPageClient } from "@/components/flashcards/FlashcardsPageClient";
import { NoCategorySelected } from "@/components/flashcards/NoCategorySelected";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getFlashcards } from "@/presentation/actions/content/flashcards/get-flashcards";

interface FlashcardsPageProps {
  searchParams: Promise<{ categoryId?: string }>;
}

export default async function FlashcardsPage({
  searchParams,
}: FlashcardsPageProps) {
  const params = await searchParams;
  const categoryId = params.categoryId
    ? Number.parseInt(params.categoryId, 10)
    : null;

  if (!categoryId || Number.isNaN(categoryId)) {
    return <NoCategorySelected />;
  }

  const result = await getFlashcards(categoryId);

  if (!result.success) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            {result.error ||
              "Failed to load flashcards. Please refresh and try again."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const flashcards = result.data.flashcards.map((card, index) => ({
    id: card.id,
    categoryId: card.categoryId,
    question: card.question,
    answer: card.answer,
    difficulty: card.difficulty,
    computedDifficulty: card.computedDifficulty,
    createdAt:
      typeof card.createdAt === "string"
        ? new Date(card.createdAt)
        : card.createdAt &&
            typeof card.createdAt === "object" &&
            "getTime" in card.createdAt
          ? (card.createdAt as Date)
          : new Date(),
    displayOrder: index,
    isActive: true,
  }));

  return (
    <FlashcardsPageClient
      categoryId={categoryId}
      initialFlashcards={flashcards}
    />
  );
}
