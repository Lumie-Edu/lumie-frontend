import { z } from 'zod';

export const sessionStatusSchema = z.enum(['OPEN', 'CLOSED']);
export type SessionStatus = z.infer<typeof sessionStatusSchema>;

export const attendanceStatusSchema = z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']);
export type AttendanceStatus = z.infer<typeof attendanceStatusSchema>;

export const checkMethodSchema = z.enum(['CODE', 'MANUAL']);
export type CheckMethod = z.infer<typeof checkMethodSchema>;

export const attendanceSessionSchema = z.object({
  id: z.number(),
  academyId: z.number(),
  name: z.string(),
  sessionDate: z.string(),
  subject: z.string().nullable().optional(),
  attendanceCode: z.string(),
  codeExpiresAt: z.string().nullable().optional(),
  lateThresholdMinutes: z.number(),
  status: sessionStatusSchema,
  createdBy: z.number().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  presentCount: z.number(),
  absentCount: z.number(),
  lateCount: z.number(),
  excusedCount: z.number(),
  totalStudents: z.number(),
});

export type AttendanceSession = z.infer<typeof attendanceSessionSchema>;

export const attendanceRecordSchema = z.object({
  id: z.number(),
  sessionId: z.number(),
  studentId: z.number(),
  studentName: z.string(),
  status: attendanceStatusSchema,
  checkMethod: checkMethodSchema,
  checkedAt: z.string().nullable().optional(),
  memo: z.string().nullable().optional(),
});

export type AttendanceRecord = z.infer<typeof attendanceRecordSchema>;

export const createSessionSchema = z.object({
  name: z.string().min(1, '세션명을 입력해주세요.').max(100, '세션명은 100자를 초과할 수 없습니다.'),
  sessionDate: z.string().min(1, '날짜를 선택해주세요.'),
  academyId: z.number({ message: '학원을 선택해주세요.' }),
  subject: z.string().optional(),
  lateThresholdMinutes: z.number().min(1).optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

export const updateStatusSchema = z.object({
  status: attendanceStatusSchema,
  memo: z.string().optional(),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

export const bulkUpdateSchema = z.object({
  recordIds: z.array(z.number()).min(1, '레코드를 선택해주세요.'),
  status: attendanceStatusSchema,
});

export type BulkUpdateInput = z.infer<typeof bulkUpdateSchema>;

export const checkInSchema = z.object({
  code: z.string().regex(/^\d{6}$/, '6자리 숫자를 입력해주세요.'),
});

export type CheckInInput = z.infer<typeof checkInSchema>;

export const checkInResponseSchema = z.object({
  message: z.string(),
  status: attendanceStatusSchema,
});

export type CheckInResponse = z.infer<typeof checkInResponseSchema>;
