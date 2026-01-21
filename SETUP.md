# Quick Setup Guide

Follow these steps to get your Learning Cards application running with PostgreSQL.

## Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- Git (optional, for cloning)

## Step-by-Step Setup

### 1. Start PostgreSQL Database

```bash
docker-compose up -d
```

This will:
- Start PostgreSQL 16 in a Docker container
- Create the `learning_cards` database
- Expose it on port 5432
- Set up persistent storage

Verify it's running:
```bash
docker ps
```

You should see `learning-cards-db` with status "Up" and "(healthy)".

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

The `.env.local` file should already be configured with:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/learning_cards?schema=public"
```

If not, copy from example:
```bash
cp .env.example .env.local
```

Then add the DATABASE_URL line shown above.

### 4. Initialize Database Schema

```bash
npm run init:schema
```

**Important:** When prompted, select **"Yes, I want to execute all statements"**

This will create all 27 tables needed for the application:
- Authentication tables (users, accounts, sessions)
- Content tables (domains, categories, flashcards)
- Learning path tables (paths, units, lessons)
- Gamification tables (XP, hearts, streaks)
- Group collaboration tables
- Analytics tables

### 5. Seed Test Data (Optional but Recommended)

```bash
npm run seed:db
```

This populates your database with:
- 4 test users (1 admin, 3 members)
- 3 learning domains (JavaScript, Python, Spanish)
- 18 flashcards
- 3 learning paths with lessons
- 2 groups with members
- Sample progress and gamification data

**Test accounts (all use password: `password123`):**
- Admin: `admin@learningcards.com`
- User 1: `john@example.com`
- User 2: `jane@example.com`
- User 3: `bob@example.com`

See [SEEDING_GUIDE.md](./SEEDING_GUIDE.md) for full details on test data.

### 6. Start Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

### 7. (Optional) Open Database GUI

```bash
npx drizzle-kit studio
```

This opens Drizzle Studio, a web-based database browser at https://local.drizzle.studio

## Verification Checklist

✅ Docker container is running
```bash
docker ps | grep learning-cards-db
```

✅ Database connection works
```bash
npm run check:db
```

✅ Tables are created
```bash
# Using psql in Docker container
docker exec -it learning-cards-db psql -U postgres -d learning_cards -c "\dt"
```

✅ Development server starts
```bash
npm run dev
```

## Troubleshooting

### Database connection failed

**Problem:** Can't connect to PostgreSQL

**Solutions:**
1. Check if Docker is running: `docker ps`
2. If container not running: `docker-compose up -d`
3. Wait 10 seconds for PostgreSQL to fully start
4. Check logs: `docker-compose logs postgres`

### Port 5432 already in use

**Problem:** Another PostgreSQL instance is running

**Solutions:**
1. Stop other PostgreSQL: `sudo service postgresql stop` (Linux/Mac)
2. Or change port in `docker-compose.yml`:
   ```yaml
   ports:
     - '5433:5432'  # Use port 5433 instead
   ```
   Then update DATABASE_URL to use port 5433

### Schema initialization fails

**Problem:** `npm run init:schema` errors

**Solutions:**
1. Ensure .env.local has DATABASE_URL
2. Verify Docker container is healthy: `docker ps`
3. Check database logs: `docker-compose logs`
4. Try manual connection:
   ```bash
   docker exec -it learning-cards-db psql -U postgres -d learning_cards
   ```

### Seed script fails

**Problem:** `npm run seed:db` errors

**Solutions:**
1. Make sure schema is initialized first: `npm run init:schema`
2. Check if tables exist:
   ```bash
   docker exec -it learning-cards-db psql -U postgres -d learning_cards -c "\dt"
   ```
3. Clear and restart:
   ```bash
   docker-compose down -v
   docker-compose up -d
   npm run init:schema
   npm run seed:db
   ```

### Permission denied errors

**Problem:** Docker permission issues (Linux)

**Solution:**
```bash
sudo usermod -aG docker $USER
newgrp docker
```

## Clean Slate (Reset Everything)

If you want to start completely fresh:

```bash
# Stop and remove everything (including data)
docker-compose down -v

# Start fresh
docker-compose up -d

# Wait a few seconds, then reinitialize
sleep 5
npm run init:schema

# Reseed if desired
npm run seed:db
```

## Next Steps

Once everything is running:

1. **Explore the app** at http://localhost:3000
2. **Login** with a test account
3. **View the database** with `npx drizzle-kit studio`
4. **Check the docs** in README.md
5. **Read the guides:**
   - [SEEDING_GUIDE.md](./SEEDING_GUIDE.md) - Test data details
   - [DOMAIN_DRIVEN_DESIGN_MODEL.md](./DOMAIN_DRIVEN_DESIGN_MODEL.md) - Architecture
   - [AUTH_QUICK_START.md](./AUTH_QUICK_START.md) - Authentication setup

## Common Commands Reference

```bash
# Database management
docker-compose up -d              # Start database
docker-compose down               # Stop database
docker-compose down -v            # Stop and remove data
docker-compose logs -f            # View logs

# Schema management
npm run init:schema               # Initialize/update schema
npx drizzle-kit generate          # Generate migration files
npx drizzle-kit studio            # Open database GUI

# Data management
npm run seed:db                   # Seed test data
npm run check:db                  # Test connection

# Development
npm run dev                       # Start dev server
npm run build                     # Build for production
npm run lint                      # Lint code
npm run format                    # Format code

# Admin tools
npm run make:admin                # Promote user to admin
npm run check:auth                # Check auth setup
```

Happy coding! 🚀
