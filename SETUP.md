# Quick Setup Guide - Local PostgreSQL

This guide will help you get your MUD game running with a local PostgreSQL database.

## Prerequisites

- Node.js 20+ installed
- PostgreSQL installed locally

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Install and Start PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### 3. Create Database

```bash
# Connect to PostgreSQL (you may need to use 'sudo -u postgres psql' on Linux)
psql postgres

# In the psql shell, run:
CREATE DATABASE mud;

# Verify it was created:
\l

# Exit:
\q
```

### 4. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env
```

Edit `.env` and update the DATABASE_URL with your credentials:

```
DATABASE_URL=postgresql://YOUR_USERNAME@localhost:5432/mud
```

**Common configurations:**
- **macOS/Linux:** Often your system username with no password: `postgresql://yourusername@localhost:5432/mud`
- **Windows:** Usually `postgresql://postgres:yourpassword@localhost:5432/mud`

To find your PostgreSQL username:
```bash
# On macOS/Linux
whoami

# Or check with
psql -l
```

### 5. Generate and Run Migrations

```bash
# Generate migration files from your schema
npm run db:generate

# Apply migrations to your database
npm run db:migrate
```

### 6. Start Development Servers

**Option A: Both servers at once (Recommended)**
```bash
npm run dev
```

**Option B: Separate terminals**

Terminal 1 (Backend):
```bash
npm run dev:server
```

Terminal 2 (Frontend):
```bash
npm run dev:client
```

### 7. Access Your Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Database Studio:** Run `npm run db:studio` to open Drizzle Studio

## Troubleshooting

### "Connection refused" error

Make sure PostgreSQL is running:
```bash
# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Restart if needed
brew services restart postgresql@16  # macOS
sudo systemctl restart postgresql     # Linux
```

### "Database does not exist" error

Make sure you created the database:
```bash
psql postgres -c "CREATE DATABASE mud;"
```

### "Password authentication failed"

Update your `.env` file with the correct credentials. For local development, you might need to:

1. Check your PostgreSQL password:
```bash
psql postgres
\password
```

2. Or configure PostgreSQL to trust local connections by editing `pg_hba.conf`:
```bash
# Find the config file location
psql -c "SHOW hba_file"

# Edit it and change 'md5' to 'trust' for local connections (development only!)
```

### Port conflicts

If port 3000 or 5173 is already in use, you can change them:
- Backend port: Update `PORT` in `.env`
- Frontend port: Vite will automatically use the next available port

## Next Steps

Once everything is running:

1. ✅ Test the API at http://localhost:3000/api/hello
2. ✅ View your database with `npm run db:studio`
3. ✅ Start building your game features!

See `README.md` for more detailed information about the project structure and available commands.

