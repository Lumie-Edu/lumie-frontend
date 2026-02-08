import { z } from 'zod';
import { phoneSchema, phoneSchemaApi } from '@/src/shared/lib/validation';

const academyInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const positionInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const ContractType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  INTERN: 'INTERN',
} as const;

export type ContractType = (typeof ContractType)[keyof typeof ContractType];

export const ContractTypeLabel: Record<ContractType, string> = {
  FULL_TIME: '정규직',
  PART_TIME: '파트타임',
  CONTRACT: '계약직',
  INTERN: '인턴',
};

export const EmploymentStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ON_LEAVE: 'ON_LEAVE',
  TERMINATED: 'TERMINATED',
} as const;

export type EmploymentStatus = (typeof EmploymentStatus)[keyof typeof EmploymentStatus];

export const EmploymentStatusLabel: Record<EmploymentStatus, string> = {
  ACTIVE: '재직',
  INACTIVE: '비활성',
  ON_LEAVE: '휴직',
  TERMINATED: '퇴직',
};

export const employeeSchema = z.object({
  id: z.number(),
  userId: z.number(),
  userLoginId: z.string(),
  name: z.string(),
  phone: phoneSchemaApi,
  email: z.string().nullable().optional(),
  academies: z.array(academyInfoSchema).optional(),
  position: positionInfoSchema.nullable().optional(),
  hireDate: z.string().nullable().optional(),
  contractStartDate: z.string().nullable().optional(),
  contractEndDate: z.string().nullable().optional(),
  contractType: z.string().nullable().optional(),
  employmentStatus: z.string().optional(),
  adminMemo: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Employee = z.infer<typeof employeeSchema>;

const userLoginIdRegex = /^[a-zA-Z0-9_]+$/;

export const createEmployeeSchema = z.object({
  userLoginId: z
    .string()
    .min(4, '아이디는 최소 4자 이상이어야 합니다.')
    .max(50, '아이디는 50자를 초과할 수 없습니다.')
    .regex(userLoginIdRegex, '아이디는 영문, 숫자, 밑줄(_)만 사용할 수 있습니다.'),
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.').max(100, '이름은 100자를 초과할 수 없습니다.'),
  phone: phoneSchema,
  email: z.string().email('올바른 이메일 형식이 아닙니다.').optional().or(z.literal('')),
  academyIds: z.array(z.number()).optional(),
  positionId: z.number().nullable().optional(),
  hireDate: z.string().optional(),
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),
  contractType: z.string().optional(),
  adminMemo: z.string().optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = z.object({
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.').max(100, '이름은 100자를 초과할 수 없습니다.').optional(),
  phone: phoneSchema,
  email: z.string().email('올바른 이메일 형식이 아닙니다.').optional().or(z.literal('')),
  academyIds: z.array(z.number()).optional(),
  positionId: z.number().nullable().optional(),
  hireDate: z.string().optional(),
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),
  contractType: z.string().optional(),
  employmentStatus: z.string().optional(),
  adminMemo: z.string().optional(),
});

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export interface EmployeeFilter {
  positionId?: number;
  academyId?: number;
  isActive?: boolean;
  search?: string;
}
