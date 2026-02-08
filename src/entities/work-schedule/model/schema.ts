import { z } from 'zod';

export const workScheduleSchema = z.object({
  id: z.number(),
  adminId: z.number(),
  dayOfWeek: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  breakStartTime: z.string().nullable().optional(),
  breakEndTime: z.string().nullable().optional(),
  effectiveFrom: z.string(),
  effectiveTo: z.string().nullable().optional(),
  isDayOff: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type WorkSchedule = z.infer<typeof workScheduleSchema>;

export const createWorkScheduleSchema = z.object({
  dayOfWeek: z.string().min(1, '요일을 선택해주세요.'),
  startTime: z.string().min(1, '시작 시간을 입력해주세요.'),
  endTime: z.string().min(1, '종료 시간을 입력해주세요.'),
  breakStartTime: z.string().optional(),
  breakEndTime: z.string().optional(),
  effectiveFrom: z.string().min(1, '시작일을 입력해주세요.'),
  effectiveTo: z.string().optional(),
  isDayOff: z.boolean().default(false),
});

export type CreateWorkScheduleInput = z.infer<typeof createWorkScheduleSchema>;

export const DayOfWeekLabel: Record<string, string> = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
};

export const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
