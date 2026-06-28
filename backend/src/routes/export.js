import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { UnauthorizedError } from '../middleware/error.js';
import { getLesson } from '../services/lesson.service.js';
import { streamLessonPdf } from '../services/pdf.service.js';
export const exportRouter = Router();
exportRouter.get('/pdf/:id', requireAuth, async (req, res, next) => {
  try {
    if (!req.userId) throw new UnauthorizedError();
    const id = String(req.params.id);
    const lesson = await getLesson(req.userId, id);
    streamLessonPdf(lesson, res);
  } catch (err) {
    next(err);
  }
});
exportRouter.get('/csv/:id', requireAuth, async (req, res, next) => {
  try {
    if (!req.userId) throw new UnauthorizedError();
    const id = String(req.params.id);
    const lesson = await getLesson(req.userId, id);
    const { objective, activity, rhyme, worksheet, materials } = lesson.lessonContent;
    const csvContent = [
      ['Age Group', 'Theme', 'Objective', 'Activity', 'Rhyme', 'Worksheet', 'Materials'],
      [
        lesson.ageGroup,
        lesson.theme,
        `"${(objective || '').replace(/"/g, '""')}"`,
        `"${(activity || '').replace(/"/g, '""')}"`,
        `"${(rhyme || '').replace(/"/g, '""')}"`,
        `"${(worksheet || '').replace(/"/g, '""')}"`,
        `"${(materials || []).join(', ')}"`,
      ],
    ]
      .map((e) => e.join(','))
      .join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=lesson-${id}.csv`);
    res.send(csvContent);
  } catch (err) {
    next(err);
  }
});
