'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { examClient } from '@/src/shared/api/base';

const MAX_IMAGES = 200;

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

interface PresignedUpload {
    fileName: string;
    objectKey: string;
    uploadUrl: string;
}

interface OmrPresignResponse {
    batchKey: string;
    uploads: PresignedUpload[];
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
    resultId: number | null;
    error: string | null;
}

interface OmrBatchResponse {
    totalImages: number;
    successCount: number;
    failCount: number;
    savedCount: number;
    results: BatchOmrResult[];
}

interface OmrJobResponse {
    jobId: number;
}

interface OmrJobStatusResponse {
    jobId: number;
    examId: number;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    totalImages: number;
    processedImages: number;
    successCount: number;
    failCount: number;
    savedCount: number;
    results: BatchOmrResult[] | null;
    createdAt: string;
}

const QUERY_KEYS = {
    all: ['omr-grading'] as const,
    omrJobs: (examId: number) => ['omr-jobs', examId] as const,
    omrJob: (examId: number, jobId: number) => ['omr-job', examId, jobId] as const,
};

interface SubmitOmrGradingOptions {
    onUploadProgress?: (percent: number) => void;
}

/**
 * Presigned URL 방식 비동기 배치 OMR 채점 제출
 * 1. /presign → presigned PUT URL 수신
 * 2. 브라우저에서 MinIO로 직접 병렬 업로드 (동시 6개)
 * 3. /confirm → Job 생성 + 채점 시작
 */
export function useSubmitOmrGrading({ onUploadProgress }: SubmitOmrGradingOptions = {}) {
    return useMutation({
        mutationFn: async ({ examId, images }: OmrGradingRequest) => {
            if (images.length > MAX_IMAGES) {
                throw new Error(`이미지는 최대 ${MAX_IMAGES}개까지 가능합니다.`);
            }

            // Step 1: Request presigned URLs
            const presignResponse = await examClient.post<OmrPresignResponse>(
                `/v1/exams/${examId}/results/omr/batch/presign`,
                { fileNames: images.map((f) => f.name) }
            );

            // Step 2: Upload files directly to MinIO via presigned URLs
            const CONCURRENCY = 6;
            let completedCount = 0;
            let aborted = false;
            let firstError: Error | null = null;

            const uploadFile = async (file: File, upload: PresignedUpload) => {
                if (aborted) return;
                return new Promise<void>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('PUT', upload.uploadUrl);
                    xhr.setRequestHeader('Content-Type', file.type || 'image/jpeg');

                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            completedCount++;
                            onUploadProgress?.(Math.round((completedCount / images.length) * 100));
                            resolve();
                        } else {
                            reject(new Error(`업로드 실패: ${file.name} (${xhr.status})`));
                        }
                    };

                    xhr.onerror = () => reject(new Error(`네트워크 오류: ${file.name}`));
                    xhr.send(file);
                });
            };

            // Concurrency-limited parallel upload
            const queue = presignResponse.uploads.map((u, i) => ({ file: images[i], upload: u }));
            const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
                while (queue.length > 0) {
                    if (aborted) return;
                    const item = queue.shift()!;
                    try {
                        await uploadFile(item.file, item.upload);
                    } catch (e) {
                        aborted = true;
                        firstError = e as Error;
                    }
                }
            });
            await Promise.all(workers);

            if (firstError) {
                throw firstError;
            }

            // Step 3: Confirm upload and create grading job
            const jobResponse = await examClient.post<OmrJobResponse>(
                `/v1/exams/${examId}/results/omr/batch/confirm`,
                {
                    batchKey: presignResponse.batchKey,
                    objectKeys: presignResponse.uploads.map((u) => u.objectKey),
                }
            );

            return jobResponse;
        },
        onSuccess: () => {
            toast.success('채점 요청이 제출되었습니다. 백그라운드에서 처리 중입니다.');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

/**
 * OMR Job 상태 polling
 */
export function useOmrJobStatus(examId: number, jobId: number | null) {
    return useQuery({
        queryKey: QUERY_KEYS.omrJob(examId, jobId ?? 0),
        queryFn: () =>
            examClient.get<OmrJobStatusResponse>(
                `/v1/exams/${examId}/omr-jobs/${jobId}`
            ),
        enabled: !!jobId,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            if (status === 'COMPLETED' || status === 'FAILED') {
                return false;
            }
            return 2000;
        },
    });
}

/**
 * 특정 시험의 OMR Job 목록 조회
 */
export function useOmrJobs(examId: number | null) {
    return useQuery({
        queryKey: QUERY_KEYS.omrJobs(examId ?? 0),
        queryFn: () =>
            examClient.get<OmrJobStatusResponse[]>(
                `/v1/exams/${examId}/omr-jobs`
            ),
        enabled: !!examId,
    });
}

export { MAX_IMAGES };

export type {
    OmrGradingResult,
    OmrQuestionResult,
    OmrGradingRequest,
    OmrGradingResultWithFile,
    BatchOmrResult,
    OmrBatchResponse,
    OmrJobResponse,
    OmrJobStatusResponse,
};
