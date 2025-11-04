import { Router } from 'express';
import { db } from '../db/index.js';
import { systemDialogueLog, characters } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// Hard-coded user ID (matching worlds.ts)
const HARDCODED_USER_ID = '00000000-0000-0000-0000-000000000001';

// Helper function to get or create player character
async function getOrCreatePlayerCharacter(worldId: string) {
  const playerCharacter = await db
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
    return playerCharacter[0];
  }

  // Call the character creation logic
  // Import nodes at the top if not already imported
  const { nodes } = await import('../db/schema.js');
  
  const worldNodes = await db
    .select()
    .from(nodes)
    .where(eq(nodes.worldId, worldId))
    .limit(1);

  let nodeId: string;
  
  if (worldNodes.length === 0) {
    const [newNode] = await db
      .insert(nodes)
      .values({
        worldId,
        name: 'Starting Area',
        width: 10,
        height: 10,
        terrain: { tiles: [] },
      })
      .returning();
    
    nodeId = newNode.id;
  } else {
    nodeId = worldNodes[0].id;
  }

  const [newCharacter] = await db
    .insert(characters)
    .values({
      worldId,
      userId: HARDCODED_USER_ID,
      name: 'Player',
      nodeId,
      x: 5,
      y: 5,
      z: 0,
      attributes: { level: 1, hp: 100, maxHp: 100 },
    })
    .returning();

  return newCharacter;
}

// GET /api/dialogue/:worldId/history - Get conversation history for player in a world
router.get('/:worldId/history', async (req, res) => {
  try {
    const { worldId } = req.params;
    const { limit = 100 } = req.query;

    // Find or create the player's character in this world
    const playerCharacter = await getOrCreatePlayerCharacter(worldId);

    // Get the dialogue history
    const history = await db
      .select({
        id: systemDialogueLog.id,
        isInput: systemDialogueLog.isInput,
        text: systemDialogueLog.text,
        createdAt: systemDialogueLog.createdAt,
      })
      .from(systemDialogueLog)
      .where(
        and(
          eq(systemDialogueLog.worldId, worldId),
          eq(systemDialogueLog.playerCharacterId, playerCharacter.id)
        )
      )
      .orderBy(systemDialogueLog.createdAt)
      .limit(Number(limit));

    res.json({ history });
  } catch (error) {
    console.error('Error fetching dialogue history:', error);
    res.status(500).json({ error: 'Failed to fetch dialogue history' });
  }
});

// POST /api/dialogue/:worldId/log - Log a dialogue entry (player input or system response)
router.post('/:worldId/log', async (req, res) => {
  try {
    const { worldId } = req.params;
    const { isInput, text } = req.body;

    if (typeof isInput !== 'boolean') {
      return res.status(400).json({ error: 'isInput must be a boolean' });
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'text is required' });
    }

    // Find or create the player's character in this world
    const playerCharacter = await getOrCreatePlayerCharacter(worldId);

    // Log the dialogue
    const [logEntry] = await db
      .insert(systemDialogueLog)
      .values({
        worldId,
        playerCharacterId: playerCharacter.id,
        isInput,
        text: text.trim(),
      })
      .returning();

    res.json({ entry: logEntry });
  } catch (error) {
    console.error('Error logging dialogue:', error);
    res.status(500).json({ error: 'Failed to log dialogue' });
  }
});

// POST /api/dialogue/:worldId/log-batch - Log multiple dialogue entries at once
router.post('/:worldId/log-batch', async (req, res) => {
  try {
    const { worldId } = req.params;
    const { entries } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'entries must be a non-empty array' });
    }

    // Validate all entries
    for (const entry of entries) {
      if (typeof entry.isInput !== 'boolean') {
        return res.status(400).json({ error: 'Each entry must have isInput as boolean' });
      }
      if (!entry.text || typeof entry.text !== 'string') {
        return res.status(400).json({ error: 'Each entry must have text' });
      }
    }

    // Find or create the player's character
    const playerCharacter = await getOrCreatePlayerCharacter(worldId);

    // Insert all entries
    const logEntries = await db
      .insert(systemDialogueLog)
      .values(
        entries.map(entry => ({
          worldId,
          playerCharacterId: playerCharacter.id,
          isInput: entry.isInput,
          text: entry.text.trim(),
        }))
      )
      .returning();

    res.json({ entries: logEntries });
  } catch (error) {
    console.error('Error logging batch dialogue:', error);
    res.status(500).json({ error: 'Failed to log batch dialogue' });
  }
});

// DELETE /api/dialogue/:worldId/clear - Clear all dialogue history for player in a world
router.delete('/:worldId/clear', async (req, res) => {
  try {
    const { worldId } = req.params;

    // Find the player's character (don't create if doesn't exist)
    const playerCharacter = await db
      .select()
      .from(characters)
      .where(
        and(
          eq(characters.worldId, worldId),
          eq(characters.userId, HARDCODED_USER_ID)
        )
      )
      .limit(1);

    if (playerCharacter.length === 0) {
      return res.json({ deleted: 0 });
    }

    // Delete all dialogue for this player in this world
    const deleted = await db
      .delete(systemDialogueLog)
      .where(
        and(
          eq(systemDialogueLog.worldId, worldId),
          eq(systemDialogueLog.playerCharacterId, playerCharacter[0].id)
        )
      )
      .returning();

    res.json({ deleted: deleted.length });
  } catch (error) {
    console.error('Error clearing dialogue:', error);
    res.status(500).json({ error: 'Failed to clear dialogue' });
  }
});

export default router;

