import { query } from '../lib/db';
import { getLogger } from '../lib/logger';

function formatDate(dateVal: Date | string): string {
  if (dateVal instanceof Date) {
    const year = dateVal.getFullYear();
    const month = String(dateVal.getMonth() + 1).padStart(2, '0');
    const day = String(dateVal.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (typeof dateVal === 'string') {
    return dateVal.split('T')[0];
  }
  return dateVal;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  hours: number;
  activityType: 'planning' | 'teaching' | 'grading' | 'focus_session';
  date: string;
  createdAt: string;
}

export interface StudentMetric {
  id: string;
  userId: string;
  studentName: string;
  activityName: string;
  score: number | null;
  attendanceStatus: 'present' | 'absent' | 'tardy' | null;
  engagementScore: number | null;
  date: string;
  createdAt: string;
}

export interface WeeklyTrend {
  day: string;
  hours: number;
}

export type DateRangeType =
  | 'current_week'
  | 'last_week'
  | 'last_30_days'
  | 'last_3_months'
  | 'custom';

// Resolves a DateRangeType to specific start and end Date objects
export function resolveDateRange(
  range: DateRangeType,
  customStart?: string,
  customEnd?: string,
): { startDate: Date; endDate: Date; prevStartDate: Date; prevEndDate: Date } {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();
  let prevStartDate = new Date();
  let prevEndDate = new Date();

  if (range === 'current_week') {
    // Current week: Sunday to Saturday
    startDate.setDate(now.getDate() - now.getDay());
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    // Prev period: Previous week
    prevStartDate = new Date(startDate);
    prevStartDate.setDate(startDate.getDate() - 7);

    prevEndDate = new Date(endDate);
    prevEndDate.setDate(endDate.getDate() - 7);
  } else if (range === 'last_week') {
    // Last week: Last Sunday to last Saturday
    startDate.setDate(now.getDate() - now.getDay() - 7);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    // Prev period: 2 weeks ago
    prevStartDate = new Date(startDate);
    prevStartDate.setDate(startDate.getDate() - 7);

    prevEndDate = new Date(endDate);
    prevEndDate.setDate(endDate.getDate() - 7);
  } else if (range === 'last_30_days') {
    startDate.setDate(now.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    // Prev period: 30 to 60 days ago
    prevStartDate.setDate(now.getDate() - 60);
    prevStartDate.setHours(0, 0, 0, 0);

    prevEndDate.setDate(now.getDate() - 31);
    prevEndDate.setHours(23, 59, 59, 999);
  } else if (range === 'last_3_months') {
    startDate.setDate(now.getDate() - 90);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    // Prev period: 90 to 180 days ago
    prevStartDate.setDate(now.getDate() - 180);
    prevStartDate.setHours(0, 0, 0, 0);

    prevEndDate.setDate(now.getDate() - 91);
    prevEndDate.setHours(23, 59, 59, 999);
  } else {
    // Custom Range
    startDate = customStart ? new Date(customStart) : new Date();
    startDate.setHours(0, 0, 0, 0);

    endDate = customEnd ? new Date(customEnd) : new Date();
    endDate.setHours(23, 59, 59, 999);

    const durationMs = endDate.getTime() - startDate.getTime();
    prevStartDate = new Date(startDate.getTime() - durationMs - 1);
    prevEndDate = new Date(startDate.getTime() - 1);
  }

  return { startDate, endDate, prevStartDate, prevEndDate };
}

export async function getWeeklyTrends(
  userId: string,
  range: DateRangeType,
  customStart?: string,
  customEnd?: string,
): Promise<WeeklyTrend[]> {
  const { startDate, endDate } = resolveDateRange(range, customStart, customEnd);

  // Group by day of week using DOW
  const rows = await query<{ day_num: number; total_hours: string }>(
    `SELECT EXTRACT(DOW FROM date)::integer as day_num, SUM(hours) as total_hours
     FROM focus_sessions
     WHERE user_id = $1 AND date >= $2::date AND date <= $3::date
     GROUP BY EXTRACT(DOW FROM date)
     ORDER BY day_num`,
    [userId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]],
  );

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const trendsMap = new Map<number, number>();
  for (let i = 0; i < 7; i++) {
    trendsMap.set(i, 0);
  }

  rows.forEach((r) => {
    trendsMap.set(r.day_num, parseFloat(r.total_hours || '0'));
  });

  return daysOfWeek.map((day, idx) => ({
    day,
    hours: trendsMap.get(idx) || 0,
  }));
}

export async function getFocusHoursSummary(
  userId: string,
  range: DateRangeType,
  customStart?: string,
  customEnd?: string,
): Promise<{ totalHours: number; percentageChange: number }> {
  const { startDate, endDate, prevStartDate, prevEndDate } = resolveDateRange(
    range,
    customStart,
    customEnd,
  );

  const currentResult = await query<{ sum: string }>(
    `SELECT SUM(hours) as sum FROM focus_sessions 
     WHERE user_id = $1 AND date >= $2::date AND date <= $3::date`,
    [userId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]],
  );

  const prevResult = await query<{ sum: string }>(
    `SELECT SUM(hours) as sum FROM focus_sessions 
     WHERE user_id = $1 AND date >= $2::date AND date <= $3::date`,
    [userId, prevStartDate.toISOString().split('T')[0], prevEndDate.toISOString().split('T')[0]],
  );

  const currentTotal = parseFloat(currentResult[0]?.sum || '0');
  const prevTotal = parseFloat(prevResult[0]?.sum || '0');

  let percentageChange = 0;
  if (prevTotal > 0) {
    percentageChange = ((currentTotal - prevTotal) / prevTotal) * 100;
  } else if (currentTotal > 0) {
    percentageChange = 100; // 100% increase if previous was 0 and current is positive
  }

  return {
    totalHours: Math.round(currentTotal * 10) / 10,
    percentageChange: Math.round(percentageChange),
  };
}

export async function listTasks(userId: string): Promise<Task[]> {
  const rows = await query<any>(
    `SELECT id, user_id, title, completed, completed_at, created_at
     FROM tasks
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );

  return rows.map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    title: r.title,
    completed: r.completed,
    completedAt: r.completed_at ? r.completed_at.toISOString() : null,
    createdAt: r.created_at.toISOString(),
  }));
}

export async function createTask(userId: string, title: string): Promise<Task> {
  const rows = await query<any>(
    `INSERT INTO tasks (user_id, title)
     VALUES ($1, $2)
     RETURNING id, user_id, title, completed, completed_at, created_at`,
    [userId, title],
  );

  const r = rows[0];
  return {
    id: r.id,
    userId: r.user_id,
    title: r.title,
    completed: r.completed,
    completedAt: r.completed_at ? r.completed_at.toISOString() : null,
    createdAt: r.created_at.toISOString(),
  };
}

export async function toggleTask(userId: string, id: string, completed: boolean): Promise<Task> {
  const completedAt = completed ? new Date() : null;
  const rows = await query<any>(
    `UPDATE tasks
     SET completed = $3, completed_at = $4
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, title, completed, completed_at, created_at`,
    [id, userId, completed, completedAt],
  );

  const r = rows[0];
  if (!r) throw new Error('Task not found');
  return {
    id: r.id,
    userId: r.user_id,
    title: r.title,
    completed: r.completed,
    completedAt: r.completed_at ? r.completed_at.toISOString() : null,
    createdAt: r.created_at.toISOString(),
  };
}

export async function deleteTask(userId: string, id: string): Promise<void> {
  await query(`DELETE FROM tasks WHERE id = $1 AND user_id = $2`, [id, userId]);
}

export async function logFocusSession(
  userId: string,
  hours: number,
  activityType: 'planning' | 'teaching' | 'grading' | 'focus_session',
  dateStr: string,
): Promise<FocusSession> {
  const date = new Date(dateStr);
  const rows = await query<any>(
    `INSERT INTO focus_sessions (user_id, hours, activity_type, date)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, hours, activity_type, date, created_at`,
    [userId, hours, activityType, formatDate(date)],
  );

  const r = rows[0];
  return {
    id: r.id,
    userId: r.user_id,
    hours: parseFloat(r.hours.toString()),
    activityType: r.activity_type,
    date: formatDate(r.date),
    createdAt: r.created_at.toISOString(),
  };
}

export async function listStudentMetrics(userId: string): Promise<StudentMetric[]> {
  const rows = await query<any>(
    `SELECT id, user_id, student_name, activity_name, score, attendance_status, engagement_score, date, created_at
     FROM student_metrics
     WHERE user_id = $1
     ORDER BY date DESC, created_at DESC`,
    [userId],
  );

  return rows.map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    studentName: r.student_name,
    activityName: r.activity_name,
    score: r.score,
    attendanceStatus: r.attendance_status,
    engagementScore: r.engagement_score,
    date: formatDate(r.date),
    createdAt: r.created_at.toISOString(),
  }));
}

export async function logStudentMetric(
  userId: string,
  studentName: string,
  activityName: string,
  score: number | null,
  attendanceStatus: 'present' | 'absent' | 'tardy' | null,
  engagementScore: number | null,
  dateStr: string,
): Promise<StudentMetric> {
  const date = new Date(dateStr);
  const rows = await query<any>(
    `INSERT INTO student_metrics (user_id, student_name, activity_name, score, attendance_status, engagement_score, date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, user_id, student_name, activity_name, score, attendance_status, engagement_score, date, created_at`,
    [userId, studentName, activityName, score, attendanceStatus, engagementScore, formatDate(date)],
  );

  const r = rows[0];
  return {
    id: r.id,
    userId: r.user_id,
    studentName: r.student_name,
    activityName: r.activity_name,
    score: r.score,
    attendanceStatus: r.attendance_status,
    engagementScore: r.engagement_score,
    date: formatDate(r.date),
    createdAt: r.created_at.toISOString(),
  };
}

export async function seedInitialData(userId: string): Promise<void> {
  // Check if data already exists
  const existingTasks = await query(`SELECT id FROM tasks WHERE user_id = $1 LIMIT 1`, [userId]);
  const existingSessions = await query(`SELECT id FROM focus_sessions WHERE user_id = $1 LIMIT 1`, [
    userId,
  ]);

  if (existingTasks.length > 0 || existingSessions.length > 0) {
    return; // Already seeded
  }

  getLogger().info({ userId }, 'Seeding initial analytics data for user');

  // 1. Seed Tasks
  const tasksToSeed = [
    { title: "Review next week's phonics curriculum", completed: true, offsetDays: -2 },
    { title: 'Design alphabet tracing worksheets', completed: false, offsetDays: 0 },
    { title: 'Print safety guidelines for science experiments', completed: false, offsetDays: 0 },
    { title: 'Grade student attendance logs', completed: true, offsetDays: -4 },
    { title: 'Log Friday teaching focus sessions', completed: false, offsetDays: 0 },
  ];

  for (const t of tasksToSeed) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() + t.offsetDays);
    const completedAt = t.completed ? new Date(createdAt.getTime() + 1000 * 60 * 60) : null;

    await query(
      `INSERT INTO tasks (user_id, title, completed, completed_at, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, t.title, t.completed, completedAt, createdAt],
    );
  }

  // 2. Seed Focus Sessions (Past 14 days)
  const now = new Date();

  for (let i = 0; i < 14; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);

    // Create 1-2 sessions for weekdays, fewer for weekends
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) {
      if (Math.random() > 0.7) {
        const hours = Math.round((Math.random() * 2 + 1) * 10) / 10;
        await query(
          `INSERT INTO focus_sessions (user_id, hours, activity_type, date)
           VALUES ($1, $2, $3, $4)`,
          [userId, hours, 'planning', date.toISOString().split('T')[0]],
        );
      }
    } else {
      // Planning session
      const planningHours = Math.round((Math.random() * 2 + 1) * 10) / 10;
      await query(
        `INSERT INTO focus_sessions (user_id, hours, activity_type, date)
         VALUES ($1, $2, $3, $4)`,
        [userId, planningHours, 'planning', date.toISOString().split('T')[0]],
      );

      // Teaching session
      const teachingHours = Math.round((Math.random() * 3 + 2) * 10) / 10;
      await query(
        `INSERT INTO focus_sessions (user_id, hours, activity_type, date)
         VALUES ($1, $2, $3, $4)`,
        [userId, teachingHours, 'teaching', date.toISOString().split('T')[0]],
      );
    }
  }

  // 3. Seed Student Metrics
  const students = ['Group A', 'Group B', 'Student John', 'Student Sarah', 'Student Alex'];
  const activities = [
    { name: 'hands-on science activities', baseScore: 85, baseEngagement: 5 },
    { name: 'phonics recognition exercises', baseScore: 58, baseEngagement: 3 }, // low scores for phonetic exercises as requested
    { name: 'alphabet tracing worksheets', baseScore: 78, baseEngagement: 4 },
  ];

  for (let i = 0; i < 15; i++) {
    const student = students[i % students.length];
    const activity = activities[i % activities.length];
    const date = new Date(now);
    date.setDate(now.getDate() - (i % 7));

    // Calculate dynamic scores and status
    const scoreOffset = Math.floor(Math.random() * 20) - 10;
    const score = Math.max(0, Math.min(100, activity.baseScore + scoreOffset));
    const engagementOffset = Math.floor(Math.random() * 3) - 1;
    const engagement = Math.max(1, Math.min(5, activity.baseEngagement + engagementOffset));
    const attendanceStatus =
      Math.random() > 0.9 ? 'absent' : Math.random() > 0.9 ? 'tardy' : 'present';

    await query(
      `INSERT INTO student_metrics (user_id, student_name, activity_name, score, attendance_status, engagement_score, date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        student,
        activity.name,
        score,
        attendanceStatus,
        engagement,
        date.toISOString().split('T')[0],
      ],
    );
  }
}
