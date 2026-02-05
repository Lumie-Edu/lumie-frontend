import { z } from 'zod';

// User login ID regex (letters, numbers, underscores only)
const userLoginIdRegex = /^[a-zA-Z0-9_]+$/;

export const studentSchema = z.object({
  id: z.number(),
  userId: z.number(),
  userLoginId: z.string(),
  name: z.string(),
  phone: z.string().nullable().optional(),
  academyId: z.number(),
  academyName: z.string(),
  studentHighschool: z.string().nullable().optional(),
  studentBirthYear: z.number().nullable().optional(),
  studentMemo: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Student = z.infer<typeof studentSchema>;

export const createStudentSchema = z.object({
  userLoginId: z
    .string()
    .min(4, '아이디는 최소 4자 이상이어야 합니다.')
    .max(50, '아이디는 50자를 초과할 수 없습니다.')
    .regex(userLoginIdRegex, '아이디는 영문, 숫자, 밑줄(_)만 사용할 수 있습니다.'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .max(128, '비밀번호는 128자를 초과할 수 없습니다.'),
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.').max(100, '이름은 100자를 초과할 수 없습니다.'),
  phone: z.string().optional(),
  academyId: z.number({ message: '학원을 선택해주세요.' }),
  studentHighschool: z.string().optional(),
  studentBirthYear: z.number().optional(),
  studentMemo: z.string().optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;

export const updateStudentSchema = z.object({
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.').max(100, '이름은 100자를 초과할 수 없습니다.').optional(),
  phone: z.string().optional(),
  studentHighschool: z.string().optional(),
  studentBirthYear: z.number().optional(),
  studentMemo: z.string().optional(),
  academyId: z.number().optional(),
});

export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

export const bulkImportStudentSchema = z.object({
  academyId: z.number({ message: '학원을 선택해주세요.' }),
  students: z.array(
    z.object({
      userLoginId: z.string().min(4).regex(userLoginIdRegex),
      password: z.string().min(8),
      name: z.string().min(2),
      phone: z.string().optional(),
      studentHighschool: z.string().optional(),
      studentBirthYear: z.number().optional(),
    })
  ).min(1, '최소 1명의 학생 정보가 필요합니다.'),
});

export type BulkImportStudentInput = z.infer<typeof bulkImportStudentSchema>;
