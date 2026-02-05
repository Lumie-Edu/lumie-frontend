import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { academyClient } from '@/src/shared/api/base';
import { Student, CreateStudentInput, UpdateStudentInput, BulkImportStudentInput } from '../model/schema';
import { PaginatedResponse, PaginationParams } from '@/src/shared/types/api';

export type SearchField = 'name' | 'studentHighschool' | 'studentBirthYear' | 'phone';

interface StudentQueryParams extends PaginationParams {
  academyId?: number;
  search?: string;
  searchField?: SearchField;
  isActive?: boolean;
}

const QUERY_KEYS = {
  all: ['students'] as const,
  list: (params?: StudentQueryParams) => [...QUERY_KEYS.all, 'list', params] as const,
  detail: (id: number) => [...QUERY_KEYS.all, 'detail', id] as const,
};

export function useStudents(params?: StudentQueryParams) {
  return useQuery({
    queryKey: QUERY_KEYS.list(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page !== undefined) searchParams.set('page', String(params.page));
      if (params?.size !== undefined) searchParams.set('size', String(params.size));
      if (params?.sort) searchParams.set('sort', params.sort);
      if (params?.academyId !== undefined) searchParams.set('academyId', String(params.academyId));
      if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
      if (params?.search) searchParams.set('search', params.search);
      if (params?.searchField) searchParams.set('searchField', params.searchField);
      const query = searchParams.toString();
      return academyClient.get<PaginatedResponse<Student>>(
        `/api/v1/students${query ? `?${query}` : ''}`
      );
    },
  });
}

export function useStudent(id: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => academyClient.get<Student>(`/api/v1/students/${id}`),
    enabled: options?.enabled ?? id > 0,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStudentInput) =>
      academyClient.post<Student>('/api/v1/students', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('학생이 등록되었습니다.');
    },
  });
}

export function useUpdateStudent(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateStudentInput) =>
      academyClient.patch<Student>(`/api/v1/students/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('학생 정보가 수정되었습니다.');
    },
  });
}

export function useDeactivateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => academyClient.post<void>(`/api/v1/students/${id}/deactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('학생이 퇴원 처리되었습니다.');
    },
  });
}

export function useReactivateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => academyClient.post<void>(`/api/v1/students/${id}/reactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('학생이 재등록되었습니다.');
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => academyClient.delete<void>(`/api/v1/students/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('학생이 삭제되었습니다.');
    },
  });
}

export function useBulkImportStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkImportStudentInput) =>
      academyClient.post<{ imported: number; failed: number }>(
        '/api/v1/students/bulk',
        data
      ),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success(`${result.imported}명이 등록되었습니다.`);
    },
  });
}

interface BatchOperationResult {
  total: number;
  success: number;
  failed: number;
  failures: { id: number; reason: string }[];
}

export function useBatchDeactivate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) =>
      academyClient.post<BatchOperationResult>('/api/v1/students/batch/deactivate', { ids }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      if (result.failed > 0) {
        toast.warning(`${result.success}명 퇴원 완료, ${result.failed}명 실패`);
      } else {
        toast.success(`${result.success}명이 퇴원 처리되었습니다.`);
      }
    },
  });
}

export function useBatchReactivate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) =>
      academyClient.post<BatchOperationResult>('/api/v1/students/batch/reactivate', { ids }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      if (result.failed > 0) {
        toast.warning(`${result.success}명 재등록 완료, ${result.failed}명 실패`);
      } else {
        toast.success(`${result.success}명이 재등록되었습니다.`);
      }
    },
  });
}

export function useBatchDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) =>
      academyClient.post<BatchOperationResult>('/api/v1/students/batch/delete', { ids }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      if (result.failed > 0) {
        toast.warning(`${result.success}명 삭제 완료, ${result.failed}명 실패`);
      } else {
        toast.success(`${result.success}명이 삭제되었습니다.`);
      }
    },
  });
}
