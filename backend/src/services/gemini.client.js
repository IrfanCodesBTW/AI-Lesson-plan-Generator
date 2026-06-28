import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { lessonContentSchema } from '../schemas/lesson.schemas.js';
import { loadEnv } from '../config/env.js';
import { getLogger } from '../lib/logger.js';
export class GeminiUnavailableError extends Error {
  cause;
  constructor(message, cause) {
    super(message);
    this.cause = cause;
    this.name = 'GeminiUnavailableError';
  }
}
export class GeminiInvalidResponseError extends Error {
  cause;
  constructor(message, cause) {
    super(message);
    this.cause = cause;
    this.name = 'GeminiInvalidResponseError';
  }
}
const RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    objective: { type: SchemaType.STRING, description: 'One clear learning objective sentence.' },
    activity: { type: SchemaType.STRING, description: 'Step-by-step activity plan (3-5 steps).' },
    rhyme: { type: SchemaType.STRING, description: 'A short, age-appropriate rhyme (4-8 lines).' },
    worksheet: { type: SchemaType.STRING, description: 'A simple worksheet idea (1-2 sentences).' },
    materials: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'List of 3-5 simple materials.',
    },
  },
  required: ['objective', 'activity', 'rhyme', 'worksheet', 'materials'],
};
const SYSTEM_INSTRUCTION = [
  'You are a curriculum designer for preschool (ages 2-6).',
  'Generate engaging, safe, age-appropriate lesson content.',
  'Keep language simple and concrete. Avoid scary or violent themes.',
  'Use the exact JSON shape requested. Do not include markdown fences or commentary.',
].join(' ');
const responseValidator = lessonContentSchema;
function buildPrompt(req) {
  const dateLine = req.date ? `Lesson date: ${req.date}.\n` : '';
  return [
    `Age group: ${req.ageGroup} years old.`,
    `Theme: ${req.theme}.`,
    dateLine,
    'Generate a complete preschool lesson plan with the requested JSON shape.',
  ].join('\n');
}
export async function callGemini(req, options) {
  const env = loadEnv();
  const apiKey = options?.apiKey ?? env.GEMINI_API_KEY;
  const modelName = options?.model ?? env.GEMINI_MODEL;
  const timeoutMs = options?.timeoutMs ?? env.GEMINI_TIMEOUT_MS;
  if (!apiKey || apiKey.trim() === '') {
    throw new GeminiUnavailableError('GEMINI_API_KEY not configured');
  }
  const genai = new GoogleGenerativeAI(apiKey);
  const model = genai.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.8,
    },
    systemInstruction: SYSTEM_INSTRUCTION,
  });
  const log = getLogger().child({ component: 'gemini', model: modelName });
  const callPromise = (async () => {
    const result = await model.generateContent(buildPrompt(req));
    return result.response.text();
  })();
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new GeminiUnavailableError(`Gemini timed out after ${timeoutMs}ms`)),
      timeoutMs,
    );
  });
  try {
    const text = await Promise.race([callPromise, timeoutPromise]);
    if (!text) {
      throw new GeminiInvalidResponseError('Gemini returned empty response');
    }
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      throw new GeminiInvalidResponseError('Gemini response was not valid JSON', err);
    }
    const validated = responseValidator.safeParse(parsed);
    if (!validated.success) {
      throw new GeminiInvalidResponseError(
        `Gemini response failed schema: ${validated.error.issues.map((i) => i.message).join('; ')}`,
      );
    }
    log.info({ age: req.ageGroup, theme: req.theme }, 'gemini generation ok');
    return validated.data;
  } catch (err) {
    if (err instanceof GeminiUnavailableError || err instanceof GeminiInvalidResponseError) {
      log.warn({ err: err.message }, 'gemini call failed');
      throw err;
    }
    log.warn({ err }, 'gemini call threw');
    throw new GeminiUnavailableError(
      err instanceof Error ? err.message : 'Unknown Gemini error',
      err,
    );
  } finally {
    if (timer) clearTimeout(timer);
  }
}
