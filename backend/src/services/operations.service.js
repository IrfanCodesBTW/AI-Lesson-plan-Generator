import { query } from '../lib/db.js';
function toEnquiry(row) {
  return {
    id: row.id,
    userId: row.user_id,
    parentName: row.parent_name,
    childName: row.child_name,
    childAge: row.child_age,
    status: row.status,
    remarks: row.remarks,
    createdAt: row.created_at.toISOString(),
  };
}
function toRoutine(row) {
  return {
    id: row.id,
    userId: row.user_id,
    childName: row.child_name,
    routineType: row.routine_type,
    detail: row.detail,
    createdAt: row.created_at.toISOString(),
  };
}
export async function listEnquiries(userId) {
  const rows = await query(
    `SELECT id, user_id, parent_name, child_name, child_age, status, remarks, created_at
     FROM parent_enquiries
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );
  return rows.map(toEnquiry);
}
export async function createEnquiry(userId, parentName, childName, childAge, remarks) {
  const rows = await query(
    `INSERT INTO parent_enquiries (user_id, parent_name, child_name, child_age, remarks)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, parent_name, child_name, child_age, status, remarks, created_at`,
    [userId, parentName, childName, childAge, remarks ?? null],
  );
  const row = rows[0];
  if (!row) throw new Error('Insert returned no row');
  return toEnquiry(row);
}
export async function updateEnquiryStatus(userId, id, status) {
  const rows = await query(
    `UPDATE parent_enquiries
     SET status = $3
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, parent_name, child_name, child_age, status, remarks, created_at`,
    [id, userId, status],
  );
  const row = rows[0];
  if (!row) throw new Error('Enquiry not found');
  return toEnquiry(row);
}
export async function listRoutines(userId) {
  const rows = await query(
    `SELECT id, user_id, child_name, routine_type, detail, created_at
     FROM daycare_routines
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );
  return rows.map(toRoutine);
}
export async function createRoutine(userId, childName, routineType, detail) {
  const rows = await query(
    `INSERT INTO daycare_routines (user_id, child_name, routine_type, detail)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, child_name, routine_type, detail, created_at`,
    [userId, childName, routineType, detail],
  );
  const row = rows[0];
  if (!row) throw new Error('Insert returned no row');
  return toRoutine(row);
}
