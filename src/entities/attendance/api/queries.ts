import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { attendanceClient } from '@/src/shared/api/base';
import {
  AttendanceSession,
  AttendanceRecord,
  CreateSessionInput,
  UpdateStatusInput,
  BulkUpdateInput,
  CheckInInput,
  CheckInResponse,
} from '../model/schema';
import { PaginatedResponse, PaginationParams } from '@/src/shared/types/api';

interface SessionQueryParams extends PaginationParams {
  academyId?: number;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}

const QUERY_KEYS = {
  all: ['attendance'] as const,
  sessions: (params?: SessionQueryParams) => [...QUERY_KEYS.all, 'sessions', params] as const,
  session: (id: number) => [...QUERY_KEYS.all, 'session', id] as const,
  records: (sessionId: number) => [...QUERY_KEYS.all, 'records', sessionId] as const,
};

export function useAttendanceSessions(params?: SessionQueryParams) {
  return useQuery({
    queryKey: QUERY_KEYS.sessions(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page !== undefined) searchParams.set('page', String(params.page));
      if (params?.size !== undefined) searchParams.set('size', String(params.size));
      if (params?.sort) searchParams.set('sort', params.sort);
      if (params?.academyId) searchParams.set('academyId', String(params.academyId));
      if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
      if (params?.dateTo) searchParams.set('dateTo', params.dateTo);
      if (params?.status) searchParams.set('status', params.status);
      const query = searchParams.toString();
      return attendanceClient.get<PaginatedResponse<AttendanceSession>>(
        `/api/v1/attendance/sessions${query ? `?${query}` : ''}`
      );
    },
  });
}

export function useAttendanceSession(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.session(id),
    queryFn: () => attendanceClient.get<AttendanceSession>(`/api/v1/attendance/sessions/${id}`),
    enabled: id > 0,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSessionInput) =>
      attendanceClient.post<AttendanceSession>('/api/v1/attendance/sessions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('출석 세션이 생성되었습니다.');
    },
  });
}

export function useCloseSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      attendanceClient.post<void>(`/api/v1/attendance/sessions/${id}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('세션이 종료되었습니다.');
    },
  });
}

export function useRegenerateCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      attendanceClient.post<AttendanceSession>(`/api/v1/attendance/sessions/${id}/regenerate-code`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('새로운 출석 코드가 생성되었습니다.');
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      attendanceClient.delete<void>(`/api/v1/attendance/sessions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('세션이 삭제되었습니다.');
    },
  });
}

export function useAttendanceRecords(sessionId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.records(sessionId),
    queryFn: () =>
      attendanceClient.get<AttendanceRecord[]>(
        `/api/v1/attendance/sessions/${sessionId}/records`
      ),
    enabled: sessionId > 0,
  });
}

export function useUpdateAttendanceStatus(sessionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: number; data: UpdateStatusInput }) =>
      attendanceClient.patch<void>(
        `/api/v1/attendance/sessions/${sessionId}/records/${recordId}`,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.records(sessionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.session(sessionId) });
      toast.success('출석 상태가 변경되었습니다.');
    },
  });
}

export function useBulkUpdateAttendance(sessionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkUpdateInput) =>
      attendanceClient.post<void>(
        `/api/v1/attendance/sessions/${sessionId}/records/bulk-update`,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.records(sessionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.session(sessionId) });
      toast.success('출석 상태가 일괄 변경되었습니다.');
    },
  });
}

export function useCheckIn() {
  return useMutation({
    mutationFn: (data: CheckInInput) =>
      attendanceClient.post<CheckInResponse>('/api/v1/attendance/check-in', data),
  });
}
