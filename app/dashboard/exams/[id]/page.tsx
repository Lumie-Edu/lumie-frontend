'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useExam } from '@/entities/exam';
import { Button } from '@/src/shared/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/shared/ui/Card';
import { Calendar, Clock, Award, ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StudentExamDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const examId = parseInt(id, 10);
  const router = useRouter();

  const { data: exam, isLoading, error } = useExam(examId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">시험 정보를 불러오는 중 오류가 발생했습니다.</p>
        <Button className="mt-4" onClick={() => router.push('/dashboard/exams')}>
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push('/dashboard/exams')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        목록으로
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{exam.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-500">생성일</p>
                <p className="font-medium">
                  {new Date(exam.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
            {exam.totalQuestions && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500">문항 수</p>
                  <p className="font-medium">{exam.totalQuestions}문항</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Award className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-500">총점</p>
                <p className="font-medium">{exam.totalPossibleScore ?? 100}점</p>
              </div>
            </div>
          </div>

          {exam.passScore && (
            <p className="text-sm text-gray-600">
              합격 기준: {exam.passScore}점 이상
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
