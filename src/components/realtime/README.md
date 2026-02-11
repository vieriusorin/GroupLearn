# Real-Time Live Quiz Components

Complete UI component library for live quiz sessions with Socket.io integration.

## 📦 Components

### Session Management

#### `CreateSessionDialog`
Modal dialog for creating new live quiz sessions.

```tsx
import { CreateSessionDialog } from "@/components/realtime";

<CreateSessionDialog
  groupId={123}
  categories={[{ id: 1, name: "Math" }]}
  trigger={<Button>Create Session</Button>} // Optional custom trigger
/>
```

**Features:**
- Session type selection (blitz_quiz, study_room, peer_review)
- Configuration: card count, time limit, category filter, AI hints
- Auto-navigation to session lobby on creation
- Form validation and error handling

---

#### `SessionsList`
Grid layout displaying all active sessions with auto-refresh.

```tsx
import { SessionsList } from "@/components/realtime";

<SessionsList
  groupId={123}
  currentUserId="user-123"
  initialSessions={sessions}
  categories={categories}
  autoRefresh={true} // Refresh every 10 seconds
/>
```

**Features:**
- Auto-refresh every 10 seconds
- Empty state with CTA
- Loading and error states
- Grid layout (responsive: 1/2/3 columns)

---

#### `SessionCard`
Individual session card with join/enter functionality.

```tsx
import { SessionCard } from "@/components/realtime";

<SessionCard
  session={session}
  groupId={123}
  currentUserId="user-123"
/>
```

**Features:**
- Session type badge and status indicators
- Host identification
- Participant avatars preview
- Join/Enter buttons based on participation
- Time formatting

---

#### `SessionLobby`
Waiting room before quiz starts with Socket.io integration.

```tsx
import { SessionLobby } from "@/components/realtime";

<SessionLobby
  session={sessionDetail}
  groupId={123}
  currentUserId="user-123"
/>
```

**Features:**
- Real-time participant list
- Session configuration display
- Host controls (Start Quiz button)
- Socket.io: Auto-navigates participants when session starts
- Live connection status indicator
- Minimum participant validation

**Socket.io Events:**
- Listens to: `session:started` → auto-navigate to quiz
- Displays: Live connection badge when Socket.io connected

---

### Quiz Interface

#### `BlitzQuizParticipant`
Main quiz interface for answering questions.

```tsx
import { BlitzQuizParticipant } from "@/components/realtime";

<BlitzQuizParticipant
  sessionId="session-123"
  groupId={123}
  currentCard={{
    id: "card-1",
    front: "What is 2 + 2?",
    back: "4",
    options: ["2", "3", "4", "5"],
    correctAnswer: "4",
  }}
  cardNumber={1}
  totalCards={10}
  timeLimit={30}
  participantState={{
    userId: "user-123",
    score: 100,
    rank: 1,
    answeredCards: 1,
  }}
  onComplete={() => console.log("Move to next card")}
/>
```

**Features:**
- Question display with 4 multiple-choice options
- Countdown timer with visual progress bar
- Answer selection and submission
- Auto-submit on timeout
- QuizProgress component integration
- AnswerFeedback overlay after submission
- Auto-advance to next question or results

**Socket.io Integration Needed:**
```tsx
// In your page component:
const { sessionState } = useLiveSession(sessionId, true);

useEffect(() => {
  // Listen for new cards
  if (sessionState.currentCardIndex !== prevCardIndex) {
    fetchNextCard(); // Update currentCard prop
  }
}, [sessionState.currentCardIndex]);
```

---

#### `QuizProgress`
Progress indicator showing current question, score, and rank.

```tsx
import { QuizProgress } from "@/components/realtime";

<QuizProgress
  currentCard={5}
  totalCards={10}
  currentScore={450}
  currentRank={2}
  previousRank={3} // Optional: for trend indicator
/>
```

**Features:**
- Progress bar with percentage
- Score display with trophy icon
- Rank badges (🥇🥈🥉 for top 3)
- Rank change indicators (↑↓)
- Progress dots visualization

---

#### `AnswerFeedback`
Full-screen feedback overlay after answering.

```tsx
import { AnswerFeedback } from "@/components/realtime";

<AnswerFeedback
  isCorrect={true}
  pointsEarned={10}
  speedBonus={5}
  correctAnswer="4" // Shown only if incorrect
  responseTime={2500}
  onComplete={() => console.log("Advance to next")}
  autoAdvanceMs={3000}
/>
```

**Features:**
- Confetti animation for correct answers
- Points and speed bonus display
- Correct answer reveal for incorrect responses
- Response time display
- Auto-advance with animated progress bar
- Green/red theming

---

#### `LiveLeaderboard`
Real-time rankings during and after quiz.

```tsx
import { LiveLeaderboard } from "@/components/realtime";

// Compact view (sidebar during quiz)
<LiveLeaderboard
  participants={participants}
  currentUserId="user-123"
  compact={true}
  showHeader={true}
/>

// Full view (results page)
<LiveLeaderboard
  participants={participants}
  currentUserId="user-123"
  compact={false}
/>
```

**Features:**
- Top 3 badges (🥇🥈🥉)
- Current user highlight
- Animated rank changes with transitions
- Score updates with pulse animation
- Compact and full view modes
- Rank change indicators (↑↓)

**Socket.io Integration:**
```tsx
const { sessionState } = useLiveSession(sessionId, true);

<LiveLeaderboard
  participants={sessionState.leaderboard.map(p => ({
    ...p,
    isCurrentUser: p.userId === currentUserId,
  }))}
  currentUserId={currentUserId}
  compact={true}
/>
```

---

#### `BlitzQuizResults`
Final results screen with statistics and XP awards.

```tsx
import { BlitzQuizResults } from "@/components/realtime";

<BlitzQuizResults
  sessionId="session-123"
  groupId={123}
  participants={finalResults}
  currentUserId="user-123"
  personalStats={{
    accuracy: 85,
    avgResponseTime: 3200,
    fastestAnswer: 1200,
    slowestAnswer: 5400,
    streak: 5,
  }}
  totalCards={10}
  sessionType="blitz_quiz"
  onPlayAgain={() => console.log("Create new session")}
/>
```

**Features:**
- Confetti celebration for top 3 finishers
- Personal performance card (score, accuracy, avg time, XP)
- XP rewards display (🥇 +100, 🥈 +50, 🥉 +25)
- Final leaderboard integration
- Session summary statistics
- "Play Again" and "Return to Group" buttons

---

## 🔌 Socket.io Integration

### Setup

All components work with the existing Socket.io infrastructure:

```tsx
import { useLiveSession, useSocket } from "@/hooks/useSocket";

function QuizPage({ sessionId }: { sessionId: number }) {
  // Connect to Socket.io and listen for session events
  const { sessionState, isConnected } = useLiveSession(sessionId, true);

  return (
    <div>
      {/* Connection status */}
      {isConnected && <Badge>Live</Badge>}

      {/* Session state */}
      <p>Status: {sessionState.status}</p>
      <p>Current Card: {sessionState.currentCardIndex}</p>
      <p>Leaderboard: {sessionState.leaderboard.length} participants</p>
    </div>
  );
}
```

### Socket.io Events

**Server → Client Events:**

| Event | Payload | Description |
|-------|---------|-------------|
| `session:started` | `{ sessionId, startedAt, config }` | Session begins |
| `session:card_revealed` | `{ sessionId, cardIndex, flashcard, timeLimit }` | New question revealed |
| `session:answer_submitted` | `{ sessionId, userId, flashcardId, isCorrect, points }` | Answer submitted |
| `session:leaderboard_updated` | `{ sessionId, leaderboard[] }` | Rankings updated |
| `session:ended` | `{ sessionId, endedAt, finalLeaderboard[] }` | Quiz complete |

**Client → Server Events:**

Handled by server actions (`submitLiveAnswer`), not direct Socket.io emits from UI.

---

## 🎯 Complete Example: Quiz Flow

### 1. Session Lobby Page

```tsx
import { SessionLobby } from "@/components/realtime";

export default async function SessionLobbyPage({
  params
}: {
  params: { groupId: string; sessionId: string }
}) {
  const session = await getSessionDetail(Number(params.sessionId));
  const currentUser = await getCurrentUser();

  return (
    <SessionLobby
      session={session}
      groupId={Number(params.groupId)}
      currentUserId={currentUser.id}
    />
  );
}
```

**Flow:**
1. Participants join and see live participant list
2. Host clicks "Start Quiz" → triggers `startLiveSession()` server action
3. Server emits `session:started` event
4. All participants auto-navigate to quiz page

---

### 2. Quiz Page (Active)

```tsx
"use client";

import { useState, useEffect } from "react";
import { BlitzQuizParticipant, LiveLeaderboard } from "@/components/realtime";
import { useLiveSession } from "@/hooks/useSocket";

export default function QuizPage({
  sessionId,
  groupId,
  initialCard
}: QuizPageProps) {
  const [currentCard, setCurrentCard] = useState(initialCard);
  const [participantState, setParticipantState] = useState({
    userId: "user-123",
    score: 0,
    rank: 1,
    answeredCards: 0,
  });

  // Socket.io integration
  const { sessionState, isConnected } = useLiveSession(Number(sessionId), true);

  // Listen for new cards
  useEffect(() => {
    if (sessionState.currentCardIndex > participantState.answeredCards) {
      // Fetch next card from server
      fetchCard(sessionState.currentCardIndex).then(setCurrentCard);
    }
  }, [sessionState.currentCardIndex]);

  // Update leaderboard in real-time
  const leaderboardData = sessionState.leaderboard.map(p => ({
    ...p,
    isCurrentUser: p.userId === participantState.userId,
  }));

  // Update participant state from leaderboard
  useEffect(() => {
    const myEntry = sessionState.leaderboard.find(
      p => p.userId === participantState.userId
    );
    if (myEntry) {
      setParticipantState(prev => ({
        ...prev,
        score: myEntry.totalScore,
        rank: myEntry.rank,
        previousRank: prev.rank,
      }));
    }
  }, [sessionState.leaderboard]);

  // Navigate to results when session ends
  useEffect(() => {
    if (sessionState.status === 'ended') {
      router.push(`/groups/${groupId}/sessions/${sessionId}/results`);
    }
  }, [sessionState.status]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Quiz Area */}
      <div className="lg:col-span-3">
        <BlitzQuizParticipant
          sessionId={sessionId}
          groupId={Number(groupId)}
          currentCard={currentCard}
          cardNumber={participantState.answeredCards + 1}
          totalCards={10}
          timeLimit={30}
          participantState={participantState}
          onComplete={() => {
            setParticipantState(prev => ({
              ...prev,
              answeredCards: prev.answeredCards + 1,
            }));
          }}
        />
      </div>

      {/* Live Leaderboard Sidebar */}
      <div className="lg:col-span-1">
        <LiveLeaderboard
          participants={leaderboardData}
          currentUserId={participantState.userId}
          compact={true}
        />
      </div>
    </div>
  );
}
```

**Flow:**
1. Server emits `session:card_revealed` → UI fetches card data
2. Participant submits answer → server action `submitLiveAnswer()`
3. Server emits `session:leaderboard_updated` → UI updates ranks/scores
4. AnswerFeedback overlay shows for 3 seconds
5. Repeat until all cards complete
6. Server emits `session:ended` → navigate to results

---

### 3. Results Page

```tsx
import { BlitzQuizResults } from "@/components/realtime";

export default async function ResultsPage({
  params
}: {
  params: { groupId: string; sessionId: string }
}) {
  const results = await getSessionResults(params.sessionId);
  const currentUser = await getCurrentUser();

  return (
    <BlitzQuizResults
      sessionId={params.sessionId}
      groupId={Number(params.groupId)}
      participants={results.participants}
      currentUserId={currentUser.id}
      personalStats={results.personalStats}
      totalCards={results.totalCards}
      sessionType="blitz_quiz"
      onPlayAgain={() => {
        // Navigate to create session or group page
      }}
    />
  );
}
```

**Flow:**
1. Show confetti for top 3
2. Display personal performance metrics
3. Show final leaderboard
4. Provide "Play Again" and "Return to Group" options

---

## 🎨 Styling

All components use:
- **shadcn/ui**: Card, Button, Badge, Progress, Avatar
- **Tailwind CSS**: Responsive design, animations
- **Lucide React**: Icons
- **canvas-confetti**: Celebrations
- **date-fns**: Time formatting (in SessionCard)

---

## 📱 Mobile Responsiveness

- **SessionsList**: 1 column mobile, 2 tablet, 3 desktop
- **SessionLobby**: Stacked layout mobile, grid desktop
- **BlitzQuizParticipant**: Full-width mobile, max-w-4xl desktop
- **LiveLeaderboard**: Full-width mobile, sidebar desktop
- **QuizProgress**: Responsive flex layout
- **BlitzQuizResults**: Stacked cards mobile, grid desktop

---

## 🚀 Feature Flags

Components check `FeatureFlags.REALTIME` and `FeatureFlags.LIVE_SESSIONS`:

```tsx
import { FeatureFlags } from "@/lib/shared/feature-flags";

if (!FeatureFlags.REALTIME) {
  return <div>Real-time features disabled</div>;
}
```

Enable in `.env.local`:
```bash
NEXT_PUBLIC_FEATURE_REALTIME=true
NEXT_PUBLIC_FEATURE_LIVE_SESSIONS=true
```

---

## 🔧 Development Tips

1. **Testing Socket.io locally:**
   - Ensure Socket.io server is running
   - Check `SOCKET_IO_PATH` in config
   - Monitor connection in browser console

2. **Debugging:**
   - All Socket.io events logged to console
   - Check `[Socket.io]` prefix in logs
   - Verify `isConnected` state

3. **Performance:**
   - Components use `React.memo` for LeaderboardEntry
   - Debounced animations prevent thrashing
   - Auto-refresh limited to 10-second intervals

4. **Error Handling:**
   - Components gracefully handle disconnections
   - Fallback to polling if Socket.io unavailable
   - Error messages shown for failed actions

---

## 📦 Dependencies

```json
{
  "socket.io-client": "^4.x",
  "canvas-confetti": "^1.x",
  "lucide-react": "^0.x",
  "date-fns": "^3.x"
}
```

---

## 🎯 Next Steps

### Phase 3: Remaining Tasks

1. **Create actual page routes** (app/groups/[groupId]/sessions/...)
2. **Server Actions**: Implement missing actions if any
3. **Data Fetching**: Add queries for cards, results, etc.
4. **Mobile Polish**: Touch optimizations, larger hit targets
5. **Accessibility**: ARIA labels, keyboard navigation
6. **Testing**: E2E tests for full quiz flow

### Future Enhancements

- **AI Hints**: Button to get AI hint during quiz
- **Study Room Mode**: Collaborative flashcard review
- **Peer Review Mode**: Review each other's responses
- **Power-ups**: Freeze timer, 50/50, skip card
- **Achievements**: Badges for streaks, perfect scores
- **Replay**: Watch quiz playback with timeline

---

## 📄 License

Part of the Learning Cards application.
