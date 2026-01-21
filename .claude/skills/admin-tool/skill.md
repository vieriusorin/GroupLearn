---
name: admin-tool
description: Create admin utility scripts for database operations and maintenance
allowed-tools: [Write, Read, Edit, Bash]
---

## Purpose
Create administrative utility scripts for database operations, data management, and system maintenance.

## Guidelines

### 1. Tool Location
All admin tools go in: `tools/<tool-name>.ts`

### 2. Tool Template
```typescript
import Database from 'better-sqlite3';
import path from 'path';
import readline from 'readline';

// Database connection
const dbPath = path.join(process.cwd(), 'data', 'learning-cards.db');
const db = new Database(dbPath);

// Interactive input helper
function question(prompt: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  try {
    console.log('=== Tool Name ===\n');

    // Get user input if needed
    const email = await question('Enter user email: ');

    if (!email) {
      console.error('Error: Email is required');
      process.exit(1);
    }

    // Verify data exists
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      console.error(`Error: User with email ${email} not found`);
      process.exit(1);
    }

    // Confirm action for destructive operations
    const confirm = await question(
      `Are you sure you want to perform this action? (yes/no): `
    );

    if (confirm.toLowerCase() !== 'yes') {
      console.log('Operation cancelled');
      process.exit(0);
    }

    // Perform operation
    db.prepare('UPDATE users SET role = ? WHERE email = ?').run('admin', email);

    console.log('\n✓ Operation completed successfully!');
    console.log(`User ${email} is now an admin.`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();
```

### 3. Common Tool Patterns

**Read-only diagnostic tool:**
```typescript
import { getDb } from '@/lib/db';

const db = getDb();

console.log('=== System Status ===\n');

// Count records
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
console.log(`Total users: ${userCount.count}`);

// Show sample data
const users = db.prepare('SELECT id, email, role, created_at FROM users LIMIT 5').all();
console.table(users);

// Check for issues
const usersWithoutPasswords = db.prepare(`
  SELECT COUNT(*) as count FROM users WHERE password_hash IS NULL
`).get() as { count: number };

if (usersWithoutPasswords.count > 0) {
  console.warn(`⚠ Warning: ${usersWithoutPasswords.count} users without passwords`);
}
```

**Data export tool:**
```typescript
import fs from 'fs';
import { getDb } from '@/lib/db';

const db = getDb();

// Export to JSON
const data = db.prepare('SELECT * FROM table').all();
const json = JSON.stringify(data, null, 2);
const filename = `export-${Date.now()}.json`;

fs.writeFileSync(filename, json);
console.log(`✓ Exported ${data.length} records to ${filename}`);

// Export to CSV
const csvRows = [
  ['id', 'name', 'email'].join(','), // Header
  ...data.map((row: any) => [row.id, row.name, row.email].join(',')),
];
const csv = csvRows.join('\n');
fs.writeFileSync('export.csv', csv);
```

**Batch update tool:**
```typescript
import { getDb } from '@/lib/db';

const db = getDb();

// Use transaction for batch operations
const updateMany = db.transaction((items: any[]) => {
  const stmt = db.prepare('UPDATE table SET field = ? WHERE id = ?');

  for (const item of items) {
    stmt.run(item.value, item.id);
  }
});

try {
  const items = [
    { id: 1, value: 'updated' },
    { id: 2, value: 'updated' },
  ];

  updateMany(items);
  console.log(`✓ Updated ${items.length} records`);
} catch (error) {
  console.error('Batch update failed:', error);
  process.exit(1);
}
```

**Data validation tool:**
```typescript
import { getDb } from '@/lib/db';

const db = getDb();

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

function validateData(): ValidationResult {
  const errors: string[] = [];

  // Check for orphaned records
  const orphanedFlashcards = db.prepare(`
    SELECT COUNT(*) as count FROM flashcards f
    LEFT JOIN categories c ON f.category_id = c.id
    WHERE c.id IS NULL
  `).get() as { count: number };

  if (orphanedFlashcards.count > 0) {
    errors.push(`Found ${orphanedFlashcards.count} flashcards with invalid category_id`);
  }

  // Check for invalid dates
  const invalidDates = db.prepare(`
    SELECT COUNT(*) as count FROM review_history
    WHERE reviewed_at > datetime('now')
  `).get() as { count: number };

  if (invalidDates.count > 0) {
    errors.push(`Found ${invalidDates.count} reviews with future dates`);
  }

  // Check for duplicate emails
  const duplicateEmails = db.prepare(`
    SELECT email, COUNT(*) as count FROM users
    GROUP BY email HAVING count > 1
  `).all() as Array<{ email: string; count: number }>;

  if (duplicateEmails.length > 0) {
    errors.push(`Found duplicate emails: ${duplicateEmails.map(d => d.email).join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

console.log('=== Data Validation ===\n');
const result = validateData();

if (result.isValid) {
  console.log('✓ All validations passed!');
} else {
  console.log('✗ Validation failed:\n');
  result.errors.forEach((error) => console.log(`  - ${error}`));
  process.exit(1);
}
```

**Cleanup tool:**
```typescript
import { getDb } from '@/lib/db';

const db = getDb();

console.log('=== Data Cleanup ===\n');

// Delete old sessions
const deletedSessions = db.prepare(`
  DELETE FROM sessions WHERE expires < datetime('now')
`).run();
console.log(`✓ Deleted ${deletedSessions.changes} expired sessions`);

// Archive old data
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
const archived = db.prepare(`
  UPDATE logs SET archived = 1
  WHERE created_at < ? AND archived = 0
`).run(thirtyDaysAgo);
console.log(`✓ Archived ${archived.changes} old log entries`);

// Vacuum database
db.exec('VACUUM');
console.log('✓ Database optimized');
```

### 4. Add Tool to package.json

After creating a tool, add it to scripts:
```json
{
  "scripts": {
    "tool:<name>": "tsx tools/<name>.ts"
  }
}
```

### 5. Testing Tools

Create a test database:
```bash
# Copy production database
cp data/learning-cards.db data/learning-cards-test.db

# Run tool on test database
DATABASE_URL=data/learning-cards-test.db tsx tools/my-tool.ts

# If successful, run on production
tsx tools/my-tool.ts
```

## Common Tool Examples

### 1. Make User Admin
```typescript
// tools/make-admin.ts
import readline from 'readline';
import { getDb } from '@/lib/db';

const db = getDb();

async function question(prompt: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const email = await question('Enter user email: ');

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user) {
    console.error('User not found');
    process.exit(1);
  }

  db.prepare('UPDATE users SET role = ? WHERE email = ?').run('admin', email);

  console.log(`✓ ${email} is now an admin`);
}

main();
```

### 2. Database Statistics
```typescript
// tools/db-stats.ts
import { getDb } from '@/lib/db';

const db = getDb();

const tables = ['users', 'domains', 'categories', 'flashcards', 'review_history'];

console.log('=== Database Statistics ===\n');

tables.forEach((table) => {
  const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as { count: number };
  console.log(`${table.padEnd(20)} ${count.count}`);
});
```

### 3. Reset User Progress
```typescript
// tools/reset-progress.ts
import readline from 'readline';
import { getDb } from '@/lib/db';

async function question(prompt: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const db = getDb();
  const email = await question('Enter user email: ');

  const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email) as
    | { id: number; email: string }
    | undefined;

  if (!user) {
    console.error('User not found');
    process.exit(1);
  }

  const confirm = await question(
    `Reset all progress for ${user.email}? This cannot be undone! (yes/no): `
  );

  if (confirm.toLowerCase() !== 'yes') {
    console.log('Cancelled');
    process.exit(0);
  }

  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM review_history WHERE user_id = ?').run(user.id);
    db.prepare('DELETE FROM user_progress WHERE user_id = ?').run(user.id);
    db.prepare('DELETE FROM xp_history WHERE user_id = ?').run(user.id);
    db.prepare(`
      UPDATE users
      SET xp = 0, level = 1, streak = 0, hearts = 5
      WHERE id = ?
    `).run(user.id);
  });

  transaction();

  console.log(`✓ Progress reset for ${user.email}`);
}

main();
```

## Best Practices
- ✅ Always close database connections
- ✅ Use transactions for multi-step operations
- ✅ Confirm destructive operations
- ✅ Validate input data
- ✅ Provide clear success/error messages
- ✅ Log operations for audit trail
- ✅ Test on backup database first
- ✅ Handle errors gracefully
- ⚠️ Never skip confirmation for deletions
- ⚠️ Don't run tools in production without testing
- ⚠️ Always backup before bulk operations
