'use client';

import { useState } from 'react';
import { useReviews, useDeleteReview } from '@/entities/review';
import { Card, CardContent } from '@/src/shared/ui/Card';
import { Badge } from '@/components/ui/badge';
import { PageListHeader } from '@/src/shared/ui/PageListHeader';
import { Trash2, Star, MessageSquareText } from 'lucide-react';
import { EmptyState } from '@/src/shared/ui/EmptyState';
import { ReviewPopupToggle } from '../../toggle-popup/ui/ReviewPopupToggle';

export function ReviewList() {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, error } = useReviews();
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('정말 삭제하시겠습니까?')) {
      setDeletingId(id);
      deleteReview(id, {
        onSettled: () => setDeletingId(null),
      });
    }
  };

  const reviews = data?.content ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">리뷰를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageListHeader title="리뷰 관리" count={data?.totalElements ?? 0} countUnit="개">
        <ReviewPopupToggle />
      </PageListHeader>

      {reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquareText}
          message="등록된 리뷰가 없습니다."
          description="학생들이 리뷰를 남기면 이곳에 표시됩니다."
        />
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium text-gray-700">{review.reviewerName}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{review.reviewTitle}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                      {review.reviewContent}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(review.id, e)}
                    disabled={isDeleting && deletingId === review.id}
                    className="p-2 hover:bg-red-50 rounded ml-4"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
