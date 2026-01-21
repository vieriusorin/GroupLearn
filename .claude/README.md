# Claude Code Multi-Agent System

This folder contains the agent definitions for Claude Code's multi-agent code review orchestration.

## Structure

```
.claude/
├── README.md                    # This file
├── ORCHESTRATOR.md              # Instructions for Claude Code orchestrator
└── agents/                      # Specialist agent definitions
    ├── design-system.md         # UI consistency & styling
    ├── domain-driven-design.md  # Domain boundaries & architecture
    ├── best-practices.md        # Next.js & React patterns
    ├── accessibility.md         # WCAG 2.2 AA compliance
    ├── security.md              # Vulnerability detection
    └── performance.md           # Optimization opportunities
```

## How It Works

### For Users

When you want a code review, simply ask Claude Code in conversation:

```
"Review my new flashcard component for accessibility issues"
"Do a security audit of the API routes"
"Check if the new feature follows best practices"
"Review src/app/review/page.tsx with all agents"
```

Claude Code will:
1. Identify which specialist agents are relevant
2. Apply each agent's checklist to your code
3. Synthesize findings into a prioritized report
4. Provide actionable suggestions with code examples

### For Claude Code (Orchestrator)

See [ORCHESTRATOR.md](./ORCHESTRATOR.md) for detailed orchestration instructions.

## Agent Roles

### 🎨 Design System
Ensures UI consistency, proper component usage, and Tailwind conventions.

**Use for:** UI components, styling changes, new screens

### 🏗️ Domain-Driven Design
Validates domain boundaries, layering, and business logic organization.

**Use for:** Business logic, API orchestration, domain models

### ✅ Best Practices
Checks Next.js/React patterns, TypeScript usage, and code quality.

**Use for:** All code changes (always relevant)

### ♿ Accessibility
Verifies WCAG compliance, keyboard navigation, and screen reader support.

**Use for:** UI components, forms, interactive elements

### 🔒 Security
Identifies vulnerabilities, validates input sanitization, checks auth.

**Use for:** API endpoints, data handling, authentication

### ⚡ Performance
Spots optimization opportunities, checks caching, bundle size.

**Use for:** Slow features, data-heavy components, database queries

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

## Customization

### Adding New Agents
1. Create `agents/your-agent.md`
2. Follow the template structure:
   - Role description
   - Responsibilities
   - Review checklist
   - Output format
3. Update ORCHESTRATOR.md with selection criteria

### Modifying Agents
Edit the markdown files to:
- Adjust priorities
- Add new checklist items
- Update patterns specific to your codebase
- Fine-tune feedback style

### Project-Specific Rules
Add a `.claude/PROJECT_RULES.md` for:
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

## Advanced Usage

### Combine with TypeScript Orchestrator
For CI/CD integration, use the TypeScript orchestrator at `.github/agents/orchestrator-claude.ts`:

```bash
npm run agents:claude -- --task "PR Review" --files src/app/api
```

This provides:
- Structured output for automation
- Parallel agent execution
- JSON export capabilities
- GitHub Actions integration

### Custom Workflows
Create project-specific review shortcuts in `.claude/workflows.md`

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
- Main project README for usage examples
