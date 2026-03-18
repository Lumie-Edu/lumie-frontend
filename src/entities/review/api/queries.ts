import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { contentClient } from '@/src/shared/api/base';
import { Review, ReviewPopupSetting, UpdateReviewPopupSettingInput } from '../model/schema';
import { PaginatedResponse, PaginationParams } from '@/src/shared/types/api';

const QUERY_KEYS = {
  all: ['reviews'] as const,
  list: (params?: PaginationParams) => [...QUERY_KEYS.all, 'list', params] as const,
  popupSetting: () => [...QUERY_KEYS.all, 'popup-setting'] as const,
};

export function useReviews(params?: PaginationParams) {
  return useQuery({
    queryKey: QUERY_KEYS.list(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page !== undefined) searchParams.set('page', String(params.page));
      if (params?.size !== undefined) searchParams.set('size', String(params.size));
      if (params?.sort) searchParams.set('sort', params.sort);
      const query = searchParams.toString();
      return contentClient.get<PaginatedResponse<Review>>(
        `/v1/reviews${query ? `?${query}` : ''}`
      );
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => contentClient.delete<void>(`/v1/reviews/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('리뷰가 삭제되었습니다.');
    },
  });
}

export function useReviewPopupSetting() {
  return useQuery({
    queryKey: QUERY_KEYS.popupSetting(),
    queryFn: () => contentClient.get<ReviewPopupSetting>('/v1/reviews/popup-setting'),
  });
}

export function useUpdateReviewPopupSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateReviewPopupSettingInput) =>
      contentClient.put<ReviewPopupSetting>('/v1/reviews/popup-setting', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.popupSetting() });
      toast.success('리뷰 팝업 설정이 저장되었습니다.');
    },
  });
}
