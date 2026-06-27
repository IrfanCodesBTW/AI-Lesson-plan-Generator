import { query } from '../lib/db';

export interface ParentEnquiry {
  id: string;
  userId: string;
  parentName: string;
  childName: string;
  childAge: number;
  status: 'pending' | 'contacted' | 'admitted' | 'rejected';
  remarks: string | null;
  createdAt: string;
}

export interface DaycareRoutine {
  id: string;
  userId: string;
  childName: string;
  routineType: 'meal' | 'nap' | 'diaper' | 'activity';
  detail: string;
  createdAt: string;
}

interface EnquiryRow {
  id: string;
  user_id: string;
  parent_name: string;
  child_name: string;
  child_age: number;
  status: 'pending' | 'contacted' | 'admitted' | 'rejected';
  remarks: string | null;
  created_at: Date;
}

interface RoutineRow {
  id: string;
  user_id: string;
  child_name: string;
  routine_type: 'meal' | 'nap' | 'diaper' | 'activity';
  detail: string;
  created_at: Date;
}

function toEnquiry(row: EnquiryRow): ParentEnquiry {
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

function toRoutine(row: RoutineRow): DaycareRoutine {
  return {
    id: row.id,
    userId: row.user_id,
    childName: row.child_name,
    routineType: row.routine_type,
    detail: row.detail,
    createdAt: row.created_at.toISOString(),
  };
}

export async function listEnquiries(userId: string): Promise<ParentEnquiry[]> {
  const rows = await query<EnquiryRow>(
    `SELECT id, user_id, parent_name, child_name, child_age, status, remarks, created_at
     FROM parent_enquiries
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );
  return rows.map(toEnquiry);
}

export async function createEnquiry(
  userId: string,
  parentName: string,
  childName: string,
  childAge: number,
  remarks?: string,
): Promise<ParentEnquiry> {
  const rows = await query<EnquiryRow>(
    `INSERT INTO parent_enquiries (user_id, parent_name, child_name, child_age, remarks)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, parent_name, child_name, child_age, status, remarks, created_at`,
    [userId, parentName, childName, childAge, remarks ?? null],
  );
  const row = rows[0];
  if (!row) throw new Error('Insert returned no row');
  return toEnquiry(row);
}

export async function updateEnquiryStatus(
  userId: string,
  id: string,
  status: 'pending' | 'contacted' | 'admitted' | 'rejected',
): Promise<ParentEnquiry> {
  const rows = await query<EnquiryRow>(
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

export async function listRoutines(userId: string): Promise<DaycareRoutine[]> {
  const rows = await query<RoutineRow>(
    `SELECT id, user_id, child_name, routine_type, detail, created_at
     FROM daycare_routines
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );
  return rows.map(toRoutine);
}

export async function createRoutine(
  userId: string,
  childName: string,
  routineType: 'meal' | 'nap' | 'diaper' | 'activity',
  detail: string,
): Promise<DaycareRoutine> {
  const rows = await query<RoutineRow>(
    `INSERT INTO daycare_routines (user_id, child_name, routine_type, detail)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, child_name, routine_type, detail, created_at`,
    [userId, childName, routineType, detail],
  );
  const row = rows[0];
  if (!row) throw new Error('Insert returned no row');
  return toRoutine(row);
}
