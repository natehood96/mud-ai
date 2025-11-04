import { Router } from 'express';
import { db } from '../db/index.js';
import { worlds, worldAdmins, users } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Hard-coded user ID for now (we'll add auth later)
const HARDCODED_USER_ID = '00000000-0000-0000-0000-000000000001';

// Ensure the hard-coded user exists on startup
async function ensureHardcodedUser() {
  try {
    const existingUser = await db.select().from(users).where(eq(users.id, HARDCODED_USER_ID)).limit(1);
    
    if (existingUser.length === 0) {
      await db.insert(users).values({
        id: HARDCODED_USER_ID,
        username: 'demo_user',
        passwordHash: 'not_used_yet',
      });
      console.log('Created hard-coded demo user');
    }
  } catch (error) {
    console.error('Error ensuring hard-coded user:', error);
  }
}

// Call this when the module loads
ensureHardcodedUser();

// GET /api/worlds - Get all worlds for the current user
router.get('/', async (req, res) => {
  try {
    const userId = HARDCODED_USER_ID;

    // Get all worlds where the user is an admin
    const userWorlds = await db
      .select({
        id: worlds.id,
        name: worlds.name,
        createdAt: worlds.createdAt,
        lastPlayedAt: worlds.lastPlayedAt,
      })
      .from(worlds)
      .innerJoin(worldAdmins, eq(worlds.id, worldAdmins.worldId))
      .where(eq(worldAdmins.userId, userId))
      .orderBy(worlds.lastPlayedAt);

    res.json({ worlds: userWorlds });
  } catch (error) {
    console.error('Error fetching worlds:', error);
    res.status(500).json({ error: 'Failed to fetch worlds' });
  }
});

// POST /api/worlds - Create a new world
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const userId = HARDCODED_USER_ID;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'World name is required' });
    }

    // Create the world
    const [newWorld] = await db
      .insert(worlds)
      .values({
        name: name.trim(),
        lastPlayedAt: new Date(),
      })
      .returning();

    // Make the user an admin of this world
    await db.insert(worldAdmins).values({
      worldId: newWorld.id,
      userId: userId,
    });

    res.json({ world: newWorld });
  } catch (error) {
    console.error('Error creating world:', error);
    res.status(500).json({ error: 'Failed to create world' });
  }
});

// PUT /api/worlds/:worldId/last-played - Update last played timestamp
router.put('/:worldId/last-played', async (req, res) => {
  try {
    const { worldId } = req.params;
    const userId = HARDCODED_USER_ID;

    // Verify the user has access to this world
    const access = await db
      .select()
      .from(worldAdmins)
      .where(
        and(
          eq(worldAdmins.worldId, worldId),
          eq(worldAdmins.userId, userId)
        )
      )
      .limit(1);

    if (access.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update last played timestamp
    const [updatedWorld] = await db
      .update(worlds)
      .set({ lastPlayedAt: new Date() })
      .where(eq(worlds.id, worldId))
      .returning();

    res.json({ world: updatedWorld });
  } catch (error) {
    console.error('Error updating world:', error);
    res.status(500).json({ error: 'Failed to update world' });
  }
});

export default router;

