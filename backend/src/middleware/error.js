export class AppError extends Error {
  status;
  code;
  details;
  constructor(status, message, code = 'APP_ERROR', details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.name = 'AppError';
  }
}
export class BadRequestError extends AppError {
  constructor(message, details) {
    super(400, message, 'BAD_REQUEST', details);
    this.name = 'BadRequestError';
  }
}
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}
export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(404, message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}
export class ConflictError extends AppError {
  constructor(message) {
    super(409, message, 'CONFLICT');
    this.name = 'ConflictError';
  }
}
export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(500).json({
    error: { code: 'INTERNAL', message },
  });
}
export function notFoundHandler(_req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
}
