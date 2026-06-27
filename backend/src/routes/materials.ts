import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { query } from '../lib/db';

export const materialsRouter = Router();

materialsRouter.get('/requirements', requireAuth, async (req, res, next) => {
  try {
    const { theme } = req.query;

    // Aggregate materials from lesson plans
    let sql =
      "SELECT lesson_content->>'materials' as materials FROM lesson_plans WHERE user_id = $1";
    const params: any[] = [req.userId!];

    if (theme) {
      sql += ' AND theme = $2';
      params.push(theme);
    }

    const result = await query(sql, params);

    const allMaterials = new Set<string>();

    result.forEach((row: any) => {
      if (row.materials) {
        try {
          const parsed = JSON.parse(row.materials);
          if (Array.isArray(parsed)) {
            parsed.forEach((m) => allMaterials.add(m));
          }
        } catch {
          // ignore parse errors
        }
      }
    });

    res.json({ materials: Array.from(allMaterials) });
  } catch (err) {
    next(err);
  }
});
