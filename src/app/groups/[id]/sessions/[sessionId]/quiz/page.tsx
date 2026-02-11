"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { BlitzQuizParticipant, LiveLeaderboard } from "@/components/realtime";
import { useLiveSession } from "@/hooks/useSocket";
import {
  getCurrentSessionCard,
  getLiveSessionParticipantState,
  getLiveSessionLeaderboard,
} from "@/presentation/actions/realtime/liveSession.actions";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface LeaderboardParticipant {
  userId: string;
  userName: string;
  score: number;
  rank: number;
  answeredCards: number;
  isCurrentUser?: boolean;
}

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = Number(params.id);
  const sessionId = Number(params.sessionId);

  const [currentCard, setCurrentCard] = useState<QuizCard | null>(null);
  const [participantState, setParticipantState] = useState<ParticipantState | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardParticipant[]>([]);
  const [totalCards, setTotalCards] = useState(10);
  const [timeLimit, setTimeLimit] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");

  // Socket.io integration
  const { sessionState, isConnected } = useLiveSession(sessionId, true);

  // Fetch initial data
  const fetchQuizData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch participant state
      const stateResult = await getLiveSessionParticipantState(sessionId);
      if (!stateResult.success || !stateResult.data) {
        setError(stateResult.error || "Failed to load participant state");
        return;
      }

      setParticipantState({
        ...stateResult.data,
        previousRank: participantState?.rank,
      });
      setUserId(stateResult.data.userId);

      // Fetch current card
      const cardResult = await getCurrentSessionCard(sessionId);
      if (!cardResult.success || !cardResult.data) {
        // If no more cards, session might be ending
        if (cardResult.error === "No more cards available") {
          // Session completed, navigate to results
          router.push(`/groups/${groupId}/sessions/${sessionId}/results`);
          return;
        }
        setError(cardResult.error || "Failed to load card");
        return;
      }

      setCurrentCard({
        id: String(cardResult.data.id),
        front: cardResult.data.front,
        back: cardResult.data.back,
        options: cardResult.data.options,
        correctAnswer: cardResult.data.correctAnswer,
      });
      setTotalCards(cardResult.data.totalCards);
      setTimeLimit(cardResult.data.timeLimit);

      // Fetch leaderboard
      const leaderboardResult = await getLiveSessionLeaderboard(sessionId);
      if (leaderboardResult.success && leaderboardResult.data) {
        const mappedLeaderboard = leaderboardResult.data.leaderboard.map((entry: any) => ({
          userId: entry.userId,
          userName: entry.userName,
          score: entry.totalScore,
          rank: entry.rank,
          answeredCards: entry.correctAnswers,
          isCurrentUser: entry.userId === stateResult.data.userId,
        }));
        setLeaderboard(mappedLeaderboard);
      }
    } catch (err) {
      console.error("Error fetching quiz data:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, groupId, router, participantState?.rank]);

  // Initial load
  useEffect(() => {
    fetchQuizData();
  }, []);

  // Listen for card changes via Socket.io
  useEffect(() => {
    if (sessionState.currentCardIndex !== participantState?.answeredCards) {
      fetchQuizData();
    }
  }, [sessionState.currentCardIndex, participantState?.answeredCards, fetchQuizData]);

  // Listen for leaderboard updates via Socket.io
  useEffect(() => {
    if (sessionState.leaderboard && sessionState.leaderboard.length > 0) {
      const mappedLeaderboard = sessionState.leaderboard.map((entry: any) => ({
        userId: entry.userId,
        userName: entry.userName,
        score: entry.totalScore,
        rank: entry.rank,
        answeredCards: entry.correctAnswers,
        isCurrentUser: entry.userId === userId,
      }));
      setLeaderboard(mappedLeaderboard);

      // Update participant rank
      const myEntry = sessionState.leaderboard.find((e: any) => e.userId === userId);
      if (myEntry && participantState) {
        setParticipantState((prev) => prev ? ({
          ...prev,
          score: myEntry.totalScore,
          previousRank: prev.rank,
          rank: myEntry.rank,
        }) : null);
      }
    }
  }, [sessionState.leaderboard, userId, participantState]);

  // Navigate to results when session ends
  useEffect(() => {
    if (sessionState.status === "ended") {
      router.push(`/groups/${groupId}/sessions/${sessionId}/results`);
    }
  }, [sessionState.status, router, groupId, sessionId]);

  // Handle answer completion
  const handleAnswerComplete = useCallback(() => {
    // Increment answered cards count
    setParticipantState((prev) => prev ? ({
      ...prev,
      answeredCards: prev.answeredCards + 1,
    }) : null);

    // Fetch next card after a short delay
    setTimeout(() => {
      fetchQuizData();
    }, 3500); // Wait for feedback overlay to auto-close
  }, [fetchQuizData]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading quiz...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !currentCard || !participantState) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
              <h2 className="text-xl font-semibold">Unable to Load Quiz</h2>
              <p className="text-sm text-muted-foreground">
                {error || "Failed to load quiz data"}
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={fetchQuizData}>
                  Try Again
                </Button>
                <Button onClick={() => router.push(`/groups/${groupId}`)}>
                  Return to Group
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Quiz Area */}
        <div className="lg:col-span-3">
          <BlitzQuizParticipant
            sessionId={String(sessionId)}
            groupId={groupId}
            currentCard={currentCard}
            cardNumber={participantState.answeredCards + 1}
            totalCards={totalCards}
            timeLimit={timeLimit}
            participantState={participantState}
            onComplete={handleAnswerComplete}
          />
        </div>

        {/* Live Leaderboard Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            <LiveLeaderboard
              participants={leaderboard}
              currentUserId={userId}
              compact={true}
            />

            {/* Connection Status */}
            {!isConnected && (
              <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                <CardContent className="p-3">
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Reconnecting to live updates...
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
