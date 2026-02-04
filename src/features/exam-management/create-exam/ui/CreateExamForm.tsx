'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { CreateExamInput, createExamSchema, useCreateExam } from '@/entities/exam';
import { Button } from '@/src/shared/ui/Button';
import { Input } from '@/src/shared/ui/Input';
import { ApiError } from '@/src/shared/types/api';

export function CreateExamForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateExamInput>({
    resolver: zodResolver(createExamSchema),
    defaultValues: {
      name: '',
      category: 'GRADED',
      totalQuestions: 45,
      correctAnswers: {},
      questionScores: {},
    },
  });

  const { mutate: createExam, isPending, error } = useCreateExam();

  const category = watch('category');
  const totalQuestions = watch('totalQuestions');

  // Generate default answers and scores when form is submitted
  const onSubmit = (data: CreateExamInput) => {
    // Fill in default correctAnswers and questionScores if empty
    const correctAnswers: Record<string, string> = {};
    const questionScores: Record<string, number> = {};

    for (let i = 1; i <= data.totalQuestions; i++) {
      correctAnswers[String(i)] = '1';
      questionScores[String(i)] = data.category === 'PASS_FAIL' ? 1 : 2;
    }

    createExam({
      ...data,
      correctAnswers: Object.keys(data.correctAnswers).length > 0 ? data.correctAnswers : correctAnswers,
      questionScores: Object.keys(data.questionScores).length > 0 ? data.questionScores : questionScores,
    }, {
      onSuccess: () => {
        router.push('/admin/exams');
      },
    });
  };

  const apiError = error as ApiError | null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      {apiError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{apiError.message}</p>
        </div>
      )}

      <Input
        label="시험명 *"
        type="text"
        placeholder="시험명을 입력하세요"
        error={errors.name?.message}
        {...register('name')}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            시험 유형 *
          </label>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('category')}
          >
            <option value="GRADED">등급제</option>
            <option value="PASS_FAIL">P/NP</option>
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <Input
          label="문항 수 * (최대 45)"
          type="number"
          placeholder="45"
          error={errors.totalQuestions?.message}
          {...register('totalQuestions', { valueAsNumber: true })}
        />
      </div>

      {category === 'PASS_FAIL' && (
        <Input
          label="합격 기준 점수"
          type="number"
          placeholder="16"
          error={errors.passScore?.message}
          {...register('passScore', { valueAsNumber: true })}
        />
      )}

      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
        * 정답 및 배점은 기본값으로 설정됩니다. 시험 생성 후 상세 페이지에서 수정할 수 있습니다.
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={isPending}>
          시험 생성
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/exams')}
        >
          취소
        </Button>
      </div>
    </form>
  );
}
