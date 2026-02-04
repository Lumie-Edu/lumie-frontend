import { z } from 'zod';

export const scheduleSchema = z.object({
  id: z.number(),
  adminId: z.number(),
  date: z.string(),
  timeSlotId: z.number(),
  isAvailable: z.boolean(),
  hasReservation: z.boolean(),
  confirmedCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Schedule = z.infer<typeof scheduleSchema>;

export const createScheduleSchema = z.object({
  date: z.string().min(1, '날짜를 선택해주세요.'),
  timeSlotId: z.number({ message: '시간대를 선택해주세요.' }),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;

export const reservationStatusSchema = z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']);
export type ReservationStatus = z.infer<typeof reservationStatusSchema>;

export const reservationSchema = z.object({
  id: z.number(),
  scheduleId: z.number(),
  studentId: z.number(),
  adminId: z.number(),
  consultationContent: z.string().nullable(),
  status: reservationStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Reservation = z.infer<typeof reservationSchema>;
