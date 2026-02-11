"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { QuizProgress } from "./QuizProgress";
import { AnswerFeedback } from "./AnswerFeedback";
import { submitLiveAnswer } from "@/presentation/actions/realtime/liveSession.actions";
import { Clock, Zap, AlertCircle } from "lucide-react";
import { cn } from "@/lib/shared/utils";

interface QuizCard {
  id: string;
  front: string;
  back: string;
  options: string[];
  correctAnswer: string;
}

interface ParticipantState {
  userId: string;
  score: number;
  rank: number;
  previousRank?: number;
  answeredCards: number;
}

interface BlitzQuizParticipantProps {
  sessionId: string;
  groupId: number;
  currentCard: QuizCard;
  cardNumber: number;
  totalCards: number;
  timeLimit: number; // seconds per card
  participantState: ParticipantState;
  onComplete?: () => void;
}

export function BlitzQuizParticipant({
  sessionId,
  groupId,
  currentCard,
  cardNumber,
  totalCards,
  timeLimit,
  participantState,
  onComplete,
}: BlitzQuizParticipantProps) {
  const router = useRouter();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{
    isCorrect: boolean;
    pointsEarned: number;
    speedBonus: number;
    correctAnswer: string;
    responseTime: number;
  } | null>(null);
  const [questionStartTime] = useState(Date.now());

  // Countdown timer
  useEffect(() => {
    if (showFeedback || isSubmitting) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-submit on timeout
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showFeedback, isSubmitting]);

  // Reset state when card changes
  useEffect(() => {
    setSelectedAnswer(null);
    setTimeRemaining(timeLimit);
    setShowFeedback(false);
    setFeedbackData(null);
  }, [currentCard.id, timeLimit]);

  const handleTimeout = useCallback(async () => {
    if (isSubmitting || showFeedback) return;

    // Auto-submit with no answer
    await handleSubmit(null, true);
  }, [isSubmitting, showFeedback]);

  const handleSubmit = async (answer: string | null, isTimeout: boolean = false) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    const responseTime = Date.now() - questionStartTime;

    try {
      const result = await submitLiveAnswer(
        Number(sessionId),
        Number(currentCard.id),
        answer || "",
        responseTime
      );

      if (result.success && result.data) {
        const isCorrect = answer === currentCard.correctAnswer;

        setFeedbackData({
          isCorrect,
          pointsEarned: result.data.pointsEarned || 0,
          speedBonus: result.data.speedBonus || 0,
          correctAnswer: currentCard.correctAnswer,
          responseTime,
        });
        setShowFeedback(true);
      } else {
        console.error("Failed to submit answer:", result.error);
        // Still show feedback with 0 points on error
        setFeedbackData({
          isCorrect: false,
          pointsEarned: 0,
          speedBonus: 0,
          correctAnswer: currentCard.correctAnswer,
          responseTime,
        });
        setShowFeedback(true);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      setFeedbackData({
        isCorrect: false,
        pointsEarned: 0,
        speedBonus: 0,
        correctAnswer: currentCard.correctAnswer,
        responseTime,
      });
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (isSubmitting || showFeedback) return;
    setSelectedAnswer(answer);
  };

  const handleAnswerConfirm = () => {
    if (!selectedAnswer || isSubmitting || showFeedback) return;
    handleSubmit(selectedAnswer);
  };

  const handleFeedbackComplete = () => {
    if (cardNumber >= totalCards) {
      // Navigate to results page
      router.push(`/groups/${groupId}/sessions/${sessionId}/results`);
    } else {
      // Auto-advance handled by parent component or socket event
      if (onComplete) {
        onComplete();
      }
    }
  };

  const timePercent = (timeRemaining / timeLimit) * 100;
  const isTimeRunningOut = timeRemaining <= 5;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Header */}
      <QuizProgress
        currentCard={cardNumber}
        totalCards={totalCards}
        currentScore={participantState.score}
        currentRank={participantState.rank}
        previousRank={participantState.previousRank}
      />

      {/* Timer Display */}
      <Card className={cn(
        "transition-colors",
        isTimeRunningOut && "border-red-500 bg-red-50 dark:bg-red-950"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className={cn(
                "h-5 w-5",
                isTimeRunningOut ? "text-red-500 animate-pulse" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-2xl font-bold tabular-nums",
                isTimeRunningOut ? "text-red-500" : "text-foreground"
              )}>
                {timeRemaining}s
              </span>
            </div>
            {isTimeRunningOut && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Hurry!
              </Badge>
            )}
          </div>
          <Progress
            value={timePercent}
            className={cn(
              "h-2",
              isTimeRunningOut && "bg-red-200 dark:bg-red-900"
            )}
          />
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardContent className="p-8">
          <div className="space-y-2 mb-6">
            <Badge variant="outline">Question {cardNumber} of {totalCards}</Badge>
            <h2 className="text-2xl font-bold">{currentCard.front}</h2>
          </div>

          {/* Answer Options */}
          <div className="grid gap-3">
            {currentCard.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const optionLabel = String.fromCharCode(65 + index); // A, B, C, D

              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "outline"}
                  size="lg"
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isSubmitting || showFeedback}
                  className={cn(
                    "h-auto py-4 px-6 justify-start text-left transition-all",
                    isSelected && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center font-bold shrink-0",
                      isSelected
                        ? "bg-primary-foreground text-primary"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {optionLabel}
                    </div>
                    <span className="text-base">{option}</span>
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Submit Button */}
          {selectedAnswer && !showFeedback && (
            <div className="mt-6 flex justify-center">
              <Button
                size="lg"
                onClick={handleAnswerConfirm}
                disabled={isSubmitting}
                className="gap-2 min-w-[200px]"
              >
                {isSubmitting ? (
                  <>
                    <Zap className="h-5 w-5 animate-pulse" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    Submit Answer
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback Overlay */}
      {showFeedback && feedbackData && (
        <AnswerFeedback
          isCorrect={feedbackData.isCorrect}
          pointsEarned={feedbackData.pointsEarned}
          speedBonus={feedbackData.speedBonus}
          correctAnswer={feedbackData.correctAnswer}
          responseTime={feedbackData.responseTime}
          onComplete={handleFeedbackComplete}
          autoAdvanceMs={3000}
        />
      )}
    </div>
  );
}
