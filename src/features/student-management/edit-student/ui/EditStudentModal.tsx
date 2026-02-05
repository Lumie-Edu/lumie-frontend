'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Student,
  useUpdateStudent,
  UpdateStudentInput,
  updateStudentSchema,
} from '@/entities/student';
import { Academy } from '@/entities/academy';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditStudentModalProps {
  student: Student | null;
  academies: Academy[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditStudentModal({ student, academies, open, onOpenChange }: EditStudentModalProps) {
  const { mutate: updateStudent, isPending: isUpdating } = useUpdateStudent(student?.id ?? 0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<UpdateStudentInput>({
    resolver: zodResolver(updateStudentSchema),
  });

  useEffect(() => {
    if (student && open) {
      reset({
        name: student.name,
        phone: student.phone ?? '',
        studentHighschool: student.studentHighschool ?? '',
        studentBirthYear: student.studentBirthYear ?? undefined,
        studentMemo: student.studentMemo ?? '',
        academyId: student.academyId,
      });
    }
  }, [student, open, reset]);

  const onSubmit = (data: UpdateStudentInput) => {
    updateStudent(data, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>학생 정보 수정</DialogTitle>
          <DialogDescription>학생 정보를 수정합니다.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="academyId">학원</Label>
            <Controller
              name="academyId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString()}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger className="w-full">
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
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">이름 *</Label>
            <Input
              id="name"
              placeholder="이름을 입력하세요"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">연락처</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="연락처를 입력하세요"
              {...register('phone')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentHighschool">학교</Label>
            <Input
              id="studentHighschool"
              placeholder="학교를 입력하세요"
              {...register('studentHighschool')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentBirthYear">출생연도</Label>
            <Input
              id="studentBirthYear"
              type="number"
              placeholder="출생연도를 입력하세요"
              {...register('studentBirthYear', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentMemo">메모</Label>
            <Textarea
              id="studentMemo"
              placeholder="메모를 입력하세요"
              rows={3}
              {...register('studentMemo')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
