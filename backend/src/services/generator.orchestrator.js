import { getLogger } from '../lib/logger.js';
import { callGemini, GeminiUnavailableError, GeminiInvalidResponseError } from './gemini.client.js';
import { getFallbackTemplate } from './fallback.templates.js';
export async function generateLessonContent(input) {
  const log = getLogger().child({
    component: 'orchestrator',
    age: input.ageGroup,
    theme: input.theme,
  });
  try {
    const content = await callGemini(input);
    log.info('used gemini primary');
    return { content, source: 'gemini' };
  } catch (err) {
    const reason =
      err instanceof GeminiUnavailableError
        ? 'unavailable'
        : err instanceof GeminiInvalidResponseError
          ? 'invalid-response'
          : 'unknown';
    log.warn({ err: err?.message, reason }, 'gemini failed, using fallback template');
    const content = getFallbackTemplate(input.theme, input.ageGroup);
    return { content, source: 'fallback' };
  }
}
