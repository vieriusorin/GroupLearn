# Quick Start: Live Sessions

**Ready to test the live quiz feature!** 🚀

## 🏁 Start the Server

```bash
# Make sure environment variables are set
# Check .env.local for these required variables:
# NEXT_PUBLIC_FEATURE_REALTIME=true
# NEXT_PUBLIC_FEATURE_LIVE_SESSIONS=true
# NEXT_PUBLIC_FEATURE_BLITZ_QUIZ=true

# Start the custom server with Socket.io
npm run dev
```

The server will start at `http://localhost:3000`

## 📝 Test Flow

### Step 1: Navigate to a Group

1. Open browser: `http://localhost:3000`
2. Sign in with your account
3. Go to "Groups" from navigation
4. Click on any group you're a member of

### Step 2: Create a Live Session

You should now see a **"Live Sessions"** section at the top of the group page!

1. Click **"Create Live Session"** button
2. Fill in the form:
   - **Session Type**: Blitz Quizss
   - **Number of Cards**: 10
   - **Time per Card**: 30 seconds
   - **Category**: Select any (optional)
   - **Allow AI Hints**: Toggle as desired
3. Click **"Create Session"**

You'll be redirected to the **Session Lobby**!

### Step 3: Session Lobby

The lobby shows:
- Session configuration (10 cards, 30 seconds, etc.)
- Participants list (you'll be there with a Crown badge as host)
- **"Start Quiz"** button (only visible to host)
- Live connection indicator (green "Live" badge)

**To test with multiple users:**
1. Open a second browser (or incognito window)
2. Sign in as a different user
3. Navigate to the same group
4. Click **"Join"** on the session card
5. You'll be added to the lobby

### Step 4: Start the Quiz

1. As the host, click **"Start Quiz"**
2. All participants will **auto-navigate** to the quiz page
3. You'll see:
   - Question with 4 multiple-choice options (A, B, C, D)
   - Countdown timer
   - Live leaderboard on the right
   - Your current score and rank at the top

### Step 5: Answer Questions

1. Select an answer (A, B, C, or D)
2. Click **"Submit Answer"**
3. See feedback overlay:
   - ✅ **Correct**: Green background, confetti, points earned
   - ❌ **Incorrect**: Red background, correct answer shown, 0 points
4. Auto-advances to next question after 3 seconds

**Watch the leaderboard update in real-time!**

### Step 6: View Results

After all questions:
- Auto-navigate to results page
- See:
  - Confetti animation (for top 3)
  - Your rank and title (🏆 Champion!, 🥈 Runner-up!, etc.)
  - Personal performance card (accuracy, response time, streak)
  - Final leaderboard with XP rewards
  - XP breakdown: 🥇 +100 XP, 🥈 +50 XP, 🥉 +25 XP
- Click **"Return to Group"** to go back

## 🔍 What to Check

### Visual Indicators

- ✅ Green "Live" badge in lobby (Socket.io connected)
- ✅ Countdown timer turns red at ≤5 seconds
- ✅ Confetti animation on correct answers
- ✅ Leaderboard updates with pulse animation
- ✅ Rank badges (🥇🥈🥉)

### Real-Time Features

- ✅ Participants see new sessions appear (auto-refresh every 10s)
- ✅ Auto-navigation when host starts quiz
- ✅ Leaderboard updates after each answer
- ✅ All participants see same question at same time
- ✅ Auto-navigation to results when complete

### Browser Console

Open DevTools → Console and look for:
```
[Socket.io] User connected: ...
[Socket.io] Authenticated: ...
session:started event received
session:card_revealed event received
session:leaderboard_updated event received
```

## 🐛 Troubleshooting

### "Create Live Session" button not showing

**Check**:
```bash
# In .env.local
NEXT_PUBLIC_FEATURE_LIVE_SESSIONS=true
```

Restart server after changing environment variables.

### Socket.io not connecting

**Check**:
1. Using `npm run dev` (not `npm run dev:next`)
2. Environment variables set:
   ```bash
   NEXT_PUBLIC_FEATURE_REALTIME=true
   SOCKET_IO_CORS_ORIGIN=http://localhost:3000
   ```
3. Custom server running (look for startup message with Socket.io path)

### No categories in CreateSessionDialog

**Check**:
- Database has domains and categories seeded
- Run: `npm run seed:db` to seed initial data

### Questions not loading

**Check**:
- Database has flashcards
- Selected category has flashcards
- Run: `npm run seed:db` to seed flashcards

## 📊 Expected Performance

- **Lobby → Quiz**: Auto-navigation within 1-2 seconds
- **Answer Submission**: Feedback appears within 500ms
- **Leaderboard Update**: Updates within 500ms
- **Next Question**: Auto-advances after 3 seconds

## 🎮 Advanced Testing

### Test with Multiple Participants

1. Open 3+ browser windows (different users)
2. All join the same session
3. Host starts quiz
4. Answer at different speeds
5. Observe rank changes in real-time

### Test Edge Cases

1. **Timeout**: Don't answer, let timer reach 0
   - Should auto-submit as incorrect
2. **Disconnect**: Disable network mid-quiz
   - Should show "Reconnecting..." message
   - Should reconnect automatically
3. **Host leaves**: Host refreshes page
   - Session should continue for others
4. **Wrong answer**: Select incorrect option
   - Should show correct answer
   - Should give 0 points

## 📚 More Information

- **Full Testing Guide**: See `TESTING_GUIDE_LIVE_QUIZ.md`
- **Deployment Guide**: See `SOCKET_IO_DEPLOYMENT_GUIDE.md`
- **Implementation Details**: See `LIVE_SESSION_UI_INTEGRATION_COMPLETE.md`

## ✅ Success Criteria

If you can do all of this, the feature is working:

- [ ] Create a session from group page
- [ ] See session in lobby with participants
- [ ] Start quiz as host
- [ ] Answer questions and see feedback
- [ ] Watch leaderboard update in real-time
- [ ] Complete quiz and see results
- [ ] Receive XP rewards

**Congratulations!** The live quiz feature is fully functional! 🎉

---

**Need help?** Check the browser console for error messages or refer to the troubleshooting section above.
