import { z } from 'zod';
import { phoneSchema } from '@/src/shared/lib/validation';

// Role enum
export const RoleSchema = z.enum(['OWNER', 'DEVELOPER', 'ADMIN', 'STUDENT']);
export type Role = z.infer<typeof RoleSchema>;

// User login ID regex (letters, numbers, underscores only)
const userLoginIdRegex = /^[a-zA-Z0-9_]+$/;

// User schema
export const userSchema = z.object({
  id: z.number(),
  userLoginId: z.string(),
  name: z.string().min(2).max(100),
  role: RoleSchema,
  tenantSlug: z.string(),
  tenantId: z.number(),
});

export type User = z.infer<typeof userSchema>;

// Auth tokens schema
export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  accessExpiresIn: z.number(),
  refreshExpiresIn: z.number(),
});

export type AuthTokens = z.infer<typeof authTokensSchema>;

// Auth response schema (cookie-based - tokens set via Set-Cookie header)
export const authResponseSchema = z.object({
  accessExpiresIn: z.number(),
  refreshExpiresIn: z.number(),
  user: userSchema.nullable(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

// Login response schema (includes user)
export const loginResponseSchema = authResponseSchema.extend({
  user: userSchema,
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

// Login request schema
export const loginRequestSchema = z.object({
  userLoginId: z
    .string()
    .min(4, '아이디는 최소 4자 이상이어야 합니다.')
    .max(50, '아이디는 50자를 초과할 수 없습니다.')
    .regex(userLoginIdRegex, '아이디는 영문, 숫자, 밑줄(_)만 사용할 수 있습니다.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

// Register request schema
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

export const registerRequestSchema = z.object({
  tenantSlug: z.string().min(1, '테넌트를 선택해주세요.'),
  userLoginId: z
    .string()
    .min(4, '아이디는 최소 4자 이상이어야 합니다.')
    .max(50, '아이디는 50자를 초과할 수 없습니다.')
    .regex(userLoginIdRegex, '아이디는 영문, 숫자, 밑줄(_)만 사용할 수 있습니다.'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .max(128, '비밀번호는 128자를 초과할 수 없습니다.')
    .regex(passwordRegex, '비밀번호는 대문자, 소문자, 숫자, 특수문자(@$!%*?&)를 각각 하나 이상 포함해야 합니다.'),
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.').max(100, '이름은 100자를 초과할 수 없습니다.'),
  phone: phoneSchema,
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

// Owner register request schema (for institute registration)
const businessRegNumberRegex = /^\d{3}-\d{2}-\d{5}$/;

export const ownerRegisterRequestSchema = z.object({
  userLoginId: z
    .string()
    .min(4, '아이디는 최소 4자 이상이어야 합니다.')
    .max(50, '아이디는 50자를 초과할 수 없습니다.')
    .regex(userLoginIdRegex, '아이디는 영문, 숫자, 밑줄(_)만 사용할 수 있습니다.'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .max(128, '비밀번호는 128자를 초과할 수 없습니다.')
    .regex(passwordRegex, '비밀번호는 대문자, 소문자, 숫자, 특수문자(@$!%*?&)를 각각 하나 이상 포함해야 합니다.'),
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.').max(100, '이름은 100자를 초과할 수 없습니다.'),
  phone: phoneSchema,
  instituteName: z.string().min(2, '기관명은 최소 2자 이상이어야 합니다.').max(200, '기관명은 200자를 초과할 수 없습니다.'),
  businessRegistrationNumber: z
    .string()
    .regex(businessRegNumberRegex, '사업자등록번호 형식이 올바르지 않습니다. (예: 123-45-67890)'),
});

export type OwnerRegisterRequest = z.infer<typeof ownerRegisterRequestSchema>;
