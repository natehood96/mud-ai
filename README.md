# MUD Game

A modern MUD (Multi-User Dungeon) game built with TypeScript, React, Express, and PostgreSQL.

## Architecture

This project uses a monorepo structure with:

- **Frontend**: React SPA with Vite (in `client/`)
- **Backend**: Express.js with TypeScript (in `server/`)
- **Database**: PostgreSQL with Drizzle ORM
- **Shared**: Common types and utilities (in `shared/`)

## Prerequisites

- Node.js 20+ 
- PostgreSQL 16+ (or use Docker Compose)
- npm or yarn

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Local PostgreSQL Database

**Install PostgreSQL** (if not already installed):
- **macOS**: `brew install postgresql@16` then `brew services start postgresql@16`
- **Linux**: `sudo apt-get install postgresql` or your distro's package manager
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/)

**Create the database:**

```bash
# Connect to PostgreSQL
psql postgres

# Create the database
CREATE DATABASE mud;

# Exit psql
\q
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy from example
cp .env.example .env
```

Edit `.env` with your local PostgreSQL credentials:

```
DATABASE_URL=postgresql://YOUR_USERNAME@localhost:5432/mud
PORT=3000
NODE_ENV=development
```

Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your PostgreSQL credentials (often your system username with no password for local development).

### 4. Run Database Migrations

Generate and run the initial database schema:

```bash
npm run db:generate
npm run db:migrate
```

### 5. Start Development Servers

**Option A: Run both servers concurrently (Recommended)**

```bash
npm run dev
```

**Option B: Run separately in different terminals**

Terminal 1 (Backend):
```bash
npm run dev:server
```

Terminal 2 (Frontend):
```bash
npm run dev:client
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Available Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run dev:client` - Start only the Vite dev server
- `npm run dev:server` - Start only the Express server with hot-reload
- `npm run build` - Build both client and server for production
- `npm start` - Start the production server
- `npm run db:generate` - Generate Drizzle migrations from schema
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Docker Support (Optional)

Docker is optional for this project. For production deployment, you can build a Docker container:

```bash
docker build -t mud-game .
docker run -p 3000:3000 --env-file .env mud-game
```

If you prefer to use Docker for your PostgreSQL database during development, see the `docker-compose.yml` file for a sample configuration.

## Project Structure

```
mud-ai/
├── client/                 # React frontend
│   ├── src/
│   │   ├── main.tsx       # Entry point
│   │   └── index.css      # Global styles
│   └── index.html         # HTML template
├── server/                 # Express backend
│   ├── db/
│   │   ├── schema.ts      # Database schema
│   │   └── index.ts       # Database connection
│   ├── routes/            # API routes
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and utilities
│   └── types.ts           # TypeScript interfaces
├── migrations/            # Database migrations (generated)
├── dist/                  # Build output (generated)
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
├── drizzle.config.ts      # Drizzle ORM configuration
└── docker-compose.yml     # Docker services configuration
```

## Database Schema

The initial schema includes:

- **users**: Player accounts
- **characters**: Player characters
- **rooms**: Game world locations

You can view and modify the schema in `server/db/schema.ts`.

## API Endpoints

- `GET /api/hello` - Test endpoint
- `GET /api/game/status` - Get game server status
- `GET /api/game/room/:roomId` - Get room information
- `POST /api/game/move` - Move player to a new room

## Development Tips

1. **Database Changes**: After modifying `server/db/schema.ts`, run:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

2. **View Database**: Open Drizzle Studio to inspect your database:
   ```bash
   npm run db:studio
   ```

3. **Hot Reload**: Both the client and server support hot-reloading during development.

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set environment variables for production:
   ```bash
   export NODE_ENV=production
   export DATABASE_URL=your-production-db-url
   export PORT=3000
   ```

3. Start the server:
   ```bash
   npm start
   ```

The production build serves the frontend static files from the Express server.

## Next Steps

- [ ] Implement user authentication
- [ ] Create game world and room system
- [ ] Add combat mechanics
- [ ] Implement inventory system
- [ ] Add multiplayer support with WebSockets
- [ ] Create admin panel

## License

ISC
