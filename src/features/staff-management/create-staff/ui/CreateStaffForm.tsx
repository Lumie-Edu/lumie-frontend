'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateStaff, CreateStaffInput, createStaffSchema } from '@/entities/staff';
import { useActivePositions } from '@/entities/position';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApiError } from '@/src/shared/types/api';

interface CreateStaffFormProps {
  onSuccess?: () => void;
}

export function CreateStaffForm({ onSuccess }: CreateStaffFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CreateStaffInput>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      userLoginId: '',
      name: '',
      phone: '',
      positionId: null,
    },
  });

  const { mutate: createStaff, isPending, error } = useCreateStaff();
  const { data: positions } = useActivePositions();

  const onSubmit = (data: CreateStaffInput) => {
    createStaff(data, {
      onSuccess: () => {
        reset();
        onSuccess?.();
      },
    });
  };

  const apiError = error as ApiError | null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {apiError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{apiError.message}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">이름 *</Label>
        <Input
          id="name"
          placeholder="홍길동"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="positionId">직책</Label>
        <Controller
          name="positionId"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value?.toString() ?? ''}
              onValueChange={(value) => field.onChange(value ? Number(value) : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="직책 선택" />
              </SelectTrigger>
              <SelectContent>
                {positions?.map((position) => (
                  <SelectItem key={position.id} value={position.id.toString()}>
                    {position.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.positionId && (
          <p className="text-sm text-red-500">{errors.positionId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">전화번호</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="01012345678"
          {...register('phone')}
        />
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="userLoginId">아이디 *</Label>
        <Input
          id="userLoginId"
          placeholder="영문, 숫자, 밑줄만 사용 가능"
          {...register('userLoginId')}
        />
        {errors.userLoginId && (
          <p className="text-sm text-red-500">{errors.userLoginId.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? '생성 중...' : '직원 추가'}
      </Button>
    </form>
  );
}
