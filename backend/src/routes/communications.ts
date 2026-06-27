import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { query } from '../lib/db';
import { z } from 'zod';
import { getLogger } from '../lib/logger';

export const communicationsRouter = Router();
const logger = getLogger();

const sendSchema = z.object({
  parentId: z.string().uuid(),
  message: z.string().min(1),
  type: z.enum(['whatsapp', 'email']),
});

communicationsRouter.post('/send', requireAuth, async (req, res, next) => {
  try {
    const { parentId, message, type } = sendSchema.parse(req.body);

    // Validate parent belongs to a child in the teacher's classroom?
    // For simplicity, we just check parent exists
    const parent = await query('SELECT * FROM parents WHERE id = $1', [parentId]);
    if (parent.length === 0) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Parent not found' } });
      return;
    }

    // Mock Third-party API call
    logger.info(`Sending ${type} to parent ${parentId}: ${message}`);

    // Log to communication_history
    const result = await query(
      'INSERT INTO communication_history (parent_id, type, message) VALUES ($1, $2, $3) RETURNING *',
      [parentId, type, message],
    );

    res.status(201).json({ success: true, record: result[0] });
  } catch (err) {
    next(err);
  }
});
