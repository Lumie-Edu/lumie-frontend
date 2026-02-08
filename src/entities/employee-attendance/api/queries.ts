import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminClient } from '@/src/shared/api/base';
import { EmployeeAttendance, EmployeeAttendanceSummary } from '../model/schema';
import { PaginatedResponse } from '@/src/shared/types/api';

interface AttendanceListParams {
  adminId?: number;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  page?: number;
  size?: number;
}

const QUERY_KEYS = {
  all: ['employeeAttendances'] as const,
  list: (params?: AttendanceListParams) =>
    [...QUERY_KEYS.all, 'list', params] as const,
  detail: (id: number) => [...QUERY_KEYS.all, 'detail', id] as const,
  summary: (adminId: number, yearMonth?: string) =>
    [...QUERY_KEYS.all, 'summary', adminId, yearMonth] as const,
};

export function useEmployeeAttendances(params?: AttendanceListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.list(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.adminId) searchParams.set('adminId', String(params.adminId));
      if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
      if (params?.dateTo) searchParams.set('dateTo', params.dateTo);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.page !== undefined) searchParams.set('page', String(params.page));
      if (params?.size !== undefined) searchParams.set('size', String(params.size));
      const query = searchParams.toString();
      return adminClient.get<PaginatedResponse<EmployeeAttendance>>(
        `/api/v1/attendances${query ? `?${query}` : ''}`
      );
    },
  });
}

export function useEmployeeAttendance(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () =>
      adminClient.get<EmployeeAttendance>(`/api/v1/attendances/${id}`),
    enabled: id > 0,
  });
}

export function useAttendanceSummary(adminId: number, yearMonth?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.summary(adminId, yearMonth),
    queryFn: () => {
      const params = new URLSearchParams();
      if (adminId) params.set('adminId', String(adminId));
      if (yearMonth) params.set('yearMonth', yearMonth);
      const query = params.toString();
      return adminClient.get<EmployeeAttendanceSummary>(
        `/api/v1/attendances/summary${query ? `?${query}` : ''}`
      );
    },
    enabled: adminId > 0,
  });
}

export function useClockIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      adminClient.post<EmployeeAttendance>('/api/v1/attendances/clock-in'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('출근이 기록되었습니다.');
    },
  });
}

export function useClockOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      adminClient.post<EmployeeAttendance>('/api/v1/attendances/clock-out'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('퇴근이 기록되었습니다.');
    },
  });
}

export function useUpdateEmployeeAttendance(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { status?: string; note?: string }) =>
      adminClient.put<EmployeeAttendance>(`/api/v1/attendances/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('출퇴근 기록이 수정되었습니다.');
    },
  });
}
