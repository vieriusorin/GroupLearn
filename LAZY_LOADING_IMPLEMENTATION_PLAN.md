# Lazy Loading Implementation Plan

## Overview
This document provides a comprehensive, actionable plan for implementing lazy loading across the Next.js application to improve initial load performance, reduce bundle size, and enhance user experience.

## ⚠️ Important Note
**Current Strategy**: The project prefers to keep SSR (Server-Side Rendering) for most components rather than lazy loading. This maintains better SEO, faster initial page loads, and better user experience for above-the-fold content. Lazy loading should only be used for:
- Heavy third-party libraries (like TipTap)
- Components that are conditionally rendered (dialogs, modals)
- Components that are not needed for initial render

## Current State Analysis

### Already Implemented ✅
- `LearnPageClient` - PathSelector and PathVisualization are lazy loaded
- `LessonClient` - Lazy loaded in lesson page
- Admin pages (categories, domains, flashcards, users) - Client components are lazy loaded
- `ReviewModeSelector` - Lazy loaded
- `FlashcardDialog` - Lazy loaded
- `FlashcardModal` - Lazy loaded

### Needs Implementation ❌
- RichTextEditor (TipTap library - ~50KB+)
- Dialog/Modal components (LessonStartDialog, LessonCompletionDialog, DeleteCategoryDialog, etc.)
- Review page client component
- Settings page components
- Progress page components
- Groups page components
- Flashcards page components
- Domains page components
- Gamification components
- Mascot component
- Admin dashboard components

## Implementation Strategy

### ⚠️ SSR-First Approach
**Decision**: Keep SSR for main page components to maintain:
- Better SEO
- Faster initial page loads
- Better user experience for above-the-fold content
- Proper server-side data fetching

### 1. Route-Based Code Splitting
Next.js automatically splits routes. We keep SSR for:
- Main page components (ReviewPageClient, GroupsClient, etc.)
- Settings page components
- Progress page components
- All server-rendered content

### 2. Component-Level Lazy Loading (Selective)
Use `next/dynamic` with `ssr: false` ONLY for:
- ✅ Heavy third-party libraries (TipTap editor - ~50KB+)
- ✅ Conditionally rendered components (dialogs, modals)
- ✅ Components not needed for initial render
- ❌ NOT for main page components (keep SSR)

### 3. Library-Level Lazy Loading
- TipTap editor: Load only when editing (already done)
- Large libraries: Load on demand
- Third-party heavy dependencies: Lazy load at usage point

## Implementation Tasks

### Phase 1: Critical Heavy Components (High Priority)

#### Task 1: Lazy Load RichTextEditor
**File**: `src/components/rich-text-editor.tsx`
**Impact**: ~50KB+ reduction in initial bundle
**Status**: ⏳ Pending

**Implementation**:
- Create a wrapper component that uses `next/dynamic`
- Update all imports of RichTextEditor to use the lazy-loaded version
- Add loading skeleton for better UX

**Files to Update**:
- `src/components/admin/FlashcardModal.tsx`
- `src/components/admin/CategoryModal.tsx`
- `src/components/admin/DomainModal.tsx`
- Any other files importing RichTextEditor

#### Task 2: Lazy Load Dialog/Modal Components
**Impact**: Significant bundle reduction, load only when needed
**Status**: ⏳ Pending

**Components to Lazy Load**:
1. `LessonStartDialog` - `src/components/lesson/LessonStartDialog.tsx`
2. `LessonCompletionDialog` - `src/components/lesson/LessonCompletionDialog.tsx`
3. `DeleteCategoryDialog` - `src/components/admin/DeleteCategoryDialog.tsx`
4. `DeleteDomainDialog` - `src/components/admin/DeleteDomainDialog.tsx`
5. `DeleteFlashcardDialog` - `src/components/admin/DeleteFlashcardDialog.tsx`
6. `CategoryModal` - `src/components/admin/CategoryModal.tsx`
7. `DomainModal` - `src/components/admin/DomainModal.tsx`
8. `CreateCategoryDialog` - `src/components/domains/CreateCategoryDialog.tsx`
9. `CreateDomainDialog` - `src/components/domains/CreateDomainDialog.tsx`
10. `InviteModal` - `src/components/admin/InviteModal.tsx`
11. `AssignPathModal` - `src/components/admin/AssignPathModal.tsx`
12. `CreateGroupModal` - `src/components/admin/CreateGroupModal.tsx`

**Implementation Pattern**:
```typescript
const DialogComponent = dynamic(
  () => import('./DialogComponent').then((mod) => ({ default: mod.DialogComponent })),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse">Loading...</div>
  }
);
```

### Phase 2: Page-Level Optimizations (SKIPPED - Keep SSR)

**Decision**: Keep SSR for all page components. These tasks are **NOT** being implemented:
- ❌ ReviewPageClient - Keep SSR
- ❌ Settings page components - Keep SSR
- ❌ Progress page components - Keep SSR
- ❌ Groups page components - Keep SSR
- ❌ Flashcards page components - Keep SSR
- ❌ Domains page components - Keep SSR

**Rationale**: SSR provides better SEO, faster initial loads, and better user experience. Next.js already handles route-based code splitting automatically.

### Phase 3: Conditional & Decorative Components (Low Priority)

#### Task 10: Lazy Load Gamification Components
**Status**: ⏳ Pending

**Components**:
- `CelebrationAnimation` - Only when celebrating
- `HeartsDisplay` - Only in lesson/review contexts
- `StreakDisplay` - Only when viewing stats
- `XPProgressBar` - Only when visible

#### Task 11: Lazy Load Mascot Component
**File**: `src/components/mascot/Mascot.tsx`
**Status**: ⏳ Pending

**Impact**: Decorative component, not critical for functionality

#### Task 12: Lazy Load Admin Dashboard Components
**File**: `src/app/admin/page.tsx`
**Status**: ⏳ Pending

**Components**:
- `AdminStatsGrid`
- `AdminRecentActivity`
- `AdminQuickActions`

**Note**: These are already server components, but if they have heavy client children, lazy load those

### Phase 4: Loading States & UX (Required)

#### Task 13: Add Loading States/Skeletons
**Status**: ⏳ Pending

**Requirements**:
- Create reusable skeleton components
- Add loading states for all lazy-loaded components
- Ensure smooth transitions
- Maintain accessibility (aria-live, etc.)

**Pattern**:
```typescript
const Component = dynamic(
  () => import('./Component').then((mod) => ({ default: mod.Component })),
  { 
    ssr: false,
    loading: () => <ComponentSkeleton />
  }
);
```

### Phase 5: Testing & Validation

#### Task 14: Verify All Lazy-Loaded Components
**Status**: ⏳ Pending

**Checklist**:
- [ ] All lazy-loaded components render correctly
- [ ] No hydration errors
- [ ] Loading states work properly
- [ ] User flows are not broken
- [ ] Accessibility is maintained
- [ ] Keyboard navigation works
- [ ] Screen readers work correctly

#### Task 15: Bundle Analysis
**Status**: ⏳ Pending

**Tools**:
- Install `@next/bundle-analyzer`
- Run `npm run build` and analyze output
- Compare before/after bundle sizes
- Measure Core Web Vitals improvements

**Commands**:
```bash
npm install --save-dev @next/bundle-analyzer
```

Update `next.config.ts`:
```typescript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... existing config
});
```

Run analysis:
```bash
ANALYZE=true npm run build
```

## Best Practices

### When to Use Lazy Loading

✅ **DO lazy load:**
- Heavy third-party libraries (TipTap ~50KB+, charts, etc.)
- Dialogs, modals, and overlays (conditionally rendered)
- Components with large dependencies that are not critical
- Client-only components that don't need SSR

❌ **DON'T lazy load (Keep SSR):**
- Main page components (ReviewPageClient, GroupsClient, etc.)
- Settings page components
- Progress page components
- Any component needed for initial render
- Core layout components (TopBar, MainLayout)
- Critical above-the-fold content
- Small utility components (< 5KB)
- Shared UI components (Button, Card, etc.)
- Server-rendered content
- Components used in multiple places frequently

### Code Patterns

#### Pattern 1: Basic Lazy Loading
```typescript
import dynamic from 'next/dynamic';

const Component = dynamic(
  () => import('./Component').then((mod) => ({ default: mod.Component })),
  { ssr: false }
);
```

#### Pattern 2: With Loading State
```typescript
const Component = dynamic(
  () => import('./Component').then((mod) => ({ default: mod.Component })),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse">Loading...</div>
  }
);
```

#### Pattern 3: Named Export
```typescript
const Component = dynamic(
  () => import('./Component').then((mod) => mod.NamedComponent),
  { ssr: false }
);
```

#### Pattern 4: Conditional Loading
```typescript
const Component = dynamic(
  () => import('./Component').then((mod) => ({ default: mod.Component })),
  { ssr: false }
);

// In component
{isOpen && <Component />}
```

## Expected Benefits

### Performance Metrics (Selective Lazy Loading Only)
With SSR-first approach + selective lazy loading:
- **TipTap Bundle**: ~50KB+ reduction (only loads when editing)
- **Dialog/Modal Bundle**: Load only when needed
- **Better SEO**: SSR maintains full content for search engines
- **Faster Initial Load**: SSR provides content immediately
- **Better Core Web Vitals**: SSR improves LCP and FCP

### User Experience
- ✅ Faster initial page load (SSR)
- ✅ Better SEO (SSR)
- ✅ Reduced bundle size for heavy libraries (TipTap)
- ✅ Dialogs/modals load only when needed
- ✅ Better perceived performance
- ✅ No loading spinners for main content

## Monitoring & Validation

### Metrics to Track
1. Bundle size analysis (`npm run build` output)
2. Lighthouse scores (before/after)
3. Network tab analysis
4. React DevTools Profiler
5. Next.js Analytics
6. Core Web Vitals (LCP, FID, CLS)

### Tools
- `@next/bundle-analyzer` for bundle analysis
- Lighthouse CI for performance monitoring
- Web Vitals API for real user metrics
- React DevTools Profiler for component performance

## Rollout Strategy

1. **Phase 1**: Implement critical components (RichTextEditor, Dialogs) - Week 1
2. **Phase 2**: Test and validate performance improvements - Week 1
3. **Phase 3**: Roll out page-level optimizations - Week 2
4. **Phase 4**: Fine-tune and optimize further - Week 2
5. **Phase 5**: Monitor and iterate - Ongoing

## Notes

- Always test lazy-loaded components thoroughly
- Ensure loading states are user-friendly
- Monitor for any hydration issues
- Keep accessibility in mind (keyboard navigation, screen readers)
- Document lazy-loaded components for team awareness
- Consider prefetching for likely next actions
- Use `next/link` prefetch for navigation
- Monitor bundle sizes in CI/CD

## File-by-File Implementation Checklist

### High Priority
- [ ] `src/components/rich-text-editor.tsx` - Create lazy wrapper
- [ ] `src/components/lesson/LessonStartDialog.tsx` - Lazy load
- [ ] `src/components/lesson/LessonCompletionDialog.tsx` - Lazy load
- [ ] `src/components/admin/DeleteCategoryDialog.tsx` - Lazy load
- [ ] `src/components/admin/DeleteDomainDialog.tsx` - Lazy load
- [ ] `src/components/admin/DeleteFlashcardDialog.tsx` - Lazy load
- [ ] `src/components/admin/CategoryModal.tsx` - Lazy load
- [ ] `src/components/admin/DomainModal.tsx` - Lazy load

### Medium Priority (SKIPPED - Keep SSR)
- [x] ~~`src/app/review/page.tsx`~~ - **Keep SSR** ✅
- [x] ~~`src/components/review/ReviewPageClient.tsx`~~ - Review modes already lazy loaded in ReviewModeSelector ✅
- [x] ~~`src/app/settings/page.tsx`~~ - **Keep SSR** ✅
- [x] ~~`src/app/progress/page.tsx`~~ - **Keep SSR** ✅
- [x] ~~`src/app/groups/page.tsx`~~ - **Keep SSR** ✅
- [x] ~~`src/app/flashcards/page.tsx`~~ - **Keep SSR** ✅
- [x] ~~`src/app/domains/page.tsx`~~ - **Keep SSR** ✅

### Low Priority
- [ ] `src/components/gamification/CelebrationAnimation.tsx` - Lazy load
- [ ] `src/components/gamification/HeartsDisplay.tsx` - Lazy load
- [ ] `src/components/gamification/StreakDisplay.tsx` - Lazy load
- [ ] `src/components/gamification/XPProgressBar.tsx` - Lazy load
- [ ] `src/components/mascot/Mascot.tsx` - Lazy load
- [ ] `src/app/admin/page.tsx` - Lazy load heavy client components

## Success Criteria

- [ ] Heavy libraries (TipTap) are lazy loaded ✅ (Already done)
- [ ] Dialog/Modal components are lazy loaded (Most already done)
- [ ] Main page components keep SSR ✅ (Decision made)
- [ ] No functionality broken
- [ ] Bundle size reduced for heavy libraries
- [ ] Lighthouse score maintained/improved
- [ ] Core Web Vitals improved (SSR helps)
- [ ] No accessibility regressions
- [ ] All tests passing

## Current Status Summary

### ✅ Already Implemented
- RichTextEditor lazy loaded (FlashcardModal, FlashcardDialog)
- LessonStartDialog lazy loaded (PathVisualization)
- LessonCompletionDialog lazy loaded (LessonClient)
- DeleteCategoryDialog, DeleteDomainDialog, DeleteFlashcardDialog lazy loaded
- CategoryModal, DomainModal lazy loaded
- Review mode components lazy loaded (ReviewModeSelector)
- PathVisualization, PathSelector lazy loaded (LearnPageClient)

### ✅ Decision: Keep SSR
- ReviewPageClient - Keep SSR
- GroupsClient - Keep SSR
- FlashcardsPageClient - Keep SSR
- DomainsClient - Keep SSR
- ProgressPageClient - Keep SSR
- Settings page components - Keep SSR

### ⏳ Remaining (Optional)
- Additional modals if needed (InviteModal, AssignPathModal, CreateGroupModal) - Can be lazy loaded if they become heavy

