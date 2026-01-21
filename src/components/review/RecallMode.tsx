"use client";

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
import { Textarea } from "@/components/ui/textarea";
import type { Flashcard } from "@/lib/types";

interface RecallModeProps {
  card: Flashcard;
  recallAnswer: string;
  isFlipped: boolean;
  onAnswerChange: (answer: string) => void;
  onCheckAnswer: () => void;
  onAnswer: (isCorrect: boolean) => void;
  isPending: boolean;
}

export const RecallMode = ({
  card,
  recallAnswer,
  isFlipped,
  onAnswerChange,
  onCheckAnswer,
  onAnswer,
  isPending,
}: RecallModeProps) => {
  return (
    <Card className="min-h-[400px]">
      <CardHeader>
        <Badge>{card.difficulty}</Badge>
        <CardTitle className="text-2xl mt-4">{card.question}</CardTitle>
        <CardDescription>
          Write your answer from memory, then check
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={recallAnswer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type your answer here..."
          rows={6}
          disabled={isFlipped}
        />
        {!isFlipped ? (
          <Button onClick={onCheckAnswer} disabled={!recallAnswer.trim()}>
            Check Answer
          </Button>
        ) : (
          <>
            <div className="p-4 rounded-lg bg-muted">
              <p className="font-semibold mb-2">Correct Answer:</p>
              <RichTextDisplay content={card.answer} />
            </div>
            <div className="p-4 rounded-lg bg-accent">
              <p className="font-semibold mb-2">Your Answer:</p>
              <p>{recallAnswer}</p>
            </div>
            <div className="flex gap-4 justify-center pt-4">
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
          </>
        )}
      </CardContent>
    </Card>
  );
};
