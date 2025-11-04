import { LLMClient } from './LLMClient.js';
import { OpenAIAdapter } from './OpenAIAdapter.js';

/**
 * LLMFactory
 * 
 * Factory function that creates and returns the appropriate LLM client.
 * Currently only supports OpenAI, but designed to easily support multiple providers.
 * 
 * @param modelType - The type of LLM to use (currently ignored, always returns OpenAI)
 * @returns An instance of LLMClient
 * @throws Error if required environment variables are missing
 */
export function createLLMClient(modelType: string = 'openai'): LLMClient {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY environment variable is required. Please add it to your .env file.'
    );
  }

  // For now, always return OpenAI adapter
  // In the future, we can add a switch statement here for other providers
  switch (modelType.toLowerCase()) {
    case 'openai':
    default:
      return new OpenAIAdapter(apiKey);
  }
}

