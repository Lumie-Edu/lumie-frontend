'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { CreateScheduleInput, createScheduleSchema, useCreateSchedule } from '@/entities/schedule';
import { Button } from '@/src/shared/ui/Button';
import { ApiError } from '@/src/shared/types/api';

// 시간대 옵션
const TIME_SLOTS = [
  { id: 1, label: '09:00 - 10:00' },
  { id: 2, label: '10:00 - 11:00' },
  { id: 3, label: '11:00 - 12:00' },
  { id: 4, label: '13:00 - 14:00' },
  { id: 5, label: '14:00 - 15:00' },
  { id: 6, label: '15:00 - 16:00' },
  { id: 7, label: '16:00 - 17:00' },
  { id: 8, label: '17:00 - 18:00' },
];

export function CreateScheduleForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateScheduleInput>({
    resolver: zodResolver(createScheduleSchema),
    defaultValues: {
      date: '',
    },
  });

  const { mutate: createSchedule, isPending, error } = useCreateSchedule();

  const onSubmit = (data: CreateScheduleInput) => {
    createSchedule(data, {
      onSuccess: () => {
        router.push('/admin/schedules');
      },
    });
  };

  const apiError = error as ApiError | null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      {apiError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{apiError.message}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          날짜 *
        </label>
        <input
          type="date"
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...register('date')}
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          시간대 *
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TIME_SLOTS.map((slot) => (
            <label
              key={slot.id}
              className={`
                flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                ${watch('timeSlotId') === slot.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              <input
                type="radio"
                value={slot.id}
                className="sr-only"
                {...register('timeSlotId', { valueAsNumber: true })}
              />
              <span className="text-sm font-medium">{slot.label}</span>
            </label>
          ))}
        </div>
        {errors.timeSlotId && (
          <p className="mt-1 text-sm text-red-600">{errors.timeSlotId.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" loading={isPending}>
          스케줄 생성
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/schedules')}
        >
          취소
        </Button>
      </div>
    </form>
  );
}
