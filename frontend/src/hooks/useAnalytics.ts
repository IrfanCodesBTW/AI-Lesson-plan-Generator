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
  DashboardMetrics,
  AIInsightItem,
  TaskItem,
} from '../lib/api';
import { supabase } from '../lib/supabase';

export interface UseAnalyticsResult {
  range: string;
  customStart?: string;
  customEnd?: string;
  metrics: DashboardMetrics | null;
  insights: AIInsightItem[];
  tasks: TaskItem[];
  loading: boolean;
  insightsLoading: boolean;
  error: string | null;
  setWeekRange: (newRange: string, start?: string, end?: string) => void;
  addTask: (title: string) => Promise<boolean>;
  toggleTask: (id: string, completed: boolean) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  logSession: (hours: number, type: string, date?: string) => Promise<boolean>;
  logStudentMetrics: (input: {
    studentName: string;
    activityName: string;
    score?: number;
    attendanceStatus?: string;
    engagementScore?: number;
    date?: string;
  }) => Promise<boolean>;
  regenerateAIInsights: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

export function useAnalytics(): UseAnalyticsResult {
  const [range, setRange] = useState<string>('current_week');
  const [customStart, setCustomStart] = useState<string | undefined>(undefined);
  const [customEnd, setCustomEnd] = useState<string | undefined>(undefined);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [insights, setInsights] = useState<AIInsightItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [insightsLoading, setInsightsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
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
    let sse: EventSource | null = null;

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

  const setWeekRange = useCallback((newRange: string, start?: string, end?: string) => {
    setRange(newRange);
    setCustomStart(start);
    setCustomEnd(end);
  }, []);

  const addTask = useCallback(async (title: string): Promise<boolean> => {
    try {
      const newTask = await createNewTask(title);
      setTasks((prev) => [newTask, ...prev]);
      return true;
    } catch (err: any) {
      console.error('Failed to create task:', err);
      return false;
    }
  }, []);

  const toggleTask = useCallback(async (id: string, completed: boolean): Promise<boolean> => {
    try {
      const updated = await updateTaskStatus(id, completed);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return true;
    } catch (err: any) {
      console.error('Failed to update task status:', err);
      return false;
    }
  }, []);

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteTaskItem(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (err: any) {
      console.error('Failed to delete task:', err);
      return false;
    }
  }, []);

  const logSession = useCallback(
    async (hours: number, type: string, date?: string): Promise<boolean> => {
      try {
        await logFocusHours(hours, type, date);
        void loadAll(); // Instantly refresh metrics for real-time graphs
        return true;
      } catch (err: any) {
        console.error('Failed to log focus session:', err);
        return false;
      }
    },
    [loadAll],
  );

  const logStudentMetrics = useCallback(
    async (input: {
      studentName: string;
      activityName: string;
      score?: number;
      attendanceStatus?: string;
      engagementScore?: number;
      date?: string;
    }): Promise<boolean> => {
      try {
        await logStudentPerformance(input);
        void loadAll(); // Instantly refresh metrics
        return true;
      } catch (err: any) {
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
    } catch (err: any) {
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
