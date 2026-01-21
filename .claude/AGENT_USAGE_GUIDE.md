# Claude Code Agent Usage Guide

## Overview

This guide provides instructions for using Claude Code agents effectively during the refactoring process. It includes best practices, examples, and specific scenarios where each agent should be used.

---

## Table of Contents

1. [Available Agents](#available-agents)
2. [When to Use Each Agent](#when-to-use-each-agent)
3. [Agent Examples](#agent-examples)
4. [Best Practices](#best-practices)
5. [Common Workflows](#common-workflows)

---

## 1. Available Agents

Claude Code provides several specialized agents:

- **frontend-expert**: Frontend development (React, Next.js, state management, SSR/CSR)
- **web-best-practices**: Code quality, SOLID principles, modern web practices
- **design-system-enforcer**: UI consistency and design system compliance
- **accessibility-auditor**: Accessibility compliance (WCAG 2.2)
- **Explore**: Codebase exploration and understanding
- **Plan**: Implementation planning for features

---

## 2. When to Use Each Agent

### frontend-expert

**Use when:**
- Debugging Next.js hydration issues
- Optimizing React component performance
- Working with Tanstack Query / React Query
- Implementing state management (useState, useReducer, Context)
- Server-side rendering (SSR) vs Client-side rendering (CSR) decisions
- Nuqs for URL state management

**Examples:**
- "I'm getting a hydration mismatch error in my Next.js app"
- "How should I structure my API calls with Tanstack Query in Next.js 14?"
- "My component is re-rendering too frequently, help me optimize"
- "Should this be a Server Component or Client Component?"

### web-best-practices

**Use when:**
- Reviewing code for SOLID principles
- Identifying anti-patterns and code smells
- Checking TypeScript type safety
- Assessing testability and maintainability
- Security vulnerability scanning
- Performance bottleneck identification

**Examples:**
- "Review this service class for SOLID principle violations"
- "Check this component for anti-patterns"
- "Is this code testable? How can I improve it?"
- "Identify security issues in this API route"

### design-system-enforcer

**Use when:**
- Creating new UI components
- Ensuring design consistency
- Validating component patterns
- Checking spacing, colors, typography usage
- Reviewing component composition

**Examples:**
- "Review this new button variant for design system compliance"
- "Check if this form follows our design patterns"
- "Validate spacing and layout in this component"

### accessibility-auditor

**Use when:**
- Creating forms or interactive components
- Building modal dialogs or overlays
- Implementing navigation menus
- Adding images or media content
- Creating data visualizations
- Any user-facing feature

**Examples:**
- "Audit this form for accessibility compliance"
- "Check if this modal meets WCAG 2.2 standards"
- "Ensure this navigation is keyboard accessible"

### Explore

**Use when:**
- Understanding codebase structure
- Finding where specific functionality is implemented
- Learning about existing patterns
- Discovering dependencies between modules
- Researching before making changes

**Examples:**
- "Where are errors from the client handled?"
- "How does authentication work in this codebase?"
- "Find all components that use the flashcard state"
- "Show me the data flow for lesson completion"

### Plan

**Use when:**
- Implementing new features
- Refactoring large sections of code
- Making architectural decisions
- Planning multi-step implementations
- Needing approval before coding

**Examples:**
- "Plan how to add user authentication"
- "Design the implementation for dark mode support"
- "Create a plan to refactor the review system"

---

## 3. Agent Examples

### Example 1: Debugging Hydration Issue

```
USER: I'm getting hydration mismatch in my lesson page. The server renders one thing but client shows different content.

RESPONSE: Let me use the frontend-expert agent to diagnose this.

<uses frontend-expert agent>

RESULT:
The agent identified that you're using `localStorage` in `useEffect` which causes:
- Server: Renders with null/default state
- Client: Renders with localStorage value

Solution: Use cookies or move localStorage logic to a separate client component.
```

### Example 2: Code Review for SOLID Principles

```
USER: Review my DomainService class for SOLID violations

RESPONSE: Using the web-best-practices agent to review your service class.

<uses web-best-practices agent>

RESULT:
Issues found:
1. SRP Violation: Class handles both domain logic and category validation
2. DIP Violation: Directly depends on database operations (not injected)
3. LSP Violation: Static methods can't be substituted

Recommendations:
- Split into DomainService and CategoryService
- Use dependency injection for repositories
- Convert to instance methods
```

### Example 3: Exploring Codebase

```
USER: How does the XP calculation work in lessons?

RESPONSE: Let me use the Explore agent to find the XP calculation logic.

<uses Explore agent with thoroughness: "medium">

RESULT:
XP calculation found in:
1. src/app/lesson/[id]/page.tsx:142-148 - Inline calculation
2. src/lib/gamification.ts:12-25 - Helper functions
3. src/app/api/lessons/[id]/complete/route.ts:78 - Duplicate logic

Recommendation: Centralize in a dedicated XPCalculationService.
```

### Example 4: Planning Feature Implementation

```
USER: I want to add a badge system for achievements

RESPONSE: Let me enter plan mode to design this feature.

<uses Plan agent>

RESULT:
Plan created:
1. Design badge schema (database tables)
2. Create Badge domain entity
3. Implement BadgeService with award logic
4. Create badge UI components
5. Add badge triggers to lesson completion
6. Create badge display on profile

Estimated: 2-3 days
Files to modify: 8
New files: 6

Ready to proceed?
```

---

## 4. Best Practices

### 4.1 Be Specific

**Bad:**
```
"Check my code"
```

**Good:**
```
"Review src/app/lesson/[id]/page.tsx for React performance issues and component decomposition opportunities"
```

### 4.2 Provide Context

**Bad:**
```
"This doesn't work"
```

**Good:**
```
"The lesson completion is not updating user XP. I'm calling completeLessonMutation in useLessonSession hook after all cards are answered, but the progress page still shows old XP"
```

### 4.3 Specify Agent When Appropriate

**When you know which agent to use:**
```
"Use the frontend-expert agent to analyze this hydration issue in app/page.tsx"
```

**When unsure:**
```
"My lesson session state is getting out of sync. Help me debug this."
(Claude will choose the appropriate agent)
```

### 4.4 Combine Agents for Comprehensive Review

```
"Review the LessonSession component:
1. Use frontend-expert to check React patterns
2. Use web-best-practices to verify SOLID principles
3. Use accessibility-auditor to ensure it's accessible"
```

---

## 5. Common Workflows

### Workflow 1: Implementing a New Feature

```
Step 1: Explore existing patterns
"Use the Explore agent to find similar features to user progress tracking"

Step 2: Plan implementation
"Create an implementation plan for adding lesson bookmarks feature"

Step 3: Review design
"Use design-system-enforcer to review my bookmark button design"

Step 4: Check accessibility
"Use accessibility-auditor to check the bookmark UI"

Step 5: Code review
"Use web-best-practices to review the final implementation"
```

### Workflow 2: Refactoring a Component

```
Step 1: Analyze current state
"Use frontend-expert to analyze app/domains/page.tsx and identify refactoring opportunities"

Step 2: Create refactoring plan
"Plan how to decompose this 336-line component into smaller pieces"

Step 3: Verify SOLID principles
"Use web-best-practices to verify the refactored components follow SOLID principles"

Step 4: Check for regressions
"Use frontend-expert to ensure no React anti-patterns were introduced"
```

### Workflow 3: Debugging an Issue

```
Step 1: Understand the problem area
"Use Explore agent to understand how lesson completion updates user progress"

Step 2: Identify the bug
"Use frontend-expert to debug why XP is not updating after lesson completion"

Step 3: Verify the fix
"Use web-best-practices to review my fix for race conditions"
```

### Workflow 4: Creating UI Components

```
Step 1: Design the component
(Create component code)

Step 2: Check design system compliance
"Use design-system-enforcer to review this new ProgressCard component"

Step 3: Ensure accessibility
"Use accessibility-auditor to check if this progress card is accessible"

Step 4: Optimize performance
"Use frontend-expert to check if this component has any performance issues"
```

---

## 6. Agent-Specific Tips

### frontend-expert

- Mention specific React hooks causing issues (useState, useEffect, etc.)
- Include relevant error messages (hydration errors, infinite loops)
- Specify Next.js version (we're on 16.x)
- Mention if it's a Server Component or Client Component issue

### web-best-practices

- Reference specific SOLID principles you're concerned about
- Mention if you need security review
- Specify if you want TypeScript type safety review
- Ask about specific anti-patterns (god objects, tight coupling, etc.)

### design-system-enforcer

- Reference the component library (shadcn/ui with new-york style)
- Mention if it's a variant of existing component
- Include screenshots when possible
- Specify which design tokens should be used

### accessibility-auditor

- Mention WCAG level requirements (we target Level AA)
- Specify user interaction types (keyboard, screen reader)
- Include component type (form, modal, navigation, etc.)

### Explore

- Be specific about what you're looking for
- Specify thoroughness level (quick, medium, very thorough)
- Ask for specific patterns or implementations
- Request architectural understanding when needed

### Plan

- Provide clear requirements
- Mention constraints (time, complexity, dependencies)
- Specify if you need permission-based actions
- Request architectural decisions when needed

---

## 7. Example Prompts for This Codebase

### Refactoring

```
"Use frontend-expert to analyze src/app/domains/page.tsx and create a refactoring plan to extract custom hooks and smaller components"

"Review the lesson completion flow with web-best-practices and identify race conditions or concurrency issues"

"Use Explore agent to find all places where XP is calculated and identify duplication"
```

### Feature Development

```
"Plan the implementation of a 'Review History' feature showing all past flashcard reviews with dates and accuracy"

"Use design-system-enforcer to ensure the new achievement badge component matches our design system"

"Check the new lesson retry feature with accessibility-auditor to ensure keyboard navigation works"
```

### Bug Fixing

```
"Use frontend-expert to debug why the lesson session loses state when navigating back"

"Analyze the user progress race condition with web-best-practices and suggest atomic update patterns"

"Find why hearts aren't refilling with Explore agent - trace the refill logic"
```

### Code Review

```
"Review all custom hooks in the hooks/ directory with frontend-expert for React best practices"

"Use web-best-practices to audit lib/db-operations.ts for database connection leaks"

"Check if all form components meet accessibility standards with accessibility-auditor"
```

---

## 8. Integration with Refactoring Plan

### Phase 1: Foundation

```
"Use web-best-practices to identify all database connection leak risks in lib/db-operations.ts"

"Review our current error handling strategy with web-best-practices"
```

### Phase 2: Custom Hooks

```
"Use frontend-expert to review the new useLessonSession hook for React anti-patterns"

"Check if the useFormDialog hook follows React Hook best practices with frontend-expert"
```

### Phase 3: Repository Pattern

```
"Review the new repository pattern implementation with web-best-practices for SOLID compliance"

"Use Explore agent to find all direct database access that needs to be moved to repositories"
```

### Phase 4: Domain Model

```
"Review the LessonSession entity with web-best-practices for domain-driven design principles"

"Use web-best-practices to verify value objects are immutable and properly encapsulated"
```

### Phase 5: Component Decomposition

```
"Use frontend-expert to suggest how to decompose the 378-line admin/categories/page.tsx component"

"Review the decomposed components with design-system-enforcer for consistency"
```

### Phase 6: Server Components

```
"Use frontend-expert to determine which components should be Server Components vs Client Components"

"Review the Server Actions implementation with web-best-practices for security"
```

---

## 9. Troubleshooting

### Agent not providing helpful output?

**Problem:** Agent response is too generic

**Solution:** Be more specific
```
Instead of: "Check this code"
Try: "Use frontend-expert to check src/hooks/useLessonSession.ts for React Hook dependency issues and potential infinite loops"
```

### Agent analyzing wrong files?

**Problem:** Agent is looking at irrelevant code

**Solution:** Specify exact file paths
```
"Use Explore agent to analyze ONLY src/app/lesson/[id]/page.tsx, do not look at other lesson files"
```

### Need multiple agents?

**Problem:** Issue requires multiple perspectives

**Solution:** Request sequential analysis
```
"First use frontend-expert to analyze component patterns, then use web-best-practices to check SOLID principles, then use accessibility-auditor to verify accessibility"
```

---

## 10. Success Criteria

When using agents effectively, you should see:

- **Faster debugging**: Issues identified in minutes vs hours
- **Better code quality**: Agents catch issues before code review
- **Consistent patterns**: Agents ensure adherence to established patterns
- **Learning**: Understanding improves through agent explanations
- **Confidence**: Changes backed by expert analysis

---

## Conclusion

Claude Code agents are powerful tools for refactoring and maintaining code quality. Use them:

- **Proactively** - Before writing code, during planning
- **Specifically** - With clear, focused requests
- **Systematically** - As part of your development workflow
- **Continuously** - Throughout the refactoring process

By leveraging these agents effectively, you'll accelerate the refactoring effort and ensure high code quality throughout the process.
