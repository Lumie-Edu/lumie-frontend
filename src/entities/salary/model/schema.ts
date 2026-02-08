import { z } from 'zod';

export const PayrollStatus = {
  DRAFT: 'DRAFT',
  FINALIZED: 'FINALIZED',
  PAID: 'PAID',
} as const;

export type PayrollStatus = (typeof PayrollStatus)[keyof typeof PayrollStatus];

export const PayrollStatusLabel: Record<PayrollStatus, string> = {
  DRAFT: '초안',
  FINALIZED: '확정',
  PAID: '지급완료',
};

export const PayrollItemType = {
  ALLOWANCE: 'ALLOWANCE',
  DEDUCTION: 'DEDUCTION',
} as const;

export type PayrollItemType = (typeof PayrollItemType)[keyof typeof PayrollItemType];

export const salarySchema = z.object({
  id: z.number(),
  adminId: z.number(),
  baseSalary: z.number(),
  effectiveFrom: z.string(),
  effectiveTo: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type SalaryRecord = z.infer<typeof salarySchema>;

export const payrollItemSchema = z.object({
  id: z.number(),
  itemType: z.string(),
  name: z.string(),
  amount: z.number(),
  note: z.string().nullable().optional(),
});

export type PayrollItem = z.infer<typeof payrollItemSchema>;

export const payrollSchema = z.object({
  id: z.number(),
  adminId: z.number(),
  adminName: z.string().optional(),
  payYear: z.number(),
  payMonth: z.number(),
  baseSalary: z.number(),
  totalAllowances: z.number(),
  totalDeductions: z.number(),
  netPay: z.number(),
  totalWorkDays: z.number().nullable().optional(),
  actualWorkDays: z.number().nullable().optional(),
  totalOvertimeMinutes: z.number().nullable().optional(),
  status: z.string(),
  note: z.string().nullable().optional(),
  items: z.array(payrollItemSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PayrollRecord = z.infer<typeof payrollSchema>;

export const createSalarySchema = z.object({
  baseSalary: z.number().min(0, '급여는 0 이상이어야 합니다.'),
  effectiveFrom: z.string().min(1, '시작일을 입력해주세요.'),
  effectiveTo: z.string().optional(),
  note: z.string().optional(),
});

export type CreateSalaryInput = z.infer<typeof createSalarySchema>;

export const generatePayrollSchema = z.object({
  adminId: z.number(),
  payYear: z.number(),
  payMonth: z.number(),
});

export type GeneratePayrollInput = z.infer<typeof generatePayrollSchema>;
