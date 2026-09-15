import OpenAI from 'openai';
import 'dotenv/config';

const qwen = new OpenAI({
  apiKey: process.env.QWEN_API_KEY,
  baseURL: process.env.QWEN_BASE_URL,
});

export async function askQwen(prompt: string) {
  const response = await qwen.chat.completions.create({
    model: process.env.QWEN_MODEL || 'qwen-plus',
    messages: [
      {
        role: 'system',
        content: 'You are an expert QA Automation Engineer specializing in Playwright.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.2,
  });

  return response.choices[0]?.message?.content || '';
}