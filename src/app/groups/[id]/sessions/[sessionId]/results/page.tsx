import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { BlitzQuizResults } from "@/components/realtime";
import { getLiveSessionResults } from "@/presentation/actions/realtime/liveSession.actions";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ResultsPageProps {
  params: Promise<{
    id: string;
    sessionId: string;
  }>;
}

async function ResultsContent({
  groupId,
  sessionId,
  userId,
}: {
  groupId: number;
  sessionId: number;
  userId: string;
}) {
  const result = await getLiveSessionResults(sessionId);

  if (!result.success || !result.data) {
    notFound();
  }

  const { participants, personalStats, totalCards, sessionType } = result.data;

  // Create a new session handler
  const handlePlayAgain = () => {
    // This will be handled client-side in the component
    return undefined;
  };

  return (
    <BlitzQuizResults
      sessionId={String(sessionId)}
      groupId={groupId}
      participants={participants}
      currentUserId={userId}
      personalStats={personalStats}
      totalCards={totalCards}
      sessionType={sessionType}
      onPlayAgain={handlePlayAgain}
    />
  );
}

function LoadingResults() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading results...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const { id, sessionId: sessionIdStr } = await params;
  const groupId = Number(id);
  const sessionId = Number(sessionIdStr);

  if (isNaN(groupId) || isNaN(sessionId)) {
    notFound();
  }

  return (
    <Suspense fallback={<LoadingResults />}>
      <ResultsContent
        groupId={groupId}
        sessionId={sessionId}
        userId={session.user.id}
      />
    </Suspense>
  );
}
