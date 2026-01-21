# Cursor Orchestrator Guide

## Overview

This document provides instructions for Cursor to orchestrate multi-agent code reviews. As the orchestrator, you coordinate specialist agents to provide comprehensive, actionable feedback.

## Orchestration Process

### 1. Task Analysis
When the user requests a code review:
- Understand the scope (specific files, features, or entire codebase)
- Identify which specialist agents are relevant
- Determine the priority order based on the task

### 2. Agent Selection
Choose relevant agents based on the task:

| Task Type | Relevant Agents |
|-----------|----------------|
| New feature implementation | All agents |
| UI changes | Design System, Accessibility, Performance |
| API endpoint | Security, Best Practices, DDD, Performance |
| Business logic | DDD, Best Practices, Security |
| Form/interaction | Accessibility, Design System, Best Practices |
| Database changes | Security, Performance, DDD |
| Security audit | Security, Best Practices |
| Performance issues | Performance, Frontend Expert |
| React/Next.js issues | Frontend Expert, Web Best Practices |

### 3. Agent Execution
For each relevant agent:
1. Read the agent's markdown file from `.cursor/agents/`
2. Apply the agent's checklist to the code being reviewed
3. Collect findings with specific file:line references
4. Keep feedback concise and actionable

### 4. Synthesis
After all agents complete:
1. **Consolidate**: Merge overlapping findings
2. **Prioritize**: Rank issues by severity and impact
3. **Resolve Conflicts**: If agents disagree, explain the trade-offs
4. **Organize**: Group by file or concern type

### 5. Final Report
Produce a structured review with:

```markdown
# Code Review: [Task Description]

## Executive Summary
- [High-level overview of findings]
- [Number of issues by severity]

## Critical Issues
[Issues requiring immediate attention]

## By Agent

### 🎨 Design System
- [Finding 1 with file:line]
- [Finding 2 with file:line]

### 🏗️ Domain-Driven Design
- [Finding 1 with file:line]

### ✅ Best Practices
- [Finding 1 with file:line]

### ♿ Accessibility
- [Finding 1 with file:line]

### 🔒 Security
- [Finding 1 with file:line]

### ⚡ Performance
- [Finding 1 with file:line]

## Prioritized Action Items
1. [Most critical fix with code example]
2. [Next important fix]
3. [...]

## Recommendations
[Strategic suggestions for overall improvement]
```

## Best Practices

### Do:
- ✅ Provide specific file:line references
- ✅ Include minimal code examples showing fixes
- ✅ Explain *why* something is an issue
- ✅ Prioritize by severity and impact
- ✅ Keep suggestions small and safe
- ✅ Match existing code style
- ✅ Focus on actionable items
- ✅ Read agent definitions from `.cursor/agents/` when needed

### Don't:
- ❌ Make vague suggestions without specifics
- ❌ Recommend large refactors for small issues
- ❌ Suggest changes that conflict with existing patterns
- ❌ Overwhelm with too many low-priority items
- ❌ Assume context not provided

## Example Usage

### User Request:
"Review the review API endpoint for security issues"

### Orchestrator Actions:
1. Read `src/app/api/review/route.ts`
2. Activate: Security, Best Practices, DDD agents
3. Each agent reviews against their checklist
4. Synthesize findings with priority on security
5. Provide actionable report

### User Request:
"I'm adding a new flashcard form component, review it"

### Orchestrator Actions:
1. Read the new component file
2. Activate: Design System, Accessibility, Best Practices agents
3. Focus on: UI consistency, form accessibility, React patterns
4. Provide quick feedback with code examples

## Agent Coordination

### Parallel Review
All agents should consider:
- The same code scope
- The same task context
- Their specific domain only (no overlap)

### Conflict Resolution
If agents give conflicting advice:
- Security > Performance (favor safe over fast)
- Accessibility > Design (favor inclusive over aesthetic)
- Best Practices > DDD (favor pragmatic over purist)
- Explain trade-offs to the user

### Incremental Feedback
For large reviews:
1. Start with critical/high severity issues
2. Group by file or feature
3. Suggest tackling in phases
4. Provide immediate wins first

## Quality Checks

Before delivering the report:
- [ ] All findings have file:line references
- [ ] Code examples are minimal and correct
- [ ] Priority order makes sense
- [ ] No duplicate findings
- [ ] Actionable next steps are clear
- [ ] Report matches existing code style
- [ ] Security issues are flagged prominently

## Continuous Improvement

After each review:
- Note which agents were most useful
- Identify gaps in coverage
- Adjust agent selection for similar tasks
- Learn from user feedback on suggestions

## Agent-Specific Notes

### When to Use Each Agent

**Frontend Expert**: Next.js/React issues, SSR/CSR problems, Tanstack Query, Nuqs, performance optimization

**Web Best Practices**: Always relevant, but especially for architecture, SOLID principles, TypeScript safety

**Design System Enforcer**: UI components, styling changes, component composition

**Accessibility Auditor**: Forms, modals, interactive elements, any user-facing feature

**Security**: API endpoints, authentication, data handling, input validation

**Performance**: Slow features, database queries, bundle size, caching

**Best Practices**: General code quality, Next.js/React patterns

**Domain-Driven Design**: Business logic, API orchestration, domain boundaries

**Design System**: Component consistency, styling standards

## Quick Reference

To use a specific agent, the user can say:
- "Use the [agent-name] agent to [task]"
- "Review [file] with the [agent-name] agent"
- "Check [code] for [agent-name] issues"

You should then:
1. Read `.cursor/agents/[agent-name].md`
2. Apply that agent's specific guidelines
3. Provide feedback in that agent's output format

