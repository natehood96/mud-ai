import { Router } from 'express';
import { db } from '../db/index.js';
import { characters, nodes } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Hard-coded user ID (matching worlds.ts)
const HARDCODED_USER_ID = '00000000-0000-0000-0000-000000000001';

// GET /api/characters/:worldId/player - Get or create the player's character in a world
router.get('/:worldId/player', async (req, res) => {
  try {
    const { worldId } = req.params;

    // Check if player already has a character in this world
    let playerCharacter = await db
      .select()
      .from(characters)
      .where(
        and(
          eq(characters.worldId, worldId),
          eq(characters.userId, HARDCODED_USER_ID)
        )
      )
      .limit(1);

    if (playerCharacter.length > 0) {
      return res.json({ character: playerCharacter[0] });
    }

    // No character exists, create one
    // For now, we'll create a character at a default position
    // Later we can make this more sophisticated with proper node selection

    // Try to find any node in this world to place the character
    const worldNodes = await db
      .select()
      .from(nodes)
      .where(eq(nodes.worldId, worldId))
      .limit(1);

    let nodeId: string;
    
    if (worldNodes.length === 0) {
      // No nodes exist yet, create a default starting node
      const [newNode] = await db
        .insert(nodes)
        .values({
          worldId,
          name: 'Starting Area',
          width: 10,
          height: 10,
          terrain: { tiles: [] }, // Empty terrain for now
        })
        .returning();
      
      nodeId = newNode.id;
    } else {
      nodeId = worldNodes[0].id;
    }

    // Create the player character
    const [newCharacter] = await db
      .insert(characters)
      .values({
        worldId,
        userId: HARDCODED_USER_ID,
        name: 'Player', // Default name, can be customized later
        nodeId,
        x: 5,
        y: 5,
        z: 0,
        attributes: {
          level: 1,
          hp: 100,
          maxHp: 100,
        },
      })
      .returning();

    res.json({ character: newCharacter, created: true });
  } catch (error) {
    console.error('Error getting/creating player character:', error);
    res.status(500).json({ error: 'Failed to get or create character' });
  }
});

export default router;

