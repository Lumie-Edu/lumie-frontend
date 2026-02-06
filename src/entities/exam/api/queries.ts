import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { examClient } from '@/src/shared/api/base';
import {
  Exam,
  CreateExamInput,
  UpdateExamInput,
  ExamResult,
  SubmitExamResultInput,
} from '../model/schema';
import { PaginatedResponse, PaginationParams } from '@/src/shared/types/api';

interface ExamQueryParams extends PaginationParams {
  academyId?: number;
  status?: string;
}

const QUERY_KEYS = {
  all: ['exams'] as const,
  list: (params?: ExamQueryParams) => [...QUERY_KEYS.all, 'list', params] as const,
  detail: (id: number) => [...QUERY_KEYS.all, 'detail', id] as const,
  results: (examId: number) => [...QUERY_KEYS.all, 'results', examId] as const,
  studentResults: () => ['student-exam-results'] as const,
};

export function useExams(params?: ExamQueryParams) {
  return useQuery({
    queryKey: QUERY_KEYS.list(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page !== undefined) searchParams.set('page', String(params.page));
      if (params?.size !== undefined) searchParams.set('size', String(params.size));
      if (params?.sort) searchParams.set('sort', params.sort);
      if (params?.academyId) searchParams.set('academyId', String(params.academyId));
      if (params?.status) searchParams.set('status', params.status);
      const query = searchParams.toString();
      return examClient.get<PaginatedResponse<Exam>>(
        `/api/v1/exams${query ? `?${query}` : ''}`
      );
    },
  });
}

export function useExam(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => examClient.get<Exam>(`/api/v1/exams/${id}`),
    enabled: id > 0,
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExamInput) =>
      examClient.post<Exam>('/api/v1/exams', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('시험이 생성되었습니다.');
    },
  });
}

export function useUpdateExam(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateExamInput) =>
      examClient.patch<Exam>(`/api/v1/exams/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('시험 정보가 수정되었습니다.');
    },
  });
}

export function usePublishExam(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => examClient.post<Exam>(`/api/v1/exams/${id}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('시험이 공개되었습니다.');
    },
  });
}

export function useCloseExam(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => examClient.post<Exam>(`/api/v1/exams/${id}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('시험이 종료되었습니다.');
    },
  });
}

export function useDeleteExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => examClient.delete<void>(`/api/v1/exams/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('시험이 삭제되었습니다.');
    },
  });
}

// Exam Results
export function useExamResults(examId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.results(examId),
    queryFn: () =>
      examClient.get<ExamResult[]>(`/api/v1/exams/${examId}/results`),
    enabled: examId > 0,
  });
}

export function useSubmitExamResult(examId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitExamResultInput) =>
      examClient.post<ExamResult>(`/api/v1/exams/${examId}/results`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.results(examId) });
      toast.success('성적이 등록되었습니다.');
    },
  });
}

// Student's own results
export function useMyExamResults() {
  return useQuery({
    queryKey: QUERY_KEYS.studentResults(),
    queryFn: () =>
      examClient.get<PaginatedResponse<ExamResult>>('/api/v1/exams/my-results'),
  });
}

// Report Generation
export function useGenerateReport() {
  return useMutation({
    mutationFn: async ({ studentId, examId }: { studentId: number; examId: number }) => {
      const { storage } = await import('@/src/shared/lib/storage');
      const { ENV } = await import('@/src/shared/config/env');

      const tenantSlug = storage.getTenantSlug();

      const response = await fetch(
        `${ENV.EXAM_SERVICE_URL}/api/v1/reports/students/${studentId}/exams/${examId}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            ...(tenantSlug && { 'X-Tenant-Slug': tenantSlug }),
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: '리포트 생성에 실패했습니다.' }));
        throw new Error(error.message);
      }

      const blob = await response.blob();
      return { blob, studentId, examId };
    },
    onSuccess: ({ blob, studentId, examId }) => {
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report_${studentId}_${examId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('리포트가 다운로드되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
