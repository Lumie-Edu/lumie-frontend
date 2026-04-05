import { ENV } from '@/src/shared/config/env';
import { storage } from '@/src/shared/lib/storage';

/**
 * OMR 원본 이미지를 blob URL로 가져온다.
 * 호출자는 더 이상 필요 없을 때 URL.revokeObjectURL로 해제해야 한다.
 */
export async function fetchOmrImageBlob(examId: number, resultId: number): Promise<string> {
    const tenantSlug = storage.getTenantSlug();
    const response = await fetch(
        `${ENV.EXAM_SERVICE_URL}/v1/exams/${examId}/results/${resultId}/omr-image`,
        {
            credentials: 'include',
            headers: tenantSlug ? { 'X-Tenant-Slug': tenantSlug } : {},
        }
    );
    if (!response.ok) throw new Error('OMR 이미지를 불러오지 못했습니다.');
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}
