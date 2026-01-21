# Learning Cards - Spaced Repetition System

A powerful flashcard learning application built with Next.js, featuring spaced repetition, multiple review modes, and intelligent progress tracking.

## Features

### 🎯 Core Learning Features
- **Spaced Repetition**: Automatically schedules card reviews at 1, 3, and 7-day intervals for optimal long-term retention
- **Rich Text Editor**: Format flashcard answers with bold, italic, lists, headings, and proper spacing
- **Multiple Review Modes**:
  - **Flashcard**: Classic flip-card experience
  - **Quiz**: Multiple-choice questions for active recall
  - **Recall**: Write answers from memory and self-assess
- **Struggling Queue**: Automatically tracks cards you miss and prioritizes them for review
- **Daily Goals**: Set and track daily review targets to maintain consistency

### 📊 Organization & Progress
- **Domain-Based Organization**: Group learning materials by subject (e.g., JavaScript, Spanish, Biology)
- **Categories**: Further organize flashcards within each domain
- **Progress Tracking**: Visual progress bars showing mastery level for each domain
- **Streak Counter**: Track your daily learning streak
- **Dashboard**: Comprehensive overview of your learning stats

### 🎨 Technical Features
- Built with **Next.js 15** (App Router)
- **TanStack Query** for efficient data fetching and caching
- **nuqs** for URL state management
- **PostgreSQL** database with **Drizzle ORM** for reliable data storage
- **shadcn/ui** components with **Tailwind CSS** for a beautiful, responsive UI
- Full **TypeScript** support

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

## How Spaced Repetition Works

The app uses a proven spaced repetition algorithm:

1. **New Card**: First review scheduled in **1 day**
2. **Correct Answer**: Interval increases to **3 days**
3. **Correct Again**: Interval increases to **7 days** (mastered!)
4. **Incorrect Answer**: Card resets to **1 day** AND is added to the struggling queue

Cards marked incorrect multiple times stay in the struggling queue until you consistently answer them correctly.

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes for database operations
│   │   ├── domains/
│   │   ├── categories/
│   │   ├── flashcards/
│   │   ├── review/
│   │   └── stats/
│   ├── domains/          # Domain management page
│   ├── flashcards/       # Flashcard creation page
│   ├── review/           # Review session page
│   └── page.tsx          # Dashboard (home page)
├── components/
│   ├── providers.tsx     # TanStack Query & nuqs providers
│   └── ui/               # shadcn/ui components
└── lib/
    ├── db.ts             # Database initialization
    ├── db-operations.ts  # CRUD operations
    ├── spaced-repetition.ts  # Learning algorithm
    ├── types.ts          # TypeScript types
    └── utils.ts          # Utility functions
```

## Database Schema

The app uses PostgreSQL with Drizzle ORM. Schema files are located in `src/infrastructure/database/schema/`.

Key tables:
- **users**: User accounts and authentication
- **domains**: Top-level learning areas
- **categories**: Sub-topics within domains
- **flashcards**: Individual cards with questions and answers
- **review_history**: Records of all review sessions
- **struggling_queue**: Cards that need extra attention

Database migrations are managed by Drizzle Kit and stored in `drizzle/migrations/`.

## Technologies Used

- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type-safe development
- **TanStack Query v5**: Server state management
- **nuqs**: URL state management
- **PostgreSQL**: Relational database
- **Drizzle ORM**: Type-safe database toolkit
- **Better Auth**: Authentication and authorization
- **Tiptap**: Rich text editor for formatted content
- **Tailwind CSS v4**: Utility-first styling
- **@tailwindcss/typography**: Beautiful typography styles
- **shadcn/ui**: Pre-built UI components
- **Biome**: Fast linter and formatter

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code
npm run format

# Database commands
docker-compose up -d          # Start database
docker-compose down           # Stop database
npm run init:schema           # Initialize database schema
npm run seed:db               # Seed database with test data
npx drizzle-kit generate      # Generate migrations
npx drizzle-kit studio        # Open Drizzle Studio (database GUI)

# Admin tools
npm run make:admin            # Make a user admin
npm run check:db              # Check database connection
npm run check:auth            # Check authentication setup
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

## Future Enhancements

Potential features for future development:
- Import/export flashcard decks
- Image support for flashcards
- Audio pronunciation for language learning
- Collaborative decks and sharing
- Mobile app version
- Statistics and analytics dashboard
- Custom spaced repetition intervals
- Tags for cross-category organization

## License

MIT License - feel free to use this project for learning or as a base for your own applications!

---

**Happy Learning! 📚✨**
