import axios from 'axios';
import { supabase } from './supabase';
const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000';
export const api = axios.create({
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
export const AGE_GROUPS = ['2-3', '3-4', '4-5', '5-6'];
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
];
export function getApiError(err) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
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
export async function fetchHealth() {
  const res = await api.get('/health');
  return res.data;
}
export async function registerUser(input) {
  const res = await api.post('/api/auth/register', input);
  return res.data;
}
export async function loginUser(input) {
  const res = await api.post('/api/auth/login', input);
  return res.data;
}
export async function fetchLessons(params = {}) {
  const res = await api.get('/api/lessons', { params });
  return res.data;
}
export async function fetchLesson(id) {
  const res = await api.get(`/api/lessons/${id}`);
  return res.data.lesson;
}
export async function deleteLesson(id) {
  await api.delete(`/api/lessons/${id}`);
}
export async function generateLesson(input) {
  const res = await api.post('/api/lessons/generate', input);
  return res.data.lesson;
}
export async function downloadLessonPdf(id, suggestedFilename) {
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
// ── Analytics API Functions ──────────────────────────────────────────
export async function fetchDashboardData(range, customStart, customEnd) {
  const params = { range };
  if (customStart) params.customStart = customStart;
  if (customEnd) params.customEnd = customEnd;
  const res = await api.get('/api/analytics/dashboard', { params });
  return res.data;
}
export async function fetchInsights() {
  const res = await api.get('/api/analytics/insights');
  return res.data.insights;
}
export async function triggerInsightsRegenerate() {
  const res = await api.post('/api/analytics/insights/regenerate');
  return res.data.insights;
}
export async function fetchTasksList() {
  const res = await api.get('/api/analytics/tasks');
  return res.data.tasks;
}
export async function createNewTask(title) {
  const res = await api.post('/api/analytics/tasks', { title });
  return res.data.task;
}
export async function updateTaskStatus(id, completed) {
  const res = await api.put(`/api/analytics/tasks/${id}`, { completed });
  return res.data.task;
}
export async function deleteTaskItem(id) {
  await api.delete(`/api/analytics/tasks/${id}`);
}
export async function logFocusHours(hours, activityType, date) {
  await api.post('/api/analytics/focus-sessions', { hours, activityType, date });
}
export async function logStudentPerformance(input) {
  await api.post('/api/analytics/student-metrics', input);
}
// ── Operations API Functions ─────────────────────────────────────────
export async function fetchEnquiries() {
  const res = await api.get('/api/operations/enquiries');
  return res.data.enquiries;
}
export async function createEnquiry(input) {
  const res = await api.post('/api/operations/enquiries', input);
  return res.data.enquiry;
}
export async function updateEnquiryStatus(id, status) {
  const res = await api.put(`/api/operations/enquiries/${id}`, { status });
  return res.data.enquiry;
}
export async function fetchRoutines() {
  const res = await api.get('/api/operations/routines');
  return res.data.routines;
}
export async function createRoutine(input) {
  const res = await api.post('/api/operations/routines', input);
  return res.data.routine;
}
// ── New Features API Functions ─────────────────────────────────────────
export async function approveLesson(id, status) {
  const res = await api.patch(`/api/lessons/${id}/approve`, { status });
  return res.data.lesson;
}
export async function downloadLessonCsv(id, suggestedFilename) {
  const res = await api.get(`/api/export/csv/${id}`, { responseType: 'blob' });
  const blob = new Blob([res.data], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = suggestedFilename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function fetchCurriculumMapping() {
  const res = await api.get('/api/curriculum/mapping');
  return res.data.mapping;
}
export async function createCurriculum(input) {
  const res = await api.post('/api/curriculum', input);
  return res.data.activity;
}
export async function fetchMaterialRequirements(theme) {
  const res = await api.get('/api/materials/requirements', { params: { theme } });
  return res.data.materials;
}
export async function sendCommunication(input) {
  const res = await api.post('/api/communications/send', input);
  return res.data;
}
export async function fetchParents() {
  const res = await api.get('/api/management/parents');
  return res.data.parents;
}
export async function createParent(input) {
  const res = await api.post('/api/management/parents', input);
  return res.data.parent;
}
export async function fetchChildren() {
  const res = await api.get('/api/management/children');
  return res.data.children;
}
export async function createChild(input) {
  const res = await api.post('/api/management/children', input);
  return res.data.child;
}
export async function fetchClassrooms() {
  const res = await api.get('/api/management/classrooms');
  return res.data.classrooms;
}
export async function createClassroom(input) {
  const res = await api.post('/api/management/classrooms', input);
  return res.data.classroom;
}
