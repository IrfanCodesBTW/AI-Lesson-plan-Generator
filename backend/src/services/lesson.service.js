import { query } from '../lib/db.js';
import { NotFoundError } from '../middleware/error.js';
function toLesson(row) {
  return {
    id: row.id,
    userId: row.user_id,
    ageGroup: row.age_group,
    theme: row.theme,
    lessonContent: row.lesson_content,
    source: row.source,
    createdAt: row.created_at.toISOString(),
  };
}
export async function listLessons(userId, query_) {
  const { theme, page, limit } = query_;
  const offset = (page - 1) * limit;
  const params = [userId];
  let where = 'WHERE user_id = $1';
  if (theme) {
    params.push(`%${theme}%`);
    where += ` AND theme ILIKE $${params.length}`;
  }
  const rowsPromise = query(
    `SELECT id, user_id, age_group, theme, lesson_content, source, created_at
     FROM lesson_plans
     ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );
  const totalPromise = query(`SELECT COUNT(*)::text AS count FROM lesson_plans ${where}`, params);
  const [rows, totalRows] = await Promise.all([rowsPromise, totalPromise]);
  const total = Number(totalRows[0]?.count ?? 0);
  return {
    items: rows.map(toLesson),
    total,
    page,
    limit,
  };
}
export async function getLesson(userId, id) {
  const rows = await query(
    `SELECT id, user_id, age_group, theme, lesson_content, source, created_at
     FROM lesson_plans
     WHERE id = $1 AND user_id = $2
     LIMIT 1`,
    [id, userId],
  );
  const row = rows[0];
  if (!row) {
    throw new NotFoundError('Lesson not found');
  }
  return toLesson(row);
}
export async function deleteLesson(userId, id) {
  const result = await query(
    `DELETE FROM lesson_plans WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId],
  );
  if (result.length === 0) {
    throw new NotFoundError('Lesson not found');
  }
}
export async function createLesson(userId, input, content, source) {
  const rows = await query(
    `INSERT INTO lesson_plans (user_id, age_group, theme, lesson_content, source)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, age_group, theme, lesson_content, source, created_at`,
    [userId, input.ageGroup, input.theme, JSON.stringify(content), source],
  );
  const row = rows[0];
  if (!row) throw new Error('Insert returned no row');
  return toLesson(row);
}
