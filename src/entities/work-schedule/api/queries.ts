import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminClient } from '@/src/shared/api/base';
import { WorkSchedule, CreateWorkScheduleInput } from '../model/schema';

const QUERY_KEYS = {
  all: ['workSchedules'] as const,
  list: (adminId: number, effectiveDate?: string) =>
    [...QUERY_KEYS.all, 'list', adminId, effectiveDate] as const,
  calendar: (adminId: number, yearMonth?: string) =>
    [...QUERY_KEYS.all, 'calendar', adminId, yearMonth] as const,
};

export function useWorkSchedules(adminId: number, effectiveDate?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.list(adminId, effectiveDate),
    queryFn: () => {
      const params = new URLSearchParams();
      if (effectiveDate) params.set('effectiveDate', effectiveDate);
      const query = params.toString();
      return adminClient.get<WorkSchedule[]>(
        `/api/v1/admins/${adminId}/schedules${query ? `?${query}` : ''}`
      );
    },
    enabled: adminId > 0,
  });
}

export function useScheduleCalendar(adminId: number, yearMonth?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.calendar(adminId, yearMonth),
    queryFn: () => {
      const params = new URLSearchParams();
      if (yearMonth) params.set('yearMonth', yearMonth);
      const query = params.toString();
      return adminClient.get<WorkSchedule[]>(
        `/api/v1/admins/${adminId}/schedules/calendar${query ? `?${query}` : ''}`
      );
    },
    enabled: adminId > 0,
  });
}

export function useCreateWorkSchedule(adminId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkScheduleInput[]) =>
      adminClient.post<WorkSchedule[]>(
        `/api/v1/admins/${adminId}/schedules`,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('근무 스케줄이 설정되었습니다.');
    },
  });
}

export function useUpdateWorkSchedule(adminId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scheduleId, data }: { scheduleId: number; data: Partial<CreateWorkScheduleInput> }) =>
      adminClient.put<WorkSchedule>(
        `/api/v1/admins/${adminId}/schedules/${scheduleId}`,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('스케줄이 수정되었습니다.');
    },
  });
}

export function useDeleteWorkSchedule(adminId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: number) =>
      adminClient.delete<void>(
        `/api/v1/admins/${adminId}/schedules/${scheduleId}`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('스케줄이 삭제되었습니다.');
    },
  });
}
