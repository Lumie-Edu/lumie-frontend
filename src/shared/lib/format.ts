/**
 * 전화번호를 010-xxxx-xxxx 또는 010-xxx-xxxx 형식으로 포맷팅합니다.
 * 이미 하이픈이 포함된 경우도 처리합니다.
 *
 * @param phone - 원본 전화번호 문자열
 * @returns 포맷팅된 전화번호 또는 원본 문자열 (포맷 불가 시)
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';

  // 하이픈, 공백 등 제거하고 숫자만 추출
  const digits = phone.replace(/\D/g, '');

  // 11자리 (010-xxxx-xxxx)
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  // 10자리 (010-xxx-xxxx)
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // 8자리 (010 제외된 경우, xxxx-xxxx → 010-xxxx-xxxx)
  if (digits.length === 8) {
    return `010-${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  // 7자리 (010 제외된 경우, xxx-xxxx → 010-xxx-xxxx)
  if (digits.length === 7) {
    return `010-${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  // 그 외의 경우 원본 반환
  return phone;
}
