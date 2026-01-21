# Code Templates - DDD Implementation

**Quick reference templates for implementing DDD patterns in the Learning Cards app**

---

## 📋 Table of Contents

1. [Use Case Template](#use-case-template)
2. [Repository Template](#repository-template)
3. [Server Action Template](#server-action-template)
4. [React Query Hook Template](#react-query-hook-template)
5. [API Route Template](#api-route-template)
6. [Event Handler Template](#event-handler-template)

---

## 1. Use Case Template

### Pattern: Application Service / Use Case

**File Location:** `src/application/use-cases/[context]/[Action]UseCase.ts`

```typescript
import { UserId, [EntityId] } from '@/domains/shared/types/branded-types';
import { DomainError } from '@/domains/shared/errors';
import { [Entity] } from '@/domains/[context]/entities/[Entity]';
import { I[Entity]Repository } from '@/domains/[context]/repositories/I[Entity]Repository';

/**
 * Request DTO
 */
export interface [Action]Request {
  userId: string;
  // Add other primitive types here
  name: string;
  description?: string | null;
}

/**
 * Response DTO
 */
export interface [Action]Response {
  success: boolean;
  data: {
    id: number;
    name: string;
    // Add other fields to return to client
  };
}

/**
 * [Action]UseCase
 *
 * Description: What this use case does
 *
 * Flow:
 * 1. Step one
 * 2. Step two
 * 3. Step three
 * 4. Return result
 */
export class [Action]UseCase {
  constructor(
    private readonly entityRepository: I[Entity]Repository
    // Inject other repositories needed
  ) {}

  async execute(request: [Action]Request): Promise<[Action]Response> {
    // 1. Convert primitives to value objects/branded types
    const userId = UserId(request.userId);

    // 2. Load entities from repositories
    const entity = await this.entityRepository.findById(entityId);
    if (!entity) {
      throw new DomainError('Entity not found', 'ENTITY_NOT_FOUND');
    }

    // 3. Execute domain logic (call methods on entities/aggregates)
    entity.someBusinessLogic();

    // 4. Save changes
    await this.entityRepository.save(entity);

    // 5. Publish domain events (if needed)
    const events = entity.getEvents();
    // await this.eventPublisher.publishAll(events);
    entity.clearEvents();

    // 6. Return DTO
    return {
      success: true,
      data: this.toDTO(entity),
    };
  }

  private toDTO(entity: [Entity]): [Action]Response['data'] {
    return {
      id: entity.getId() as number,
      name: entity.getName(),
      // Map other fields
    };
  }
}
```

**Example Usage:**
```typescript
// In API route or Server Action
const useCase = new CreateDomainUseCase(domainRepository);
const result = await useCase.execute({
  userId: session.user.id,
  name: 'Mathematics',
  description: 'Math learning path',
});
```

---

## 2. Repository Template

### Pattern: Infrastructure Persistence

**File Location:** `src/infrastructure/repositories/[context]/Sqlite[Entity]Repository.ts`

```typescript
import type { Database } from 'better-sqlite3';
import { [Entity] } from '@/domains/[context]/entities/[Entity]';
import type { I[Entity]Repository } from '@/domains/[context]/repositories/I[Entity]Repository';
import { [Entity]Id } from '@/domains/shared/types/branded-types';
import { DomainError } from '@/domains/shared/errors';

/**
 * SQLite implementation of [Entity] repository
 */
export class Sqlite[Entity]Repository implements I[Entity]Repository {
  constructor(private readonly db: Database) {}

  async findById(id: [Entity]Id): Promise<[Entity] | null> {
    const row = this.db
      .prepare('SELECT * FROM [table_name] WHERE id = ?')
      .get(id as number) as any;

    if (!row) return null;

    return this.mapToEntity(row);
  }

  async findAll(): Promise<[Entity][]> {
    const rows = this.db
      .prepare('SELECT * FROM [table_name] ORDER BY created_at DESC')
      .all() as any[];

    return rows.map((row) => this.mapToEntity(row));
  }

  async save(entity: [Entity]): Promise<[Entity]> {
    if (entity.isNew()) {
      // Insert new entity
      const result = this.db
        .prepare(
          'INSERT INTO [table_name] (field1, field2, created_at) VALUES (?, ?, ?)'
        )
        .run(
          entity.getField1(),
          entity.getField2(),
          entity.getCreatedAt().toISOString()
        );

      return [Entity].reconstitute(
        [Entity]Id(result.lastInsertRowid as number),
        entity.getField1(),
        entity.getField2(),
        entity.getCreatedAt()
      );
    } else {
      // Update existing entity
      this.db
        .prepare('UPDATE [table_name] SET field1 = ?, field2 = ? WHERE id = ?')
        .run(
          entity.getField1(),
          entity.getField2(),
          entity.getId() as number
        );

      return entity;
    }
  }

  async delete(id: [Entity]Id): Promise<void> {
    const result = this.db
      .prepare('DELETE FROM [table_name] WHERE id = ?')
      .run(id as number);

    if (result.changes === 0) {
      throw new DomainError('[Entity] not found', '[ENTITY]_NOT_FOUND');
    }
  }

  async exists(id: [Entity]Id): Promise<boolean> {
    const row = this.db
      .prepare('SELECT 1 FROM [table_name] WHERE id = ?')
      .get(id as number) as any;

    return !!row;
  }

  async count(): Promise<number> {
    const row = this.db
      .prepare('SELECT COUNT(*) as count FROM [table_name]')
      .get() as { count: number };

    return row.count;
  }

  /**
   * Map database row to domain entity
   */
  private mapToEntity(row: any): [Entity] {
    return [Entity].reconstitute(
      [Entity]Id(row.id),
      row.field1,
      row.field2,
      new Date(row.created_at)
    );
  }
}
```

**Example Usage:**
```typescript
// In DI container
const db = getDb();
const domainRepository = new SqliteDomainRepository(db);
```

---

## 3. Server Action Template

### Pattern: Next.js Server Action with Auth

**File Location:** `src/presentation/actions/[context]/[action-name].ts`

```typescript
'use server';

import { withAuth } from '@/presentation/utils/action-wrapper';
import { [Action]UseCase } from '@/application/use-cases/[context]/[Action]UseCase';
import { repositories } from '@/infrastructure/di/container';
import type { ActionResult } from '@/presentation/types/action-result';

/**
 * Server Action: [Action description]
 *
 * @param formData - Form data from client
 * @returns ActionResult with data or error
 */
export async function [actionName](
  formData: FormData
): Promise<ActionResult<[ResponseType]>> {
  return withAuth(['admin', 'member'], async (user) => {
    // 1. Extract data from formData
    const name = formData.get('name') as string;
    const description = formData.get('description') as string | null;

    // 2. Validate input (basic checks)
    if (!name || name.trim().length === 0) {
      return {
        success: false,
        error: 'Name is required',
        code: 'VALIDATION_ERROR',
      };
    }

    // 3. Execute use case
    const useCase = new [Action]UseCase(repositories.[entity]);
    const result = await useCase.execute({
      userId: user.id,
      name: name.trim(),
      description: description?.trim() || null,
    });

    // 4. Return success
    return {
      success: true,
      data: result.data,
    };
  });
}
```

**Alternative: JSON Input**
```typescript
export async function [actionName](
  input: { name: string; description?: string }
): Promise<ActionResult<[ResponseType]>> {
  return withAuth(['admin', 'member'], async (user) => {
    const useCase = new [Action]UseCase(repositories.[entity]);
    const result = await useCase.execute({
      userId: user.id,
      ...input,
    });

    return {
      success: true,
      data: result.data,
    };
  });
}
```

**Example Usage in Component:**
```typescript
'use client';
import { createDomain } from '@/presentation/actions/content/create-domain';

export function DomainForm() {
  async function handleSubmit(formData: FormData) {
    const result = await createDomain(formData);

    if (!result.success) {
      console.error(result.error);
      return;
    }

    console.log('Created:', result.data);
  }

  return <form action={handleSubmit}>...</form>;
}
```

---

## 4. React Query Hook Template

### Pattern: TanStack Query Hook

**File Location:** `src/presentation/hooks/use[Entity].ts`

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { [actionName] } from '@/presentation/actions/[context]/[action-name]';

/**
 * Query hook for fetching [entities]
 */
export function use[Entities]() {
  return useQuery({
    queryKey: ['[entities]'],
    queryFn: async () => {
      const response = await fetch('/api/[entities]');
      if (!response.ok) throw new Error('Failed to fetch [entities]');
      return response.json();
    },
  });
}

/**
 * Query hook for fetching a single [entity]
 */
export function use[Entity](id: number | null) {
  return useQuery({
    queryKey: ['[entity]', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`/api/[entities]/${id}`);
      if (!response.ok) throw new Error('Failed to fetch [entity]');
      return response.json();
    },
    enabled: !!id,
  });
}

/**
 * Mutation hook for creating [entity]
 */
export function useCreate[Entity]() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const result = await [actionName](data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['[entities]'] });
    },
  });
}

/**
 * Mutation hook for updating [entity]
 */
export function useUpdate[Entity]() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: number;
      name: string;
      description?: string;
    }) => {
      const result = await update[Entity](id, data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate specific entity and list
      queryClient.invalidateQueries({ queryKey: ['[entity]', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['[entities]'] });
    },
  });
}

/**
 * Mutation hook for deleting [entity]
 */
export function useDelete[Entity]() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const result = await delete[Entity](id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['[entities]'] });
    },
  });
}
```

**Example Usage:**
```typescript
'use client';

export function DomainsList() {
  const { data: domains, isLoading } = useDomains();
  const createMutation = useCreateDomain();
  const deleteMutation = useDeleteDomain();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {domains?.map((domain) => (
        <div key={domain.id}>
          {domain.name}
          <button onClick={() => deleteMutation.mutate(domain.id)}>
            Delete
          </button>
        </div>
      ))}
      <button
        onClick={() =>
          createMutation.mutate({ name: 'New Domain', description: null })
        }
      >
        Create
      </button>
    </div>
  );
}
```

---

## 5. API Route Template

### Pattern: Next.js App Router API Route

**File Location:** `src/app/api/[resource]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { [Action]UseCase } from '@/application/use-cases/[context]/[Action]UseCase';
import { repositories } from '@/infrastructure/di/container';
import { handleApiError } from '@/lib/api-utils';

/**
 * GET /api/[resource]
 * Get all [resources]
 */
export async function GET(request: NextRequest) {
  try {
    const useCase = new Get[Resources]UseCase(repositories.[entity]);
    const result = await useCase.execute();

    return NextResponse.json(result.data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/[resource]
 * Create a new [resource]
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod (if using validation schemas)
    // const validated = createSchema.parse(body);

    const useCase = new Create[Resource]UseCase(repositories.[entity]);
    const result = await useCase.execute({
      ...body,
      // userId from session if needed
    });

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Dynamic Route Template:**
**File Location:** `src/app/api/[resource]/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { [Action]UseCase } from '@/application/use-cases/[context]/[Action]UseCase';
import { repositories } from '@/infrastructure/di/container';

/**
 * GET /api/[resource]/[id]
 * Get a single [resource]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const useCase = new Get[Resource]UseCase(repositories.[entity]);
    const result = await useCase.execute({ id });

    return NextResponse.json(result.data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/[resource]/[id]
 * Update a [resource]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    const useCase = new Update[Resource]UseCase(repositories.[entity]);
    const result = await useCase.execute({ id, ...body });

    return NextResponse.json(result.data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/[resource]/[id]
 * Delete a [resource]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const useCase = new Delete[Resource]UseCase(repositories.[entity]);
    await useCase.execute({ id });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## 6. Event Handler Template

### Pattern: Domain Event Handler

**File Location:** `src/infrastructure/events/handlers/[EventName]Handler.ts`

```typescript
import { [EventName] } from '@/domains/[context]/events/[EventName]';
import { I[Entity]Repository } from '@/domains/[context]/repositories/I[Entity]Repository';

/**
 * Handler for [EventName]
 *
 * Purpose: Describe what this handler does when the event occurs
 *
 * Example: When a lesson is completed, update the user's progress
 */
export class [EventName]Handler {
  constructor(
    private readonly entityRepository: I[Entity]Repository
    // Inject other repositories needed
  ) {}

  async handle(event: [EventName]): Promise<void> {
    // 1. Load affected entities
    const entity = await this.entityRepository.findById(event.entityId);
    if (!entity) {
      console.warn(`Entity ${event.entityId} not found for event handler`);
      return;
    }

    // 2. Perform side effect (update state, send notification, etc.)
    // entity.someMethod();

    // 3. Save changes
    await this.entityRepository.save(entity);

    // Log for debugging
    console.log(`Handled ${event.constructor.name} for entity ${event.entityId}`);
  }
}
```

**Event Publisher Registration:**
**File Location:** `src/infrastructure/events/handlers/index.ts`

```typescript
import { DomainEventPublisher } from '../DomainEventPublisher';
import { LessonCompletedEvent } from '@/domains/learning-path/events';
import { LessonCompletedHandler } from './LessonCompletedHandler';
import { repositories } from '@/infrastructure/di/container';

/**
 * Register all event handlers
 */
export function registerEventHandlers(publisher: DomainEventPublisher) {
  // Lesson completed -> Update user progress
  const lessonCompletedHandler = new LessonCompletedHandler(
    repositories.userProgress
  );

  publisher.subscribe<LessonCompletedEvent>(
    'LessonCompletedEvent',
    async (event) => {
      await lessonCompletedHandler.handle(event);
    }
  );

  // Add more event handlers here
  // publisher.subscribe<XPEarnedEvent>('XPEarnedEvent', async (event) => { ... });
}
```

---

## 🔧 Dependency Injection Container

**File Location:** `src/infrastructure/di/container.ts`

```typescript
import { getDb } from '@/infrastructure/database';
import { SqliteDomainRepository } from '@/infrastructure/repositories/content/SqliteDomainRepository';
import { SqliteCategoryRepository } from '@/infrastructure/repositories/content/SqliteCategoryRepository';
// Import other repositories

/**
 * Dependency Injection Container
 *
 * Singleton pattern for repositories and services
 */
class Container {
  private static instance: Container;
  private db = getDb();

  // Repositories
  public readonly repositories = {
    domain: new SqliteDomainRepository(this.db),
    category: new SqliteCategoryRepository(this.db),
    // Add other repositories
  };

  // Use Cases (optional - can instantiate in Server Actions instead)
  public readonly useCases = {
    // createDomain: new CreateDomainUseCase(this.repositories.domain),
    // Add other use cases
  };

  private constructor() {}

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }
}

// Export singleton instance
export const container = Container.getInstance();
export const repositories = container.repositories;
export const useCases = container.useCases;
```

---

## 📝 Quick Reference: File Naming Conventions

| Type | File Name Pattern | Example |
|------|-------------------|---------|
| Use Case | `[Action][Entity]UseCase.ts` | `CreateDomainUseCase.ts` |
| Repository | `Sqlite[Entity]Repository.ts` | `SqliteDomainRepository.ts` |
| Server Action | `[action]-[entity].ts` | `create-domain.ts` |
| React Hook | `use[Entity].ts` or `use[Action][Entity].ts` | `useDomains.ts`, `useCreateDomain.ts` |
| API Route | `route.ts` in `/api/[resource]/` | `/api/domains/route.ts` |
| Event Handler | `[EventName]Handler.ts` | `LessonCompletedHandler.ts` |

---

## 🎯 Common Patterns Checklist

When implementing a new feature, follow this checklist:

- [ ] Create domain entity/aggregate in `src/domains/`
- [ ] Define repository interface in `src/domains/[context]/repositories/`
- [ ] Implement repository in `src/infrastructure/repositories/`
- [ ] Create use case in `src/application/use-cases/`
- [ ] Create Server Action in `src/presentation/actions/`
- [ ] Create React Query hook in `src/presentation/hooks/`
- [ ] Update API route (if needed) in `src/app/api/`
- [ ] Register in DI container `src/infrastructure/di/container.ts`
- [ ] Add event handlers (if emitting events)
- [ ] Test the flow end-to-end

---

**Pro Tips:**

1. **Always start with the domain** - Model the business logic first
2. **Keep use cases thin** - Delegate to domain entities
3. **DTOs at boundaries** - Convert at presentation and application layers
4. **Events for side effects** - Use domain events for cross-aggregate communication
5. **Test domain logic** - Unit test entities and aggregates without infrastructure

Happy coding! 🚀
