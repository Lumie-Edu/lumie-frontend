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

export const staffSchema = z.object({
  id: z.number(),
  userId: z.number(),
  userLoginId: z.string(),
  name: z.string(),
  phone: phoneSchemaApi,
  academies: z.array(academyInfoSchema).optional(),
  position: positionInfoSchema.nullable().optional(),
  adminMemo: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Staff = z.infer<typeof staffSchema>;

const userLoginIdRegex = /^[a-zA-Z0-9_]+$/;

export const createStaffSchema = z.object({
  userLoginId: z
    .string()
    .min(4, '아이디는 최소 4자 이상이어야 합니다.')
    .max(50, '아이디는 50자를 초과할 수 없습니다.')
    .regex(userLoginIdRegex, '아이디는 영문, 숫자, 밑줄(_)만 사용할 수 있습니다.'),
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.').max(100, '이름은 100자를 초과할 수 없습니다.'),
  phone: phoneSchema,
  academyIds: z.array(z.number()).optional(),
  positionId: z.number().nullable().optional(),
  adminMemo: z.string().optional(),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;

export const updateStaffSchema = z.object({
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.').max(100, '이름은 100자를 초과할 수 없습니다.').optional(),
  phone: phoneSchema,
  academyIds: z.array(z.number()).optional(),
  positionId: z.number().nullable().optional(),
  adminMemo: z.string().optional(),
});

export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
