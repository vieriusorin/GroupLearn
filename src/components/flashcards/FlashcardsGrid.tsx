import type { FlashcardAdmin } from "@/application/dtos";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { RichTextDisplay } from "@/components/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  isLoading: boolean;
  flashcards: FlashcardAdmin[];
  onEdit: (card: FlashcardAdmin) => void;
  onDelete: (card: FlashcardAdmin) => void;
  isDeleting: boolean;
};

const difficultyVariant = (difficulty: string) => {
  if (difficulty === "easy") return "success";
  if (difficulty === "hard") return "destructive";
  return "warning";
};

export const FlashcardsGrid = ({
  isLoading,
  flashcards,
  onEdit,
  onDelete,
  isDeleting,
}: Props) => {
  if (isLoading) {
    return <p className="text-muted-foreground">Loading flashcards...</p>;
  }

  if (flashcards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Flashcards Yet</CardTitle>
          <CardDescription>
            Create your first flashcard to start learning!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {flashcards.map((card) => (
        <Card key={card.id} className="flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between">
              <Badge variant={difficultyVariant(card.difficulty)}>
                {card.difficulty}
              </Badge>
            </div>
            <CardTitle className="text-lg mt-2">{card.question}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground font-semibold mb-1">
                Answer:
              </p>
              <RichTextDisplay content={card.answer} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="default" onClick={() => onEdit(card)}>
                Edit
              </Button>
              <ConfirmDialog
                trigger={
                  <Button size="sm" variant="destructive" disabled={isDeleting}>
                    Delete
                  </Button>
                }
                title="Delete flashcard?"
                description="This action cannot be undone."
                onConfirm={() => onDelete(card)}
                confirmText="Delete"
                variant="destructive"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
