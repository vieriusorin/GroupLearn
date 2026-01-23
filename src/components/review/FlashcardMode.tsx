"use client";

import { RichTextDisplay } from "@/components/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Flashcard } from "@/infrastructure/database/schema";

interface FlashcardModeProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  onAnswer: (isCorrect: boolean) => void;
  isPending: boolean;
}

export const FlashcardMode = ({
  card,
  isFlipped,
  onFlip,
  onAnswer,
  isPending,
}: FlashcardModeProps) => {
  return (
    <>
      <Card className="min-h-[400px] cursor-pointer" onClick={onFlip}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge>{card.difficulty}</Badge>
            <span className="text-sm text-muted-foreground">Click to flip</span>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[300px]">
          <div className="text-center w-full max-w-2xl px-4">
            <p className="text-2xl font-semibold mb-4">
              {isFlipped ? "Answer:" : "Question:"}
            </p>
            {isFlipped ? (
              <div className="text-left">
                <RichTextDisplay content={card.answer} />
              </div>
            ) : (
              <p className="text-xl">{card.question}</p>
            )}
          </div>
        </CardContent>
      </Card>
      {isFlipped && (
        <div className="flex gap-4 mt-6 justify-center">
          <Button
            variant="destructive"
            size="lg"
            onClick={() => onAnswer(false)}
            disabled={isPending}
          >
            ❌ Incorrect
          </Button>
          <Button
            variant="default"
            size="lg"
            onClick={() => onAnswer(true)}
            disabled={isPending}
          >
            ✓ Correct
          </Button>
        </div>
      )}
    </>
  );
};
