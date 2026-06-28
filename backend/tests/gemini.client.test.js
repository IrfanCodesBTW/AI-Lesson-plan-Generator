import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn(),
    SchemaType: {
      OBJECT: 'object',
      STRING: 'string',
      ARRAY: 'array',
    },
  };
});
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  callGemini,
  GeminiInvalidResponseError,
  GeminiUnavailableError,
} from '../src/services/gemini.client.js';
import { resetEnvForTests } from '../src/config/env.js';
function makeMockModel(text) {
  if (text instanceof Error) {
    return {
      generateContent: vi.fn().mockRejectedValue(text),
    };
  }
  if (typeof text === 'function') {
    return {
      generateContent: vi.fn().mockImplementation(() => ({
        response: { text: () => text() },
      })),
    };
  }
  return {
    generateContent: vi.fn().mockResolvedValue({ response: { text: () => text } }),
  };
}
function setupMockModel(model, apiKey = 'test-key') {
  vi.mocked(GoogleGenerativeAI).mockImplementation(() => ({
    getGenerativeModel: () => model,
  }));
  return apiKey;
}
const validContent = {
  objective: 'Children will learn about animals.',
  activity: '1. Look at cards.\n2. Name animals.',
  rhyme: 'Animals, animals, hop and play.',
  worksheet: 'Color the picture.',
  materials: ['Cards', 'Crayons'],
};
beforeEach(() => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://lesson:lesson@localhost:5433/lesson_dev';
  process.env.JWT_SECRET = 'test-secret-32-characters-minimum-here-12345';
  resetEnvForTests();
});
describe('Gemini client', () => {
  it('returns parsed and validated content on success', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    resetEnvForTests();
    setupMockModel(makeMockModel(JSON.stringify(validContent)));
    const result = await callGemini({ ageGroup: '4-5', theme: 'Animals' });
    expect(result).toEqual(validContent);
  });
  it('throws GeminiUnavailableError when no API key is set', async () => {
    process.env.GEMINI_API_KEY = '';
    resetEnvForTests();
    await expect(callGemini({ ageGroup: '4-5', theme: 'Animals' })).rejects.toBeInstanceOf(
      GeminiUnavailableError,
    );
  });
  it('falls back when Gemini returns invalid JSON', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    resetEnvForTests();
    setupMockModel(makeMockModel('this is not json'));
    await expect(callGemini({ ageGroup: '4-5', theme: 'Animals' })).rejects.toBeInstanceOf(
      GeminiInvalidResponseError,
    );
  });
  it('falls back when Gemini returns valid JSON but wrong shape', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    resetEnvForTests();
    setupMockModel(makeMockModel(JSON.stringify({ objective: 'o', activity: 'a' })));
    await expect(callGemini({ ageGroup: '4-5', theme: 'Animals' })).rejects.toBeInstanceOf(
      GeminiInvalidResponseError,
    );
  });
  it('falls back when Gemini throws (network error)', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    resetEnvForTests();
    setupMockModel(makeMockModel(new Error('fetch failed')));
    await expect(callGemini({ ageGroup: '4-5', theme: 'Animals' })).rejects.toBeInstanceOf(
      GeminiUnavailableError,
    );
  });
  it('times out and falls back when Gemini is too slow', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    resetEnvForTests();
    setupMockModel(
      makeMockModel(() => new Promise((resolve) => setTimeout(() => resolve('{}'), 500))),
    );
    await expect(
      callGemini({ ageGroup: '4-5', theme: 'Animals' }, { timeoutMs: 50 }),
    ).rejects.toBeInstanceOf(GeminiUnavailableError);
  });
  it('uses custom model name when provided', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    resetEnvForTests();
    const model = makeMockModel(JSON.stringify(validContent));
    setupMockModel(model);
    await callGemini({ ageGroup: '4-5', theme: 'Animals' }, { model: 'gemini-1.5-pro' });
    const ctor = vi.mocked(GoogleGenerativeAI);
    expect(ctor).toHaveBeenCalledWith('test-key');
  });
});
