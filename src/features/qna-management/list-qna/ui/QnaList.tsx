'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQnaList, useDeleteQna } from '@/entities/qna';
import { useAcademies } from '@/entities/academy';
import { Button } from '@/src/shared/ui/Button';
import { Card, CardContent } from '@/src/shared/ui/Card';
import { Plus, Trash2, MessageCircle, CheckCircle, Clock } from 'lucide-react';

interface QnaListProps {
  isAdmin?: boolean;
}

const statusConfig = {
  PENDING: { label: '답변 대기', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  ANSWERED: { label: '답변 완료', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  CLOSED: { label: '종료', color: 'bg-gray-100 text-gray-700', icon: CheckCircle },
};

export function QnaList({ isAdmin = false }: QnaListProps) {
  const router = useRouter();
  const [selectedAcademy, setSelectedAcademy] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const { data: academiesData } = useAcademies();

  const { data, isLoading, error } = useQnaList({
    academyId: selectedAcademy,
    status: selectedStatus,
  });
  const { mutate: deleteQna, isPending: isDeleting } = useDeleteQna();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('정말 삭제하시겠습니까?')) {
      setDeletingId(id);
      deleteQna(id, {
        onSettled: () => setDeletingId(null),
      });
    }
  };

  const basePath = isAdmin ? '/admin/qna' : '/dashboard/qna';
  const academies = academiesData?.content ?? [];
  const qnaItems = data?.content ?? [];

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
        <p className="text-red-600">Q&A 목록을 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Q&A ({data?.totalElements ?? 0}개)
          </h2>
          {isAdmin && (
            <>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedAcademy ?? ''}
                onChange={(e) => setSelectedAcademy(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">전체 학원</option>
                {academies.map((academy) => (
                  <option key={academy.id} value={academy.id}>
                    {academy.name}
                  </option>
                ))}
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedStatus ?? ''}
                onChange={(e) => setSelectedStatus(e.target.value || undefined)}
              >
                <option value="">전체 상태</option>
                <option value="PENDING">답변 대기</option>
                <option value="ANSWERED">답변 완료</option>
                <option value="CLOSED">종료</option>
              </select>
            </>
          )}
        </div>
        {!isAdmin && (
          <Button onClick={() => router.push(`${basePath}/new`)}>
            <Plus className="w-4 h-4 mr-2" />
            질문하기
          </Button>
        )}
      </div>

      {qnaItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">등록된 Q&A가 없습니다.</p>
          {!isAdmin && (
            <Button className="mt-4" onClick={() => router.push(`${basePath}/new`)}>
              첫 질문하기
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {qnaItems.map((qna) => {
            const status = statusConfig[qna.status];
            const StatusIcon = status.icon;

            return (
              <Card
                key={qna.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`${basePath}/${qna.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{qna.title}</h3>
                        <span className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {qna.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {qna.authorName} · {new Date(qna.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDelete(qna.id, e)}
                        disabled={isDeleting && deletingId === qna.id}
                        className="p-2 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
