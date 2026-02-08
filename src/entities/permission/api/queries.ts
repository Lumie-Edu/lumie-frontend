import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminClient } from '@/src/shared/api/base';
import {
  Permission,
  PermissionsByCategory,
  AccessLevel,
  PositionPermissionEntry,
} from '../model/schema';

const QUERY_KEYS = {
  all: ['permissions'] as const,
  list: () => [...QUERY_KEYS.all, 'list'] as const,
  categories: () => [...QUERY_KEYS.all, 'categories'] as const,
  positionPermissions: (positionId: number) =>
    [...QUERY_KEYS.all, 'position', positionId] as const,
};

export function usePermissions() {
  return useQuery({
    queryKey: QUERY_KEYS.list(),
    queryFn: () => adminClient.get<Permission[]>('/api/v1/permissions'),
  });
}

export function usePermissionsByCategory() {
  return useQuery({
    queryKey: QUERY_KEYS.categories(),
    queryFn: async () => {
      const map = await adminClient.get<Record<string, Permission[]>>(
        '/api/v1/permissions/categories'
      );
      return Object.entries(map).map(
        ([category, permissions]): PermissionsByCategory => ({
          category,
          permissions,
        })
      );
    },
  });
}

export function usePositionPermissions(positionId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.positionPermissions(positionId),
    queryFn: () =>
      adminClient.get<PositionPermissionEntry[]>(
        `/api/v1/positions/${positionId}/permissions`
      ),
    enabled: positionId > 0,
  });
}

export function useSetPositionPermissions(positionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (permissions: Record<string, AccessLevel>) =>
      adminClient.put<void>(
        `/api/v1/positions/${positionId}/permissions`,
        { permissions }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('권한이 설정되었습니다.');
    },
  });
}
