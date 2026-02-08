import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminClient } from '@/src/shared/api/base';
import { Staff, CreateStaffInput, UpdateStaffInput } from '../model/schema';
import { PaginatedResponse, PaginationParams } from '@/src/shared/types/api';

interface StaffQueryParams extends PaginationParams {
  search?: string;
}

const QUERY_KEYS = {
  all: ['admins'] as const,
  list: (params?: StaffQueryParams) => [...QUERY_KEYS.all, 'list', params] as const,
  detail: (id: number) => [...QUERY_KEYS.all, 'detail', id] as const,
};

export function useStaffList(params?: StaffQueryParams) {
  return useQuery({
    queryKey: QUERY_KEYS.list(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page !== undefined) searchParams.set('page', String(params.page));
      if (params?.size !== undefined) searchParams.set('size', String(params.size));
      if (params?.sort) searchParams.set('sort', params.sort);
      const query = searchParams.toString();
      return adminClient.get<PaginatedResponse<Staff>>(
        `/api/v1/admins${query ? `?${query}` : ''}`
      );
    },
  });
}

export function useStaff(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => adminClient.get<Staff>(`/api/v1/admins/${id}`),
    enabled: id > 0,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStaffInput) =>
      adminClient.post<Staff>('/api/v1/admins', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('직원이 등록되었습니다.');
    },
  });
}

export function useUpdateStaff(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateStaffInput) =>
      adminClient.put<Staff>(`/api/v1/admins/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('직원 정보가 수정되었습니다.');
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminClient.delete<void>(`/api/v1/admins/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('직원이 삭제되었습니다.');
    },
  });
}
