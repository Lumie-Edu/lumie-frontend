import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminClient } from '@/src/shared/api/base';
import { Employee, CreateEmployeeInput, UpdateEmployeeInput, EmployeeFilter } from '../model/schema';
import { PaginatedResponse, PaginationParams } from '@/src/shared/types/api';

interface EmployeeQueryParams extends PaginationParams {
  filter?: EmployeeFilter;
}

const QUERY_KEYS = {
  all: ['employees'] as const,
  list: (params?: EmployeeQueryParams) => [...QUERY_KEYS.all, 'list', params] as const,
  detail: (id: number) => [...QUERY_KEYS.all, 'detail', id] as const,
};

export function useEmployees(params?: EmployeeQueryParams) {
  return useQuery({
    queryKey: QUERY_KEYS.list(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page !== undefined) searchParams.set('page', String(params.page));
      if (params?.size !== undefined) searchParams.set('size', String(params.size));
      if (params?.sort) searchParams.set('sort', params.sort);
      if (params?.filter?.positionId) searchParams.set('positionId', String(params.filter.positionId));
      if (params?.filter?.academyId) searchParams.set('academyId', String(params.filter.academyId));
      if (params?.filter?.isActive !== undefined) searchParams.set('isActive', String(params.filter.isActive));
      if (params?.filter?.search) searchParams.set('search', params.filter.search);
      const query = searchParams.toString();
      return adminClient.get<PaginatedResponse<Employee>>(
        `/api/v1/admins${query ? `?${query}` : ''}`
      );
    },
  });
}

export function useEmployee(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => adminClient.get<Employee>(`/api/v1/admins/${id}`),
    enabled: id > 0,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeInput) =>
      adminClient.post<Employee>('/api/v1/admins', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('직원이 등록되었습니다.');
    },
  });
}

export function useUpdateEmployee(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEmployeeInput) =>
      adminClient.put<Employee>(`/api/v1/admins/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('직원 정보가 수정되었습니다.');
    },
  });
}

export function useDeactivateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      adminClient.post<void>(`/api/v1/admins/${id}/deactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('직원이 비활성화되었습니다.');
    },
  });
}

export function useReactivateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      adminClient.post<void>(`/api/v1/admins/${id}/reactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('직원이 재활성화되었습니다.');
    },
  });
}

export function useTerminateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      adminClient.post<void>(`/api/v1/admins/${id}/terminate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('퇴직 처리되었습니다.');
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminClient.delete<void>(`/api/v1/admins/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('직원이 삭제되었습니다.');
    },
  });
}
