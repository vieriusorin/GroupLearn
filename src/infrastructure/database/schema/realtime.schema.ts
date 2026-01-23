/**
 * Real-Time & Presence Schema
 *
 * Database schema for Socket.io presence tracking and real-time features
 */

import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  varchar,
  jsonb,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './auth.schema';
import { groups } from './groups.schema';

/**
 * Online Presence Tracking
 *
 * Tracks which users are currently online and their status
 */
export const onlinePresence = pgTable(
  'online_presence',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    groupId: integer('group_id').references(() => groups.id, { onDelete: 'cascade' }),
    sessionId: text('session_id'), // For live quiz sessions
    status: varchar('status', {
      length: 20,
      enum: ['online', 'away', 'offline'],
    })
      .notNull()
      .default('online'),
    lastSeen: timestamp('last_seen').notNull().defaultNow(),
    metadata: jsonb('metadata').$type<{
      currentActivity?: string;
      currentPath?: number;
      socketId?: string;
    }>(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('presence_user_idx').on(table.userId),
    groupIdIdx: index('presence_group_idx').on(table.groupId),
    sessionIdIdx: index('presence_session_idx').on(table.sessionId),
    statusIdx: index('presence_status_idx').on(table.status),
    lastSeenIdx: index('presence_last_seen_idx').on(table.lastSeen),
  })
);

/**
 * Live Sessions
 *
 * Manages live collaborative learning sessions (Blitz Quiz, Study Rooms)
 */
export const liveSessions = pgTable(
  'live_sessions',
  {
    id: serial('id').primaryKey(),
    sessionType: varchar('session_type', {
      length: 50,
      enum: ['blitz_quiz', 'study_room', 'peer_review'],
    }).notNull(),
    groupId: integer('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    hostId: text('host_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id'), // Source of flashcards
    config: jsonb('config').$type<{
      cardCount: number;
      timeLimit: number; // Seconds per card
      allowHints: boolean;
      difficulty?: 'easy' | 'medium' | 'hard';
    }>(),
    status: varchar('status', {
      length: 20,
      enum: ['waiting', 'active', 'completed', 'cancelled'],
    })
      .notNull()
      .default('waiting'),
    currentCardIndex: integer('current_card_index').notNull().default(0),
    selectedFlashcards: jsonb('selected_flashcards').$type<number[]>(), // IDs of flashcards
    startedAt: timestamp('started_at'),
    endedAt: timestamp('ended_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    groupIdIdx: index('live_sessions_group_idx').on(table.groupId),
    hostIdIdx: index('live_sessions_host_idx').on(table.hostId),
    statusIdx: index('live_sessions_status_idx').on(table.status),
    createdAtIdx: index('live_sessions_created_idx').on(table.createdAt),
  })
);

/**
 * Live Session Participants
 *
 * Tracks who joined each live session
 */
export const liveSessionParticipants = pgTable(
  'live_session_participants',
  {
    id: serial('id').primaryKey(),
    sessionId: integer('session_id')
      .notNull()
      .references(() => liveSessions.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    joinedAt: timestamp('joined_at').notNull().defaultNow(),
    leftAt: timestamp('left_at'),
    totalScore: integer('total_score').notNull().default(0),
    correctAnswers: integer('correct_answers').notNull().default(0),
    totalAnswers: integer('total_answers').notNull().default(0),
    averageResponseTime: integer('average_response_time').notNull().default(0), // Milliseconds
    rank: integer('rank'),
  },
  (table) => ({
    sessionIdIdx: index('live_participants_session_idx').on(table.sessionId),
    userIdIdx: index('live_participants_user_idx').on(table.userId),
    sessionUserIdx: index('live_participants_session_user_idx').on(table.sessionId, table.userId),
  })
);

/**
 * Live Session Answers
 *
 * Records each answer submitted during a live session
 */
export const liveSessionAnswers = pgTable(
  'live_session_answers',
  {
    id: serial('id').primaryKey(),
    sessionId: integer('session_id')
      .notNull()
      .references(() => liveSessions.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    flashcardId: integer('flashcard_id').notNull(),
    answer: text('answer'), // For text-based answers
    isCorrect: boolean('is_correct').notNull(),
    responseTimeMs: integer('response_time_ms').notNull(),
    pointsEarned: integer('points_earned').notNull(),
    cardIndex: integer('card_index').notNull(), // Position in session
    submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  },
  (table) => ({
    sessionIdIdx: index('live_answers_session_idx').on(table.sessionId),
    userIdIdx: index('live_answers_user_idx').on(table.userId),
    flashcardIdIdx: index('live_answers_flashcard_idx').on(table.flashcardId),
    sessionUserIdx: index('live_answers_session_user_idx').on(table.sessionId, table.userId),
  })
);

// Type exports
export type OnlinePresence = typeof onlinePresence.$inferSelect;
export type NewOnlinePresence = typeof onlinePresence.$inferInsert;

export type LiveSession = typeof liveSessions.$inferSelect;
export type NewLiveSession = typeof liveSessions.$inferInsert;

export type LiveSessionParticipant = typeof liveSessionParticipants.$inferSelect;
export type NewLiveSessionParticipant = typeof liveSessionParticipants.$inferInsert;

export type LiveSessionAnswer = typeof liveSessionAnswers.$inferSelect;
export type NewLiveSessionAnswer = typeof liveSessionAnswers.$inferInsert;
