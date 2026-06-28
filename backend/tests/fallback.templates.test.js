import { describe, it, expect } from 'vitest';
import { getFallbackTemplate, ageBand } from '../src/services/fallback.templates.js';
import { AGE_GROUPS } from '../src/schemas/lesson.schemas.js';
const ALL_THEMES = [
  'Animals',
  'Colors',
  'Numbers & Counting',
  'Family & Friends',
  'Seasons & Weather',
  'Plants & Gardens',
  'Transport & Vehicles',
  'Water & Bubbles',
  'Shapes',
  'My Body',
  'Unknown Theme',
];
describe('ageBand', () => {
  it('maps each age group to the correct band', () => {
    const cases = [
      ['2-3', 'youngest'],
      ['3-4', 'young'],
      ['4-5', 'middle'],
      ['5-6', 'oldest'],
    ];
    for (const [age, expected] of cases) {
      expect(ageBand(age)).toBe(expected);
    }
  });
});
describe('getFallbackTemplate', () => {
  it.each(ALL_THEMES.flatMap((theme) => AGE_GROUPS.map((age) => [theme, age])))(
    'produces valid content for theme=%s age=%s',
    (theme, age) => {
      const result = getFallbackTemplate(theme, age);
      expect(result.objective.length).toBeGreaterThan(0);
      expect(result.activity.length).toBeGreaterThan(0);
      expect(result.rhyme.length).toBeGreaterThan(0);
      expect(result.worksheet.length).toBeGreaterThan(0);
      expect(result.materials.length).toBeGreaterThan(0);
      for (const m of result.materials) {
        expect(m.length).toBeGreaterThan(0);
      }
    },
  );
  it('produces different content for different age groups of the same theme', () => {
    const a = getFallbackTemplate('Animals', '2-3');
    const b = getFallbackTemplate('Animals', '5-6');
    expect(a.objective).not.toBe(b.objective);
    expect(a.activity).not.toBe(b.activity);
    expect(a.rhyme).not.toBe(b.rhyme);
    expect(a.worksheet).not.toBe(b.worksheet);
  });
  it('falls back to generic profile for unknown theme', () => {
    const result = getFallbackTemplate('Quantum Physics', '4-5');
    expect(result.objective).toContain('sort and compare');
  });
});
