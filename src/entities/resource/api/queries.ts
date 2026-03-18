import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { contentClient } from '@/src/shared/api/base';
import { Resource, CreateResourceInput, UpdateResourceInput } from '../model/schema';
import { PaginatedResponse, PaginationParams } from '@/src/shared/types/api';

interface ResourceQueryParams extends PaginationParams {
  academyId?: number;
}

const QUERY_KEYS = {
  all: ['resources'] as const,
  list: (params?: ResourceQueryParams) => [...QUERY_KEYS.all, 'list', params] as const,
  detail: (id: number) => [...QUERY_KEYS.all, 'detail', id] as const,
};

export function useResources(params?: ResourceQueryParams) {
  return useQuery({
    queryKey: QUERY_KEYS.list(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      searchParams.set('isAsset', 'true');
      if (params?.page !== undefined) searchParams.set('page', String(params.page));
      if (params?.size !== undefined) searchParams.set('size', String(params.size));
      if (params?.sort) searchParams.set('sort', params.sort);
      if (params?.academyId) searchParams.set('academyId', String(params.academyId));
      const query = searchParams.toString();
      return contentClient.get<PaginatedResponse<Resource>>(
        `/v1/announcements${query ? `?${query}` : ''}`
      );
    },
  });
}

export function useResource(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => contentClient.get<Resource>(`/v1/announcements/${id}`),
    enabled: id > 0,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateResourceInput) =>
      contentClient.post<Resource>('/v1/announcements', {
        ...data,
        isItAssetAnnouncement: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('자료가 등록되었습니다.');
    },
  });
}

export function useUpdateResource(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateResourceInput) =>
      contentClient.patch<Resource>(`/v1/announcements/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('자료가 수정되었습니다.');
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => contentClient.delete<void>(`/v1/announcements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('자료가 삭제되었습니다.');
    },
  });
}
