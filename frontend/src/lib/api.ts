import axios, { AxiosInstance } from 'axios';
import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000';

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type AgeGroup = '2-3' | '3-4' | '4-5' | '5-6';

export const AGE_GROUPS: AgeGroup[] = ['2-3', '3-4', '4-5', '5-6'];

export const THEMES = [
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
] as const;

export type Theme = (typeof THEMES)[number];

export interface LessonContent {
  objective: string;
  activity: string;
  rhyme: string;
  worksheet: string;
  materials: string[];
}

export interface Lesson {
  id: string;
  userId: string;
  ageGroup: AgeGroup;
  theme: string;
  lessonContent: LessonContent;
  source: 'gemini' | 'fallback';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface LessonListResponse {
  items: Lesson[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export function getApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: ApiError } | undefined;
    if (data?.error) return data.error;
    return {
      code: 'NETWORK_ERROR',
      message: err.message || 'Request failed',
    };
  }
  return {
    code: 'UNKNOWN',
    message: err instanceof Error ? err.message : 'Unknown error',
  };
}

export async function fetchHealth(): Promise<{
  ok: boolean;
  service: string;
  gemini: 'configured' | 'fallback';
}> {
  const res = await api.get('/health');
  return res.data;
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await api.post('/api/auth/register', input);
  return res.data;
}

export async function loginUser(input: { email: string; password: string }): Promise<AuthResponse> {
  const res = await api.post('/api/auth/login', input);
  return res.data;
}

export async function fetchLessons(
  params: {
    theme?: string;
    page?: number;
    limit?: number;
  } = {},
): Promise<LessonListResponse> {
  const res = await api.get('/api/lessons', { params });
  return res.data;
}

export async function fetchLesson(id: string): Promise<Lesson> {
  const res = await api.get(`/api/lessons/${id}`);
  return res.data.lesson as Lesson;
}

export async function deleteLesson(id: string): Promise<void> {
  await api.delete(`/api/lessons/${id}`);
}

export async function generateLesson(input: {
  ageGroup: AgeGroup;
  theme: string;
  date?: string;
}): Promise<Lesson> {
  const res = await api.post('/api/lessons/generate', input);
  return res.data.lesson as Lesson;
}

export async function downloadLessonPdf(id: string, suggestedFilename: string): Promise<void> {
  const res = await api.get(`/api/export/pdf/${id}`, { responseType: 'blob' });
  const blob = new Blob([res.data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = suggestedFilename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── Analytics Types ──────────────────────────────────────────────────

export interface WeeklyTrend {
  day: string;
  hours: number;
}

export interface DashboardKPIs {
  attendanceRate: number;
  engagementRate: number;
  completionRate: number;
  totalTasks: number;
  completedTasks: number;
  geminiLessonsCount: number;
  fallbackLessonsCount: number;
  totalLessonsCount: number;
}

export interface FocusHoursSummary {
  totalHours: number;
  percentageChange: number;
}

export interface DashboardMetrics {
  trends: WeeklyTrend[];
  summary: FocusHoursSummary;
  kpis: DashboardKPIs;
}

export interface AIInsightItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'classroom_engagement' | 'learning_gaps' | 'resource_suggestions';
  createdAt: string;
}

export interface TaskItem {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

// ── Analytics API Functions ──────────────────────────────────────────

export async function fetchDashboardData(
  range: string,
  customStart?: string,
  customEnd?: string,
): Promise<DashboardMetrics> {
  const params: Record<string, string> = { range };
  if (customStart) params.customStart = customStart;
  if (customEnd) params.customEnd = customEnd;
  const res = await api.get('/api/analytics/dashboard', { params });
  return res.data;
}

export async function fetchInsights(): Promise<AIInsightItem[]> {
  const res = await api.get('/api/analytics/insights');
  return res.data.insights;
}

export async function triggerInsightsRegenerate(): Promise<AIInsightItem[]> {
  const res = await api.post('/api/analytics/insights/regenerate');
  return res.data.insights;
}

export async function fetchTasksList(): Promise<TaskItem[]> {
  const res = await api.get('/api/analytics/tasks');
  return res.data.tasks;
}

export async function createNewTask(title: string): Promise<TaskItem> {
  const res = await api.post('/api/analytics/tasks', { title });
  return res.data.task;
}

export async function updateTaskStatus(id: string, completed: boolean): Promise<TaskItem> {
  const res = await api.put(`/api/analytics/tasks/${id}`, { completed });
  return res.data.task;
}

export async function deleteTaskItem(id: string): Promise<void> {
  await api.delete(`/api/analytics/tasks/${id}`);
}

export async function logFocusHours(
  hours: number,
  activityType: string,
  date?: string,
): Promise<void> {
  await api.post('/api/analytics/focus-sessions', { hours, activityType, date });
}

export async function logStudentPerformance(input: {
  studentName: string;
  activityName: string;
  score?: number;
  attendanceStatus?: string;
  engagementScore?: number;
  date?: string;
}): Promise<void> {
  await api.post('/api/analytics/student-metrics', input);
}

// ── Operations Types ─────────────────────────────────────────────────

export interface ParentEnquiry {
  id: string;
  userId: string;
  parentName: string;
  childName: string;
  childAge: number;
  status: 'pending' | 'contacted' | 'admitted' | 'rejected';
  remarks: string | null;
  createdAt: string;
}

export interface DaycareRoutine {
  id: string;
  userId: string;
  childName: string;
  routineType: 'meal' | 'nap' | 'diaper' | 'activity';
  detail: string;
  createdAt: string;
}

// ── Operations API Functions ─────────────────────────────────────────

export async function fetchEnquiries(): Promise<ParentEnquiry[]> {
  const res = await api.get('/api/operations/enquiries');
  return res.data.enquiries;
}

export async function createEnquiry(input: {
  parentName: string;
  childName: string;
  childAge: number;
  remarks?: string;
}): Promise<ParentEnquiry> {
  const res = await api.post('/api/operations/enquiries', input);
  return res.data.enquiry;
}

export async function updateEnquiryStatus(
  id: string,
  status: 'pending' | 'contacted' | 'admitted' | 'rejected',
): Promise<ParentEnquiry> {
  const res = await api.put(`/api/operations/enquiries/${id}`, { status });
  return res.data.enquiry;
}

export async function fetchRoutines(): Promise<DaycareRoutine[]> {
  const res = await api.get('/api/operations/routines');
  return res.data.routines;
}

export async function createRoutine(input: {
  childName: string;
  routineType: 'meal' | 'nap' | 'diaper' | 'activity';
  detail: string;
}): Promise<DaycareRoutine> {
  const res = await api.post('/api/operations/routines', input);
  return res.data.routine;
}

// ── New Features API Functions ─────────────────────────────────────────

export async function approveLesson(id: string, status: 'approved' | 'rejected'): Promise<Lesson> {
  const res = await api.patch(`/api/lessons/${id}/approve`, { status });
  return res.data.lesson as Lesson;
}

export async function downloadLessonCsv(id: string, suggestedFilename: string): Promise<void> {
  const res = await api.get(`/api/export/csv/${id}`, { responseType: 'blob' });
  const blob = new Blob([res.data], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = suggestedFilename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function fetchCurriculumMapping(): Promise<any> {
  const res = await api.get('/api/curriculum/mapping');
  return res.data.mapping;
}

export async function createCurriculum(input: {
  theme: string;
  week_number: number;
  details: string;
}): Promise<any> {
  const res = await api.post('/api/curriculum', input);
  return res.data.activity;
}

export async function fetchMaterialRequirements(theme?: string): Promise<string[]> {
  const res = await api.get('/api/materials/requirements', { params: { theme } });
  return res.data.materials;
}

export async function sendCommunication(input: {
  parentId: string;
  message: string;
  type: 'whatsapp' | 'email';
}): Promise<any> {
  const res = await api.post('/api/communications/send', input);
  return res.data;
}

export async function fetchParents(): Promise<any[]> {
  const res = await api.get('/api/management/parents');
  return res.data.parents;
}

export async function createParent(input: {
  name: string;
  email?: string;
  phone?: string;
}): Promise<any> {
  const res = await api.post('/api/management/parents', input);
  return res.data.parent;
}

export async function fetchChildren(): Promise<any[]> {
  const res = await api.get('/api/management/children');
  return res.data.children;
}

export async function createChild(input: {
  name: string;
  dob: string;
  parent_id: string;
  classroom_id?: string;
}): Promise<any> {
  const res = await api.post('/api/management/children', input);
  return res.data.child;
}

export async function fetchClassrooms(): Promise<any[]> {
  const res = await api.get('/api/management/classrooms');
  return res.data.classrooms;
}

export async function createClassroom(input: { name: string; capacity: number }): Promise<any> {
  const res = await api.post('/api/management/classrooms', input);
  return res.data.classroom;
}
