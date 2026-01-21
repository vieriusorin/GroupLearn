/**
 * Database Seeding Script
 *
 * Seeds the database with comprehensive test data covering all features:
 * - Users (admin and regular members)
 * - Domains, Categories, Flashcards
 * - Learning Paths with Units and Lessons
 * - Groups with Members
 * - User Progress and Gamification
 * - Invitations
 *
 * Usage: npm run seed:db
 */

import crypto from "node:crypto";
import { existsSync } from "node:fs";
import { join } from "node:path";
import bcrypt from "bcryptjs";
// CRITICAL: Load environment variables BEFORE any database imports
import * as dotenv from "dotenv";

// Load environment variables from .env.local first, then .env
const envLocalPath = join(process.cwd(), ".env.local");
if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config();
}

// Validate DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not defined in environment variables!");
  console.error("Please create a .env.local file with DATABASE_URL");
  process.exit(1);
}

import { inArray } from "drizzle-orm";
// NOW it's safe to import database
import { db } from "../src/infrastructure/database/drizzle";
import {
  categories,
  dailyStreaks,
  domains,
  flashcards,
  groupInvitations,
  groupMemberAnalytics,
  groupMembers,
  groupPaths,
  groupPathVisibility,
  groups,
  heartsTransactions,
  invitationPaths,
  lessonCompletions,
  lessonFlashcards,
  lessons,
  paths,
  units,
  userActivityLog,
  userProgress,
  users,
  xpTransactions,
} from "../src/infrastructure/database/schema";

// Helper to generate user IDs
function generateUserId() {
  return crypto.randomUUID();
}

// Helper to generate invitation tokens
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Helper to get future date
function getFutureDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function seed() {
  console.log("🌱 Starting database seeding...\n");

  try {
    // ============================================
    // 1. USERS
    // ============================================
    console.log("👥 Creating users...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    const adminUser = {
      id: generateUserId(),
      name: "Admin User",
      email: "admin@learningcards.com",
      emailVerified: true,
      password: hashedPassword,
      role: "admin" as const,
      subscriptionStatus: "premium" as const,
      subscriptionExpiresAt: getFutureDate(365),
    };

    const regularUser1 = {
      id: generateUserId(),
      name: "John Doe",
      email: "john@example.com",
      emailVerified: true,
      password: hashedPassword,
      role: "member" as const,
      subscriptionStatus: "free" as const,
    };

    const regularUser2 = {
      id: generateUserId(),
      name: "Jane Smith",
      email: "jane@example.com",
      emailVerified: true,
      password: hashedPassword,
      role: "member" as const,
      subscriptionStatus: "premium" as const,
      subscriptionExpiresAt: getFutureDate(30),
    };

    const regularUser3 = {
      id: generateUserId(),
      name: "Bob Johnson",
      email: "bob@example.com",
      emailVerified: true,
      password: hashedPassword,
      role: "member" as const,
      subscriptionStatus: "trial" as const,
      subscriptionExpiresAt: getFutureDate(14),
    };

    // Ensure seeding is idempotent – remove any existing test users first
    await db
      .delete(users)
      .where(
        inArray(users.email, [
          "admin@learningcards.com",
          "john@example.com",
          "jane@example.com",
          "bob@example.com",
        ]),
      );

    await db
      .insert(users)
      .values([adminUser, regularUser1, regularUser2, regularUser3]);
    console.log("✅ Created 4 users (1 admin, 3 members)\n");

    // ============================================
    // 2. DOMAINS & CATEGORIES
    // ============================================
    console.log("📚 Creating domains and categories...");

    const [jsDomain] = await db
      .insert(domains)
      .values({
        name: "JavaScript",
        description: "Modern JavaScript programming language",
      })
      .returning();

    const [pythonDomain] = await db
      .insert(domains)
      .values({
        name: "Python",
        description: "Python programming fundamentals",
      })
      .returning();

    const [spanishDomain] = await db
      .insert(domains)
      .values({
        name: "Spanish",
        description: "Learn Spanish from basics to advanced",
      })
      .returning();

    // JavaScript categories
    const [jsBasicsCategory] = await db
      .insert(categories)
      .values({
        domainId: jsDomain.id,
        name: "Basics",
        description: "JavaScript fundamentals",
      })
      .returning();

    const [jsAsyncCategory] = await db
      .insert(categories)
      .values({
        domainId: jsDomain.id,
        name: "Async Programming",
        description: "Promises, async/await, and callbacks",
      })
      .returning();

    // Python categories
    const [pythonBasicsCategory] = await db
      .insert(categories)
      .values({
        domainId: pythonDomain.id,
        name: "Basics",
        description: "Python fundamentals",
      })
      .returning();

    // Spanish categories
    const [spanishVocabCategory] = await db
      .insert(categories)
      .values({
        domainId: spanishDomain.id,
        name: "Vocabulary",
        description: "Essential Spanish vocabulary",
      })
      .returning();

    console.log("✅ Created 3 domains and 4 categories\n");

    // ============================================
    // 3. FLASHCARDS
    // ============================================
    console.log("🎴 Creating flashcards...");

    // JavaScript Basics flashcards
    const jsBasicsFlashcards = await db
      .insert(flashcards)
      .values([
        {
          categoryId: jsBasicsCategory.id,
          question: "What is a variable in JavaScript?",
          answer: "A container for storing data values",
          difficulty: "easy" as const,
        },
        {
          categoryId: jsBasicsCategory.id,
          question: "What are the primitive data types in JavaScript?",
          answer: "String, Number, Boolean, Undefined, Null, Symbol, BigInt",
          difficulty: "medium" as const,
        },
        {
          categoryId: jsBasicsCategory.id,
          question: "What is the difference between let and const?",
          answer: "let allows reassignment, const does not allow reassignment",
          difficulty: "easy" as const,
        },
        {
          categoryId: jsBasicsCategory.id,
          question: "What is hoisting in JavaScript?",
          answer:
            "The process where variable and function declarations are moved to the top of their scope before code execution",
          difficulty: "hard" as const,
        },
        {
          categoryId: jsBasicsCategory.id,
          question: 'What is the purpose of "use strict"?',
          answer:
            "Enables strict mode, which catches common coding mistakes and prevents unsafe actions",
          difficulty: "medium" as const,
        },
      ])
      .returning();

    // JavaScript Async flashcards
    const jsAsyncFlashcards = await db
      .insert(flashcards)
      .values([
        {
          categoryId: jsAsyncCategory.id,
          question: "What is a Promise in JavaScript?",
          answer:
            "An object representing the eventual completion or failure of an asynchronous operation",
          difficulty: "medium" as const,
        },
        {
          categoryId: jsAsyncCategory.id,
          question: "What are the three states of a Promise?",
          answer: "Pending, Fulfilled, and Rejected",
          difficulty: "medium" as const,
        },
        {
          categoryId: jsAsyncCategory.id,
          question: "What does async/await do?",
          answer:
            "Allows writing asynchronous code in a synchronous-looking manner",
          difficulty: "easy" as const,
        },
        {
          categoryId: jsAsyncCategory.id,
          question: "How do you handle errors in async/await?",
          answer: "Using try/catch blocks",
          difficulty: "easy" as const,
        },
        {
          categoryId: jsAsyncCategory.id,
          question:
            "What is the difference between Promise.all() and Promise.race()?",
          answer:
            "Promise.all() waits for all promises to resolve, Promise.race() resolves when the first promise settles",
          difficulty: "hard" as const,
        },
      ])
      .returning();

    // Python Basics flashcards
    const _pythonBasicsFlashcards = await db
      .insert(flashcards)
      .values([
        {
          categoryId: pythonBasicsCategory.id,
          question: "What is a list in Python?",
          answer: "An ordered, mutable collection of items",
          difficulty: "easy" as const,
        },
        {
          categoryId: pythonBasicsCategory.id,
          question: "What is the difference between a list and a tuple?",
          answer: "Lists are mutable, tuples are immutable",
          difficulty: "medium" as const,
        },
        {
          categoryId: pythonBasicsCategory.id,
          question: "What is a dictionary in Python?",
          answer: "An unordered collection of key-value pairs",
          difficulty: "easy" as const,
        },
      ])
      .returning();

    // Spanish Vocabulary flashcards
    const spanishVocabFlashcards = await db
      .insert(flashcards)
      .values([
        {
          categoryId: spanishVocabCategory.id,
          question: "Hello",
          answer: "Hola",
          difficulty: "easy" as const,
        },
        {
          categoryId: spanishVocabCategory.id,
          question: "Goodbye",
          answer: "Adiós",
          difficulty: "easy" as const,
        },
        {
          categoryId: spanishVocabCategory.id,
          question: "Thank you",
          answer: "Gracias",
          difficulty: "easy" as const,
        },
        {
          categoryId: spanishVocabCategory.id,
          question: "Please",
          answer: "Por favor",
          difficulty: "easy" as const,
        },
        {
          categoryId: spanishVocabCategory.id,
          question: "How are you?",
          answer: "¿Cómo estás?",
          difficulty: "medium" as const,
        },
      ])
      .returning();

    console.log("✅ Created 18 flashcards across all categories\n");

    // ============================================
    // 4. LEARNING PATHS
    // ============================================
    console.log("🛤️  Creating learning paths...");

    // JavaScript Fundamentals Path
    const [jsFundamentalsPath] = await db
      .insert(paths)
      .values({
        domainId: jsDomain.id,
        name: "JavaScript Fundamentals",
        description: "Master the basics of JavaScript programming",
        icon: "⚡",
        orderIndex: 0,
        isLocked: false,
        unlockRequirementType: "none" as const,
        visibility: "public" as const,
        createdBy: adminUser.id,
      })
      .returning();

    // JavaScript Advanced Path (locked)
    const [jsAdvancedPath] = await db
      .insert(paths)
      .values({
        domainId: jsDomain.id,
        name: "JavaScript Advanced",
        description: "Advanced JavaScript concepts and patterns",
        icon: "🚀",
        orderIndex: 1,
        isLocked: true,
        unlockRequirementType: "previous_path" as const,
        unlockRequirementValue: jsFundamentalsPath.id,
        visibility: "public" as const,
        createdBy: adminUser.id,
      })
      .returning();

    // Spanish Basics Path
    const [spanishBasicsPath] = await db
      .insert(paths)
      .values({
        domainId: spanishDomain.id,
        name: "Spanish Basics",
        description: "Start your Spanish learning journey",
        icon: "🇪🇸",
        orderIndex: 0,
        isLocked: false,
        unlockRequirementType: "none" as const,
        visibility: "public" as const,
        createdBy: adminUser.id,
      })
      .returning();

    console.log("✅ Created 3 learning paths\n");

    // ============================================
    // 5. UNITS & LESSONS
    // ============================================
    console.log("📖 Creating units and lessons...");

    // JavaScript Fundamentals - Unit 1
    const [jsUnit1] = await db
      .insert(units)
      .values({
        pathId: jsFundamentalsPath.id,
        name: "Variables & Data Types",
        description: "Learn about variables and data types",
        unitNumber: 1,
        orderIndex: 0,
        xpReward: 50,
      })
      .returning();

    // JavaScript Fundamentals - Unit 2
    const [jsUnit2] = await db
      .insert(units)
      .values({
        pathId: jsFundamentalsPath.id,
        name: "Asynchronous JavaScript",
        description: "Master async programming",
        unitNumber: 2,
        orderIndex: 1,
        xpReward: 75,
      })
      .returning();

    // Spanish Basics - Unit 1
    const [spanishUnit1] = await db
      .insert(units)
      .values({
        pathId: spanishBasicsPath.id,
        name: "Essential Greetings",
        description: "Learn basic Spanish greetings",
        unitNumber: 1,
        orderIndex: 0,
        xpReward: 40,
      })
      .returning();

    // Lessons for JS Unit 1
    const [jsLesson1] = await db
      .insert(lessons)
      .values({
        unitId: jsUnit1.id,
        name: "Introduction to Variables",
        description: "Learn var, let, and const",
        orderIndex: 0,
        xpReward: 10,
        flashcardCount: 3,
      })
      .returning();

    const [jsLesson2] = await db
      .insert(lessons)
      .values({
        unitId: jsUnit1.id,
        name: "Data Types Deep Dive",
        description: "Understanding primitive types",
        orderIndex: 1,
        xpReward: 15,
        flashcardCount: 2,
      })
      .returning();

    // Lessons for JS Unit 2
    const [jsLesson3] = await db
      .insert(lessons)
      .values({
        unitId: jsUnit2.id,
        name: "Promises Fundamentals",
        description: "Introduction to Promises",
        orderIndex: 0,
        xpReward: 20,
        flashcardCount: 3,
      })
      .returning();

    const [jsLesson4] = await db
      .insert(lessons)
      .values({
        unitId: jsUnit2.id,
        name: "Async/Await Mastery",
        description: "Modern async patterns",
        orderIndex: 1,
        xpReward: 25,
        flashcardCount: 2,
      })
      .returning();

    // Lessons for Spanish Unit 1
    const [spanishLesson1] = await db
      .insert(lessons)
      .values({
        unitId: spanishUnit1.id,
        name: "Basic Greetings",
        description: "Hello, goodbye, and more",
        orderIndex: 0,
        xpReward: 10,
        flashcardCount: 5,
      })
      .returning();

    console.log("✅ Created 3 units and 5 lessons\n");

    // ============================================
    // 6. LESSON FLASHCARDS (Link lessons to flashcards)
    // ============================================
    console.log("🔗 Linking flashcards to lessons...");

    // JS Lesson 1 flashcards
    await db.insert(lessonFlashcards).values([
      {
        lessonId: jsLesson1.id,
        flashcardId: jsBasicsFlashcards[0].id,
        orderIndex: 0,
      },
      {
        lessonId: jsLesson1.id,
        flashcardId: jsBasicsFlashcards[2].id,
        orderIndex: 1,
      },
      {
        lessonId: jsLesson1.id,
        flashcardId: jsBasicsFlashcards[4].id,
        orderIndex: 2,
      },
    ]);

    // JS Lesson 2 flashcards
    await db.insert(lessonFlashcards).values([
      {
        lessonId: jsLesson2.id,
        flashcardId: jsBasicsFlashcards[1].id,
        orderIndex: 0,
      },
      {
        lessonId: jsLesson2.id,
        flashcardId: jsBasicsFlashcards[3].id,
        orderIndex: 1,
      },
    ]);

    // JS Lesson 3 flashcards
    await db.insert(lessonFlashcards).values([
      {
        lessonId: jsLesson3.id,
        flashcardId: jsAsyncFlashcards[0].id,
        orderIndex: 0,
      },
      {
        lessonId: jsLesson3.id,
        flashcardId: jsAsyncFlashcards[1].id,
        orderIndex: 1,
      },
      {
        lessonId: jsLesson3.id,
        flashcardId: jsAsyncFlashcards[4].id,
        orderIndex: 2,
      },
    ]);

    // JS Lesson 4 flashcards
    await db.insert(lessonFlashcards).values([
      {
        lessonId: jsLesson4.id,
        flashcardId: jsAsyncFlashcards[2].id,
        orderIndex: 0,
      },
      {
        lessonId: jsLesson4.id,
        flashcardId: jsAsyncFlashcards[3].id,
        orderIndex: 1,
      },
    ]);

    // Spanish Lesson 1 flashcards
    await db.insert(lessonFlashcards).values([
      {
        lessonId: spanishLesson1.id,
        flashcardId: spanishVocabFlashcards[0].id,
        orderIndex: 0,
      },
      {
        lessonId: spanishLesson1.id,
        flashcardId: spanishVocabFlashcards[1].id,
        orderIndex: 1,
      },
      {
        lessonId: spanishLesson1.id,
        flashcardId: spanishVocabFlashcards[2].id,
        orderIndex: 2,
      },
      {
        lessonId: spanishLesson1.id,
        flashcardId: spanishVocabFlashcards[3].id,
        orderIndex: 3,
      },
      {
        lessonId: spanishLesson1.id,
        flashcardId: spanishVocabFlashcards[4].id,
        orderIndex: 4,
      },
    ]);

    console.log("✅ Linked all flashcards to lessons\n");

    // ============================================
    // 7. GROUPS
    // ============================================
    console.log("👥 Creating groups...");

    const [jsStudyGroup] = await db
      .insert(groups)
      .values({
        name: "JavaScript Study Group",
        description: "A group for learning JavaScript together",
        adminId: adminUser.id,
      })
      .returning();

    const [spanishLearningGroup] = await db
      .insert(groups)
      .values({
        name: "Spanish Learning Circle",
        description: "Practice Spanish with fellow learners",
        adminId: regularUser1.id,
      })
      .returning();

    console.log("✅ Created 2 groups\n");

    // ============================================
    // 8. GROUP MEMBERS
    // ============================================
    console.log("👤 Adding group members...");

    await db.insert(groupMembers).values([
      // JS Study Group members
      {
        groupId: jsStudyGroup.id,
        userId: adminUser.id,
        role: "admin" as const,
        invitedBy: adminUser.id,
      },
      {
        groupId: jsStudyGroup.id,
        userId: regularUser1.id,
        role: "member" as const,
        invitedBy: adminUser.id,
      },
      {
        groupId: jsStudyGroup.id,
        userId: regularUser2.id,
        role: "member" as const,
        invitedBy: adminUser.id,
      },
      // Spanish Learning Group members
      {
        groupId: spanishLearningGroup.id,
        userId: regularUser1.id,
        role: "admin" as const,
        invitedBy: regularUser1.id,
      },
      {
        groupId: spanishLearningGroup.id,
        userId: regularUser3.id,
        role: "member" as const,
        invitedBy: regularUser1.id,
      },
    ]);

    console.log("✅ Added 5 group memberships\n");

    // ============================================
    // 9. GROUP INVITATIONS
    // ============================================
    console.log("📧 Creating group invitations...");

    const [pendingInvitation] = await db
      .insert(groupInvitations)
      .values({
        groupId: jsStudyGroup.id,
        email: "newuser@example.com",
        role: "member" as const,
        token: generateToken(),
        invitedBy: adminUser.id,
        status: "pending" as const,
        expiresAt: getFutureDate(7),
      })
      .returning();

    const [acceptedInvitation] = await db
      .insert(groupInvitations)
      .values({
        groupId: spanishLearningGroup.id,
        email: regularUser3.email,
        role: "member" as const,
        token: generateToken(),
        invitedBy: regularUser1.id,
        status: "accepted" as const,
        expiresAt: getFutureDate(-1), // Past date
        acceptedAt: new Date(),
      })
      .returning();

    console.log("✅ Created 2 group invitations\n");

    // ============================================
    // 10. INVITATION PATHS
    // ============================================
    console.log("🎯 Linking paths to invitations...");

    await db.insert(invitationPaths).values([
      {
        invitationId: pendingInvitation.id,
        pathId: jsFundamentalsPath.id,
      },
      {
        invitationId: acceptedInvitation.id,
        pathId: spanishBasicsPath.id,
      },
    ]);

    console.log("✅ Linked paths to invitations\n");

    // ============================================
    // 11. GROUP PATHS
    // ============================================
    console.log("📚 Assigning paths to groups...");

    await db.insert(groupPaths).values([
      {
        groupId: jsStudyGroup.id,
        pathId: jsFundamentalsPath.id,
        assignedBy: adminUser.id,
      },
      {
        groupId: jsStudyGroup.id,
        pathId: jsAdvancedPath.id,
        assignedBy: adminUser.id,
      },
      {
        groupId: spanishLearningGroup.id,
        pathId: spanishBasicsPath.id,
        assignedBy: regularUser1.id,
      },
    ]);

    console.log("✅ Assigned paths to groups\n");

    // ============================================
    // 12. GROUP PATH VISIBILITY
    // ============================================
    console.log("👁️  Setting path visibility...");

    await db.insert(groupPathVisibility).values([
      {
        groupId: jsStudyGroup.id,
        pathId: jsFundamentalsPath.id,
        isVisible: true,
      },
      {
        groupId: jsStudyGroup.id,
        pathId: jsAdvancedPath.id,
        isVisible: true,
      },
      {
        groupId: spanishLearningGroup.id,
        pathId: spanishBasicsPath.id,
        isVisible: true,
      },
    ]);

    console.log("✅ Set path visibility\n");

    // ============================================
    // 13. USER PROGRESS
    // ============================================
    console.log("📊 Creating user progress...");

    // John's progress in JS Fundamentals
    const [_johnProgress] = await db
      .insert(userProgress)
      .values({
        userId: regularUser1.id,
        pathId: jsFundamentalsPath.id,
        groupId: jsStudyGroup.id,
        currentUnitId: jsUnit1.id,
        currentLessonId: jsLesson2.id,
        totalXp: 25,
        hearts: 4,
        streakCount: 3,
        lastActivityDate: new Date(),
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        timeSpentTotal: 1800, // 30 minutes
      })
      .returning();

    // Jane's progress in Spanish
    const [_janeProgress] = await db
      .insert(userProgress)
      .values({
        userId: regularUser2.id,
        pathId: spanishBasicsPath.id,
        currentUnitId: spanishUnit1.id,
        currentLessonId: spanishLesson1.id,
        totalXp: 45,
        hearts: 5,
        streakCount: 5,
        lastActivityDate: new Date(),
        startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        timeSpentTotal: 3600, // 1 hour
      })
      .returning();

    console.log("✅ Created user progress records\n");

    // ============================================
    // 14. LESSON COMPLETIONS
    // ============================================
    console.log("✔️  Recording lesson completions...");

    await db.insert(lessonCompletions).values([
      {
        userId: regularUser1.id,
        lessonId: jsLesson1.id,
        xpEarned: 10,
        accuracyPercent: 100,
        timeSpentSeconds: 600,
        heartsRemaining: 5,
      },
      {
        userId: regularUser1.id,
        lessonId: jsLesson2.id,
        xpEarned: 15,
        accuracyPercent: 80,
        timeSpentSeconds: 720,
        heartsRemaining: 4,
      },
      {
        userId: regularUser2.id,
        lessonId: spanishLesson1.id,
        xpEarned: 10,
        accuracyPercent: 90,
        timeSpentSeconds: 480,
        heartsRemaining: 5,
      },
    ]);

    console.log("✅ Created lesson completion records\n");

    // ============================================
    // 15. XP TRANSACTIONS
    // ============================================
    console.log("⭐ Creating XP transactions...");

    await db.insert(xpTransactions).values([
      {
        userId: regularUser1.id,
        pathId: jsFundamentalsPath.id,
        amount: 10,
        sourceType: "lesson_completion" as const,
        sourceId: jsLesson1.id,
      },
      {
        userId: regularUser1.id,
        pathId: jsFundamentalsPath.id,
        amount: 15,
        sourceType: "lesson_completion" as const,
        sourceId: jsLesson2.id,
      },
      {
        userId: regularUser2.id,
        pathId: spanishBasicsPath.id,
        amount: 10,
        sourceType: "lesson_completion" as const,
        sourceId: spanishLesson1.id,
      },
      {
        userId: regularUser2.id,
        pathId: spanishBasicsPath.id,
        amount: 20,
        sourceType: "streak_bonus" as const,
      },
      {
        userId: regularUser2.id,
        pathId: spanishBasicsPath.id,
        amount: 15,
        sourceType: "daily_goal" as const,
      },
    ]);

    console.log("✅ Created XP transaction records\n");

    // ============================================
    // 16. HEARTS TRANSACTIONS
    // ============================================
    console.log("💖 Creating hearts transactions...");

    await db.insert(heartsTransactions).values([
      {
        userId: regularUser1.id,
        amount: -1,
        reason: "wrong_answer" as const,
        lessonId: jsLesson2.id,
      },
      {
        userId: regularUser1.id,
        amount: 5,
        reason: "daily_reset" as const,
      },
      {
        userId: regularUser2.id,
        amount: 5,
        reason: "daily_reset" as const,
      },
    ]);

    console.log("✅ Created hearts transaction records\n");

    // ============================================
    // 17. DAILY STREAKS
    // ============================================
    console.log("🔥 Creating daily streaks...");

    await db.insert(dailyStreaks).values([
      {
        userId: regularUser1.id,
        currentStreak: 3,
        longestStreak: 7,
        lastActivityDate: new Date(),
      },
      {
        userId: regularUser2.id,
        currentStreak: 5,
        longestStreak: 10,
        lastActivityDate: new Date(),
      },
      {
        userId: regularUser3.id,
        currentStreak: 0,
        longestStreak: 2,
        lastActivityDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
    ]);

    console.log("✅ Created daily streak records\n");

    // ============================================
    // 18. USER ACTIVITY LOG
    // ============================================
    console.log("📝 Creating activity logs...");

    await db.insert(userActivityLog).values([
      {
        userId: regularUser1.id,
        groupId: jsStudyGroup.id,
        activityType: "lesson_completed" as const,
        activityDetails: JSON.stringify({
          lessonId: jsLesson1.id,
          lessonName: "Introduction to Variables",
        }),
      },
      {
        userId: regularUser1.id,
        groupId: jsStudyGroup.id,
        activityType: "lesson_completed" as const,
        activityDetails: JSON.stringify({
          lessonId: jsLesson2.id,
          lessonName: "Data Types Deep Dive",
        }),
      },
      {
        userId: regularUser1.id,
        groupId: jsStudyGroup.id,
        activityType: "streak_achieved" as const,
        activityDetails: JSON.stringify({ streakCount: 3 }),
      },
      {
        userId: regularUser2.id,
        activityType: "lesson_completed" as const,
        activityDetails: JSON.stringify({
          lessonId: spanishLesson1.id,
          lessonName: "Basic Greetings",
        }),
      },
      {
        userId: regularUser2.id,
        activityType: "streak_achieved" as const,
        activityDetails: JSON.stringify({ streakCount: 5 }),
      },
      {
        userId: regularUser3.id,
        groupId: spanishLearningGroup.id,
        activityType: "group_joined" as const,
        activityDetails: JSON.stringify({
          groupName: "Spanish Learning Circle",
        }),
      },
    ]);

    console.log("✅ Created activity log entries\n");

    // ============================================
    // 19. GROUP MEMBER ANALYTICS
    // ============================================
    console.log("📈 Creating group analytics...");

    await db.insert(groupMemberAnalytics).values([
      {
        groupId: jsStudyGroup.id,
        userId: regularUser1.id,
        totalLessonsCompleted: 2,
        totalFlashcardsReviewed: 15,
        totalTimeSpent: 1800,
        averageScore: 90,
        lastActivityAt: new Date(),
      },
      {
        groupId: jsStudyGroup.id,
        userId: regularUser2.id,
        totalLessonsCompleted: 0,
        totalFlashcardsReviewed: 0,
        totalTimeSpent: 0,
        averageScore: 0,
      },
      {
        groupId: spanishLearningGroup.id,
        userId: regularUser3.id,
        totalLessonsCompleted: 0,
        totalFlashcardsReviewed: 0,
        totalTimeSpent: 0,
        averageScore: 0,
      },
    ]);

    console.log("✅ Created group analytics\n");

    console.log("\n🎉 Database seeding completed successfully!\n");
    console.log("📋 Summary:");
    console.log("   - 4 users (1 admin, 3 members)");
    console.log("   - 3 domains with 4 categories");
    console.log("   - 18 flashcards");
    console.log("   - 3 learning paths with 3 units and 5 lessons");
    console.log("   - 2 groups with 5 members");
    console.log("   - 2 group invitations");
    console.log("   - User progress and gamification data");
    console.log("   - Activity logs and analytics");
    console.log("\n👤 Test Accounts:");
    console.log("   Admin: admin@learningcards.com / password123");
    console.log("   User 1: john@example.com / password123");
    console.log("   User 2: jane@example.com / password123");
    console.log("   User 3: bob@example.com / password123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seed();
