import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { academyClient } from '@/src/shared/api/base';
import { Academy, CreateAcademyInput, UpdateAcademyInput } from '../model/schema';
import { PaginatedResponse, PaginationParams } from '@/src/shared/types/api';

const QUERY_KEYS = {
  all: ['academies'] as const,
  list: (params?: PaginationParams) => [...QUERY_KEYS.all, 'list', params] as const,
  detail: (id: number) => [...QUERY_KEYS.all, 'detail', id] as const,
};

export function useAcademies(params?: PaginationParams) {
  return useQuery({
    queryKey: QUERY_KEYS.list(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page !== undefined) searchParams.set('page', String(params.page));
      if (params?.size !== undefined) searchParams.set('size', String(params.size));
      if (params?.sort) searchParams.set('sort', params.sort);
      const query = searchParams.toString();
      return academyClient.get<PaginatedResponse<Academy>>(
        `/v1/academies${query ? `?${query}` : ''}`
      );
    },
  });
}

export function useAcademy(id: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => academyClient.get<Academy>(`/v1/academies/${id}`),
    enabled: options?.enabled ?? id > 0,
  });
}

export function useCreateAcademy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAcademyInput) =>
      academyClient.post<Academy>('/v1/academies', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('학원이 생성되었습니다.');
    },
  });
}

export function useUpdateAcademy(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAcademyInput) =>
      academyClient.patch<Academy>(`/v1/academies/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('학원 정보가 수정되었습니다.');
    },
  });
}

export function useToggleAcademyActive(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isActive: boolean) =>
      academyClient.patch<void>(`/v1/academies/${id}/active?isActive=${isActive}`),
    onSuccess: (_, isActive) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success(isActive ? '학원이 활성화되었습니다.' : '학원이 비활성화되었습니다.');
    },
  });
}

export function useDeleteAcademy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => academyClient.delete<void>(`/v1/academies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('학원이 삭제되었습니다.');
    },
  });
}
