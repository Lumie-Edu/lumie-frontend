import { z } from 'zod';

export const EmployeeAttendanceStatus = {
  PENDING: 'PENDING',
  PRESENT: 'PRESENT',
  LATE: 'LATE',
  ABSENT: 'ABSENT',
  DAY_OFF: 'DAY_OFF',
  HALF_DAY: 'HALF_DAY',
} as const;

export type EmployeeAttendanceStatus =
  (typeof EmployeeAttendanceStatus)[keyof typeof EmployeeAttendanceStatus];

export const EmployeeAttendanceStatusLabel: Record<EmployeeAttendanceStatus, string> = {
  PENDING: '대기',
  PRESENT: '출근',
  LATE: '지각',
  ABSENT: '결근',
  DAY_OFF: '휴무',
  HALF_DAY: '반차',
};

export const EmployeeAttendanceStatusColor: Record<EmployeeAttendanceStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  PRESENT: 'bg-green-100 text-green-700',
  LATE: 'bg-yellow-100 text-yellow-700',
  ABSENT: 'bg-red-100 text-red-700',
  DAY_OFF: 'bg-gray-100 text-gray-500',
  HALF_DAY: 'bg-blue-100 text-blue-700',
};

export const employeeAttendanceSchema = z.object({
  id: z.number(),
  adminId: z.number(),
  adminName: z.string().optional(),
  workDate: z.string(),
  clockInTime: z.string().nullable().optional(),
  clockOutTime: z.string().nullable().optional(),
  status: z.string(),
  lateMinutes: z.number().nullable().optional(),
  earlyLeaveMinutes: z.number().nullable().optional(),
  overtimeMinutes: z.number().nullable().optional(),
  note: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type EmployeeAttendance = z.infer<typeof employeeAttendanceSchema>;

export const employeeAttendanceSummarySchema = z.object({
  adminId: z.number(),
  yearMonth: z.string(),
  totalWorkDays: z.number(),
  presentDays: z.number(),
  lateDays: z.number(),
  absentDays: z.number(),
  dayOffDays: z.number(),
  halfDayDays: z.number(),
  totalLateMinutes: z.number(),
  totalOvertimeMinutes: z.number(),
  totalWorkMinutes: z.number(),
});

export type EmployeeAttendanceSummary = z.infer<typeof employeeAttendanceSummarySchema>;
