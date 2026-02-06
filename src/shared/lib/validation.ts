import { z } from 'zod';

// Validation utilities

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

// 전화번호 정규식: 010으로 시작하는 11자리 숫자만 허용
export const PHONE_REGEX = /^010\d{8}$/;

// Zod 전화번호 스키마 (optional)
export const phoneSchema = z
  .string()
  .regex(PHONE_REGEX, '전화번호는 010으로 시작하는 11자리 숫자여야 합니다. (예: 01012345678)')
  .optional()
  .or(z.literal(''));

// Zod 전화번호 스키마 (nullable + optional, API 응답용)
export const phoneSchemaApi = z.string().nullable().optional();

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function validatePassword(password: string): ValidationResult {
  if (password.length < 8) {
    return { valid: false, message: '비밀번호는 최소 8자 이상이어야 합니다.' };
  }
  if (password.length > 128) {
    return { valid: false, message: '비밀번호는 128자를 초과할 수 없습니다.' };
  }
  if (!PASSWORD_REGEX.test(password)) {
    return {
      valid: false,
      message:
        '비밀번호는 대문자, 소문자, 숫자, 특수문자(@$!%*?&)를 각각 하나 이상 포함해야 합니다.',
    };
  }
  return { valid: true };
}

export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { valid: false, message: '이메일을 입력해주세요.' };
  }
  if (email.length > 255) {
    return { valid: false, message: '이메일은 255자를 초과할 수 없습니다.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: '올바른 이메일 형식이 아닙니다.' };
  }
  return { valid: true };
}

export function validateName(name: string): ValidationResult {
  if (!name) {
    return { valid: false, message: '이름을 입력해주세요.' };
  }
  if (name.length < 2) {
    return { valid: false, message: '이름은 최소 2자 이상이어야 합니다.' };
  }
  if (name.length > 100) {
    return { valid: false, message: '이름은 100자를 초과할 수 없습니다.' };
  }
  return { valid: true };
}

export function validateRequired(
  value: string,
  fieldName: string
): ValidationResult {
  if (!value || value.trim() === '') {
    return { valid: false, message: `${fieldName}을(를) 입력해주세요.` };
  }
  return { valid: true };
}
