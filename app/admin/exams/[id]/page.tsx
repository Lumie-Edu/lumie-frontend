'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useExam,
  useUpdateExam,
  usePublishExam,
  useCloseExam,
  useDeleteExam,
  UpdateExamInput,
  updateExamSchema,
} from '@/entities/exam';
import { ExamResultsView } from '@/features/exam-management';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/src/shared/ui/Button';
import { Input } from '@/src/shared/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/shared/ui/Card';
import { Play, Square, Trash2 } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ExamDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const examId = parseInt(id, 10);
  const router = useRouter();

  const { data: exam, isLoading, error } = useExam(examId);
  const { mutate: updateExam, isPending: isUpdating } = useUpdateExam(examId);
  const { mutate: publishExam, isPending: isPublishing } = usePublishExam(examId);
  const { mutate: closeExam, isPending: isClosing } = useCloseExam(examId);
  const { mutate: deleteExam, isPending: isDeleting } = useDeleteExam();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateExamInput>({
    resolver: zodResolver(updateExamSchema),
  });

  useEffect(() => {
    if (exam) {
      reset({
        name: exam.name,
        category: exam.category,
        totalQuestions: exam.totalQuestions,
        correctAnswers: exam.correctAnswers ?? {},
        questionScores: exam.questionScores ?? {},
        questionTypes: exam.questionTypes ?? {},
        passScore: exam.passScore ?? undefined,
      });
    }
  }, [exam, reset]);

  const onSubmit = (data: UpdateExamInput) => {
    updateExam(data, {
      onSuccess: () => {
        alert('시험 정보가 수정되었습니다.');
      },
    });
  };

  const handlePublish = () => {
    if (confirm('시험을 공개하시겠습니까?')) {
      publishExam(undefined, {
        onSuccess: () => alert('시험이 공개되었습니다.'),
      });
    }
  };

  const handleClose = () => {
    if (confirm('시험을 종료하시겠습니까?')) {
      closeExam(undefined, {
        onSuccess: () => alert('시험이 종료되었습니다.'),
      });
    }
  };

  const handleDelete = () => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteExam(examId, {
        onSuccess: () => router.push('/admin/exams'),
      });
    }
  };

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
        <Button className="mt-4" onClick={() => router.push('/admin/exams')}>
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">시험 상세</h1>
          <p className="text-gray-600">시험 정보를 확인하고 관리합니다.</p>
        </div>
        <div className="flex gap-2">
          {exam.status === 'DRAFT' && (
            <Button onClick={handlePublish} loading={isPublishing}>
              <Play className="w-4 h-4 mr-1" />
              공개
            </Button>
          )}
          {exam.status === 'PUBLISHED' && (
            <Button variant="secondary" onClick={handleClose} loading={isClosing}>
              <Square className="w-4 h-4 mr-1" />
              종료
            </Button>
          )}
          <Button variant="danger" onClick={handleDelete} loading={isDeleting}>
            <Trash2 className="w-4 h-4 mr-1" />
            삭제
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>시험 정보 수정</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
            <Input
              label="시험명 *"
              type="text"
              error={errors.name?.message}
              {...register('name')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="문항 수"
                type="number"
                error={errors.totalQuestions?.message}
                {...register('totalQuestions', { valueAsNumber: true })}
              />
              <Input
                label="합격 점수 (P/NP 전용)"
                type="number"
                error={errors.passScore?.message}
                {...register('passScore', { valueAsNumber: true })}
              />
            </div>

            <Button type="submit" loading={isUpdating}>
              저장
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <ExamResultsView
            examId={examId}
            totalScore={exam.totalPossibleScore ?? 100}
            passingScore={exam.passScore ?? undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}
