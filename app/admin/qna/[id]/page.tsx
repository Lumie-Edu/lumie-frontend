'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQna } from '@/entities/qna';
import { AnswerQuestionForm } from '@/features/qna-management';
import { Button } from '@/src/shared/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/shared/ui/Card';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminQnaDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const qnaId = parseInt(id, 10);
  const router = useRouter();

  const { data: qna, isLoading, error, refetch } = useQna(qnaId);
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !qna) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">질문을 불러오는 중 오류가 발생했습니다.</p>
        <Button className="mt-4" onClick={() => router.push('/admin/qna')}>
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push('/admin/qna')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        목록으로
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{qna.title}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {qna.authorName} · {new Date(qna.createdAt).toLocaleDateString('ko-KR')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {qna.status === 'PENDING' && (
                <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                  <Clock className="w-3 h-3" />
                  답변 대기
                </span>
              )}
              {qna.status === 'ANSWERED' && (
                <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                  <CheckCircle className="w-3 h-3" />
                  답변 완료
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{qna.content}</p>
          </div>
        </CardContent>
      </Card>

      {qna.answer && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">답변</CardTitle>
            {qna.answeredAt && (
              <p className="text-sm text-gray-500">
                {qna.answeredBy} · {new Date(qna.answeredAt).toLocaleDateString('ko-KR')}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{qna.answer}</p>
          </CardContent>
        </Card>
      )}

      {qna.status === 'PENDING' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">답변 작성</CardTitle>
          </CardHeader>
          <CardContent>
            <AnswerQuestionForm qnaId={qnaId} onSuccess={() => refetch()} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
