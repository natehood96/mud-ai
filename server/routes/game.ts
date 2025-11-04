import { Router } from 'express';
import { LLMClient } from '../llm/LLMClient.js';

/**
 * Game routes factory
 * Creates a router with game-related endpoints
 * @param llmClient - The LLM client instance for AI-powered responses
 */
export function createGameRouter(llmClient: LLMClient | null) {
  const router = Router();

  /**
   * Get game status
   */
  router.get('/status', (req, res) => {
    res.json({ 
      status: 'online',
      players: 0,
      uptime: process.uptime(),
      aiEnabled: llmClient !== null
    });
  });

  /**
   * Handle user commands
   * Sends player input to AI for processing
   */
  router.post('/command', async (req, res) => {
    const { command } = req.body;
    
    if (!command || typeof command !== 'string') {
      return res.status(400).json({ 
        response: 'Error: Invalid command format' 
      });
    }

    // Check if LLM client is available
    if (!llmClient) {
      return res.status(503).json({ 
        response: 'Error: AI system is not available. Please check that OPENAI_API_KEY is set in your .env file.' 
      });
    }

    try {
      // Pass the user's command to the LLM for processing
      const response = await llmClient.generateText(command);
      res.json({ response });
    } catch (error) {
      console.error('Error generating LLM response:', error);
      res.status(500).json({ 
        response: 'Error: Failed to generate response. Please try again.' 
      });
    }
  });

  /**
   * Handle user commands with streaming
   * Streams AI responses in real-time using Server-Sent Events
   */
  router.post('/command-stream', async (req, res) => {
    const { command } = req.body;
    
    if (!command || typeof command !== 'string') {
      return res.status(400).json({ 
        response: 'Error: Invalid command format' 
      });
    }

    // Check if LLM client is available
    if (!llmClient) {
      return res.status(503).json({ 
        response: 'Error: AI system is not available. Please check that OPENAI_API_KEY is set in your .env file.' 
      });
    }

    try {
      // Set headers for Server-Sent Events
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Stream the LLM response
      for await (const chunk of llmClient.generateTextStream(command)) {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }

      // Send done signal
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error('Error generating LLM response:', error);
      res.write(`data: ${JSON.stringify({ error: 'Failed to generate response. Please try again.' })}\n\n`);
      res.end();
    }
  });

  return router;
}

