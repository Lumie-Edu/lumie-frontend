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

export interface QuestionResult {
  id: number;
  questionNumber: number;
  selectedChoice: string;
  correctAnswer: string;
  isCorrect: boolean;
  score: number;
  earnedScore: number;
  questionType: string;
}

const QUERY_KEYS = {
  all: ['exams'] as const,
  list: (params?: ExamQueryParams) => [...QUERY_KEYS.all, 'list', params] as const,
  detail: (id: number) => [...QUERY_KEYS.all, 'detail', id] as const,
  results: (examId: number) => [...QUERY_KEYS.all, 'results', examId] as const,
  studentResults: () => ['student-exam-results'] as const,
  studentExamResults: (studentId: number) => [...QUERY_KEYS.all, 'student-results', studentId] as const,
  questionResults: (resultId: number) => [...QUERY_KEYS.all, 'questions', resultId] as const,
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
        `/v1/exams${query ? `?${query}` : ''}`
      );
    },
  });
}

export function useExam(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => examClient.get<Exam>(`/v1/exams/${id}`),
    enabled: id > 0,
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExamInput) =>
      examClient.post<Exam>('/v1/exams', data),
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
      examClient.patch<Exam>(`/v1/exams/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('시험 정보가 수정되었습니다.');
    },
  });
}

export function usePublishExam(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => examClient.post<Exam>(`/v1/exams/${id}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('시험이 공개되었습니다.');
    },
  });
}

export function useCloseExam(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => examClient.post<Exam>(`/v1/exams/${id}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('시험이 종료되었습니다.');
    },
  });
}

export function useDeleteExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => examClient.delete<void>(`/v1/exams/${id}`),
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
      examClient.get<ExamResult[]>(`/v1/exams/${examId}/results`),
    enabled: examId > 0,
  });
}

export function useSubmitExamResult(examId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitExamResultInput) =>
      examClient.post<ExamResult>(`/v1/exams/${examId}/results`, data),
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
      examClient.get<PaginatedResponse<ExamResult>>('/v1/exams/my-results'),
  });
}

// Student Exam Results
export function useStudentExamResults(studentId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.studentExamResults(studentId),
    queryFn: () => examClient.get<ExamResult[]>(`/v1/students/${studentId}/results`),
    enabled: studentId > 0,
  });
}

// Question Results
export function useQuestionResults(resultId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.questionResults(resultId),
    queryFn: () => examClient.get<QuestionResult[]>(`/v1/results/${resultId}/questions`),
    enabled: resultId > 0,
  });
}

interface UpdateQuestionAnswerParams {
  examId: number;
  resultId: number;
  questionResultId: number;
  selectedChoice: string;
}

interface DeleteExamResultParams {
  examId: number;
  resultId: number;
}

export function useDeleteExamResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, resultId }: DeleteExamResultParams) =>
      examClient.delete<void>(`/v1/exams/${examId}/results/${resultId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.results(variables.examId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      queryClient.invalidateQueries({
        predicate: (query) => {
          const root = query.queryKey[0];
          return root === 'statistics' || root === 'grade-management';
        },
      });
      toast.success('시험 성적이 삭제되었습니다.');
    },
    onError: () => {
      toast.error('시험 성적 삭제에 실패했습니다.');
    },
  });
}

export function useUpdateQuestionAnswer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, resultId, questionResultId, selectedChoice }: UpdateQuestionAnswerParams) =>
      examClient.patch<QuestionResult>(
        `/v1/exams/${examId}/results/${resultId}/questions/${questionResultId}`,
        { selectedChoice },
      ),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData<QuestionResult[]>(
        QUERY_KEYS.questionResults(variables.resultId),
        (prev) => prev?.map((q) => (q.id === updated.id ? updated : q)),
      );
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.results(variables.examId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      // 성적관리/통계 쿼리도 함께 갱신 (점수 요약, 등수, 학생 성적표 등)
      queryClient.invalidateQueries({
        predicate: (query) => {
          const root = query.queryKey[0];
          return root === 'statistics' || root === 'grade-management';
        },
      });
      toast.success('답안이 수정되었습니다.');
    },
    onError: () => {
      toast.error('답안 수정에 실패했습니다.');
    },
  });
}

// Report Generation
export function buildReportUrl(
  baseUrl: string,
  studentId: number,
  examId: number,
) {
  return `${baseUrl}/v1/reports/students/${studentId}/exams/${examId}`;
}

interface GenerateReportParams {
  studentId: number;
  examId: number;
}

export function useGenerateReport() {
  return useMutation({
    mutationFn: async ({ studentId, examId }: GenerateReportParams) => {
      const { storage } = await import('@/src/shared/lib/storage');
      const { ENV } = await import('@/src/shared/config/env');

      const tenantSlug = storage.getTenantSlug();

      const response = await fetch(
        buildReportUrl(ENV.EXAM_SERVICE_URL, studentId, examId),
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
