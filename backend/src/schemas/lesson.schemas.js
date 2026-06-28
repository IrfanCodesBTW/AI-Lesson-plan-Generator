import { z } from 'zod';
export const AGE_GROUPS = ['2-3', '3-4', '4-5', '5-6'];
export const SOURCES = ['gemini', 'fallback'];
export const lessonContentSchema = z.object({
  objective: z.string().min(1).max(2000),
  activity: z.string().min(1).max(5000),
  rhyme: z.string().min(1).max(5000),
  worksheet: z.string().min(1).max(2000),
  materials: z.array(z.string().min(1).max(200)).min(1).max(50),
});
export const generateLessonSchema = z.object({
  ageGroup: z.enum(AGE_GROUPS),
  theme: z.string().trim().min(1).max(100),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD')
    .optional(),
});
export const listLessonsQuerySchema = z.object({
  theme: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
