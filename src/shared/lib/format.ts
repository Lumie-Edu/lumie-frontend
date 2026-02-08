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

/**
 * 날짜를 YYYY.MM.DD 형식으로 포맷팅합니다.
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

/**
 * 금액을 원화 형식으로 포맷팅합니다. (예: 3,500,000원)
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '';
  return `${amount.toLocaleString('ko-KR')}원`;
}

/**
 * 입사일 기준 근속 기간을 계산합니다. (예: 2년 3개월)
 */
export function formatTenure(hireDate: string | Date | null | undefined): string {
  if (!hireDate) return '';
  const start = typeof hireDate === 'string' ? new Date(hireDate) : hireDate;
  if (isNaN(start.getTime())) return '';
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years > 0 && months > 0) return `${years}년 ${months}개월`;
  if (years > 0) return `${years}년`;
  if (months > 0) return `${months}개월`;
  return '1개월 미만';
}

/**
 * 시간을 HH:MM 형식으로 포맷팅합니다.
 */
export function formatTime(time: string | Date | null | undefined): string {
  if (!time) return '';
  if (typeof time === 'string' && /^\d{2}:\d{2}/.test(time)) {
    return time.slice(0, 5);
  }
  const d = typeof time === 'string' ? new Date(time) : time;
  if (isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
