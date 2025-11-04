import { pgTable, uuid, text, timestamp, integer, jsonb, boolean, primaryKey, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// =====================================================================
// USERS
// A user account that can own characters across multiple worlds
// =====================================================================

export const users = pgTable('User', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(), // or external auth provider id
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// =====================================================================
// WORLDS
// Represents an isolated "universe" that contains nodes, NPCs, items, etc.
// =====================================================================

export const worlds = pgTable('World', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastPlayedAt: timestamp('last_played_at'),
});

// =====================================================================
// WORLD ADMINS
// Which users are allowed to edit/modify a world (user → world owner)
// =====================================================================

export const worldAdmins = pgTable('WorldAdmin', {
  worldId: uuid('world_id').notNull().references(() => worlds.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.worldId, table.userId] }),
}));

// =====================================================================
// NODES
// A "room" or "area" with its own 2D map grid
// The terrain is stored as JSON because it is structured but not relational
// =====================================================================

export const nodes = pgTable('Node', {
  id: uuid('id').defaultRandom().primaryKey(),
  worldId: uuid('world_id').notNull().references(() => worlds.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // e.g., "Castle Courtyard"
  width: integer('width').notNull(), // width of 2D grid
  height: integer('height').notNull(), // height of 2D grid
  terrain: jsonb('terrain').notNull(), // grid data (tiles, exits, etc.)
});

// =====================================================================
// NODE CONNECTION GRAPH
// Describes directional movement between nodes
// (dx, dy, dz) = 3D vector representing the direction from node_a -> node_b
// No need to store text direction, we infer it from vector sign
// =====================================================================

export const nodeConnections = pgTable('NodeConnection', {
  id: uuid('id').defaultRandom().primaryKey(),
  worldId: uuid('world_id').notNull().references(() => worlds.id, { onDelete: 'cascade' }),
  nodeA: uuid('node_a').notNull().references(() => nodes.id, { onDelete: 'cascade' }),
  nodeB: uuid('node_b').notNull().references(() => nodes.id, { onDelete: 'cascade' }),
  dx: integer('dx').notNull(), // +x east, -x west
  dy: integer('dy').notNull(), // +y north, -y south
  dz: integer('dz').notNull(), // +z up,   -z down
});

// =====================================================================
// CHARACTER (Player OR NPC)
// If user_id is NULL → NPC
// If user_id has a value → playable character
// Characters have a location inside a node + grid coordinate
// =====================================================================

export const characters = pgTable('Character', {
  id: uuid('id').defaultRandom().primaryKey(),
  worldId: uuid('world_id').notNull().references(() => worlds.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id), // NULL = NPC
  name: text('name').notNull(),
  nodeId: uuid('node_id').notNull().references(() => nodes.id, { onDelete: 'cascade' }),
  x: integer('x').notNull(), // position inside node grid
  y: integer('y').notNull(),
  z: integer('z').notNull().default(0), // optional, if vertical tiles matter
  attributes: jsonb('attributes').default({}), // HP, stats, AI behavior, etc.
});

// =====================================================================
// ITEM BLUEPRINTS
// Defines what an item IS (name, type, metadata) — NOT who owns it
// =====================================================================

export const items = pgTable('Item', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // weapon, armor, consumable, misc
  attributes: jsonb('attributes').default({}), // arbitrary stats or modifiers
});

// =====================================================================
// CHARACTER INVENTORY
// Actual items owned by a character (instance of an item blueprint)
// =====================================================================

export const characterInventory = pgTable('CharacterInventory', {
  id: uuid('id').defaultRandom().primaryKey(),
  characterId: uuid('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  itemId: uuid('item_id').notNull().references(() => items.id),
  quantity: integer('quantity').notNull().default(1),
  isEquipped: boolean('is_equipped').notNull().default(false),
});

// =====================================================================
// SYSTEM DIALOGUE LOG
// Tracks conversation between the player and the system
// =====================================================================

export const systemDialogueLog = pgTable('SystemDialogueLog', {
  id: uuid('id').defaultRandom().primaryKey(),
  worldId: uuid('world_id').notNull().references(() => worlds.id),
  playerCharacterId: uuid('player_character_id').notNull().references(() => characters.id),
  isInput: boolean('is_input').notNull(), // true = player spoke
  text: text('text').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  playerTimeIdx: index('idx_system_dialog_player_time').on(table.playerCharacterId, table.createdAt),
}));

// =====================================================================
// CHARACTER CONVERSATION LOG
// Tracks conversation between characters (player-NPC or NPC-NPC)
// =====================================================================

export const characterConversationLog = pgTable('CharacterConversationLog', {
  id: uuid('id').defaultRandom().primaryKey(),
  worldId: uuid('world_id').notNull().references(() => worlds.id),
  speakingCharacterId: uuid('speaking_character_id').notNull().references(() => characters.id),
  targetCharacterId: uuid('target_character_id').notNull().references(() => characters.id),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  pairTimeIdx: index('idx_character_convo_pair_time').on(table.speakingCharacterId, table.targetCharacterId, table.createdAt),
}));

// =====================================================================
// RELATIONS (for Drizzle ORM query helpers)
// =====================================================================

export const usersRelations = relations(users, ({ many }) => ({
  worldAdmins: many(worldAdmins),
  characters: many(characters),
}));

export const worldsRelations = relations(worlds, ({ many }) => ({
  worldAdmins: many(worldAdmins),
  nodes: many(nodes),
  nodeConnections: many(nodeConnections),
  characters: many(characters),
  systemDialogueLogs: many(systemDialogueLog),
  characterConversationLogs: many(characterConversationLog),
}));

export const worldAdminsRelations = relations(worldAdmins, ({ one }) => ({
  user: one(users, {
    fields: [worldAdmins.userId],
    references: [users.id],
  }),
  world: one(worlds, {
    fields: [worldAdmins.worldId],
    references: [worlds.id],
  }),
}));

export const nodesRelations = relations(nodes, ({ one, many }) => ({
  world: one(worlds, {
    fields: [nodes.worldId],
    references: [worlds.id],
  }),
  characters: many(characters),
  connectionsFrom: many(nodeConnections, { relationName: 'nodeA' }),
  connectionsTo: many(nodeConnections, { relationName: 'nodeB' }),
}));

export const nodeConnectionsRelations = relations(nodeConnections, ({ one }) => ({
  world: one(worlds, {
    fields: [nodeConnections.worldId],
    references: [worlds.id],
  }),
  fromNode: one(nodes, {
    fields: [nodeConnections.nodeA],
    references: [nodes.id],
    relationName: 'nodeA',
  }),
  toNode: one(nodes, {
    fields: [nodeConnections.nodeB],
    references: [nodes.id],
    relationName: 'nodeB',
  }),
}));

export const charactersRelations = relations(characters, ({ one, many }) => ({
  world: one(worlds, {
    fields: [characters.worldId],
    references: [worlds.id],
  }),
  user: one(users, {
    fields: [characters.userId],
    references: [users.id],
  }),
  node: one(nodes, {
    fields: [characters.nodeId],
    references: [nodes.id],
  }),
  inventory: many(characterInventory),
  systemDialogueLogs: many(systemDialogueLog),
  conversationsSpoken: many(characterConversationLog, { relationName: 'speaker' }),
  conversationsReceived: many(characterConversationLog, { relationName: 'target' }),
}));

export const itemsRelations = relations(items, ({ many }) => ({
  characterInventory: many(characterInventory),
}));

export const characterInventoryRelations = relations(characterInventory, ({ one }) => ({
  character: one(characters, {
    fields: [characterInventory.characterId],
    references: [characters.id],
  }),
  item: one(items, {
    fields: [characterInventory.itemId],
    references: [items.id],
  }),
}));

export const systemDialogueLogRelations = relations(systemDialogueLog, ({ one }) => ({
  world: one(worlds, {
    fields: [systemDialogueLog.worldId],
    references: [worlds.id],
  }),
  playerCharacter: one(characters, {
    fields: [systemDialogueLog.playerCharacterId],
    references: [characters.id],
  }),
}));

export const characterConversationLogRelations = relations(characterConversationLog, ({ one }) => ({
  world: one(worlds, {
    fields: [characterConversationLog.worldId],
    references: [worlds.id],
  }),
  speakingCharacter: one(characters, {
    fields: [characterConversationLog.speakingCharacterId],
    references: [characters.id],
    relationName: 'speaker',
  }),
  targetCharacter: one(characters, {
    fields: [characterConversationLog.targetCharacterId],
    references: [characters.id],
    relationName: 'target',
  }),
}));
