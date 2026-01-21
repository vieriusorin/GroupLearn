# Cursor Multi-Agent System

This folder contains the agent definitions for Cursor's multi-agent code review orchestration system.

## Structure

```
.cursor/
├── README.md                    # This file
├── ORCHESTRATOR.md              # Instructions for Cursor orchestrator
└── agents/                      # Specialist agent definitions
    ├── frontend-expert.md       # Next.js, React, SSR/CSR, Tanstack Query
    ├── web-best-practices.md    # Next.js 16, React 19, SOLID principles
    ├── design-system-enforcer.md # UI consistency & styling
    ├── accessibility-auditor.md  # WCAG 2.2 AA compliance
    ├── security.md              # Vulnerability detection
    ├── performance.md            # Optimization opportunities
    ├── best-practices.md        # Next.js & React patterns
    ├── domain-driven-design.md  # Domain boundaries & architecture
    └── design-system.md         # Component consistency
```

## How It Works

### For Users

When you want a code review, simply ask Cursor in conversation:

```
"Review my new flashcard component for accessibility issues"
"Do a security audit of the API routes"
"Check if the new feature follows best practices"
"Review src/app/review/page.tsx with all agents"
```

Cursor will:
1. Identify which specialist agents are relevant
2. Apply each agent's checklist to your code
3. Synthesize findings into a prioritized report
4. Provide actionable suggestions with code examples

### For Cursor (Orchestrator)

See [ORCHESTRATOR.md](./ORCHESTRATOR.md) for detailed orchestration instructions.

## Agent Roles

### 🎨 Frontend Expert
Expert-level guidance on Next.js, React, SSR/CSR, Tanstack Query, Nuqs, and frontend performance.

**Use for:** Frontend debugging, React optimization, Next.js architecture, state management

### ✅ Web Best Practices
Ensures code quality, SOLID principles, Next.js 16/React 19 patterns, and TypeScript safety.

**Use for:** All code changes (always relevant), architecture decisions, refactoring

### 🎨 Design System Enforcer
Ensures UI consistency, proper component usage, and Tailwind conventions.

**Use for:** UI components, styling changes, new screens

### ♿ Accessibility Auditor
Verifies WCAG 2.2 Level AA compliance, keyboard navigation, and screen reader support.

**Use for:** UI components, forms, interactive elements

### 🔒 Security
Identifies vulnerabilities, validates input sanitization, checks authentication/authorization.

**Use for:** API endpoints, data handling, authentication

### ⚡ Performance
Spots optimization opportunities, checks caching, bundle size, database queries.

**Use for:** Slow features, data-heavy components, database queries

### ✅ Best Practices
Checks Next.js/React patterns, TypeScript usage, and code quality.

**Use for:** All code changes (always relevant)

### 🏗️ Domain-Driven Design
Validates domain boundaries, layering, and business logic organization.

**Use for:** Business logic, API orchestration, domain models

### 🎨 Design System
Component consistency, styling standards, pattern recognition.

**Use for:** UI components, styling changes

## Quick Examples

### Review a specific file
```
"Review src/app/api/flashcards/route.ts for security and best practices"
```

### Review a feature
```
"I just implemented dark mode. Review all related files for accessibility and design consistency."
```

### Pre-commit check
```
"Review my uncommitted changes before I commit"
```

### Full audit
```
"Do a complete security audit of all API routes"
```

### Use specific agent
```
"Use the frontend-expert agent to analyze this hydration issue"
"Review this API endpoint with the security agent"
"Check accessibility with the accessibility-auditor agent"
```

## Customization

### Adding New Agents
1. Create `agents/your-agent.md`
2. Follow the template structure:
   - Role description
   - Responsibilities
   - Review checklist
   - Output format
3. Update ORCHESTRATOR.md with selection criteria
4. Update `.cursorrules` with the new agent

### Modifying Agents
Edit the markdown files to:
- Adjust priorities
- Add new checklist items
- Update patterns specific to your codebase
- Fine-tune feedback style

### Project-Specific Rules
Add a `.cursor/PROJECT_RULES.md` for:
- Custom conventions
- Required patterns
- Forbidden practices
- Team-specific guidelines

## Benefits

### vs. Traditional Reviews
- ✅ Consistent coverage across all areas
- ✅ No blind spots or forgotten checks
- ✅ Immediate feedback during development
- ✅ Learn best practices while coding

### vs. Linters
- ✅ Understands context and intent
- ✅ Provides explanations, not just errors
- ✅ Catches architectural issues
- ✅ Suggests improvements, not just fixes

### vs. Manual Reviews
- ✅ Faster for routine checks
- ✅ More thorough coverage
- ✅ Available 24/7
- ✅ Augments human review, doesn't replace it

## Integration with Development Workflow

### During Development
Ask for reviews as you code:
- After implementing a feature
- Before committing
- When stuck on architecture decisions
- For quick sanity checks

### Before Commits
```
"Review my uncommitted changes"
```

### During PR Review
```
"Review the changes in this PR focusing on security and performance"
```

### Continuous Learning
Use agent feedback to:
- Learn project patterns
- Understand best practices
- Improve code quality over time
- Build better architectural intuition

## Maintenance

### Keep Agents Updated
- Review and update agents quarterly
- Incorporate new patterns as codebase evolves
- Add examples from actual code reviews
- Remove outdated recommendations

### Track Effectiveness
- Note which agents find the most issues
- Adjust priorities based on project phase
- Remove checks that never trigger
- Add checks for recurring problems

## Support

Questions or issues? Check:
- [ORCHESTRATOR.md](./ORCHESTRATOR.md) for orchestration details
- Agent-specific files for checklist details
- `.cursorrules` for system configuration

