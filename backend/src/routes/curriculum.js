import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { query } from '../lib/db.js';
import { z } from 'zod';
export const curriculumRouter = Router();
const createCurriculumSchema = z.object({
  theme: z.string().min(1),
  week_number: z.number().int().positive(),
  details: z.string().min(1),
});
curriculumRouter.get('/', requireAuth, async (_req, res, next) => {
  try {
    const result = await query('SELECT * FROM curriculum_activities ORDER BY week_number ASC');
    res.json({ activities: result });
  } catch (err) {
    next(err);
  }
});
curriculumRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const data = createCurriculumSchema.parse(req.body);
    const result = await query(
      'INSERT INTO curriculum_activities (theme, week_number, details) VALUES ($1, $2, $3) RETURNING *',
      [data.theme, data.week_number, data.details],
    );
    res.status(201).json({ activity: result[0] });
  } catch (err) {
    next(err);
  }
});
curriculumRouter.get('/mapping', requireAuth, async (_req, res, next) => {
  try {
    const result = await query(
      'SELECT week_number, theme, details FROM curriculum_activities ORDER BY week_number ASC',
    );
    // Group by week for mapping
    const mapping = result.reduce((acc, row) => {
      acc[row.week_number] = { theme: row.theme, details: row.details };
      return acc;
    }, {});
    res.json({ mapping });
  } catch (err) {
    next(err);
  }
});
