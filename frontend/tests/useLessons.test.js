import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLessons } from '../src/hooks/useLessons';
import * as api from '../src/lib/api';
vi.mock('../src/lib/api', async () => {
  const actual = await vi.importActual('../src/lib/api');
  return {
    ...actual,
    fetchLessons: vi.fn(),
    generateLesson: vi.fn(),
    deleteLesson: vi.fn(),
  };
});
const sampleLesson = {
  id: 'l1',
  userId: 'u1',
  ageGroup: '4-5',
  theme: 'Animals',
  lessonContent: {
    objective: 'o',
    activity: 'a',
    rhyme: 'r',
    worksheet: 'w',
    materials: ['m1'],
  },
  source: 'fallback',
  createdAt: '2026-06-07T10:00:00.000Z',
};
beforeEach(() => {
  vi.mocked(api.fetchLessons).mockReset();
  vi.mocked(api.generateLesson).mockReset();
  vi.mocked(api.deleteLesson).mockReset();
});
describe('useLessons', () => {
  it('loads lessons on demand', async () => {
    vi.mocked(api.fetchLessons).mockResolvedValue({
      items: [sampleLesson],
      total: 1,
      page: 1,
      limit: 20,
    });
    const { result } = renderHook(() => useLessons());
    await act(async () => {
      await result.current.load();
    });
    await waitFor(() => {
      expect(result.current.items).toHaveLength(1);
      expect(result.current.total).toBe(1);
      expect(result.current.loading).toBe(false);
    });
  });
  it('passes theme filter to fetchLessons', async () => {
    vi.mocked(api.fetchLessons).mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 });
    const { result } = renderHook(() => useLessons());
    await act(async () => {
      await result.current.load('Animals');
    });
    expect(api.fetchLessons).toHaveBeenCalledWith({ theme: 'Animals' });
  });
  it('captures error string on load failure', async () => {
    vi.mocked(api.fetchLessons).mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useLessons());
    await act(async () => {
      await result.current.load();
    });
    await waitFor(() => {
      expect(result.current.error).toBe('boom');
    });
  });
  it('generate returns lesson on success', async () => {
    vi.mocked(api.generateLesson).mockResolvedValue(sampleLesson);
    const { result } = renderHook(() => useLessons());
    let lesson = null;
    await act(async () => {
      lesson = await result.current.generate({ ageGroup: '4-5', theme: 'Animals' });
    });
    expect(lesson).toEqual(sampleLesson);
    expect(result.current.generating).toBe(false);
  });
  it('generate returns null and sets error on failure', async () => {
    vi.mocked(api.generateLesson).mockRejectedValue(new Error('gemini down'));
    const { result } = renderHook(() => useLessons());
    let lesson = sampleLesson;
    await act(async () => {
      lesson = await result.current.generate({ ageGroup: '4-5', theme: 'Animals' });
    });
    expect(lesson).toBeNull();
    expect(result.current.error).toBe('gemini down');
  });
  it('remove drops the item from the list optimistically', async () => {
    vi.mocked(api.fetchLessons).mockResolvedValue({
      items: [sampleLesson, { ...sampleLesson, id: 'l2' }],
      total: 2,
      page: 1,
      limit: 20,
    });
    vi.mocked(api.deleteLesson).mockResolvedValue(undefined);
    const { result } = renderHook(() => useLessons());
    await act(async () => {
      await result.current.load();
    });
    await waitFor(() => expect(result.current.items).toHaveLength(2));
    await act(async () => {
      const ok = await result.current.remove('l1');
      expect(ok).toBe(true);
    });
    expect(result.current.items.map((l) => l.id)).toEqual(['l2']);
    expect(result.current.total).toBe(1);
  });
});
