import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchDashboardData,
  fetchInsights,
  triggerInsightsRegenerate,
  fetchTasksList,
  createNewTask,
  updateTaskStatus,
  deleteTaskItem,
  logFocusHours,
  logStudentPerformance,
} from '../lib/api';
import { supabase } from '../lib/supabase';
export function useAnalytics() {
  const [range, setRange] = useState('current_week');
  const [customStart, setCustomStart] = useState(undefined);
  const [customEnd, setCustomEnd] = useState(undefined);
  const [metrics, setMetrics] = useState(null);
  const [insights, setInsights] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Memoize parameters to avoid redundant load calls
  const fetchParams = useMemo(
    () => ({ range, customStart, customEnd }),
    [range, customStart, customEnd],
  );
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsData, insightsData, tasksData] = await Promise.all([
        fetchDashboardData(fetchParams.range, fetchParams.customStart, fetchParams.customEnd),
        fetchInsights(),
        fetchTasksList(),
      ]);
      setMetrics(metricsData);
      setInsights(insightsData);
      setTasks(tasksData);
    } catch (err) {
      setError(
        err?.response?.data?.error?.message || err?.message || 'Failed to load dashboard analytics',
      );
    } finally {
      setLoading(false);
    }
  }, [fetchParams]);
  // Load initially and when parameters change
  useEffect(() => {
    void loadAll();
  }, [loadAll]);
  // Real-time updates via Server-Sent Events (SSE)
  useEffect(() => {
    let sse = null;
    const connectSSE = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token || localStorage.getItem('token');
        if (!token) return;
        const apiBase = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000';
        sse = new EventSource(`${apiBase}/api/analytics/events?token=${token}`);
        sse.addEventListener('refresh', () => {
          // Trigger a silent background reload when notified of database updates
          void fetchDashboardData(fetchParams.range, fetchParams.customStart, fetchParams.customEnd)
            .then(setMetrics)
            .catch(console.error);
          void fetchInsights().then(setInsights).catch(console.error);
          void fetchTasksList().then(setTasks).catch(console.error);
        });
        sse.onerror = (err) => {
          console.error('SSE connection error:', err);
          sse?.close();
        };
      } catch (err) {
        console.error('Failed to initialize SSE connection:', err);
      }
    };
    void connectSSE();
    return () => {
      if (sse) {
        sse.close();
      }
    };
  }, [fetchParams.range, fetchParams.customStart, fetchParams.customEnd]);
  const setWeekRange = useCallback((newRange, start, end) => {
    setRange(newRange);
    setCustomStart(start);
    setCustomEnd(end);
  }, []);
  const addTask = useCallback(async (title) => {
    try {
      const newTask = await createNewTask(title);
      setTasks((prev) => [newTask, ...prev]);
      return true;
    } catch (err) {
      console.error('Failed to create task:', err);
      return false;
    }
  }, []);
  const toggleTask = useCallback(async (id, completed) => {
    try {
      const updated = await updateTaskStatus(id, completed);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return true;
    } catch (err) {
      console.error('Failed to update task status:', err);
      return false;
    }
  }, []);
  const deleteTask = useCallback(async (id) => {
    try {
      await deleteTaskItem(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete task:', err);
      return false;
    }
  }, []);
  const logSession = useCallback(
    async (hours, type, date) => {
      try {
        await logFocusHours(hours, type, date);
        void loadAll(); // Instantly refresh metrics for real-time graphs
        return true;
      } catch (err) {
        console.error('Failed to log focus session:', err);
        return false;
      }
    },
    [loadAll],
  );
  const logStudentMetrics = useCallback(
    async (input) => {
      try {
        await logStudentPerformance(input);
        void loadAll(); // Instantly refresh metrics
        return true;
      } catch (err) {
        console.error('Failed to log student metrics:', err);
        return false;
      }
    },
    [loadAll],
  );
  const regenerateAIInsights = useCallback(async () => {
    setInsightsLoading(true);
    try {
      const newInsights = await triggerInsightsRegenerate();
      setInsights(newInsights);
    } catch (err) {
      console.error('Failed to regenerate AI insights:', err);
    } finally {
      setInsightsLoading(false);
    }
  }, []);
  return {
    range,
    customStart,
    customEnd,
    metrics,
    insights,
    tasks,
    loading,
    insightsLoading,
    error,
    setWeekRange,
    addTask,
    toggleTask,
    deleteTask,
    logSession,
    logStudentMetrics,
    regenerateAIInsights,
    refreshAll: loadAll,
  };
}
