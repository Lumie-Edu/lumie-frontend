import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { contentClient } from '@/src/shared/api/base';
import { Qna, CreateQnaInput, AnswerQnaInput } from '../model/schema';
import { PaginatedResponse, PaginationParams } from '@/src/shared/types/api';

interface QnaQueryParams extends PaginationParams {
  academyId?: number;
  status?: string;
}

const QUERY_KEYS = {
  all: ['qna'] as const,
  list: (params?: QnaQueryParams) => [...QUERY_KEYS.all, 'list', params] as const,
  detail: (id: number) => [...QUERY_KEYS.all, 'detail', id] as const,
  myList: () => [...QUERY_KEYS.all, 'my'] as const,
};

export function useQnaList(params?: QnaQueryParams) {
  return useQuery({
    queryKey: QUERY_KEYS.list(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page !== undefined) searchParams.set('page', String(params.page));
      if (params?.size !== undefined) searchParams.set('size', String(params.size));
      if (params?.sort) searchParams.set('sort', params.sort);
      if (params?.academyId) searchParams.set('academyId', String(params.academyId));
      if (params?.status) searchParams.set('status', params.status);
      const query = searchParams.toString();
      return contentClient.get<PaginatedResponse<Qna>>(
        `/v1/qna${query ? `?${query}` : ''}`
      );
    },
  });
}

export function useQna(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => contentClient.get<Qna>(`/v1/qna/${id}`),
    enabled: id > 0,
  });
}

export function useMyQnaList() {
  return useQuery({
    queryKey: QUERY_KEYS.myList(),
    queryFn: () => contentClient.get<PaginatedResponse<Qna>>('/v1/qna/my'),
  });
}

export function useCreateQna() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQnaInput) =>
      contentClient.post<Qna>('/v1/qna', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('질문이 등록되었습니다.');
    },
  });
}

export function useAnswerQna(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AnswerQnaInput) =>
      contentClient.post<Qna>(`/v1/qna/${id}/answer`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('답변이 등록되었습니다.');
    },
  });
}

export function useCloseQna(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => contentClient.post<Qna>(`/v1/qna/${id}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('질문이 종료되었습니다.');
    },
  });
}

export function useDeleteQna() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => contentClient.delete<void>(`/v1/qna/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('질문이 삭제되었습니다.');
    },
  });
}
