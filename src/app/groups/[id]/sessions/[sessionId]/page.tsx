import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { SessionLobby } from "@/components/realtime";
import { getLiveSessionDetail } from "@/presentation/actions/realtime/liveSession.actions";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface SessionLobbyPageProps {
  params: Promise<{
    id: string;
    sessionId: string;
  }>;
}

async function SessionLobbyContent({ groupId, sessionId, userId }: {
  groupId: number;
  sessionId: number;
  userId: string;
}) {
  const result = await getLiveSessionDetail(sessionId);

  if (!result.success || !result.data) {
    notFound();
  }

  const session = result.data;

  // Check if user is a participant
  const isParticipant = session.participants.some(p => p.userId === userId);

  // If session has started and user is participant, redirect to quiz
  if (session.status === "active" && isParticipant) {
    redirect(`/groups/${groupId}/sessions/${sessionId}/quiz`);
  }

  // If session has ended, redirect to results
  if (session.status === "completed") {
    redirect(`/groups/${groupId}/sessions/${sessionId}/results`);
  }

  return (
    <SessionLobby
      session={session}
      groupId={groupId}
      currentUserId={userId}
    />
  );
}

function LoadingLobby() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading session...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function SessionLobbyPage({ params }: SessionLobbyPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const { id, sessionId: sessionIdStr } = await params;
  const groupId = Number(id);
  const sessionId = Number(sessionIdStr);

  if (Number.isNaN(groupId) || Number.isNaN(sessionId)) {
    notFound();
  }

  return (
    <Suspense fallback={<LoadingLobby />}>
      <SessionLobbyContent
        groupId={groupId}
        sessionId={sessionId}
        userId={session.user.id}
      />
    </Suspense>
  );
}
