import { Router } from 'express';
import { db } from '../db/index.js';
import { characters, characterInventory, items, nodes } from '../db/schema.js';
import { eq, and, asc } from 'drizzle-orm';

const router = Router();

// Hard-coded user ID (matching other routes)
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

  // Create character if doesn't exist
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

// POST /api/commands/:worldId/special - Handle special commands
router.post('/:worldId/special', async (req, res) => {
  try {
    const { worldId } = req.params;
    const { command } = req.body;

    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'Command is required' });
    }

    const normalizedCommand = command.trim().toLowerCase();

    // Get player character
    const playerCharacter = await getOrCreatePlayerCharacter(worldId);

    switch (normalizedCommand) {
      case 'inventory': {
        // Get character's inventory with item details
        const inventory = await db
          .select({
            id: characterInventory.id,
            itemName: items.name,
            itemDescription: items.description,
            itemType: items.type,
            quantity: characterInventory.quantity,
            isEquipped: characterInventory.isEquipped,
          })
          .from(characterInventory)
          .innerJoin(items, eq(characterInventory.itemId, items.id))
          .where(eq(characterInventory.characterId, playerCharacter.id))
          .orderBy(asc(items.name));

        if (inventory.length === 0) {
          return res.json({ 
            response: 'Your inventory is empty.',
            data: { items: [] }
          });
        }

        // Format inventory display
        let response = '=== INVENTORY ===\n\n';
        inventory.forEach((item) => {
          const equippedTag = item.isEquipped ? ' [EQUIPPED]' : '';
          const quantityDisplay = item.quantity > 1 ? ` (x${item.quantity})` : '';
          response += `• ${item.itemName}${quantityDisplay}${equippedTag}\n`;
          if (item.itemDescription) {
            response += `  ${item.itemDescription}\n`;
          }
          response += `  Type: ${item.itemType}\n\n`;
        });

        return res.json({ 
          response: response.trim(),
          data: { items: inventory }
        });
      }

      case 'map': {
        // Get current node information
        const currentNode = await db
          .select()
          .from(nodes)
          .where(eq(nodes.id, playerCharacter.nodeId))
          .limit(1);

        if (currentNode.length === 0) {
          return res.json({ response: 'Error: Unable to determine your current location.' });
        }

        const node = currentNode[0];
        let response = '=== MAP ===\n\n';
        response += `Current Location: ${node.name}\n`;
        response += `Position: (${playerCharacter.x}, ${playerCharacter.y})\n`;
        response += `Area Size: ${node.width}x${node.height}\n\n`;
        response += '[Full map functionality coming soon...]';

        return res.json({ 
          response,
          data: { 
            node: {
              name: node.name,
              width: node.width,
              height: node.height,
            },
            position: {
              x: playerCharacter.x,
              y: playerCharacter.y,
              z: playerCharacter.z,
            }
          }
        });
      }

      case 'stats': {
        const attrs = playerCharacter.attributes as any || {};
        let response = '=== CHARACTER STATS ===\n\n';
        response += `Name: ${playerCharacter.name}\n`;
        response += `Level: ${attrs.level || 1}\n`;
        response += `HP: ${attrs.hp || 100}/${attrs.maxHp || 100}\n`;
        
        // Add any additional attributes
        if (attrs.strength) response += `Strength: ${attrs.strength}\n`;
        if (attrs.dexterity) response += `Dexterity: ${attrs.dexterity}\n`;
        if (attrs.intelligence) response += `Intelligence: ${attrs.intelligence}\n`;
        if (attrs.experience !== undefined) response += `Experience: ${attrs.experience}\n`;

        return res.json({ 
          response,
          data: { 
            character: {
              name: playerCharacter.name,
              attributes: attrs,
            }
          }
        });
      }

      case 'help': {
        let response = '=== HELP ===\n\n';
        response += 'Special Commands:\n';
        response += '• INVENTORY - View your items\n';
        response += '• MAP - View your current location\n';
        response += '• STATS - View your character statistics\n';
        response += '• HELP - Display this help message\n\n';
        response += 'For all other commands, simply type what you want to do and the AI will respond!\n';
        response += 'Examples: "look around", "go north", "talk to the guard", etc.';

        return res.json({ response });
      }

      default:
        return res.status(400).json({ 
          error: `Unknown special command: ${command}` 
        });
    }
  } catch (error) {
    console.error('Error handling special command:', error);
    res.status(500).json({ error: 'Failed to process command' });
  }
});

export default router;

