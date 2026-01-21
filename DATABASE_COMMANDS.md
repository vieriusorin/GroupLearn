# Database Commands Reference

Quick reference for all database-related npm commands in this project.

## Setup Commands

### Start PostgreSQL Database
```bash
docker-compose up -d
```
Starts the PostgreSQL database container in the background.

### Stop PostgreSQL Database
```bash
docker-compose down
```
Stops the PostgreSQL database container.

### View Database Logs
```bash
docker logs learning-cards-db -f
```
View live logs from the PostgreSQL container.

## Schema Management

### Push Schema to Database
```bash
npx drizzle-kit push
```
Pushes your Drizzle schema to the database. Use this during development to quickly sync schema changes.

### Generate Migrations
```bash
npx drizzle-kit generate
```
Generates SQL migration files based on schema changes.

### Run Migrations
```bash
npx drizzle-kit migrate
```
Applies pending migrations to the database.

### Open Drizzle Studio (Database GUI)
```bash
npx drizzle-kit studio
```
Opens a web-based database GUI at `http://localhost:4983` for browsing and editing data.

## Data Management

### Seed Database
```bash
npm run seed:db
```
Seeds the database with comprehensive test data including:
- 4 users (1 admin, 3 members)
- 3 domains with 4 categories
- 18 flashcards
- 3 learning paths with units and lessons
- 2 groups with members
- Gamification data (XP, hearts, streaks)
- Activity logs and analytics

**Test Accounts:**
- Admin: `admin@learningcards.com` / `password123`
- User 1: `john@example.com` / `password123`
- User 2: `jane@example.com` / `password123`
- User 3: `bob@example.com` / `password123`

### Reset Database (With Confirmation)
```bash
npm run reset:db
```
⚠️ **DANGER**: Completely resets the database by:
1. Dropping all existing tables
2. Recreating the schema
3. Seeding with fresh test data

Waits 3 seconds before executing (press Ctrl+C to cancel).

### Reset Database (Force - No Confirmation)
```bash
npm run reset:db:force
```
⚠️ **DANGER**: Same as `reset:db` but executes immediately without confirmation.
Useful for CI/CD pipelines and automated testing.

## Utility Commands

### Check Database Connection
```bash
npm run check:db
```
Verifies database connection and displays connection info.

### Check Authentication Setup
```bash
npm run check:auth
```
Verifies authentication tables and displays user accounts.

### Make User Admin
```bash
npm run make:admin
```
Promotes a user to admin role (interactive prompt).

## Legacy Migration Commands

These commands are for migrating from older schema versions:

```bash
npm run init:schema          # Initialize schema (legacy)
npm run migrate:paths        # Migrate to paths structure
npm run migrate:auth         # Migrate authentication
npm run migrate:roles        # Migrate user roles
npm run migrate:groups       # Migrate groups feature
```

## Common Workflows

### Fresh Start (Development)
```bash
# Start database
docker-compose up -d

# Reset and seed
npm run reset:db

# Open Drizzle Studio to view data
npx drizzle-kit studio
```

### After Schema Changes
```bash
# Push changes to database
npx drizzle-kit push

# Or generate migration (recommended for production)
npx drizzle-kit generate
npx drizzle-kit migrate
```

### Quick Database Refresh
```bash
# If you just want fresh data without dropping tables
npm run seed:db
```

### CI/CD Pipeline
```bash
# Automated reset without confirmation
npm run reset:db:force
```

## Troubleshooting

### Connection Issues
1. Ensure Docker is running: `docker ps`
2. Check if database container is healthy: `docker ps | grep learning-cards-db`
3. Verify DATABASE_URL in `.env.local`:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/learning_cards?schema=public"
   ```

### Schema Out of Sync
```bash
# Force push schema (development only)
npx drizzle-kit push --force

# Or for production, generate and review migration
npx drizzle-kit generate
# Review migration files in drizzle/migrations/
npx drizzle-kit migrate
```

### Data Issues
```bash
# Complete reset
npm run reset:db

# Or just reseed without dropping tables
npm run seed:db
```

## Environment Variables

Required in `.env.local`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/learning_cards?schema=public"
```

## Database Configuration

- **Host**: localhost
- **Port**: 5432
- **Database**: learning_cards
- **Username**: postgres
- **Password**: postgres
- **Schema**: public

These are defined in `docker-compose.yml` and can be customized if needed.
