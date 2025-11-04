/**
 * Simple test script for LLM adapter
 * 
 * Run with: npx tsx server/llm/test.ts
 * Make sure OPENAI_API_KEY is set in your .env file
 */
import dotenv from 'dotenv';
import { createLLMClient } from './LLMFactory.js';

// Load environment variables
dotenv.config();

async function testLLMClient() {
  console.log('🧪 Testing LLM Client...\n');

  try {
    // Create LLM client
    console.log('1. Creating LLM client...');
    const llm = createLLMClient();
    console.log('✅ LLM client created successfully\n');

    // Test simple prompt
    console.log('2. Testing simple prompt...');
    const result = await llm.generateText('Hello!');
    console.log('✅ Received response:');
    console.log('---');
    console.log(result);
    console.log('---\n');

    // Test game-specific prompt
    console.log('3. Testing game-specific prompt...');
    const gameResult = await llm.generateText('look around');
    console.log('✅ Received response:');
    console.log('---');
    console.log(gameResult);
    console.log('---\n');

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run tests
testLLMClient();

