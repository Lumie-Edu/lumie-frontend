import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { academyClient } from '@/src/shared/api/base';
import { Position, CreatePositionInput } from '../model/schema';

const QUERY_KEYS = {
  all: ['positions'] as const,
  active: () => [...QUERY_KEYS.all, 'active'] as const,
};

export function useActivePositions() {
  return useQuery({
    queryKey: QUERY_KEYS.active(),
    queryFn: () => academyClient.get<Position[]>('/api/v1/positions/active'),
  });
}

export function useCreatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePositionInput) =>
      academyClient.post<Position>('/api/v1/positions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('직책이 생성되었습니다.');
    },
  });
}

export function useUpdatePosition(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePositionInput) =>
      academyClient.put<Position>(`/api/v1/positions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('직책이 수정되었습니다.');
    },
  });
}

export function useDeactivatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      academyClient.post<void>(`/api/v1/positions/${id}/deactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('직책이 비활성화되었습니다.');
    },
  });
}

export function useReactivatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      academyClient.post<void>(`/api/v1/positions/${id}/reactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('직책이 활성화되었습니다.');
    },
  });
}

export function useDeletePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => academyClient.delete<void>(`/api/v1/positions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('직책이 삭제되었습니다.');
    },
  });
}
