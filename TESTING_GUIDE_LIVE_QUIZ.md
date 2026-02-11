# Live Quiz Testing Guide

**Version**: 1.0
**Last Updated**: 2026-02-10
**Status**: Ready for Testing

---

## 📋 Prerequisites

### Environment Setup

1. **Feature Flags** - Ensure these are set in `.env.local`:
```bash
NEXT_PUBLIC_FEATURE_REALTIME=true
NEXT_PUBLIC_FEATURE_LIVE_SESSIONS=true
NEXT_PUBLIC_FEATURE_BLITZ_QUIZ=true
```

2. **Database** - Ensure you have:
   - At least 2 user accounts created
   - At least 1 group with both users as members
   - At least 1 category with 10+ flashcards
   - Flashcards should have `question` and `answer` fields populated

3. **Socket.io Server** - For production testing:
   - Requires custom server setup (see `src/app/api/socketio/route.ts`)
   - For development, Socket.io will run in-process

4. **Test Accounts**:
   - **Host User**: User who will create and start sessions
   - **Participant User**: User who will join sessions
   - Both should be members of the same group

---

## 🧪 Test Cases

### Test Suite 1: Session Creation

#### TC1.1: Create Blitz Quiz Session
**Objective**: Verify session creation with default settings

**Steps**:
1. Log in as Host User
2. Navigate to a group page (`/groups/{id}`)
3. Click "Create Session" button in the Live Sessions section
4. Fill in form:
   - Session Type: Blitz Quiz
   - Card Count: 10
   - Time Limit: 30 seconds
   - Category: Select a category
   - Allow Hints: Toggle as desired
5. Click "Create Session"

**Expected**:
- ✅ Dialog closes
- ✅ Redirected to `/groups/{id}/sessions/{sessionId}` (lobby)
- ✅ Session status shows "Waiting to Start"
- ✅ Host user appears in participants list with Crown icon
- ✅ Session configuration displays correctly (cards, time, hints)

**Actual**: ___________

---

#### TC1.2: Create Session with Invalid Data
**Objective**: Verify form validation

**Steps**:
1. Try creating session with:
   - Card Count: 0 or empty
   - Time Limit: 0 or empty
   - No category selected

**Expected**:
- ✅ Error messages displayed
- ✅ Session not created

**Actual**: ___________

---

### Test Suite 2: Joining Sessions

#### TC2.1: Join Active Session
**Objective**: Verify participant can join waiting session

**Steps**:
1. Log in as Participant User
2. Navigate to same group page
3. See created session in SessionsList
4. Click "Join" button on SessionCard

**Expected**:
- ✅ Redirected to session lobby
- ✅ Participant appears in participants list
- ✅ Participant count increases
- ✅ "You" badge shows next to participant name

**Actual**: ___________

---

#### TC2.2: Auto-Refresh Session List
**Objective**: Verify SessionsList auto-refreshes

**Steps**:
1. Have two browser windows open (Host and Participant)
2. Host creates session
3. Wait up to 10 seconds on Participant's browser

**Expected**:
- ✅ New session appears automatically without manual refresh
- ✅ No console errors

**Actual**: ___________

---

### Test Suite 3: Session Lobby

#### TC3.1: Socket.io Connection Status
**Objective**: Verify live connection indicator

**Steps**:
1. Open browser dev tools → Network tab
2. Join session lobby
3. Look for WebSocket connection
4. Check for "Live" badge in lobby

**Expected**:
- ✅ WebSocket connection established
- ✅ Green "Live" badge with Radio icon visible
- ✅ No connection errors in console

**Actual**: ___________

---

#### TC3.2: Minimum Participant Validation
**Objective**: Verify start button logic

**Steps**:
1. As Host, try to start session with 0 participants
2. Add 1 participant
3. Try to start again

**Expected**:
- ✅ Start button disabled with 0 participants
- ✅ Error message: "Need at least 1 participant to start"
- ✅ Start button enabled with 1+ participants

**Actual**: ___________

---

#### TC3.3: Leave Session
**Objective**: Verify leave functionality

**Steps**:
1. As Participant, click "Leave Session"
2. Verify redirect to group page
3. Check that participant removed from lobby (if Host still there)

**Expected**:
- ✅ Redirected to `/groups/{id}`
- ✅ Participant count decreases
- ✅ Participant removed from list

**Actual**: ___________

---

### Test Suite 4: Quiz Flow (Critical)

#### TC4.1: Start Session and Auto-Navigate
**Objective**: Verify Socket.io `session:started` event

**Steps**:
1. Have Host and Participant in lobby
2. Host clicks "Start Quiz"
3. Observe both browser windows

**Expected**:
- ✅ Host navigates to `/groups/{id}/sessions/{sessionId}/quiz`
- ✅ Participant auto-navigates to same page within 1-2 seconds
- ✅ Both see first question
- ✅ Countdown timer starts at time limit (e.g., 30s)

**Actual**: ___________

---

#### TC4.2: Answer Question Correctly
**Objective**: Verify correct answer flow

**Steps**:
1. On quiz page, read question
2. Select correct answer (verify by checking flashcard data)
3. Click "Submit Answer"

**Expected**:
- ✅ Submit button disabled during submission
- ✅ AnswerFeedback overlay appears with:
  - Green background
  - Confetti animation
  - ✅ "Correct!" message
  - Points earned (e.g., "+15 points")
  - Speed bonus shown (e.g., "Speed bonus: +5 points")
  - Response time (e.g., "Answered in 3.2s")
- ✅ Auto-advance after 3 seconds
- ✅ Next question loads

**Actual**: ___________

---

#### TC4.3: Answer Question Incorrectly
**Objective**: Verify incorrect answer flow

**Steps**:
1. Select wrong answer
2. Click "Submit Answer"

**Expected**:
- ✅ AnswerFeedback overlay appears with:
  - Red background
  - ✗ "Incorrect" message
  - 0 points earned
  - Correct answer displayed
  - Response time shown
- ✅ No confetti animation
- ✅ Auto-advance after 3 seconds
- ✅ Score doesn't increase

**Actual**: ___________

---

#### TC4.4: Countdown Timer and Auto-Submit
**Objective**: Verify timer timeout behavior

**Steps**:
1. Load question
2. Do NOT select any answer
3. Wait for timer to reach 0

**Expected**:
- ✅ Timer turns red at ≤5 seconds remaining
- ✅ "Hurry!" badge appears at ≤5 seconds
- ✅ Auto-submit triggers at 0 seconds
- ✅ Feedback shows as incorrect with 0 points
- ✅ Correct answer displayed

**Actual**: ___________

---

#### TC4.5: Progress Tracking
**Objective**: Verify QuizProgress component

**Steps**:
1. Answer 3 questions
2. Observe progress indicators

**Expected**:
- ✅ Progress bar fills (e.g., 30% after 3/10 questions)
- ✅ Question counter updates (e.g., "Question 4 of 10")
- ✅ Progress dots show filled/unfilled correctly
- ✅ Score increases with correct answers
- ✅ Current score displayed accurately

**Actual**: ___________

---

### Test Suite 5: Leaderboard (Real-Time)

#### TC5.1: Live Leaderboard Updates
**Objective**: Verify Socket.io `session:leaderboard_updated` event

**Steps**:
1. Have 2+ participants answer questions
2. Observe leaderboard sidebar on both screens
3. Answer at different speeds

**Expected**:
- ✅ Leaderboard updates in real-time after each answer
- ✅ Ranks recalculate correctly
- ✅ Pulse animation appears on score updates
- ✅ Rank change indicators (↑↓) display
- ✅ Current user highlighted in leaderboard
- ✅ Top 3 show emoji badges (🥇🥈🥉)

**Actual**: ___________

---

#### TC5.2: Rank Badges
**Objective**: Verify rank badge display

**Steps**:
1. Achieve different ranks by answering
2. Check QuizProgress and LiveLeaderboard

**Expected**:
- ✅ 1st place: 🥇 "1st Place" badge
- ✅ 2nd place: 🥈 "2nd Place" badge
- ✅ 3rd place: 🥉 "3rd Place" badge
- ✅ 4th+ place: "#4", "#5", etc. badges

**Actual**: ___________

---

### Test Suite 6: Session Completion

#### TC6.1: Complete All Questions
**Objective**: Verify auto-navigation to results

**Steps**:
1. Answer all 10 questions
2. Wait for feedback on last question

**Expected**:
- ✅ After last answer feedback, redirect to `/groups/{id}/sessions/{sessionId}/results`
- ✅ Socket.io emits `session:ended` event
- ✅ All participants navigate to results page
- ✅ Results page loads within 2 seconds

**Actual**: ___________

---

#### TC6.2: Results Page Display
**Objective**: Verify comprehensive results

**Steps**:
1. View results page after completion
2. Check all displayed information

**Expected**:
- ✅ Confetti animation for top 3 finishers
- ✅ Rank emoji and title (e.g., "🏆 Champion!" for 1st)
- ✅ Personal performance card shows:
  - Total points
  - Accuracy percentage
  - Average response time
  - XP earned
  - Best streak
  - Fastest answer time
- ✅ Final leaderboard with all participants
- ✅ XP rewards display (🥇 +100, 🥈 +50, 🥉 +25)
- ✅ Session summary (cards completed, participant count)
- ✅ "Return to Group" button works

**Actual**: ___________

---

#### TC6.3: XP Award Verification
**Objective**: Verify XP awarded to user account

**Steps**:
1. Note user's XP before quiz
2. Complete quiz with specific rank
3. Check user's XP after quiz
4. Navigate to profile or XP history

**Expected**:
- ✅ XP increased by displayed amount
- ✅ XP transaction recorded in database
- ✅ Transaction description includes rank

**Actual**: ___________

---

### Test Suite 7: Socket.io Events

#### TC7.1: Event Flow Verification
**Objective**: Verify all Socket.io events emit correctly

**Setup**: Open browser dev tools → Console, enable verbose logging

**Events to Check**:
1. `session:started` - When host starts quiz
   - ✅ Emitted to all participants in session room
   - ✅ Includes: sessionId, startedAt, config

2. `session:card_revealed` - When new card loads
   - ✅ Emitted after session start
   - ✅ Includes: sessionId, cardIndex, flashcard, timeLimit

3. `session:answer_submitted` - After each answer
   - ✅ Emitted after answer submission
   - ✅ Includes: sessionId, userId, flashcardId, isCorrect, points, responseTimeMs

4. `session:leaderboard_updated` - After each answer
   - ✅ Emitted after answer and rank recalculation
   - ✅ Includes: sessionId, leaderboard array

5. `session:ended` - When session completes
   - ✅ Emitted when all questions answered or host ends
   - ✅ Includes: sessionId, endedAt, finalLeaderboard

**Actual**: ___________

---

### Test Suite 8: Error Handling

#### TC8.1: Network Disconnection
**Objective**: Verify graceful handling of connection loss

**Steps**:
1. Join active quiz
2. Disable network (Chrome: DevTools → Network → Offline)
3. Wait 5 seconds
4. Re-enable network

**Expected**:
- ✅ "Reconnecting..." indicator appears
- ✅ Socket.io reconnects automatically
- ✅ Quiz state syncs after reconnection
- ✅ No data loss

**Actual**: ___________

---

#### TC8.2: Invalid Session Access
**Objective**: Verify error handling for invalid sessions

**Steps**:
1. Try accessing `/groups/{id}/sessions/99999` (invalid ID)
2. Try accessing completed session's quiz page

**Expected**:
- ✅ 404 Not Found page for invalid ID
- ✅ Auto-redirect to results if session completed
- ✅ Error message if session doesn't exist

**Actual**: ___________

---

#### TC8.3: Answer Already Submitted
**Objective**: Verify duplicate answer prevention

**Steps**:
1. Submit answer
2. Try to submit again (if possible)

**Expected**:
- ✅ Second submission rejected
- ✅ Error message: "You have already answered this question"
- ✅ No duplicate points awarded

**Actual**: ___________

---

### Test Suite 9: Multiple-Choice Options

#### TC9.1: Option Generation
**Objective**: Verify wrong answers generated correctly

**Steps**:
1. Check question options on quiz page
2. Verify options are shuffled
3. Check that correct answer is included

**Expected**:
- ✅ 4 options displayed (A, B, C, D)
- ✅ Correct answer included in options
- ✅ Wrong answers pulled from same category (if category-based)
- ✅ Options shuffled (correct answer not always in same position)
- ✅ No duplicate options

**Actual**: ___________

---

### Test Suite 10: Mobile Responsiveness

#### TC10.1: Mobile Layout
**Objective**: Verify responsive design on mobile devices

**Device**: iPhone 14 Pro (390x844) or similar

**Steps**:
1. Access all pages on mobile:
   - SessionsList
   - SessionLobby
   - Quiz page
   - Results page

**Expected**:
- ✅ SessionsList: Single column layout
- ✅ Lobby: Stacked participant cards
- ✅ Quiz: Full-width question and answer buttons
- ✅ Quiz: Leaderboard moves below quiz on mobile or hidden
- ✅ Results: Stacked personal stats and leaderboard
- ✅ All buttons large enough for touch (min 44x44px)
- ✅ No horizontal scrolling
- ✅ Text readable without zoom

**Actual**: ___________

---

### Test Suite 11: Performance

#### TC11.1: Load Time
**Objective**: Verify acceptable page load times

**Steps**:
1. Clear browser cache
2. Navigate to each page
3. Measure load time (Chrome DevTools → Network → Load)

**Expected**:
- ✅ Group page with SessionsList: < 2s
- ✅ Session lobby: < 1s
- ✅ Quiz page initial load: < 1.5s
- ✅ Results page: < 1s

**Actual**: ___________

---

#### TC11.2: With 20 Participants
**Objective**: Verify performance with many participants

**Steps**:
1. Create session with 20 participants (if possible)
2. All submit answers
3. Monitor leaderboard updates

**Expected**:
- ✅ Leaderboard renders smoothly
- ✅ No lag in UI updates
- ✅ Socket.io events process quickly (< 500ms)

**Actual**: ___________

---

## 🐛 Known Issues

Document any bugs found during testing:

| Issue ID | Description | Severity | Steps to Reproduce | Status |
|----------|-------------|----------|-------------------|--------|
| BUG-001 |  |  |  |  |
| BUG-002 |  |  |  |  |
| BUG-003 |  |  |  |  |

---

## 📊 Test Results Summary

**Date**: ___________
**Tester**: ___________
**Environment**: Development / Staging / Production

| Test Suite | Total Tests | Passed | Failed | Skipped |
|------------|-------------|--------|--------|---------|
| 1. Session Creation | 2 |  |  |  |
| 2. Joining Sessions | 2 |  |  |  |
| 3. Session Lobby | 3 |  |  |  |
| 4. Quiz Flow | 5 |  |  |  |
| 5. Leaderboard | 2 |  |  |  |
| 6. Session Completion | 3 |  |  |  |
| 7. Socket.io Events | 1 |  |  |  |
| 8. Error Handling | 3 |  |  |  |
| 9. Multiple-Choice | 1 |  |  |  |
| 10. Mobile | 1 |  |  |  |
| 11. Performance | 2 |  |  |  |
| **TOTAL** | **25** |  |  |  |

---

## ✅ Acceptance Criteria

Feature can be marked as **Production Ready** when:

- [ ] All Critical tests pass (Test Suites 4, 5, 6, 7)
- [ ] At least 90% of all tests pass
- [ ] Zero critical or high-severity bugs
- [ ] Socket.io events emit correctly in all scenarios
- [ ] Mobile responsive on iOS and Android
- [ ] Load time < 2s on 3G connection
- [ ] XP awards correctly to participants
- [ ] No console errors during happy path

---

## 🚀 Next Steps

After testing completion:

1. **Bug Fixes**: Address all identified issues
2. **Performance Optimization**: If load times exceed targets
3. **Security Audit**: Review Socket.io authentication
4. **Load Testing**: Test with 50+ concurrent participants
5. **Accessibility**: WCAG 2.1 AA compliance check
6. **Documentation**: User guide for feature
7. **Deployment**: Production Socket.io server setup

---

## 📞 Support

For questions or issues:
- Report bugs in GitHub Issues
- Discuss in team Slack channel
- Refer to `src/components/realtime/README.md` for component docs

---

**Happy Testing!** 🎉
