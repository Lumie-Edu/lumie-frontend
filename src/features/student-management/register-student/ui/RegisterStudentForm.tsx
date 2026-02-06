'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { CreateStudentInput, createStudentSchema, useCreateStudent } from '@/entities/student';
import { useAcademies } from '@/entities/academy';
import { Button } from '@/src/shared/ui/Button';
import { Input } from '@/src/shared/ui/Input';
import { ApiError } from '@/src/shared/types/api';

export function RegisterStudentForm() {
  const router = useRouter();
  const { data: academiesData } = useAcademies();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateStudentInput>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      userLoginId: '',
      password: '',
      name: '',
      phone: '',
      studentHighschool: '',
      studentMemo: '',
    },
  });

  const { mutate: createStudent, isPending, error } = useCreateStudent();

  const onSubmit = (data: CreateStudentInput) => {
    createStudent(data, {
      onSuccess: () => {
        router.push('/admin/students');
      },
    });
  };

  const apiError = error as ApiError | null;
  const academies = academiesData?.content ?? [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      {apiError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{apiError.message}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          학원 *
        </label>
        <select
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onChange={(e) => setValue('academyId', Number(e.target.value))}
        >
          <option value="">학원을 선택하세요</option>
          {academies.map((academy) => (
            <option key={academy.id} value={academy.id}>
              {academy.name}
            </option>
          ))}
        </select>
        {errors.academyId && (
          <p className="mt-1 text-sm text-red-600">{errors.academyId.message}</p>
        )}
      </div>

      <Input
        label="아이디 *"
        type="text"
        placeholder="영문, 숫자, 밑줄(_) 4자 이상"
        error={errors.userLoginId?.message}
        {...register('userLoginId')}
      />

      <Input
        label="비밀번호 *"
        type="password"
        placeholder="8자 이상"
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="이름 *"
        type="text"
        placeholder="학생 이름을 입력하세요"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="연락처"
        type="tel"
        placeholder="01012345678"
        error={errors.phone?.message}
        {...register('phone')}
      />

      <Input
        label="출생연도"
        type="number"
        placeholder="예: 2008"
        error={errors.studentBirthYear?.message}
        {...register('studentBirthYear', { valueAsNumber: true })}
      />

      <Input
        label="학교"
        type="text"
        placeholder="예: OO고등학교"
        error={errors.studentHighschool?.message}
        {...register('studentHighschool')}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="학생 메모를 입력하세요"
          {...register('studentMemo')}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={isPending}>
          학생 등록
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/students')}
        >
          취소
        </Button>
      </div>
    </form>
  );
}
