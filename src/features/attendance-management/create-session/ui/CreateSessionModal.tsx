'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateSessionInput, createSessionSchema, useCreateSession } from '@/entities/attendance';
import { useAcademies } from '@/entities/academy';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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

interface CreateSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSessionModal({ open, onOpenChange }: CreateSessionModalProps) {
  const { data: academiesData } = useAcademies();
  const { mutate: createSession, isPending, error } = useCreateSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<CreateSessionInput>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      name: '',
      sessionDate: new Date().toISOString().split('T')[0],
      subject: '',
      lateThresholdMinutes: 10,
    },
  });

  const onSubmit = (data: CreateSessionInput) => {
    createSession(data, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
    }
    onOpenChange(isOpen);
  };

  const apiError = error as ApiError | null;
  const academies = academiesData?.content ?? [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>출석 세션 생성</DialogTitle>
          <DialogDescription>새로운 출석 세션을 생성합니다. 세션 생성 시 6자리 출석 코드가 자동으로 발급됩니다.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {apiError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{apiError.message}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label>학원 *</Label>
            <Select onValueChange={(value) => setValue('academyId', Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="학원을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {academies.map((academy) => (
                  <SelectItem key={academy.id} value={String(academy.id)}>
                    {academy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.academyId && (
              <p className="text-sm text-red-600">{errors.academyId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">세션명 *</Label>
            <Input
              id="name"
              placeholder="예: 3월 5일 수학 수업"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionDate">날짜 *</Label>
            <Input
              id="sessionDate"
              type="date"
              {...register('sessionDate')}
            />
            {errors.sessionDate && (
              <p className="text-sm text-red-600">{errors.sessionDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">과목</Label>
            <Input
              id="subject"
              placeholder="예: 수학"
              {...register('subject')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lateThresholdMinutes">지각 기준 (분)</Label>
            <Input
              id="lateThresholdMinutes"
              type="number"
              min={1}
              {...register('lateThresholdMinutes', { valueAsNumber: true })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? '생성 중...' : '생성'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
