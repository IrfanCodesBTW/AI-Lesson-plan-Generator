import { Router } from 'express';
import { registerSchema, loginSchema } from '../schemas/auth.schemas.js';
import { registerUser, loginUser } from '../services/auth.service.js';
import { BadRequestError } from '../middleware/error.js';
export const authRouter = Router();
function parseBody(schema, body) {
  try {
    return schema.parse(body);
  } catch (err) {
    const issues = err instanceof Error && 'issues' in err ? err.issues : [];
    throw new BadRequestError(
      'Invalid input',
      issues.map((i) => ({ path: i.path, message: i.message })),
    );
  }
}
authRouter.post('/register', async (req, res, next) => {
  try {
    const input = parseBody(registerSchema, req.body);
    const result = await registerUser(input);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});
authRouter.post('/login', async (req, res, next) => {
  try {
    const input = parseBody(loginSchema, req.body);
    const result = await loginUser(input);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});
