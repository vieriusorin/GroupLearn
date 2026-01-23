# Learning Cards - Gamified Learning Platform

A comprehensive learning platform built with Next.js, featuring structured learning paths, gamification, group collaboration, and intelligent spaced repetition algorithms. Designed for scalable, enterprise-grade education with a clean domain-driven architecture.

## What We Built

This is a modern, production-ready learning platform with a sophisticated architecture. Here's what makes it special:

### 🎯 Core Learning Features

**Structured Learning Paths**
- **Domains**: Organize content by subject areas (JavaScript, Spanish, Math, etc.)
- **Paths**: Sequential learning journeys within each domain
- **Units**: Logical groupings of lessons with unlock requirements
- **Lessons**: Individual learning sessions with flashcards and interactive content
- **Spaced Repetition**: Intelligent scheduling algorithm for optimal retention
- **Multiple Review Modes**: Flashcards, quizzes, and recall-based learning

**Rich Content Management**
- **Tiptap Rich Text Editor**: Format questions and answers with typography, lists, headings
- **Flashcard CRUD**: Create, read, update, delete with bulk operations
- **Category Organization**: Flexible taxonomy for content classification
- **Visibility Controls**: Public/private paths for controlled access

### 🎮 Gamification System

**Progress & Engagement**
- **XP System**: Earn experience points for completing lessons and reviews
- **Hearts Mechanic**: Limited attempts system with automatic refills
- **Streak Tracking**: Daily activity streaks with automatic reset detection
- **Leaderboards**: Global and group-based competitive rankings
- **Progress Analytics**: Detailed statistics on learning journey

**XP Sources**
- Lesson completion
- Perfect accuracy bonuses
- First-time achievements
- Streak milestones

### 👥 Collaboration Features

**Groups & Teams**
- **Group Management**: Create and administer learning groups
- **Role-Based Access**: Admin and member roles with different permissions
- **Path Assignments**: Assign specific learning paths to groups
- **Invitations System**: Email-based invitations with status tracking
- **Member Progress Tracking**: Monitor individual and group performance
- **Group Analytics**: Aggregate statistics and leaderboards

### 🔐 Authentication & Authorization

**Better Auth Integration**
- Email/password authentication
- OAuth providers ready (Google, GitHub)
- Role-Based Access Control (RBAC)
- Admin, instructor, and member roles
- Subscription status tracking
- Session management

### 📊 Admin Panel

**Administrative Tools**
- User management and role assignment
- Path approval system for gated content
- Analytics dashboard
- Content moderation
- Group oversight

### 🏗️ Architecture Highlights

**Clean Architecture with CQRS**
- **Commands**: Write operations with validation and business rules
- **Queries**: Read operations optimized for performance
- **Handlers**: Dedicated handlers for each command/query
- **Domain Events**: Event-driven architecture for loose coupling

**Domain-Driven Design**
- **Bounded Contexts**: Separate domains (Auth, Content, Learning Path, Gamification, Review, Collaboration)
- **Aggregates**: LessonSession, ReviewSession, UserProgress
- **Entities**: Domain models with identity and lifecycle
- **Value Objects**: Immutable objects for domain concepts (Hearts, XP, Progress, Accuracy)
- **Repositories**: Abstract data access with interface-based design
- **Services**: Domain and application services for complex operations

**Infrastructure Layer**
- PostgreSQL database with connection pooling
- Drizzle ORM with type-safe queries
- Schema migrations with Drizzle Kit
- Transaction support for data integrity
- Repository implementations with optimized queries

**Presentation Layer**
- Server Actions for type-safe mutations
- React Server Components for optimal performance
- Client-side state with TanStack Query
- URL state management with nuqs
- Form validation with React Hook Form + Zod

### ⚡ Performance & Developer Experience

**Background Jobs**
- Trigger.dev integration for async tasks
- Heart refill automation
- Streak checking and reset
- Email notifications (ready for implementation)
- Analytics processing

**Development Tools**
- Biome for fast linting and formatting
- TypeScript strict mode for type safety
- Docker Compose for local PostgreSQL
- Hot module replacement
- Database migrations and seeding scripts

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager
- Docker and Docker Compose (for database)

### Database Setup

The easiest way to set up PostgreSQL is using Docker:

1. **Start the database:**
   ```bash
   docker-compose up -d
   ```

2. **Copy environment variables:**
   ```bash
   cp .env.example .env.local
   ```

3. **Run database migrations:**
   ```bash
   npm run init:schema
   ```

4. **(Optional) Seed test data:**
   ```bash
   npm run seed:db
   ```
   This creates test users, learning paths, groups, and sample content. See [SEEDING_GUIDE.md](./SEEDING_GUIDE.md) for details.

The Docker setup provides:
- PostgreSQL 16 on port 5432
- Database name: `learning_cards`
- Default credentials: `postgres/postgres`
- Persistent data storage in Docker volume
- Health checks for reliability

To stop the database:
```bash
docker-compose down
```

To stop and remove data:
```bash
docker-compose down -v
```

### Installation

Once the database is running:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000` (or another port if 3000 is in use).

## Usage Guide

### 1. Create Your First Domain
1. Navigate to "Manage Domains" from the dashboard
2. Click "Create Domain"
3. Enter a name (e.g., "JavaScript") and optional description
4. Click "Create Domain"

### 2. Add Categories
1. Select your domain from the list
2. Click "Create Category"
3. Enter category details (e.g., "Arrays", "Functions", "Async Programming")
4. Click "Create Category"

### 3. Create Flashcards
1. Click "Manage Cards" on a category
2. Click "Create Flashcard"
3. Enter your question and answer
4. Set difficulty level (easy, medium, hard)
5. Click "Create Flashcard"

### 4. Start Reviewing
1. Return to the dashboard
2. Click "Start Review"
3. Choose your preferred review mode:
   - **Flashcard**: Read the question, flip to see the answer, mark correct/incorrect
   - **Quiz**: Select from multiple-choice options
   - **Recall**: Type your answer, then compare with the correct answer
4. Complete your session!

## Key Concepts

### Spaced Repetition Algorithm

The `SpacedRepetitionService` implements an intelligent review scheduling system:

1. **Initial Review**: New cards start with a 1-day interval
2. **Correct Answer**: Interval doubles (1d → 3d → 7d → 14d → 30d...)
3. **Incorrect Answer**: Card resets to 1-day interval
4. **Struggling Queue**: Cards failed multiple times get priority review
5. **Review History**: Complete audit trail of all reviews

Benefits:
- Optimal retention with minimal study time
- Automatic adaptation to individual learning pace
- Priority system for difficult material

### Learning Path Structure

**Hierarchical Organization**:
```
Domain (e.g., "JavaScript")
  └─ Path (e.g., "ES6 Fundamentals")
      └─ Unit (e.g., "Arrow Functions")
          └─ Lesson (e.g., "Basic Syntax")
              └─ Flashcards (e.g., 10 cards)
```

**Unlock Mechanics**:
- **Sequential Unlocking**: Complete previous lessons to unlock next
- **XP Requirements**: Minimum XP to access advanced paths
- **Admin Approval**: Gated content requiring instructor approval
- **Time-Based**: Delayed access after enrollment

### XP & Hearts System

**XP (Experience Points)**:
- Lesson completion: 10 XP base
- Perfect accuracy bonus: +5 XP
- Streak milestones: bonus XP
- First-time achievements: bonus XP

**Hearts (Life System)**:
- Start with 5 hearts
- Lose 1 heart per incorrect answer in lessons
- Automatic refill to max after 24 hours
- Cannot start lessons with 0 hearts
- Premium: Unlimited hearts (subscription feature)

**Streaks**:
- Daily activity tracking
- Streak bonus XP multipliers
- Automatic reset detection with grace period
- Visualization on dashboard

### Group Collaboration

**Use Cases**:
- **Classroom**: Teachers assign paths to students
- **Corporate Training**: Track team learning progress
- **Study Groups**: Shared learning goals and leaderboards

**Features**:
- Role-based permissions (admin can manage, members can learn)
- Group-specific leaderboards
- Aggregate analytics for instructors
- Path visibility controls (show/hide from group)

## Architecture & Project Structure

This project follows **Clean Architecture** principles with **Domain-Driven Design** (DDD) and **CQRS** (Command Query Responsibility Segregation) patterns.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│           Presentation Layer (Next.js App)          │
│  - Pages (RSC)                                      │
│  - Server Actions                                   │
│  - API Routes                                       │
│  - Client Components                                │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│           Application Layer (Use Cases)             │
│  - Commands (Write Operations)                      │
│  - Queries (Read Operations)                        │
│  - DTOs (Data Transfer Objects)                     │
│  - Validators                                       │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              Domain Layer (Business Logic)          │
│  - Entities (Identity + Lifecycle)                  │
│  - Aggregates (Consistency Boundaries)              │
│  - Value Objects (Immutable Concepts)               │
│  - Domain Events                                    │
│  - Domain Services                                  │
│  - Repository Interfaces                            │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│           Infrastructure Layer (Technical)          │
│  - Database (Drizzle ORM + PostgreSQL)              │
│  - Repositories (Implementations)                   │
│  - External Services (Email, Storage)               │
│  - Authentication (Better Auth)                     │
└─────────────────────────────────────────────────────┘
```

### Directory Structure

```
src/
├── app/                          # Next.js App Router (Presentation)
│   ├── api/auth/                 # Better Auth API routes
│   ├── admin/                    # Admin panel pages
│   ├── domains/                  # Domain management UI
│   ├── groups/                   # Group collaboration UI
│   ├── lesson/[id]/              # Lesson learning interface
│   ├── review/                   # Review session UI
│   └── page.tsx                  # Dashboard home
│
├── application/                  # Application Layer
│   ├── dtos/                     # Data Transfer Objects
│   │   ├── auth.dto.ts
│   │   ├── gamification.dto.ts
│   │   └── ...
│   └── validators/               # Validation schemas
│
├── commands/                     # CQRS Commands (Write)
│   ├── auth/                     # Authentication commands
│   ├── content/                  # Content management commands
│   ├── groups/                   # Group commands
│   ├── lesson/                   # Lesson commands
│   ├── progress/                 # Progress tracking commands
│   ├── review/                   # Review commands
│   └── handlers/                 # Command handlers
│       ├── auth/
│       ├── content/
│       ├── groups/
│       └── ...
│
├── queries/                      # CQRS Queries (Read)
│   ├── admin/                    # Admin queries
│   ├── auth/                     # Auth queries
│   ├── content/                  # Content queries
│   ├── groups/                   # Group queries
│   ├── lesson/                   # Lesson queries
│   ├── paths/                    # Learning path queries
│   ├── progress/                 # Progress queries
│   ├── review/                   # Review queries
│   ├── stats/                    # Statistics queries
│   └── handlers/                 # Query handlers
│       ├── admin/
│       ├── content/
│       └── ...
│
├── domains/                      # Domain Layer (DDD)
│   ├── auth/                     # Authentication domain
│   │   ├── auth-service.ts
│   │   └── auth-types.ts
│   │
│   ├── content/                  # Content management domain
│   │   ├── entities/             # Domain entities
│   │   │   └── Flashcard.ts
│   │   └── repositories/         # Repository interfaces
│   │       ├── IDomainRepository.ts
│   │       └── IFlashcardRepository.ts
│   │
│   ├── learning-path/            # Learning path domain
│   │   ├── aggregates/           # Aggregates (consistency boundaries)
│   │   │   └── LessonSession.ts
│   │   ├── entities/
│   │   │   └── LessonCompletion.ts
│   │   ├── events/               # Domain events
│   │   │   └── LessonEvents.ts
│   │   ├── repositories/
│   │   │   ├── ILessonRepository.ts
│   │   │   └── ISessionRepository.ts
│   │   ├── services/             # Domain services
│   │   │   └── XPCalculationService.ts
│   │   └── value-objects/        # Value objects
│   │       ├── Answer.ts
│   │       ├── Accuracy.ts
│   │       └── Progress.ts
│   │
│   ├── gamification/             # Gamification domain
│   │   ├── aggregates/
│   │   │   └── UserProgress.ts
│   │   ├── entities/
│   │   │   └── UserProgress.ts
│   │   ├── events/
│   │   │   └── ProgressEvents.ts
│   │   ├── repositories/
│   │   │   └── IUserProgressRepository.ts
│   │   ├── services/
│   │   │   └── HeartRefillService.ts
│   │   └── value-objects/
│   │       └── Hearts.ts
│   │
│   ├── review/                   # Review domain
│   │   ├── aggregates/
│   │   │   └── ReviewSession.ts
│   │   ├── events/
│   │   │   └── ReviewEvents.ts
│   │   ├── repositories/
│   │   │   └── IReviewHistoryRepository.ts
│   │   ├── services/
│   │   │   └── SpacedRepetitionService.ts
│   │   └── value-objects/
│   │       └── ReviewInterval.ts
│   │
│   ├── collaboration/            # Group collaboration domain
│   │
│   └── shared/                   # Shared domain concepts
│       ├── errors/
│       │   ├── DomainError.ts
│       │   └── ValidationError.ts
│       └── types/
│           └── branded-types.ts
│
├── infrastructure/               # Infrastructure Layer
│   ├── database/
│   │   ├── schema/               # Drizzle ORM schemas
│   │   │   ├── auth.schema.ts
│   │   │   ├── content.schema.ts
│   │   │   ├── learning-path.schema.ts
│   │   │   ├── gamification.schema.ts
│   │   │   ├── groups.schema.ts
│   │   │   ├── analytics.schema.ts
│   │   │   ├── enums.ts
│   │   │   └── zod-schemas.ts
│   │   ├── db.ts                 # Database connection
│   │   ├── drizzle.ts            # Drizzle instance
│   │   └── transactions.ts       # Transaction support
│   │
│   ├── repositories/             # Repository implementations
│   │   └── lesson/
│   │       └── InMemorySessionRepository.ts
│   │
│   └── mappers/                  # Data mappers (DB ↔ Domain)
│
├── presentation/                 # Presentation utilities
│   ├── actions/                  # Server Actions
│   │   ├── admin/
│   │   ├── content/
│   │   ├── groups/
│   │   ├── lesson/
│   │   ├── paths/
│   │   ├── progress/
│   │   ├── review/
│   │   └── stats/
│   ├── types/
│   │   └── action-result.ts
│   └── utils/
│
├── components/                   # React Components
│   ├── admin/                    # Admin-specific components
│   ├── auth/                     # Auth forms and UI
│   ├── domains/                  # Domain management UI
│   ├── flashcards/               # Flashcard components
│   ├── gamification/             # XP, hearts, streak UI
│   ├── groups/                   # Group collaboration UI
│   ├── lesson/                   # Lesson learning interface
│   ├── path/                     # Learning path navigation
│   ├── progress/                 # Progress visualizations
│   ├── review/                   # Review session components
│   ├── settings/                 # User settings
│   ├── layout/                   # Layout components
│   ├── mascot/                   # Mascot animations
│   └── ui/                       # shadcn/ui primitives
│
├── lib/                          # Shared library code
│   ├── auth/                     # Auth utilities
│   │   ├── auth.ts               # Auth helpers
│   │   ├── better-auth.ts        # Better Auth instance
│   │   ├── authorization.ts      # Authorization helpers
│   │   ├── rbac.ts               # Role-based access control
│   │   └── auth-middleware.ts
│   ├── content/                  # Content utilities
│   ├── gamification/             # Gamification helpers
│   ├── review/                   # Review utilities
│   ├── infrastructure/           # Infrastructure utilities
│   │   ├── api-utils.ts
│   │   └── db.ts
│   └── shared/                   # Shared utilities
│       ├── utils.ts
│       ├── validation.ts
│       └── preferences.ts
│
├── hooks/                        # React hooks
│   ├── auth/                     # Auth hooks
│   │   └── useAuthSession.ts
│   ├── admin/                    # Admin hooks
│   └── usePreferences.ts
│
├── trigger/                      # Trigger.dev background jobs
│   └── example.ts                # Example task
│
├── types/                        # Global TypeScript types
│   ├── admin.ts
│   ├── invitation.ts
│   └── next-auth.d.ts
│
└── contexts/                     # React contexts
```

### Key Architecture Patterns

**CQRS (Command Query Responsibility Segregation)**
- **Commands**: Handle write operations (create, update, delete)
  - Each command has a corresponding handler
  - Validates input, applies business rules, emits events
  - Example: `CreateFlashcard.command.ts` → `CreateFlashcardHandler.ts`

- **Queries**: Handle read operations (fetch data)
  - Optimized for reading, separate from write models
  - No side effects, can be cached
  - Example: `GetFlashcards.query.ts` → `GetFlashcardsHandler.ts`

**Domain-Driven Design (DDD)**
- **Bounded Contexts**: Separate domains with clear boundaries
- **Aggregates**: Consistency boundaries (e.g., LessonSession)
- **Entities**: Objects with identity (e.g., Flashcard)
- **Value Objects**: Immutable concepts (e.g., Hearts, Accuracy)
- **Repository Pattern**: Abstract data access
- **Domain Events**: Communicate between domains

**Clean Architecture Benefits**
- **Testability**: Easy to test business logic in isolation
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to add new features without touching existing code
- **Flexibility**: Swap implementations (e.g., change database)
- **Team Collaboration**: Different teams can work on different layers

## Database Schema

The app uses **PostgreSQL 16** with **Drizzle ORM**. Schema files are located in `src/infrastructure/database/schema/`.

### Schema Modules

**Authentication (`auth.schema.ts`)**
- `users` - User accounts with Better Auth integration
- `sessions` - Active user sessions
- `accounts` - OAuth provider accounts
- `verifications` - Email verification tokens

**Content Management (`content.schema.ts`)**
- `domains` - Top-level subject areas (JavaScript, Math, etc.)
- `categories` - Sub-topics within domains
- `flashcards` - Individual learning cards with rich content

**Learning Paths (`learning-path.schema.ts`)**
- `paths` - Structured learning journeys
- `units` - Logical groupings of lessons
- `lessons` - Individual learning sessions
- `lesson_flashcards` - Flashcards assigned to lessons
- `lesson_completions` - Student completion records
- `path_approvals` - Admin-gated access approvals
- `unlock_requirements` - Prerequisites for accessing content

**Gamification (`gamification.schema.ts`)**
- `user_progress` - XP, hearts, streaks, current position
- `xp_transactions` - History of XP gains with sources
- `hearts_transactions` - Heart usage and refills
- `streak_history` - Daily activity tracking

**Groups (`groups.schema.ts`)**
- `groups` - Learning teams/classes
- `group_members` - Membership with roles (admin/member)
- `group_invitations` - Email-based invitations with status
- `group_paths` - Paths assigned to groups with visibility

**Analytics (`analytics.schema.ts`)**
- `review_history` - Historical review data
- `struggling_queue` - Cards needing extra attention
- `activity_logs` - User action tracking

**Enums (`enums.ts`)**
- Shared enumerations across schemas
- Type-safe constants for status, roles, sources

### Database Features

- **Foreign Keys**: Referential integrity with cascade deletes
- **Indexes**: Optimized for common query patterns
- **Timestamps**: `createdAt` and `updatedAt` tracking
- **Soft Deletes**: Optional for audit trails
- **Transactions**: ACID compliance for data consistency
- **Type Safety**: Drizzle generates TypeScript types from schema

### Migrations

Managed by Drizzle Kit in `drizzle/migrations/`:
```bash
npx drizzle-kit generate    # Generate migration from schema changes
npx drizzle-kit push        # Push schema directly (dev only)
npx drizzle-kit studio      # Open visual database browser
```

## Tech Stack

### Core Framework
- **Next.js 16** - React framework with App Router and Server Components
- **React 19** - Latest React with improved performance and concurrent features
- **TypeScript 5** - Strict type safety across the entire codebase

### State Management & Data Fetching
- **TanStack Query v5** - Powerful async state management with caching, refetching, and optimistic updates
- **nuqs** - Type-safe URL state management with Next.js integration
- **React Hook Form** - Performant form handling with validation

### Database & ORM
- **PostgreSQL 16** - Robust relational database with advanced features
- **Drizzle ORM 0.45** - Lightweight, type-safe ORM with excellent DX
- **Drizzle Kit** - Schema migrations and database introspection
- **pg** - Native PostgreSQL driver

### Authentication & Authorization
- **Better Auth 1.4** - Modern auth library with session management
- **Custom RBAC** - Role-based access control with admin/instructor/member roles
- **bcryptjs** - Secure password hashing

### UI & Styling
- **Tailwind CSS v4** - Utility-first CSS with modern features
- **shadcn/ui** - High-quality, accessible component library
- **Radix UI** - Unstyled, accessible UI primitives
- **Framer Motion** - Production-ready animation library
- **Lucide React** - Beautiful, consistent icon set
- **@tailwindcss/typography** - Beautiful typographic defaults
- **canvas-confetti** - Celebration animations for achievements

### Rich Text Editing
- **Tiptap 3.15** - Headless rich text editor
- **DOMPurify** - XSS protection for HTML content

### Background Jobs
- **Trigger.dev v4** - Reliable background job processing
- **Scheduled Tasks**: Heart refills, streak resets, analytics
- **Event-Driven**: Async operations for scalability

### Drag & Drop
- **@dnd-kit** - Modern drag-and-drop toolkit for lesson ordering

### Validation
- **Zod 4.3** - TypeScript-first schema validation
- **drizzle-zod** - Generate Zod schemas from Drizzle tables

### Development Tools
- **Biome 2.2** - Fast linter and formatter (Prettier + ESLint replacement)
- **tsx** - TypeScript execution for scripts
- **dotenv** - Environment variable management

### Email (Ready for Integration)
- **Resend** - Modern email API
- **Mailgun.js** - Alternative email provider

### Deployment
- Docker Compose for local development
- Vercel-ready configuration
- Edge-compatible code

## Development Commands

```bash
# Development
npm run dev                   # Start Next.js dev server
npm run build                 # Build for production
npm run start                 # Start production server

# Code Quality
npm run lint                  # Run Biome linter
npm run lint:fix              # Auto-fix linting issues
npm run format                # Format code with Biome
npm run type-check            # TypeScript type checking

# Database
docker-compose up -d          # Start PostgreSQL container
docker-compose down           # Stop database
docker-compose down -v        # Stop and remove data
npm run seed:db               # Seed test data
npm run reset:db              # Reset database (prompts for confirmation)
npm run reset:db:force        # Force reset without confirmation
npx drizzle-kit generate      # Generate migration from schema
npx drizzle-kit push          # Push schema to database (dev only)
npx drizzle-kit studio        # Open Drizzle Studio GUI

# Background Jobs (Trigger.dev)
npx trigger.dev@latest dev    # Start local Trigger.dev development
npx trigger.dev@latest deploy # Deploy tasks to Trigger.dev

# Utilities
tsx tools/seed-database.ts    # Run seeding script directly
tsx tools/reset-database.ts   # Run reset script directly
```

## Tips for Effective Learning

1. **Consistency is Key**: Review cards daily to maintain your streak
2. **Small Goals**: Start with 10-20 cards per day
3. **Use All Modes**: Switch between flashcard, quiz, and recall modes for variety
4. **Don't Skip Reviews**: The spaced repetition algorithm works best when you review on schedule
5. **Organize Well**: Take time to create clear categories - it helps with context and recall
6. **Quality Over Quantity**: Focus on understanding, not just memorization

## Multi-Agent Code Review System

This project includes an AI-powered multi-agent orchestration system for automated code reviews. Claude Code acts as the orchestrator, coordinating specialist agents to provide comprehensive feedback.

### Architecture

The agent system uses **6 specialist agents** coordinated by Claude Code:

| Agent | Focus Area | When to Use |
|-------|-----------|-------------|
| 🎨 **Design System** | UI consistency, Tailwind conventions, component patterns | UI changes, new components |
| 🏗️ **Domain-Driven Design** | Domain boundaries, layering, business logic | API changes, domain logic |
| ✅ **Best Practices** | Next.js/React patterns, TypeScript, code quality | All code changes |
| ♿ **Accessibility** | WCAG 2.2 AA compliance, keyboard navigation | Forms, interactive elements |
| 🔒 **Security** | Injection risks, input validation, auth | API endpoints, data handling |
| ⚡ **Performance** | Optimization, caching, bundle size | Slow features, data-heavy code |

### Quick Start

Simply ask Claude Code in your conversation:

```
"Review my new flashcard component for accessibility issues"
"Do a security audit of the API routes"
"Check if the new feature follows best practices"
"Review src/app/review/page.tsx with all agents"
```

Claude Code will automatically:
1. Select relevant specialist agents for your request
2. Apply each agent's checklist to your code
3. Synthesize findings into a prioritized report
4. Provide actionable suggestions with code examples

### Common Review Requests

**Review specific file:**
```
"Review src/app/api/flashcards/route.ts for security and best practices"
```

**Review a feature:**
```
"I just implemented dark mode. Review all related files for accessibility."
```

**Pre-commit check:**
```
"Review my uncommitted changes before I commit"
```

**Focused audit:**
```
"Do a complete security audit of all API routes"
```

### Agent Definitions

All agents are defined as markdown files in `.claude/agents/`:
- `design-system.md` - UI consistency checklist
- `domain-driven-design.md` - Architecture patterns
- `best-practices.md` - Next.js/React guidelines
- `accessibility.md` - WCAG compliance checks
- `security.md` - Vulnerability detection
- `performance.md` - Optimization opportunities

See [`.claude/README.md`](./.claude/README.md) for complete documentation.

### Advanced: Standalone Orchestrator

For CI/CD or command-line usage, use the TypeScript orchestrators:

**Claude-powered (recommended):**
```bash
# Set API key
export ANTHROPIC_API_KEY=your_api_key_here

# Review specific files
npm run agents:claude -- --task "Security review" --files src/app/api

# Review entire codebase
npm run agents:claude -- --task "Full audit"
```

**OpenAI-powered (alternative):**
```bash
export OPENAI_API_KEY=your_api_key_here
npm run agents:review -- --task "Review changes" --files src/app
```

### Customization

**Modify agent checklists:**
Edit files in `.claude/agents/` to adjust:
- Priorities for your project
- Specific patterns to enforce
- Custom checklist items

**Add project-specific rules:**
Create `.claude/PROJECT_RULES.md` with your team's conventions

**Adjust orchestration:**
See `.claude/ORCHESTRATOR.md` for agent coordination guidelines

### CI/CD Integration

Add to GitHub Actions:
```yaml
- name: Run Agent Review
  run: npm run agents:claude -- --task "PR Review" --files src/
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

## What's Ready & What's Next

### ✅ Fully Implemented

- Complete CQRS architecture with Commands and Queries
- Domain-Driven Design with 6 bounded contexts
- Learning paths with units and lessons
- Flashcard CRUD with rich text support
- Spaced repetition algorithm
- XP, hearts, and streak gamification
- Group collaboration with invitations
- Role-based access control (RBAC)
- Admin panel with user management
- Progress tracking and analytics
- Leaderboards (global and group)
- PostgreSQL database with migrations
- Better Auth integration
- Trigger.dev for background jobs
- Docker Compose for local development
- Type-safe API with Server Actions
- Responsive UI with Tailwind CSS v4

### 🚧 Ready for Implementation (Hooks Exist)

These features have the infrastructure in place but need UI/logic completion:

- **Email Notifications**: Trigger.dev tasks ready, need email templates
  - Invitation emails (Resend/Mailgun configured)
  - Streak reminders
  - Achievement notifications

- **Trigger.dev Background Jobs**: Config ready, need task implementations
  - Heart refill automation
  - Daily streak checking
  - Analytics processing
  - Batch email sending

### 🎯 Future Enhancements

**Content**
- Image/video support in flashcards
- Audio pronunciation for language learning
- LaTeX math rendering
- Code syntax highlighting
- Import/export flashcard decks (Anki format)

**Learning Features**
- AI-generated flashcards from text
- Spaced repetition parameter tuning
- Custom review intervals per user
- Study reminders and notifications
- Offline mode with sync

**Gamification**
- Badges and achievements system
- Customizable avatars
- Seasonal challenges
- Tournaments and competitions
- Power-ups and boosters

**Collaboration**
- Real-time collaborative editing
- Public deck marketplace
- Deck sharing with friends
- Group chat/discussion forums
- Peer review system

**Analytics**
- Detailed learning analytics dashboard
- Retention curve visualization
- Time spent tracking
- Difficulty analysis
- Performance predictions

**Mobile**
- Native iOS/React Native app
- Native Android app
- Progressive Web App (PWA) enhancements

**Enterprise**
- SSO integration (SAML, Azure AD)
- LMS integration (Canvas, Moodle, Blackboard)
- Advanced reporting for organizations
- White-labeling options
- Dedicated infrastructure

## Why This Architecture?

### Clean Architecture Benefits

**For Development**:
- Each layer can be developed and tested independently
- Business logic is isolated from frameworks and UI
- Easy to onboard new developers with clear boundaries
- Reduces cognitive load by organizing code by domain

**For Testing**:
- Unit test domain logic without database or UI
- Mock repositories and services at boundaries
- Integration tests at the infrastructure layer
- E2E tests at the presentation layer

**For Scalability**:
- Easy to extract domains into microservices later
- Can swap databases without touching business logic
- Multiple teams can work on different domains
- Clear contracts between layers prevent conflicts

**For Maintenance**:
- Find code quickly with predictable structure
- Changes isolated to specific layers
- Refactoring is safer with explicit dependencies
- Technical debt is easier to identify and fix

### CQRS Benefits

**Performance**:
- Read and write operations optimized separately
- Queries can use denormalized views
- Commands handle complex business rules
- Can scale reads and writes independently

**Clarity**:
- Clear intent: this command changes state, this query fetches data
- No accidental side effects in queries
- Easier to track what operations modify data
- Better audit logging and event sourcing

**Security**:
- Fine-grained permissions per command
- Read-only queries can't mutate state
- Command validation in one place
- Easier to implement authorization

## Contributing

This is a learning project showcasing modern architectural patterns. Feel free to:
- Fork and experiment with the architecture
- Add new features following the established patterns
- Refactor and improve the domain models
- Add tests to demonstrate the testability benefits
- Create issues for discussion of architectural decisions

## License

MIT License - feel free to use this project for learning or as a base for your own applications!

---

**Built with clean architecture principles, domain-driven design, and modern TypeScript patterns. A comprehensive example of how to structure a scalable, maintainable Next.js application. 🏗️✨**
