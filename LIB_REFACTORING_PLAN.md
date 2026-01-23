# Lib Folder Refactoring Plan

## Analysis Summary

### Files Currently Used ✅
1. **invitation-token.ts** - Used in handlers, has direct DB access
2. **leaderboard-utils.ts** - Used in GetLeaderboardHandler
3. **db-operations-paths-critical-converted.ts** - Used in path handlers
4. **db-operations-paths-drizzle.ts** - Used in GetPathsHandler
5. **analytics.ts** - Used in group analytics handlers
6. **gamification.ts** - Used in components and handlers
7. **unlock-system.ts** - Used in start-lesson action
8. **preferences.ts** - Used in components
9. **authorization.ts** - Used in handlers
10. **streak-utils.ts** - Used in actions
11. **rbac.ts** - Used in handlers/components
12. **validation.ts** - Used extensively
13. **spaced-repetition.ts** - Used in review handlers (legacy note)
14. **db-operations.ts** - Used by services
15. **services/** - Used by GetStatsHandler
16. **repositories/** - Used by GetAdminStatsHandler

### Files NOT Used ❌
1. **activity-logger.ts** - Only self-references, never imported
2. **email.ts** - `sendInvitationEmail` defined but never called

### Files That Need CQRS Refactoring 🔄
1. **invitation-token.ts** - Direct DB access, should use queries/commands
2. **db-operations.ts** - Direct DB access, should use repositories/queries
3. **db-operations-paths-*.ts** - Direct DB access, should use queries
4. **analytics.ts** - Direct DB access, should use queries
5. **leaderboard-utils.ts** - Direct DB access, should use queries
6. **activity-logger.ts** - If kept, should use commands

## Proposed Domain Structure

```
lib/
├── auth/                    # Authentication & Authorization
│   ├── rbac.ts
│   ├── auth.ts
│   ├── better-auth.ts
│   ├── auth-middleware.ts
│   └── auth-adapter.ts
│
├── groups/                  # Group domain utilities
│   └── invitation-token.ts  # ⚠️ Needs CQRS refactoring
│
├── content/                 # Content domain (legacy, should migrate to queries)
│   └── db-operations.ts    # ⚠️ Legacy, replace with queries
│
├── paths/                   # Learning paths (legacy, should migrate to queries)
│   ├── db-operations-paths-critical-converted.ts  # ⚠️ Legacy
│   └── db-operations-paths-drizzle.ts            # ⚠️ Legacy
│
├── gamification/            # Gamification domain
│   ├── gamification.ts
│   ├── streak-utils.ts
│   └── unlock-system.ts
│
├── analytics/               # Analytics domain (legacy, should migrate to queries)
│   ├── analytics.ts        # ⚠️ Needs CQRS refactoring
│   └── leaderboard-utils.ts # ⚠️ Needs CQRS refactoring
│
├── review/                 # Review domain
│   └── spaced-repetition.ts # ⚠️ Legacy (note says moved to domain)
│
├── shared/                 # Shared utilities
│   ├── validation.ts
│   ├── preferences.ts
│   ├── authorization.ts
│   ├── utils.ts
│   ├── cache-tags.ts
│   └── api-utils.ts
│
└── infrastructure/         # Infrastructure
    ├── db.ts
    └── email.ts            # ⚠️ Unused, consider removing
```

## Action Items

### Phase 1: Remove Unused Files
- [ ] Delete `lib/activity-logger.ts` (not imported anywhere)
- [ ] Delete `lib/email.ts` (sendInvitationEmail never called)

### Phase 2: Refactor to CQRS
- [ ] **invitation-token.ts** → Move to `domains/collaboration/` or create queries/commands
- [ ] **db-operations.ts** → Replace with proper repositories/queries
- [ ] **db-operations-paths-*.ts** → Replace with path queries
- [ ] **analytics.ts** → Move logic to query handlers
- [ ] **leaderboard-utils.ts** → Move logic to query handlers
- [ ] **spaced-repetition.ts** → Check if already in domain, remove if duplicate

### Phase 3: Reorganize by Domain
- [ ] Move auth files to `lib/auth/`
- [ ] Move group files to `lib/groups/`
- [ ] Move gamification files to `lib/gamification/`
- [ ] Move shared utilities to `lib/shared/`
- [ ] Update all imports

### Phase 4: Clean Up Services/Repositories
- [ ] Services are used but wrap legacy db-operations - consider migrating
- [ ] Repositories have direct DB access - should use infrastructure/repositories pattern

## Notes

- `activity-logger.ts` has functions but is never imported - likely legacy
- `email.ts` has `sendInvitationEmail` but it's never called - consider removing or implementing
- Many files have direct DB access which violates CQRS - these should be refactored
- Services and repositories in lib/ are different from infrastructure/repositories - need to clarify pattern

