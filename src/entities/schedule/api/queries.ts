import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { contentClient } from '@/src/shared/api/base';
import { Schedule, CreateScheduleInput, Reservation } from '../model/schema';
import { PaginatedResponse, PaginationParams } from '@/src/shared/types/api';

interface ScheduleQueryParams extends PaginationParams {
  academyId?: number;
  status?: string;
  date?: string;
}

const QUERY_KEYS = {
  all: ['schedules'] as const,
  list: (params?: ScheduleQueryParams) => [...QUERY_KEYS.all, 'list', params] as const,
  detail: (id: number) => [...QUERY_KEYS.all, 'detail', id] as const,
  myReservations: () => ['my-reservations'] as const,
};

export function useSchedules(params?: ScheduleQueryParams) {
  return useQuery({
    queryKey: QUERY_KEYS.list(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page !== undefined) searchParams.set('page', String(params.page));
      if (params?.size !== undefined) searchParams.set('size', String(params.size));
      if (params?.sort) searchParams.set('sort', params.sort);
      if (params?.academyId) searchParams.set('academyId', String(params.academyId));
      if (params?.status) searchParams.set('status', params.status);
      if (params?.date) searchParams.set('date', params.date);
      const query = searchParams.toString();
      return contentClient.get<PaginatedResponse<Schedule>>(
        `/v1/schedules${query ? `?${query}` : ''}`
      );
    },
  });
}

export function useSchedule(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => contentClient.get<Schedule>(`/v1/schedules/${id}`),
    enabled: id > 0,
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScheduleInput) =>
      contentClient.post<Schedule>('/v1/schedules', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('스케줄이 등록되었습니다.');
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => contentClient.delete<void>(`/v1/schedules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('스케줄이 삭제되었습니다.');
    },
  });
}

// Reservations
export function useMyReservations() {
  return useQuery({
    queryKey: QUERY_KEYS.myReservations(),
    queryFn: () => contentClient.get<PaginatedResponse<Reservation>>('/v1/reservations/my'),
  });
}

export function useBookSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: number) =>
      contentClient.post<Reservation>(`/v1/schedules/${scheduleId}/book`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myReservations() });
      toast.success('예약이 완료되었습니다.');
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: number) =>
      contentClient.delete<void>(`/v1/reservations/${reservationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myReservations() });
      toast.success('예약이 취소되었습니다.');
    },
  });
}
