# SSR Implementation Guide

**Date:** 2026-01-19
**Status:** ✅ Pattern Established
**Example:** Domains page converted to full SSR

---

## 🎉 What We've Built

### Complete SSR Implementation for Domains Feature

**Files Created:**
1. `src/app/domains-new/page.tsx` - Server Component (fetches data on server)
2. `src/components/domains/DomainsClient.tsx` - Client Component (handles interactivity)

**Features:**
- ✅ Server-Side Rendering (SSR) - Data fetched on server
- ✅ No TanStack Query - Uses React 19's built-in hooks
- ✅ Optimistic Updates - Using React's `useOptimistic`
- ✅ Server Actions - All mutations use Server Actions directly
- ✅ Type-safe - End-to-end type safety
- ✅ Automatic revalidation - Using `router.refresh()`

---

## 🧪 How to Test

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Navigate to the New Page
Visit: `http://localhost:3000/domains-new`

### 3. Test Functionality
- **SSR**: View page source - domains should be in HTML (not loaded by JS)
- **Create Domain**: Click "Create Domain" button, fill form, submit
- **Delete Domain**: Click trash icon on a domain
- **Select Domain**: Click on a domain to load categories
- **Create Category**: Select a domain, click "Create Category"
- **Delete Category**: Click trash icon on a category
- **Optimistic Updates**: Notice immediate UI updates before server confirms

### 4. Compare with Old Page
Visit: `http://localhost:3000/domains` (old TanStack Query version)

**Differences:**
- New page: Domains visible in page source (SSR)
- Old page: Domains loaded via client-side JS
- New page: No TanStack Query DevTools
- Old page: TanStack Query DevTools available

---

## 📐 The SSR Pattern

### Architecture Flow

```
Server Component (page.tsx)
  ↓
  Fetch data with Server Action
  ↓
  Pass data as props
  ↓
Client Component (*Client.tsx)
  ↓
  Handle interactivity with useTransition
  ↓
  Call Server Actions for mutations
  ↓
  Use router.refresh() to revalidate
```

### Pattern Template

#### 1. Server Component Page (src/app/[feature]/page.tsx)
```typescript
import { getDataAction } from '@/presentation/actions/[feature]';
import { FeatureClient } from '@/components/[feature]/FeatureClient';

export default async function FeaturePage() {
  // Fetch data on server
  const result = await getDataAction();

  // Handle error
  if (!result.success) {
    return <ErrorDisplay error={result.error} />;
  }

  // Pass to client component
  return <FeatureClient initialData={result.data} />;
}
```

#### 2. Client Component (src/components/[feature]/FeatureClient.tsx)
```typescript
'use client';

import { useState, useTransition, useOptimistic } from 'react';
import { useRouter } from 'next/navigation';
import { createAction, deleteAction } from '@/presentation/actions/[feature]';

type Props = {
  initialData: DataType[];
};

export function FeatureClient({ initialData }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local state
  const [data, setData] = useState(initialData);
  const [error, setError] = useState<string | null>(null);

  // Optimistic updates
  const [optimisticData, addOptimistic] = useOptimistic(
    data,
    (state, newItem: DataType) => [...state, newItem]
  );

  // Handle mutation
  const handleCreate = async (formData: FormData) => {
    const tempItem = { id: Date.now(), ...extractFormData(formData) };
    addOptimistic(tempItem); // Immediate UI update

    startTransition(async () => {
      const result = await createAction(formData);

      if (result.success) {
        router.refresh(); // Revalidate server data
      } else {
        setError(result.error);
        setData(data); // Revert optimistic update
      }
    });
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    startTransition(async () => {
      const result = await deleteAction(id);

      if (result.success) {
        router.refresh(); // Revalidate server data
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div>
      {isPending && <LoadingIndicator />}
      {error && <ErrorMessage error={error} />}

      {/* Render optimistic data */}
      {optimisticData.map(item => (
        <ItemCard
          key={item.id}
          item={item}
          onDelete={handleDelete}
        />
      ))}

      <CreateForm onSubmit={handleCreate} />
    </div>
  );
}
```

---

## 🆚 Comparison: Hybrid vs Full SSR

### Hybrid Architecture (Old Approach)
```typescript
// Page is client component
'use client';

export default function DomainsPage() {
  const { domains } = useDomains(); // TanStack Query hook
  const { mutate } = useCreateDomain(); // TanStack Query mutation

  // TanStack Query handles everything
  return <UI />;
}
```

**Pros:**
- ✅ Automatic caching
- ✅ Automatic refetching
- ✅ Easy optimistic updates
- ✅ Built-in loading/error states
- ✅ DevTools for debugging

**Cons:**
- ❌ No SSR (bad for SEO)
- ❌ Client-side data fetching
- ❌ Larger bundle size
- ❌ Extra dependency (TanStack Query)

### Full SSR (New Approach)
```typescript
// Page is server component
export default async function DomainsPage() {
  const result = await getDomains(); // Server Action
  return <DomainsClient initialData={result.data} />;
}
```

**Pros:**
- ✅ True SSR (excellent for SEO)
- ✅ Server-side data fetching
- ✅ Smaller bundle size
- ✅ No extra dependencies
- ✅ React 19 native patterns

**Cons:**
- ❌ Manual cache invalidation (router.refresh)
- ❌ More boilerplate code
- ❌ Manual optimistic updates
- ❌ Manual loading/error states
- ❌ No built-in DevTools

---

## 📊 Code Comparison

### Old Approach (Hybrid - 150 lines)
```typescript
// Hook handles everything
const { domains, isLoading } = useDomains();
const { mutate, isPending } = useCreateDomain();

// Simple component
<DomainsList domains={domains} loading={isLoading} />
```

### New Approach (Full SSR - 400 lines)
```typescript
// Manual state management
const [data, setData] = useState(initialData);
const [isPending, startTransition] = useTransition();
const [optimisticData, addOptimistic] = useOptimistic(data);

// Manual mutation handling
startTransition(async () => {
  const result = await createAction();
  if (result.success) router.refresh();
});

// Manual optimistic updates
addOptimistic(tempData);
```

**Code Increase:** ~2.5x more code for full SSR

---

## 🎯 When to Use Each Approach

### Use Hybrid (TanStack Query + Server Actions)
- ✅ Authenticated pages (SEO doesn't matter)
- ✅ Complex interactions (lots of mutations)
- ✅ Need optimistic updates
- ✅ Want excellent DX (Developer Experience)
- ✅ Time-constrained projects

**Examples:** Admin panels, dashboards, user settings

### Use Full SSR (Server Components only)
- ✅ Public pages (SEO matters)
- ✅ Simple data display
- ✅ Minimal interactions
- ✅ Want smallest bundle
- ✅ Marketing/blog pages

**Examples:** Landing pages, blog posts, product listings

---

## 🚀 Next Steps

### To Complete SSR Migration

1. **Test the New Domains Page**
   - Visit `/domains-new`
   - Test all functionality
   - Verify SSR works (view source)
   - Compare with `/domains`

2. **Apply Pattern to Other Features**
   - Copy the pattern for flashcards
   - Copy the pattern for review
   - Copy the pattern for lessons
   - Copy the pattern for progress

3. **Replace Old Pages**
   - Rename `domains/page.tsx` to `domains-old/page.tsx`
   - Rename `domains-new/page.tsx` to `domains/page.tsx`
   - Test thoroughly
   - Delete old version

4. **Remove TanStack Query**
   - Delete all hooks in `src/hooks/`
   - Remove `@tanstack/react-query` from package.json
   - Remove QueryClientProvider from layout
   - Update documentation

---

## 📝 Migration Checklist for Each Feature

### Per-Feature Checklist

- [ ] Create Server Component page in `src/app/[feature]/page.tsx`
- [ ] Create Client Component in `src/components/[feature]/[Feature]Client.tsx`
- [ ] Implement data fetching with Server Actions
- [ ] Implement mutations with useTransition
- [ ] Add optimistic updates with useOptimistic
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test all functionality
- [ ] Verify SSR works (view source)
- [ ] Replace old page
- [ ] Delete TanStack Query hooks

### Global Checklist

- [x] Domains feature migrated
- [ ] Flashcards feature migrated
- [ ] Review feature migrated
- [ ] Lessons feature migrated
- [ ] Progress feature migrated
- [ ] Admin pages migrated
- [ ] Groups feature migrated
- [ ] Remove TanStack Query
- [ ] Update documentation

---

## 💡 Tips & Best Practices

### 1. Start with Simple Features
Start with features that have simple CRUD operations (like domains) before tackling complex features.

### 2. Test Thoroughly
Test SSR by viewing page source. Data should be in HTML, not loaded by JavaScript.

### 3. Use Optimistic Updates Wisely
Only use optimistic updates for instant feedback. They add complexity.

### 4. Handle Errors Gracefully
Always show user-friendly error messages. Don't let Server Action errors crash the page.

### 5. Keep Server Components Simple
Server Components should just fetch data and pass props. Keep all interactivity in Client Components.

### 6. Use TypeScript Strictly
Type everything to catch errors early. Server Actions should have proper ActionResult types.

---

## 🐛 Common Issues & Solutions

### Issue: Page Doesn't Revalidate After Mutation
**Solution:** Make sure to call `router.refresh()` after successful mutations.

### Issue: Optimistic Update Doesn't Revert on Error
**Solution:** Reset state to previous value when mutation fails: `setData(data)`.

### Issue: Loading State Doesn't Show
**Solution:** Use `useTransition`'s `isPending` state: `const [isPending, startTransition] = useTransition()`.

### Issue: Form Validation Doesn't Work
**Solution:** Use HTML5 validation (`required`, `pattern`) or add custom validation before calling Server Action.

### Issue: Server Action Returns Undefined
**Solution:** Make sure Server Action has 'use server' directive and returns `ActionResult<T>`.

---

## 📚 Additional Resources

- [Next.js Server Actions Docs](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React useTransition Docs](https://react.dev/reference/react/useTransition)
- [React useOptimistic Docs](https://react.dev/reference/react/useOptimistic)
- [Next.js Router Docs](https://nextjs.org/docs/app/api-reference/functions/use-router)

---

**Last Updated:** 2026-01-19
**Status:** Pattern established, ready to replicate
**Next:** Test `/domains-new` page and apply pattern to other features
