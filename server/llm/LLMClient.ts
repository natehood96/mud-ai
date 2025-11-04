/**
 * LLMClient Interface
 * 
 * Defines the contract that all LLM adapters must implement.
 * This allows the game to interact with any LLM provider without
 * knowing the specific implementation details.
 */
export interface LLMClient {
  /**
   * Generates text based on a prompt
   * @param prompt - The input prompt to send to the LLM
   * @returns A promise that resolves to the generated text
   * @throws Error if the API call fails
   */
  generateText(prompt: string): Promise<string>;

  /**
   * Generates text based on a prompt with streaming support
   * @param prompt - The input prompt to send to the LLM
   * @returns An async generator that yields text chunks as they arrive
   * @throws Error if the API call fails
   */
  generateTextStream(prompt: string): AsyncGenerator<string, void, unknown>;
}

