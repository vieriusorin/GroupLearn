import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  onCreateClick: () => void;
  disabled?: boolean;
  hasError?: boolean;
};

export const FlashcardsHeader = ({
  onCreateClick,
  disabled,
  hasError,
}: Props) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <Link href="/domains">
          <Button variant="ghost" className="mb-2">
            ← Back to Domains
          </Button>
        </Link>
        <h1 className="text-4xl font-bold mb-2">Manage Flashcards</h1>
        <p className="text-muted-foreground">
          Create and edit flashcards for this category
        </p>
        {hasError && (
          <p className="mt-2 text-sm text-destructive">
            Something went wrong loading flashcards. Please refresh and try
            again.
          </p>
        )}
      </div>
      <Button onClick={onCreateClick} disabled={disabled}>
        Create Flashcard
      </Button>
    </div>
  );
};
