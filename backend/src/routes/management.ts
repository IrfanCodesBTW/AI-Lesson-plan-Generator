import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { query } from '../lib/db';

export const managementRouter = Router();

// Parents CRUD
managementRouter.get('/parents', requireAuth, async (_req, res, next) => {
  try {
    const result = await query('SELECT * FROM parents ORDER BY created_at DESC');
    res.json({ parents: result });
  } catch (err) {
    next(err);
  }
});

managementRouter.post('/parents', requireAuth, async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const result = await query(
      'INSERT INTO parents (name, email, phone) VALUES ($1, $2, $3) RETURNING *',
      [name, email, phone],
    );
    res.status(201).json({ parent: result[0] });
  } catch (err) {
    next(err);
  }
});

// Children CRUD
managementRouter.get('/children', requireAuth, async (_req, res, next) => {
  try {
    const result = await query(`
      SELECT c.*, p.name as parent_name, cl.name as classroom_name 
      FROM children c
      JOIN parents p ON c.parent_id = p.id
      LEFT JOIN classrooms cl ON c.classroom_id = cl.id
      ORDER BY c.created_at DESC
    `);
    res.json({ children: result });
  } catch (err) {
    next(err);
  }
});

managementRouter.post('/children', requireAuth, async (req, res, next) => {
  try {
    const { parent_id, classroom_id, name, dob } = req.body;
    const result = await query(
      'INSERT INTO children (parent_id, classroom_id, name, dob) VALUES ($1, $2, $3, $4) RETURNING *',
      [parent_id, classroom_id || null, name, dob],
    );
    res.status(201).json({ child: result[0] });
  } catch (err) {
    next(err);
  }
});

// Classrooms CRUD
managementRouter.get('/classrooms', requireAuth, async (_req, res, next) => {
  try {
    const result = await query('SELECT * FROM classrooms ORDER BY created_at DESC');
    res.json({ classrooms: result });
  } catch (err) {
    next(err);
  }
});

managementRouter.post('/classrooms', requireAuth, async (req, res, next) => {
  try {
    const { name, capacity } = req.body;
    const result = await query(
      'INSERT INTO classrooms (name, capacity, teacher_id) VALUES ($1, $2, $3) RETURNING *',
      [name, capacity, req.userId],
    );
    res.status(201).json({ classroom: result[0] });
  } catch (err) {
    next(err);
  }
});
