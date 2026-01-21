---
name: api-route
description: Create Next.js API routes with authentication, RBAC, and error handling
allowed-tools: [Write, Read, Edit, Bash]
---

## Purpose
Generate Next.js 16 API routes following project conventions for authentication, authorization, error handling, and database operations.

## Guidelines

### 1. API Route Structure
Location: `src/app/api/<resource>/route.ts`

### 2. Standard Template
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { hasPermission } from '@/lib/rbac';
import { errorResponse, successResponse } from '@/lib/api-utils';

// Request validation schema
const RequestSchema = z.object({
  field: z.string().min(1, 'Field is required'),
  // Add more fields...
});

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    // 2. Authorization check (if needed)
    if (!hasPermission(session.user.role, 'resource:read')) {
      return errorResponse('Forbidden', 403);
    }

    // 3. Parse query params
    const { searchParams } = new URL(request.url);
    const paramValue = searchParams.get('param');

    // 4. Database operations
    const db = getDb();
    const results = db.prepare(`
      SELECT * FROM table WHERE condition = ?
    `).all(paramValue);

    // 5. Return success response
    return successResponse(results);
  } catch (error) {
    console.error('GET /api/resource error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    // 2. Authorization
    if (!hasPermission(session.user.role, 'resource:create')) {
      return errorResponse('Forbidden', 403);
    }

    // 3. Validate request body
    const body = await request.json();
    const validationResult = RequestSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponse(
        'Validation failed',
        400,
        validationResult.error.errors
      );
    }

    const data = validationResult.data;

    // 4. Database operation
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO table (field, user_id) VALUES (?, ?)
    `);
    const result = stmt.run(data.field, session.user.id);

    // 5. Return created resource
    return successResponse(
      { id: result.lastInsertRowid, ...data },
      201
    );
  } catch (error) {
    console.error('POST /api/resource error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { id, ...updates } = body;

    // Verify ownership or admin
    const db = getDb();
    const resource = db.prepare(`
      SELECT user_id FROM table WHERE id = ?
    `).get(id) as { user_id: number } | undefined;

    if (!resource) {
      return errorResponse('Resource not found', 404);
    }

    const isOwner = resource.user_id === Number(session.user.id);
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return errorResponse('Forbidden', 403);
    }

    // Update resource
    const updateStmt = db.prepare(`
      UPDATE table SET field = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    updateStmt.run(updates.field, id);

    return successResponse({ id, ...updates });
  } catch (error) {
    console.error('PATCH /api/resource error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Missing resource ID', 400);
    }

    // Check ownership/authorization
    const db = getDb();
    const resource = db.prepare(`
      SELECT user_id FROM table WHERE id = ?
    `).get(id) as { user_id: number } | undefined;

    if (!resource) {
      return errorResponse('Resource not found', 404);
    }

    const isOwner = resource.user_id === Number(session.user.id);
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return errorResponse('Forbidden', 403);
    }

    // Delete resource
    db.prepare(`DELETE FROM table WHERE id = ?`).run(id);

    return successResponse({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/resource error:', error);
    return errorResponse('Internal server error', 500);
  }
}
```

### 3. Authentication Patterns

**Require authentication:**
```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return errorResponse('Unauthorized', 401);
}
```

**Optional authentication:**
```typescript
const session = await getServerSession(authOptions);
const userId = session?.user?.id;
// Proceed with optional user context
```

### 4. Authorization Patterns

**Role-based:**
```typescript
import { hasPermission } from '@/lib/rbac';

if (!hasPermission(session.user.role, 'resource:action')) {
  return errorResponse('Forbidden', 403);
}
```

**Ownership-based:**
```typescript
const resource = db.prepare('SELECT user_id FROM table WHERE id = ?').get(id);
const isOwner = resource.user_id === Number(session.user.id);
const isAdmin = session.user.role === 'admin';

if (!isOwner && !isAdmin) {
  return errorResponse('Forbidden', 403);
}
```

**Group-based:**
```typescript
const membership = db.prepare(`
  SELECT role FROM group_members
  WHERE group_id = ? AND user_id = ?
`).get(groupId, session.user.id);

if (!membership || !['admin', 'owner'].includes(membership.role)) {
  return errorResponse('Forbidden', 403);
}
```

### 5. Validation with Zod
```typescript
import { z } from 'zod';

const Schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
  role: z.enum(['user', 'admin', 'teacher']),
});

const result = Schema.safeParse(body);
if (!result.success) {
  return errorResponse('Validation failed', 400, result.error.errors);
}
```

### 6. Error Handling
```typescript
import { errorResponse, successResponse } from '@/lib/api-utils';

// Success
return successResponse(data);
return successResponse(data, 201); // Created

// Errors
return errorResponse('Message', 400); // Bad Request
return errorResponse('Unauthorized', 401);
return errorResponse('Forbidden', 403);
return errorResponse('Not Found', 404);
return errorResponse('Internal Server Error', 500);
```

### 7. Database Patterns

**Read operations:**
```typescript
const db = getDb();
const rows = db.prepare('SELECT * FROM table WHERE condition = ?').all(value);
const row = db.prepare('SELECT * FROM table WHERE id = ?').get(id);
```

**Write operations:**
```typescript
const stmt = db.prepare('INSERT INTO table (field) VALUES (?)');
const result = stmt.run(value);
const newId = result.lastInsertRowid;
```

**Transactions:**
```typescript
const db = getDb();
const transaction = db.transaction(() => {
  db.prepare('INSERT INTO table1 (field) VALUES (?)').run(value);
  db.prepare('UPDATE table2 SET field = ? WHERE id = ?').run(value, id);
});
transaction();
```

### 8. Dynamic Routes
For routes like `/api/resource/[id]/route.ts`:

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Use id...
}
```

## Best Practices
- ✅ Always validate input with Zod
- ✅ Check authentication before authorization
- ✅ Use prepared statements to prevent SQL injection
- ✅ Log errors with context
- ✅ Return appropriate HTTP status codes
- ✅ Close database connections (handled by getDb())
- ✅ Use transactions for multi-step operations
- ⚠️ Never trust user input
- ⚠️ Always check ownership before modifications
- ⚠️ Sanitize error messages sent to client
