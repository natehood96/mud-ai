# LLM Adapter Architecture

This directory contains the abstraction layer for LLM (Large Language Model) interactions, allowing the game to use different AI providers without changing game logic.

## Architecture Overview

```
┌─────────────────┐
│   Game Logic    │
│  (server/index) │
└────────┬────────┘
         │
         │ uses
         ▼
┌─────────────────┐
│   LLMFactory    │  ← Creates appropriate adapter
└────────┬────────┘
         │
         │ returns
         ▼
┌─────────────────┐
│   LLMClient     │  ← Interface (contract)
│   (interface)   │
└────────┬────────┘
         │
         │ implemented by
         ▼
┌─────────────────┐
│ OpenAIAdapter   │  ← Concrete implementation
└─────────────────┘
```

## Files

### `LLMClient.ts`
- **Purpose**: Defines the interface that all LLM adapters must implement
- **Key Method**: `generateText(prompt: string): Promise<string>`
- **Usage**: Reference this interface in game logic, never concrete adapters

### `OpenAIAdapter.ts`
- **Purpose**: Implements LLMClient using OpenAI's API
- **Model**: Uses `gpt-4o-mini` for cost-effective responses
- **System Prompt**: Configured as a creative MUD game master
- **Error Handling**: Wraps OpenAI errors with meaningful messages

### `LLMFactory.ts`
- **Purpose**: Factory function to create the appropriate LLM client
- **Current Support**: OpenAI only
- **Future**: Will support Claude, Perplexity, Llama, etc.
- **Environment**: Reads `OPENAI_API_KEY` from process.env

## Usage

### In Game Code

```typescript
import { createLLMClient } from './llm/LLMFactory.js';

// Initialize once at startup
const llm = createLLMClient();

// Use throughout your game
const response = await llm.generateText("look around");
console.log(response);
```

### Environment Setup

Add to your `.env` file:
```bash
OPENAI_API_KEY=your-api-key-here
```

Get your API key from: https://platform.openai.com/api-keys

## Testing

Run the test script to verify everything works:

```bash
npx tsx server/llm/test.ts
```

This will:
1. Create an LLM client
2. Send a simple "Hello!" prompt
3. Send a game-specific "look around" prompt
4. Display the responses

## Adding New Adapters

To add support for a new LLM provider (e.g., Claude):

1. **Create the adapter** (`ClaudeAdapter.ts`):
```typescript
import { LLMClient } from './LLMClient.js';

export class ClaudeAdapter implements LLMClient {
  async generateText(prompt: string): Promise<string> {
    // Implementation using Claude API
  }
}
```

2. **Update the factory** (`LLMFactory.ts`):
```typescript
export function createLLMClient(modelType: string = 'openai'): LLMClient {
  const apiKey = process.env.OPENAI_API_KEY; // or appropriate key
  
  switch (modelType.toLowerCase()) {
    case 'openai':
      return new OpenAIAdapter(apiKey);
    case 'claude':
      return new ClaudeAdapter(process.env.ANTHROPIC_API_KEY);
    default:
      throw new Error(`Unknown model type: ${modelType}`);
  }
}
```

3. **No game logic changes needed!** The game continues to use `LLMClient` interface.

## Design Principles

1. **Vendor Agnostic**: Game logic never imports vendor-specific code
2. **Easy Extension**: New providers can be added without modifying existing code
3. **Error Handling**: All adapters handle errors gracefully
4. **Type Safety**: TypeScript ensures all adapters implement the contract
5. **Environment-Based**: Configuration via environment variables, never hardcoded

## Future Enhancements

- [ ] Streaming API support
- [ ] Message history management
- [ ] Response caching
- [ ] Multiple provider support (Claude, Perplexity, Llama)
- [ ] Cost tracking and rate limiting
- [ ] Custom system prompts per game context

