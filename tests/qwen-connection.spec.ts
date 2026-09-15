import { test, expect } from '@playwright/test';
import OpenAI from 'openai';
import 'dotenv/config';

test('Check Qwen Connection', async () => {

  const qwen = new OpenAI({
    apiKey: process.env.QWEN_API_KEY,
    baseURL: process.env.QWEN_BASE_URL,
  });

  const response = await qwen.chat.completions.create({
    model: process.env.QWEN_MODEL || 'qwen-plus',
    messages: [
      {
        role: 'user',
        content: 'Reply with exactly: QWEN CONNECTED'
      }
    ],
  });

  const result = response.choices[0]?.message?.content;

  console.log('==============================');
  console.log('QWEN RESPONSE:', result);
  console.log('==============================');

  expect(result).toBeTruthy();
});