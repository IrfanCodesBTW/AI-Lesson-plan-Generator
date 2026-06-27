import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { UnauthorizedError } from '../middleware/error';
import { getLesson } from '../services/lesson.service';
import { streamLessonPdf } from '../services/pdf.service';

export const exportRouter = Router();

exportRouter.get(
  '/pdf/:id',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) throw new UnauthorizedError();
      const id = String(req.params.id);
      const lesson = await getLesson(req.userId, id);
      streamLessonPdf(lesson, res);
    } catch (err) {
      next(err);
    }
  },
);

exportRouter.get(
  '/csv/:id',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
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
  },
);
