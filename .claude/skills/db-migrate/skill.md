---
name: db-migrate
description: Create and run database migrations for SQLite schema changes
allowed-tools: [Write, Bash, Read, Edit]
---

## Purpose
Create migration scripts for database schema changes in the learning-cards SQLite database.

## Guidelines

### 1. Migration File Structure
- Create migration files in `tools/` directory
- Use descriptive names: `migrate-<feature-name>.ts` or `add-<column-name>.ts`
- Follow existing patterns in tools/ folder

### 2. Migration Script Template
```typescript
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'learning-cards.db');
const db = new Database(dbPath);

try {
  console.log('Starting migration: <description>...');

  // Check if migration already applied
  const checkStmt = db.prepare(`
    SELECT COUNT(*) as count FROM pragma_table_info('<table>')
    WHERE name = '<column>'
  `);
  const result = checkStmt.get() as { count: number };

  if (result.count > 0) {
    console.log('Migration already applied. Skipping.');
    process.exit(0);
  }

  // Apply migration
  db.exec(`
    -- Your SQL here
    ALTER TABLE <table> ADD COLUMN <column> <type> DEFAULT <value>;

    -- Index if needed
    CREATE INDEX IF NOT EXISTS idx_<table>_<column> ON <table>(<column>);
  `);

  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}
```

### 3. Common Migration Patterns

**Adding a column:**
```sql
ALTER TABLE table_name ADD COLUMN column_name TYPE DEFAULT value;
```

**Creating a table:**
```sql
CREATE TABLE IF NOT EXISTS table_name (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  column1 TEXT NOT NULL,
  column2 INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Creating an index:**
```sql
CREATE INDEX IF NOT EXISTS idx_table_column ON table(column);
```

**Updating existing data:**
```sql
UPDATE table_name SET column = value WHERE condition;
```

### 4. Testing Migrations
- Always check if migration already applied (idempotent)
- Test on a backup database first
- Verify with `npm run check:db` after migration
- Document in migration file what changed

### 5. Running Migrations
```bash
# Add script to package.json first
npm run migrate:<name>

# Or run directly
tsx tools/migrate-<name>.ts
```

## Example Usage

When user asks: "Add a new column to track user preferences"

1. Create `tools/add-user-preferences.ts`
2. Write migration following template
3. Add script to package.json: `"migrate:preferences": "tsx tools/add-user-preferences.ts"`
4. Run migration
5. Update TypeScript types if needed

## Safety Checks
- ✅ Always use `IF NOT EXISTS` for CREATE statements
- ✅ Check if column/table exists before adding
- ✅ Use transactions for complex migrations
- ✅ Close database connection in finally block
- ✅ Provide clear error messages
- ⚠️ Never delete data without explicit user confirmation
- ⚠️ Always backup before destructive operations
