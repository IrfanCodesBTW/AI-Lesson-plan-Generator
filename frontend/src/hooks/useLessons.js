import { useCallback, useState } from 'react';
import { deleteLesson, fetchLessons, generateLesson, getApiError } from '../lib/api';
export function useLessons() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const load = useCallback(async (theme) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchLessons(theme ? { theme } : undefined);
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(getApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);
  const generate = useCallback(async (input) => {
    setGenerating(true);
    setError(null);
    try {
      const lesson = await generateLesson(input);
      return lesson;
    } catch (err) {
      setError(getApiError(err).message);
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);
  const remove = useCallback(async (id) => {
    setDeletingId(id);
    setError(null);
    try {
      await deleteLesson(id);
      setItems((prev) => prev.filter((l) => l.id !== id));
      setTotal((t) => Math.max(0, t - 1));
      return true;
    } catch (err) {
      setError(getApiError(err).message);
      return false;
    } finally {
      setDeletingId(null);
    }
  }, []);
  const clearError = useCallback(() => setError(null), []);
  return {
    items,
    total,
    loading,
    generating,
    deletingId,
    error,
    load,
    generate,
    remove,
    clearError,
  };
}
