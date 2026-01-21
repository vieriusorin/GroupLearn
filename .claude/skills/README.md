# Claude Code Skills for Learning Cards

This directory contains specialized skills that help Claude Code work more effectively with the Learning Cards project. Each skill provides templates, patterns, and best practices for common development tasks.

## Available Skills

### 🗄️ Database & Migrations

#### `/db-migrate`
Create and run database migrations for SQLite schema changes.

**Use when:**
- Adding new tables or columns
- Modifying existing schema
- Creating indexes
- Running data migrations

**Example:**
```
Create a migration to add a settings column to users table
```

#### `/auth-check`
Check authentication setup, user management, and run auth-related diagnostics.

**Use when:**
- Debugging login issues
- Checking user roles
- Verifying database setup
- Managing admin users

**Example:**
```
Make user@example.com an admin
Check if authentication is working correctly
```

---

### 🌐 API Development

#### `/api-route`
Create Next.js API routes with authentication, RBAC, and error handling.

**Use when:**
- Creating new API endpoints
- Adding CRUD operations
- Implementing protected routes
- Need examples of proper error handling

**Example:**
```
Create an API route for managing user bookmarks
Add a GET endpoint to fetch user statistics
```

#### `/test-api`
Test API endpoints manually or create test scripts.

**Use when:**
- Verifying API functionality
- Testing authentication/authorization
- Checking validation logic
- Load testing endpoints

**Example:**
```
Test the /api/flashcards endpoint
Create a test script for the groups API
```

---

### 🎨 Frontend Development

#### `/component`
Create React components following shadcn/ui patterns and project conventions.

**Use when:**
- Creating new UI components
- Building forms with validation
- Implementing dialogs/modals
- Need proper accessibility patterns

**Example:**
```
Create a modal component for creating categories
Build a form component for user settings
```

#### `/query-hook`
Create TanStack Query hooks for data fetching following project patterns.

**Use when:**
- Setting up data fetching
- Implementing mutations
- Managing cache invalidation
- Need optimistic updates

**Example:**
```
Create a hook for fetching and updating user progress
Add query hooks for the lessons feature
```

---

### 🔧 Development Tools

#### `/build`
Build, type-check, and lint the project.

**Use when:**
- Running production builds
- Type checking code
- Fixing linting errors
- Preparing for deployment

**Example:**
```
Run a production build and check for errors
Type check the entire project
```

#### `/admin-tool`
Create admin utility scripts for database operations and maintenance.

**Use when:**
- Creating database management scripts
- Building data export tools
- Implementing batch operations
- Need diagnostic utilities

**Example:**
```
Create a script to export user progress to CSV
Build a tool to clean up old data
```

---

### 📚 Learning System

#### `/spaced-repetition`
Work with the spaced repetition learning algorithm and review system.

**Use when:**
- Modifying review intervals
- Adjusting difficulty calculations
- Analyzing review patterns
- Testing the learning algorithm

**Example:**
```
Add more interval levels to the spaced repetition algorithm
Create a tool to analyze struggling cards
```

---

### 📦 Utility

#### `/compress`
Compress the resulting files of a user's request.

**Use when:**
- Creating archives of generated files
- Packaging deliverables
- Backing up code changes

**Example:**
```
Compress all the components I just created
```

---

## Quick Reference Guide

### Common Tasks

**Start a new feature:**
1. `/component` - Create UI components
2. `/api-route` - Create backend endpoints
3. `/query-hook` - Set up data fetching
4. `/test-api` - Test the implementation

**Database changes:**
1. `/db-migrate` - Create migration script
2. `/build` - Verify types still work
3. `/auth-check` - Test with real data

**Debugging:**
1. `/auth-check` - Check authentication
2. `/test-api` - Verify API behavior
3. `/build` - Check for type errors

**Admin tasks:**
1. `/admin-tool` - Create utility script
2. `/auth-check` - Manage users
3. `/db-migrate` - Schema changes

---

## Tech Stack Reference

These skills are designed for the following technologies:

- **Framework:** Next.js 16.1.1 (App Router)
- **Runtime:** React 19
- **Language:** TypeScript 5
- **Database:** Drizzle ORM with Postgres
- **Authentication:** NextAuth v5 (beta.30)
- **Data Fetching:** TanStack Query v5
- **State Management:** nuqs (URL state)
- **UI Components:** shadcn/ui with Radix UI
- **Styling:** Tailwind CSS v4
- **Forms:** React Hook Form + Zod
- **Rich Text:** Tiptap
- **Animation:** Framer Motion
- **Linting:** Biome

---

## Skill Development Guidelines

### When to Create a New Skill

Create a skill when:
- A pattern is repeated frequently
- Complex boilerplate is involved
- Specific conventions should be followed
- Domain knowledge is required

### Skill Template

```markdown
---
name: skill-name
description: Brief description of what this skill does
allowed-tools: [Tool1, Tool2, Tool3]
---

## Purpose
Detailed explanation of when and why to use this skill

## Guidelines
Step-by-step instructions and patterns

## Examples
Code examples and common use cases

## Best Practices
Dos and don'ts
```

---

## Project-Specific Patterns

### File Organization
```
src/
├── app/              # Next.js pages and API routes
│   ├── api/          # API endpoints
│   └── */page.tsx    # Pages
├── components/       # React components
│   ├── ui/           # shadcn/ui components
│   └── */            # Feature components
├── lib/              # Utilities and services
│   ├── db.ts         # Database connection
│   ├── rbac.ts       # Authorization
│   └── services/     # Business logic
├── hooks/            # Custom React hooks
└── types/            # TypeScript types
```

### Import Aliases
```typescript
import { Component } from '@/components/Component';
import { getDb } from '@/lib/db';
import { useHook } from '@/hooks/useHook';
```

### Naming Conventions
- Components: PascalCase (`UserProfile.tsx`)
- Hooks: camelCase with 'use' prefix (`useUserData.ts`)
- Utilities: camelCase (`formatDate.ts`)
- Types: PascalCase (`UserType`, `ApiResponse`)
- API routes: kebab-case (`user-settings/route.ts`)

---

## Contributing Skills

When creating new skills:

1. **Focus on patterns** - Skills should teach patterns, not just generate code
2. **Include examples** - Show real examples from the codebase
3. **Document trade-offs** - Explain when and why to use certain approaches
4. **Test thoroughly** - Ensure examples work with current dependencies
5. **Keep updated** - Update skills when patterns change

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Note:** These skills are living documents. As the project evolves, update the skills to reflect new patterns and best practices.
