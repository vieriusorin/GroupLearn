/**
 * Seed Real-Time & AI Features
 *
 * Seeds the database with test data for:
 * - Live sessions (blitz quiz examples)
 * - Online presence
 * - AI usage quotas
 * - AI generated content examples
 * - Knowledge gaps
 *
 * Run this AFTER the main seed-database.ts
 * Usage: npm run seed:realtime
 */

import crypto from "node:crypto";
import { existsSync } from "node:fs";
import { join } from "node:path";
import * as dotenv from "dotenv";

// Load environment variables
const envLocalPath = join(process.cwd(), ".env.local");
if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config();
}

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not defined!");
  process.exit(1);
}

import { db } from "../src/infrastructure/database/drizzle";
import {
  users,
  groups,
  groupMembers,
  flashcards,
  categories,
  liveSessions,
  liveSessionParticipants,
  liveSessionAnswers,
  onlinePresence,
  aiUsageQuotas,
  aiGeneratedContent,
  aiHints,
  knowledgeGaps,
  aiResponseCache,
} from "../src/infrastructure/database/schema";
import { eq } from "drizzle-orm";

async function seedRealtimeFeatures() {
  console.log("🚀 Seeding real-time & AI features...\n");

  try {
    // ============================================
    // 1. Get existing users and groups
    // ============================================
    console.log("📋 Fetching existing users and groups...");

    const existingUsers = await db.select().from(users).limit(5);
    const existingGroups = await db.select().from(groups).limit(3);
    const existingFlashcards = await db.select().from(flashcards).limit(20);

    if (existingUsers.length === 0) {
      console.log("⚠️  No users found. Please run main seed script first: npm run seed:db");
      process.exit(1);
    }

    if (existingGroups.length === 0) {
      console.log("⚠️  No groups found. Please run main seed script first: npm run seed:db");
      process.exit(1);
    }

    console.log(`✓ Found ${existingUsers.length} users`);
    console.log(`✓ Found ${existingGroups.length} groups`);
    console.log(`✓ Found ${existingFlashcards.length} flashcards\n`);

    // ============================================
    // Clean up existing real-time data (for idempotent re-runs)
    // ============================================
    console.log("🧹 Cleaning up existing real-time data...");

    await db.delete(onlinePresence);
    await db.delete(aiUsageQuotas);
    await db.delete(aiHints);
    await db.delete(aiGeneratedContent);
    await db.delete(aiResponseCache);
    await db.delete(knowledgeGaps);
    await db.delete(liveSessionAnswers);
    await db.delete(liveSessionParticipants);
    await db.delete(liveSessions);

    console.log("✓ Cleaned up existing data\n");

    // ============================================
    // 2. ONLINE PRESENCE
    // ============================================
    console.log("👤 Creating online presence records...");

    const presenceRecords = existingUsers.slice(0, 3).map((user, idx) => ({
      userId: user.id,
      groupId: existingGroups[0]?.id || null,
      sessionId: null,
      socketId: `socket-${crypto.randomBytes(8).toString("hex")}`,
      status: idx === 0 ? "online" as const : idx === 1 ? "away" as const : "offline" as const,
      lastSeen: new Date(),
      metadata: { currentActivity: idx === 0 ? "reviewing-flashcards" : null },
    }));

    await db.insert(onlinePresence).values(presenceRecords);
    console.log(`✓ Created ${presenceRecords.length} presence records\n`);

    // ============================================
    // 3. AI USAGE QUOTAS
    // ============================================
    console.log("🤖 Creating AI usage quotas...");

    const quotaRecords = existingUsers.map((user) => ({
      userId: user.id,
      dailyRequestCount: Math.floor(Math.random() * 5),
      dailyTokenCount: Math.floor(Math.random() * 5000),
      monthlyRequestCount: Math.floor(Math.random() * 50),
      monthlyTokenCount: Math.floor(Math.random() * 50000),
      dailyResetAt: new Date(),
      monthlyResetAt: new Date(),
      isBlocked: false,
    }));

    await db.insert(aiUsageQuotas).values(quotaRecords);
    console.log(`✓ Created ${quotaRecords.length} AI quota records\n`);

    // ============================================
    // 4. AI HINTS (Sample cached hints)
    // ============================================
    console.log("💡 Creating sample AI hints...");

    if (existingFlashcards.length > 0) {
      const hintRecords = existingFlashcards.slice(0, 5).map((flashcard) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        return {
          flashcardId: flashcard.id,
          hint: `Think about the core concept behind this question. What fundamental principle does it relate to?`,
          modelUsed: "claude-3-5-haiku-20241022",
          tokensUsed: 150,
          requestCount: Math.floor(Math.random() * 10),
          expiresAt: tomorrow,
        };
      });

      await db.insert(aiHints).values(hintRecords);
      console.log(`✓ Created ${hintRecords.length} AI hint records\n`);
    }

    // ============================================
    // 5. AI GENERATED CONTENT
    // ============================================
    console.log("📝 Creating AI generated content examples...");

    const category = await db.select().from(categories).limit(1);

    const generatedContent = [
      {
        sourceType: "text" as const,
        sourceContent: "React hooks are functions that let you use state and lifecycle features in functional components.",
        extractedText: null,
        generatedCards: [
          {
            question: "What are React hooks?",
            answer: "Functions that let you use state and lifecycle features in functional components",
            difficulty: "easy" as const,
            category: "React",
          },
          {
            question: "Can you use hooks in class components?",
            answer: "No, hooks only work in functional components",
            difficulty: "medium" as const,
            category: "React",
          },
        ],
        status: "completed" as const,
        userId: existingUsers[0].id,
        modelUsed: "claude-sonnet-4-5-20250929",
        tokensUsed: 856,
        estimatedCost: "0.002568",
        approvedCount: 2,
        rejectedCount: 0,
        completedAt: new Date(),
      },
      {
        sourceType: "url" as const,
        sourceUrl: "https://react.dev/learn",
        extractedText: "React components are JavaScript functions that return markup...",
        generatedCards: [
          {
            question: "What do React components return?",
            answer: "Markup (JSX)",
            difficulty: "easy" as const,
            category: "React",
          },
        ],
        status: "completed" as const,
        userId: existingUsers[1]?.id || existingUsers[0].id,
        modelUsed: "claude-sonnet-4-5-20250929",
        tokensUsed: 1024,
        estimatedCost: "0.003072",
        approvedCount: 0,
        rejectedCount: 0,
        completedAt: new Date(),
      },
    ];

    await db.insert(aiGeneratedContent).values(generatedContent);
    console.log(`✓ Created ${generatedContent.length} AI generated content records\n`);

    // ============================================
    // 6. AI RESPONSE CACHE
    // ============================================
    console.log("💾 Creating AI response cache...");

    const cacheRecords = [
      {
        cacheKey: crypto.createHash("sha256").update("hint-example-1").digest("hex"),
        promptHash: crypto.createHash("sha256").update("socratic-hint-prompt").digest("hex"),
        prompt: "Generate a Socratic hint for: What is a Promise in JavaScript?",
        response: "What mechanism in JavaScript allows you to handle operations that complete at an unknown time in the future?",
        modelUsed: "claude-3-5-haiku-20241022",
        requestType: "socratic_hint" as const,
        tokensUsed: 120,
        estimatedCost: "0.000360",
        hitCount: 5,
        lastAccessedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    ];

    await db.insert(aiResponseCache).values(cacheRecords);
    console.log(`✓ Created ${cacheRecords.length} cache records\n`);

    // ============================================
    // 7. KNOWLEDGE GAPS
    // ============================================
    console.log("🎯 Creating knowledge gap examples...");

    if (existingGroups.length > 0 && category.length > 0) {
      const gapRecords = [
        {
          groupId: existingGroups[0].id,
          topic: "Async/Await in JavaScript",
          categoryId: category[0]?.id || null,
          successRate: 35,
          affectedUserCount: 8,
          totalUsers: 10,
          prerequisiteConcepts: ["Promises", "Callback functions", "Event loop"],
          recommendedActions: [
            "Create a bridge deck on Promises",
            "Add practical examples with error handling",
            "Include visual diagrams of the event loop",
          ],
          severity: "high" as const,
          status: "detected" as const,
          bridgeDeckGenerated: false,
        },
        {
          groupId: existingGroups[0].id,
          topic: "React Component Lifecycle",
          categoryId: category[0]?.id || null,
          successRate: 52,
          affectedUserCount: 5,
          totalUsers: 10,
          prerequisiteConcepts: ["React basics", "State management", "Effects"],
          recommendedActions: [
            "Review useEffect hook",
            "Practice with component mounting",
          ],
          severity: "medium" as const,
          status: "detected" as const,
          bridgeDeckGenerated: false,
        },
      ];

      await db.insert(knowledgeGaps).values(gapRecords);
      console.log(`✓ Created ${gapRecords.length} knowledge gap records\n`);
    }

    // ============================================
    // 8. LIVE SESSIONS
    // ============================================
    console.log("🎮 Creating live session examples...");

    if (existingGroups.length > 0 && existingUsers.length >= 3 && existingFlashcards.length >= 5) {
      const selectedFlashcardIds = existingFlashcards.slice(0, 5).map((f) => f.id);

      // Create a completed session
      const [completedSession] = await db
        .insert(liveSessions)
        .values({
          sessionType: "blitz_quiz",
          groupId: existingGroups[0].id,
          hostId: existingUsers[0].id,
          categoryId: category[0]?.id || null,
          config: {
            cardCount: 5,
            timeLimit: 30,
            allowHints: false,
          },
          status: "completed",
          currentCardIndex: 5,
          selectedFlashcards: selectedFlashcardIds,
          startedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          endedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        })
        .returning();

      console.log(`✓ Created completed session: ${completedSession.id}`);

      // Create participants for completed session
      const participants = [
        {
          sessionId: completedSession.id,
          userId: existingUsers[0].id,
          totalScore: 85,
          correctAnswers: 4,
          totalAnswers: 5,
          averageResponseTime: 12500,
          rank: 1,
        },
        {
          sessionId: completedSession.id,
          userId: existingUsers[1].id,
          totalScore: 72,
          correctAnswers: 4,
          totalAnswers: 5,
          averageResponseTime: 18200,
          rank: 2,
        },
        {
          sessionId: completedSession.id,
          userId: existingUsers[2]?.id || existingUsers[1].id,
          totalScore: 58,
          correctAnswers: 3,
          totalAnswers: 5,
          averageResponseTime: 22100,
          rank: 3,
        },
      ];

      await db.insert(liveSessionParticipants).values(participants);
      console.log(`✓ Created ${participants.length} participants`);

      // Create sample answers
      const answers = selectedFlashcardIds.slice(0, 3).flatMap((flashcardId, idx) => [
        {
          sessionId: completedSession.id,
          userId: existingUsers[0].id,
          flashcardId,
          answer: "Sample answer",
          isCorrect: idx < 2, // First 2 correct
          responseTimeMs: Math.floor(10000 + Math.random() * 5000),
          pointsEarned: idx < 2 ? 15 : 0,
          cardIndex: idx,
        },
        {
          sessionId: completedSession.id,
          userId: existingUsers[1].id,
          flashcardId,
          answer: "Another answer",
          isCorrect: idx === 1, // Only second correct
          responseTimeMs: Math.floor(15000 + Math.random() * 5000),
          pointsEarned: idx === 1 ? 12 : 0,
          cardIndex: idx,
        },
      ]);

      await db.insert(liveSessionAnswers).values(answers);
      console.log(`✓ Created ${answers.length} sample answers`);

      // Create an active (waiting) session
      if (existingGroups.length > 1) {
        const [waitingSession] = await db
          .insert(liveSessions)
          .values({
            sessionType: "blitz_quiz",
            groupId: existingGroups[1]?.id || existingGroups[0].id,
            hostId: existingUsers[1]?.id || existingUsers[0].id,
            categoryId: category[0]?.id || null,
            config: {
              cardCount: 10,
              timeLimit: 45,
              allowHints: true,
            },
            status: "waiting",
            currentCardIndex: 0,
            selectedFlashcards: null,
          })
          .returning();

        console.log(`✓ Created waiting session: ${waitingSession.id}`);

        // Add host as participant
        await db.insert(liveSessionParticipants).values({
          sessionId: waitingSession.id,
          userId: existingUsers[1]?.id || existingUsers[0].id,
          totalScore: 0,
          rank: null,
        });
      }

      console.log("✓ Live session setup complete\n");
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log("\n✅ Real-time & AI feature seeding complete!\n");
    console.log("📊 Summary:");
    console.log(`   - Online Presence: ${presenceRecords.length} records`);
    console.log(`   - AI Quotas: ${quotaRecords.length} records`);
    console.log(`   - AI Hints: ${existingFlashcards.length > 0 ? 5 : 0} records`);
    console.log(`   - Generated Content: ${generatedContent.length} records`);
    console.log(`   - Response Cache: 1 record`);
    console.log(`   - Knowledge Gaps: 2 records`);
    console.log(`   - Live Sessions: 2 sessions (1 completed, 1 waiting)`);
    console.log(`   - Session Participants: 4 participants`);
    console.log(`   - Session Answers: 6 answers\n`);

    console.log("🎉 You can now test:");
    console.log("   - Online presence with <OnlineMembers> component");
    console.log("   - Live quiz sessions");
    console.log("   - AI hint generation");
    console.log("   - Knowledge gap analysis");
    console.log("   - AI usage quotas\n");

  } catch (error) {
    console.error("\n❌ Error during seeding:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run the seed function
seedRealtimeFeatures().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
