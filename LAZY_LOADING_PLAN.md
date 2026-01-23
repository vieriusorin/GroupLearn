# Lazy Loading Implementation Plan

## Overview
This document outlines the strategy for implementing lazy loading across the Next.js application to improve initial load performance, reduce bundle size, and enhance user experience.

## Current State Analysis

### Findings
- **No existing lazy loading**: No `next/dynamic` imports found in the codebase
- **Heavy components identified**:
  - RichTextEditor (TipTap library - ~50KB+)
  - Admin client components (large, complex state management)
  - Lesson components (multiple dialogs, complex interactions)
  - Review components (multiple modes, heavy logic)
  - Dialog/Modal components (conditionally rendered)
  - Large page client components

### Performance Impact Areas
1. **Initial Bundle Size**: All components loaded upfront
2. **Admin Routes**: Heavy admin components loaded even when not accessed
3. **Rich Text Editor**: TipTap loaded even when not editing
4. **Dialogs/Modals**: Loaded but not always visible
5. **Review/Lesson Pages**: Complex components loaded immediately

## Strategy

### 1. Route-Based Code Splitting (Automatic)
Next.js automatically splits routes, but we can optimize further by:
- Ensuring pages use dynamic imports for heavy client components
- Separating server and client components properly

### 2. Component-Level Lazy Loading
Use `next/dynamic` with `ssr: false` for:
- Client-only components (dialogs, modals, editors)
- Heavy third-party libraries (TipTap)
- Conditionally rendered components
- Admin components (not accessed by most users)

### 3. Library-Level Lazy Loading
- TipTap editor: Load only when editing
- Large icon libraries: Load on demand
- Chart/visualization libraries: Load when needed

## Implementation Phases

### Phase 1: Critical Heavy Components
**Priority: High**
- RichTextEditor (TipTap is heavy)
- Dialog/Modal components
- Admin layout and components

### Phase 2: Page-Level Optimizations
**Priority: Medium**
- Admin pages
- Lesson pages
- Review pages
- Settings page

### Phase 3: Conditional Components
**Priority: Medium**
- Mode selectors
- Tab content
- Collapsible sections

### Phase 4: Fine-Tuning
**Priority: Low**
- Icon optimization
- Utility component lazy loading
- Performance monitoring

## Implementation Guidelines

### When to Use Lazy Loading

✅ **DO lazy load:**
- Heavy third-party libraries (TipTap, charts, etc.)
- Components only used in specific routes
- Dialogs, modals, and overlays
- Admin/privileged components
- Components with large dependencies
- Conditionally rendered components

❌ **DON'T lazy load:**
- Core layout components (TopBar, MainLayout)
- Critical above-the-fold content
- Small utility components
- Components needed for initial render
- Shared UI components (Button, Card, etc.)

### Best Practices

1. **Use `ssr: false` for client-only components**
   ```typescript
   const Component = dynamic(() => import('./Component'), { ssr: false });
   ```

2. **Provide loading states**
   ```typescript
   const Component = dynamic(() => import('./Component'), {
     loading: () => <Skeleton />,
     ssr: false,
   });
   ```

3. **Use named exports for better tree-shaking**
   ```typescript
   const Component = dynamic(() => import('./Component').then(mod => mod.Component));
   ```

4. **Lazy load at the usage point, not import point**
   - Import dynamic in the component that uses it
   - Not at the top of files

5. **Consider prefetching for likely next actions**
   - Use `next/link` prefetch for navigation
   - Preload critical dynamic imports

## Components to Lazy Load

### High Priority

1. **RichTextEditor** (`src/components/rich-text-editor.tsx`)
   - Heavy TipTap library
   - Only used in admin/editing contexts
   - Impact: ~50KB+ reduction

2. **Admin Components** (`src/components/admin/*`)
   - Large components, not accessed by most users
   - Complex state management
   - Impact: Significant bundle reduction for non-admin users

3. **Dialog Components**
   - LessonStartDialog
   - LessonCompletionDialog
   - DeleteCategoryDialog
   - DeleteDomainDialog
   - DeleteFlashcardDialog
   - FlashcardModal
   - CategoryModal
   - DomainModal
   - Impact: Load only when needed

4. **Review Mode Components**
   - FlashcardMode
   - QuizMode
   - RecallMode
   - Impact: Load only active mode

### Medium Priority

5. **Lesson Components**
   - LessonClient
   - LessonCompletionDialog
   - LessonStartDialog
   - Impact: Load when lesson starts

6. **Admin Page Clients**
   - AdminCategoriesClient
   - AdminDomainsClient
   - AdminFlashcardsClient
   - AdminUsersClient
   - Impact: Route-based splitting

7. **Path Components**
   - PathVisualization
   - PathSelector
   - Impact: Load when viewing paths

### Low Priority

8. **Settings Components**
   - Settings tabs content
   - Impact: Load active tab only

9. **Progress Components**
   - Charts and visualizations
   - Impact: Load when viewing progress

## Expected Benefits

### Performance Metrics
- **Initial Bundle Size**: 30-50% reduction
- **Time to Interactive (TTI)**: 20-40% improvement
- **First Contentful Paint (FCP)**: 15-25% improvement
- **Admin Route Load**: 60-70% reduction for non-admin users

### User Experience
- Faster initial page load
- Reduced memory usage
- Better mobile performance
- Improved Core Web Vitals scores

## Monitoring & Validation

### Metrics to Track
1. Bundle size analysis (`npm run build` output)
2. Lighthouse scores (before/after)
3. Network tab analysis
4. React DevTools Profiler
5. Next.js Analytics

### Tools
- `@next/bundle-analyzer` for bundle analysis
- Lighthouse CI for performance monitoring
- Web Vitals API for real user metrics

## Rollout Strategy

1. **Phase 1**: Implement critical components (RichTextEditor, Dialogs)
2. **Phase 2**: Test and validate performance improvements
3. **Phase 3**: Roll out page-level optimizations
4. **Phase 4**: Fine-tune and optimize further
5. **Phase 5**: Monitor and iterate

## Notes

- Always test lazy-loaded components thoroughly
- Ensure loading states are user-friendly
- Monitor for any hydration issues
- Keep accessibility in mind (keyboard navigation, screen readers)
- Document lazy-loaded components for team awareness

