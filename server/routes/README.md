# API Routes

This directory contains all API route handlers organized by domain.

## Structure

```
server/
├── index.ts              # Main server file, mounts routers
└── routes/
    ├── health.ts         # Health check endpoints
    └── game.ts           # Game-related endpoints
```

## Routers

### Health Router (`/api/*`)

Simple health check and server status endpoints.

**Endpoints:**
- `GET /api/hello` - Basic health check

**Usage in index.ts:**
```typescript
import healthRouter from './routes/health.js';
app.use('/api', healthRouter);
```

### Game Router (`/api/game/*`)

All game-related endpoints including AI-powered command processing.

**Endpoints:**
- `GET /api/game/status` - Get game server status
- `POST /api/game/command` - Send player commands to AI

**Usage in index.ts:**
```typescript
import { createGameRouter } from './routes/game.js';
app.use('/api/game', createGameRouter(llmClient));
```

**Note:** The game router is created via a factory function that accepts the LLM client, allowing routes to access AI functionality.

## Adding New Routers

1. **Create a new router file** in `server/routes/`:

```typescript
// server/routes/player.ts
import { Router } from 'express';

const router = Router();

router.get('/profile/:id', (req, res) => {
  // Handle player profile
});

export default router;
```

2. **Import and mount in** `server/index.ts`:

```typescript
import playerRouter from './routes/player.js';
app.use('/api/player', playerRouter);
```

## Dependency Injection

If a router needs access to shared services (like the LLM client), use the factory pattern:

```typescript
// router file
export function createMyRouter(service: MyService) {
  const router = Router();
  // use service in routes
  return router;
}

// index.ts
app.use('/api/path', createMyRouter(myService));
```

This keeps routes testable and maintains clean separation of concerns.

