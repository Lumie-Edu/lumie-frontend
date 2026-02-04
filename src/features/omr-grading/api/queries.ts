'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { examClient } from '@/src/shared/api/base';
import { ENV } from '@/src/shared/config/env';
import { PaginatedResponse } from '@/src/shared/types/api';
import { Exam } from '@/entities/exam';
import { storage } from '@/src/shared/lib/storage';

const MAX_IMAGES = 200;

interface OmrGradableExam extends Exam {
    // Exam fields are sufficient - grading-svc fetches details
}

interface OmrGradingResult {
    examId: number;
    examName: string;
    totalScore: number;
    grade: number;
    phoneNumber: string;
    results: OmrQuestionResult[];
    imageInfo?: {
        originalSize: string;
        resizedSize: string;
        scaleFactors: { x: number; y: number };
    };
}

interface OmrQuestionResult {
    questionNumber: number;
    studentAnswer: string;
    correctAnswer: string;
    score: number;
    earnedScore: number;
    questionType: string;
}

interface OmrGradingRequest {
    examId: number;
    images: File[];
}

interface OmrGradingResultWithFile extends OmrGradingResult {
    fileName: string;
    success: boolean;
    error?: string;
}

interface BatchOmrResult {
    fileName: string;
    success: boolean;
    saved: boolean;
    phoneNumber: string | null;
    studentId: number | null;
    studentName: string | null;
    totalScore: number | null;
    grade: number | null;
    error: string | null;
}

interface OmrBatchResponse {
    totalImages: number;
    successCount: number;
    failCount: number;
    savedCount: number;
    results: BatchOmrResult[];
}

const QUERY_KEYS = {
    all: ['omr-grading'] as const,
    gradableExams: (params?: { page?: number; size?: number }) =>
        [...QUERY_KEYS.all, 'gradable-exams', params] as const,
};

export function useGradableExams(params?: { page?: number; size?: number }) {
    return useQuery({
        queryKey: QUERY_KEYS.gradableExams(params),
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (params?.page !== undefined) searchParams.set('page', String(params.page));
            if (params?.size !== undefined) searchParams.set('size', String(params.size));
            const query = searchParams.toString();
            return examClient.get<PaginatedResponse<OmrGradableExam>>(
                `/api/v1/exams${query ? `?${query}` : ''}`
            );
        },
    });
}

/**
 * 배치 OMR 채점 + DB 저장 (exam-svc 경유)
 */
export function useGradeOmrBatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ examId, images }: OmrGradingRequest) => {
            if (images.length > MAX_IMAGES) {
                throw new Error(`이미지는 최대 ${MAX_IMAGES}개까지 가능합니다.`);
            }

            const formData = new FormData();
            images.forEach((image) => {
                formData.append('images', image);
            });

            const tenantSlug = storage.getTenantSlug();
            const headers: HeadersInit = {};
            if (tenantSlug) {
                headers['X-Tenant-Slug'] = tenantSlug;
            }

            const response = await fetch(
                `${ENV.EXAM_SERVICE_URL}/api/v1/exams/${examId}/results/omr/batch`,
                {
                    method: 'POST',
                    body: formData,
                    headers,
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'OMR 채점에 실패했습니다.';
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.detail || errorJson.message || errorMessage;
                } catch {
                    // ignore parse error
                }
                throw new Error(errorMessage);
            }

            return response.json() as Promise<OmrBatchResponse>;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
            if (data.savedCount === data.successCount && data.failCount === 0) {
                toast.success(`${data.savedCount}개의 OMR 채점 및 저장이 완료되었습니다.`);
            } else if (data.savedCount > 0) {
                toast.warning(`채점 ${data.successCount}개, 저장 ${data.savedCount}개, 실패 ${data.failCount}개`);
            } else {
                toast.error(`채점은 완료되었으나 저장된 결과가 없습니다.`);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

// 기존 useGradeOmr는 useGradeOmrBatch를 사용하도록 alias
export const useGradeOmr = useGradeOmrBatch;

export { MAX_IMAGES };

export type {
    OmrGradableExam,
    OmrGradingResult,
    OmrQuestionResult,
    OmrGradingRequest,
    OmrGradingResultWithFile,
    BatchOmrResult,
    OmrBatchResponse,
};
