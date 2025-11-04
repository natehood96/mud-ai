// server/index.ts
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createLLMClient } from './llm/LLMFactory.js';
import healthRouter from './routes/health.js';
import { createGameRouter } from './routes/game.js';
import worldsRouter from './routes/worlds.js';
import dialogueRouter from './routes/dialogue.js';
import charactersRouter from './routes/characters.js';
import commandsRouter from './routes/commands.js';

dotenv.config();

// Initialize LLM client
let llmClient: ReturnType<typeof createLLMClient> | null = null;

try {
  llmClient = createLLMClient();
  console.log('✅ LLM client initialized successfully');
} catch (error) {
  console.error('⚠️  Warning: Could not initialize LLM client:', error instanceof Error ? error.message : error);
  console.error('   Game will run in limited mode without AI responses');
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

// Mount routers
app.use('/api', healthRouter);
app.use('/api/game', createGameRouter(llmClient));
app.use('/api/worlds', worldsRouter);
app.use('/api/dialogue', dialogueRouter);
app.use('/api/characters', charactersRouter);
app.use('/api/commands', commandsRouter);

if (process.env.NODE_ENV === 'production') {
  // Serve static files from the 'dist/public' directory
  app.use(express.static(path.resolve(__dirname, '..', 'dist/public')));
  
  // Handle all other routes by serving the index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'dist/public', 'index.html'));
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

