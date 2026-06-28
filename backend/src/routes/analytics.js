import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { UnauthorizedError } from '../middleware/error.js';
import { EventManager } from '../lib/event.manager.js';
import { query } from '../lib/db.js';
import {
  getWeeklyTrends,
  getFocusHoursSummary,
  listTasks,
  createTask,
  toggleTask,
  deleteTask,
  logFocusSession,
  listStudentMetrics,
  logStudentMetric,
  seedInitialData,
} from '../services/analytics.service.js';
import { listInsights, regenerateInsights } from '../services/insight.service.js';
export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);
// 1. Server-Sent Events (SSE) endpoint for real-time updates
analyticsRouter.get('/events', (req, res) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: { message: 'Unauthorized' } });
    return;
  }
  // Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable buffering for Nginx
  });
  res.write(': ok\n\n');
  const clientId = Math.random().toString(36).substring(2, 15);
  const manager = EventManager.getInstance();
  manager.addClient(userId, clientId, res);
  req.on('close', () => {
    manager.removeClient(userId, clientId);
  });
});
// Helper function to run insight regeneration asynchronously and broadcast when done
function triggerInsightRegen(userId) {
  regenerateInsights(userId)
    .then(() => {
      EventManager.getInstance().broadcast(userId, 'refresh');
    })
    .catch((err) => {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Failed to regenerate insights asynchronously:', err);
      }
    });
}
// 2. Dashboard summary metrics endpoint
analyticsRouter.get('/dashboard', async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) throw new UnauthorizedError();
    // Automatically seed data for testing if user is new
    await seedInitialData(userId);
    const range = req.query.range || 'current_week';
    const customStart = req.query.customStart;
    const customEnd = req.query.customEnd;
    const [trends, summary, tasks, studentMetrics] = await Promise.all([
      getWeeklyTrends(userId, range, customStart, customEnd),
      getFocusHoursSummary(userId, range, customStart, customEnd),
      listTasks(userId),
      listStudentMetrics(userId),
    ]);
    // Calculate aggregated rates
    const totalAttendance = studentMetrics.filter((m) => m.attendanceStatus).length;
    const presentAttendance = studentMetrics.filter((m) => m.attendanceStatus === 'present').length;
    const attendanceRate =
      totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 100;
    const engagementCount = studentMetrics.filter((m) => m.engagementScore !== null).length;
    const totalEngagement = studentMetrics.reduce((sum, m) => sum + (m.engagementScore || 0), 0);
    // engagement rate as a percentage: average engagement score (1-5) divided by 5
    const engagementRate =
      engagementCount > 0 ? Math.round((totalEngagement / engagementCount / 5) * 100) : 92;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    // Fetch lesson counts
    const lessonCounts = await query(
      `SELECT source, COUNT(*)::text as count FROM lesson_plans WHERE user_id = $1 GROUP BY source`,
      [userId],
    );
    let geminiLessonsCount = 0;
    let fallbackLessonsCount = 0;
    lessonCounts.forEach((r) => {
      if (r.source === 'gemini') geminiLessonsCount = parseInt(r.count, 10);
      else if (r.source === 'fallback') fallbackLessonsCount = parseInt(r.count, 10);
    });
    res.json({
      trends,
      summary,
      kpis: {
        attendanceRate,
        engagementRate,
        completionRate,
        totalTasks,
        completedTasks,
        geminiLessonsCount,
        fallbackLessonsCount,
        totalLessonsCount: geminiLessonsCount + fallbackLessonsCount,
      },
    });
  } catch (err) {
    next(err);
  }
});
// 3. AI Insights endpoints
analyticsRouter.get('/insights', async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) throw new UnauthorizedError();
    const insights = await listInsights(userId);
    res.json({ insights });
  } catch (err) {
    next(err);
  }
});
analyticsRouter.post('/insights/regenerate', async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) throw new UnauthorizedError();
    const insights = await regenerateInsights(userId);
    EventManager.getInstance().broadcast(userId, 'refresh');
    res.json({ insights });
  } catch (err) {
    next(err);
  }
});
// 4. Tasks checklist endpoints
analyticsRouter.get('/tasks', async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) throw new UnauthorizedError();
    const tasks = await listTasks(userId);
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
});
analyticsRouter.post('/tasks', async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) throw new UnauthorizedError();
    const { title } = req.body;
    if (!title || typeof title !== 'string') {
      res.status(400).json({ error: { message: 'Title is required' } });
      return;
    }
    const task = await createTask(userId, title);
    EventManager.getInstance().broadcast(userId, 'refresh');
    // Also trigger insights refresh because task completion rates changed
    triggerInsightRegen(userId);
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
});
analyticsRouter.put('/tasks/:id', async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) throw new UnauthorizedError();
    const { completed } = req.body;
    if (typeof completed !== 'boolean') {
      res.status(400).json({ error: { message: 'Completed must be a boolean' } });
      return;
    }
    const task = await toggleTask(userId, req.params.id, completed);
    EventManager.getInstance().broadcast(userId, 'refresh');
    triggerInsightRegen(userId);
    res.json({ task });
  } catch (err) {
    next(err);
  }
});
analyticsRouter.delete('/tasks/:id', async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) throw new UnauthorizedError();
    await deleteTask(userId, req.params.id);
    EventManager.getInstance().broadcast(userId, 'refresh');
    triggerInsightRegen(userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
// 5. Focus logs endpoints
analyticsRouter.post('/focus-sessions', async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) throw new UnauthorizedError();
    const { hours, activityType, date } = req.body;
    if (typeof hours !== 'number' || hours <= 0) {
      res.status(400).json({ error: { message: 'Hours must be a positive number' } });
      return;
    }
    if (
      !activityType ||
      !['planning', 'teaching', 'grading', 'focus_session'].includes(activityType)
    ) {
      res.status(400).json({ error: { message: 'Invalid activity type' } });
      return;
    }
    const dateStr = date || new Date().toISOString();
    const session = await logFocusSession(userId, hours, activityType, dateStr);
    EventManager.getInstance().broadcast(userId, 'refresh');
    triggerInsightRegen(userId);
    res.status(201).json({ session });
  } catch (err) {
    next(err);
  }
});
// 6. Student metrics endpoints
analyticsRouter.post('/student-metrics', async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) throw new UnauthorizedError();
    const { studentName, activityName, score, attendanceStatus, engagementScore, date } = req.body;
    if (!studentName || typeof studentName !== 'string') {
      res.status(400).json({ error: { message: 'studentName is required' } });
      return;
    }
    if (!activityName || typeof activityName !== 'string') {
      res.status(400).json({ error: { message: 'activityName is required' } });
      return;
    }
    const dateStr = date || new Date().toISOString();
    const metric = await logStudentMetric(
      userId,
      studentName,
      activityName,
      score !== undefined ? score : null,
      attendanceStatus !== undefined ? attendanceStatus : null,
      engagementScore !== undefined ? engagementScore : null,
      dateStr,
    );
    EventManager.getInstance().broadcast(userId, 'refresh');
    triggerInsightRegen(userId);
    res.status(201).json({ metric });
  } catch (err) {
    next(err);
  }
});
