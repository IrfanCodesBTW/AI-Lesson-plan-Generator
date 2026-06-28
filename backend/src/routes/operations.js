import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { UnauthorizedError } from '../middleware/error.js';
import {
  listEnquiries,
  createEnquiry,
  updateEnquiryStatus,
  listRoutines,
  createRoutine,
} from '../services/operations.service.js';
export const operationsRouter = Router();
operationsRouter.use(requireAuth);
// ── Parent Enquiries ──────────────────────────────────────────────────
operationsRouter.get('/enquiries', async (req, res, next) => {
  try {
    if (!req.userId) throw new UnauthorizedError();
    const enquiries = await listEnquiries(req.userId);
    res.json({ enquiries });
  } catch (err) {
    next(err);
  }
});
operationsRouter.post('/enquiries', async (req, res, next) => {
  try {
    if (!req.userId) throw new UnauthorizedError();
    const { parentName, childName, childAge, remarks } = req.body;
    if (!parentName || typeof parentName !== 'string') {
      res.status(400).json({ error: { message: 'parentName is required' } });
      return;
    }
    if (!childName || typeof childName !== 'string') {
      res.status(400).json({ error: { message: 'childName is required' } });
      return;
    }
    if (typeof childAge !== 'number' || childAge < 0 || childAge > 10) {
      res.status(400).json({ error: { message: 'childAge must be a number between 0 and 10' } });
      return;
    }
    const enquiry = await createEnquiry(req.userId, parentName, childName, childAge, remarks);
    res.status(201).json({ enquiry });
  } catch (err) {
    next(err);
  }
});
operationsRouter.put('/enquiries/:id', async (req, res, next) => {
  try {
    if (!req.userId) throw new UnauthorizedError();
    const { status } = req.body;
    if (!status || !['pending', 'contacted', 'admitted', 'rejected'].includes(status)) {
      res.status(400).json({
        error: { message: 'status must be one of: pending, contacted, admitted, rejected' },
      });
      return;
    }
    const enquiry = await updateEnquiryStatus(req.userId, req.params.id, status);
    res.json({ enquiry });
  } catch (err) {
    next(err);
  }
});
// ── Daycare Routines ──────────────────────────────────────────────────
operationsRouter.get('/routines', async (req, res, next) => {
  try {
    if (!req.userId) throw new UnauthorizedError();
    const routines = await listRoutines(req.userId);
    res.json({ routines });
  } catch (err) {
    next(err);
  }
});
operationsRouter.post('/routines', async (req, res, next) => {
  try {
    if (!req.userId) throw new UnauthorizedError();
    const { childName, routineType, detail } = req.body;
    if (!childName || typeof childName !== 'string') {
      res.status(400).json({ error: { message: 'childName is required' } });
      return;
    }
    if (!routineType || !['meal', 'nap', 'diaper', 'activity'].includes(routineType)) {
      res
        .status(400)
        .json({ error: { message: 'routineType must be one of: meal, nap, diaper, activity' } });
      return;
    }
    if (!detail || typeof detail !== 'string') {
      res.status(400).json({ error: { message: 'detail is required' } });
      return;
    }
    const routine = await createRoutine(req.userId, childName, routineType, detail);
    res.status(201).json({ routine });
  } catch (err) {
    next(err);
  }
});
