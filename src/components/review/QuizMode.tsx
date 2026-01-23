"use client";

import { RichTextDisplay } from "@/components/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Flashcard } from "@/infrastructure/database/schema";

interface QuizModeProps {
  card: Flashcard;
  options: string[];
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
}

export const QuizMode = ({
  card,
  options,
  selectedAnswer,
  onSelectAnswer,
}: QuizModeProps) => {
  return (
    <Card className="min-h-[400px]">
      <CardHeader>
        <Badge>{card.difficulty}</Badge>
        <CardTitle className="text-2xl mt-4">{card.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === card.answer;
          const showResult = selectedAnswer !== null;

          return (
            <Button
              key={option}
              variant={
                showResult
                  ? isCorrect
                    ? "default"
                    : isSelected
                      ? "destructive"
                      : "outline"
                  : "outline"
              }
              className="w-full text-left justify-start h-auto py-4 px-6"
              onClick={() => !selectedAnswer && onSelectAnswer(option)}
              disabled={selectedAnswer !== null}
            >
              <div className="flex items-start w-full">
                <span className="mr-3 font-bold flex-shrink-0">
                  {String.fromCharCode(65 + index)}.
                </span>
                <div className="flex-1">
                  <RichTextDisplay content={option} />
                </div>
                {showResult && isCorrect && (
                  <span className="ml-2 flex-shrink-0">✓</span>
                )}
                {showResult && !isCorrect && isSelected && (
                  <span className="ml-2 flex-shrink-0">✗</span>
                )}
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};
