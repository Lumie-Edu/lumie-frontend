'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { CreateStudentInput, createStudentSchema, useCreateStudent } from '@/entities/student';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload } from 'lucide-react';
import { ApiError } from '@/src/shared/types/api';

function generateRandomString(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

interface RegisterStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegisterStudentModal({ open, onOpenChange }: RegisterStudentModalProps) {
  const router = useRouter();
  const { data: academiesData } = useAcademies();
  const { mutate: createStudent, isPending, error } = useCreateStudent();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<CreateStudentInput>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      userLoginId: generateRandomString(),
      password: generateRandomString(),
      name: '',
      phone: '',
      parentPhone: '',
      studentHighschool: '',
      studentMemo: '',
    },
  });

  const onSubmit = (data: CreateStudentInput) => {
    createStudent(data, {
      onSuccess: () => {
        reset({
          userLoginId: generateRandomString(),
          password: generateRandomString(),
          name: '',
          phone: '',
          parentPhone: '',
          studentHighschool: '',
          studentMemo: '',
        });
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
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle>학생 등록</DialogTitle>
              <DialogDescription>새로운 학생을 등록합니다.</DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                router.push('/admin/students/import');
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              대량 등록
            </Button>
          </div>
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
            <Label htmlFor="name">이름 *</Label>
            <Input
              id="name"
              placeholder="학생 이름을 입력하세요"
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
              placeholder="01012345678"
              {...register('phone')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentPhone">학부모</Label>
            <Input
              id="parentPhone"
              type="tel"
              placeholder="01012345678"
              {...register('parentPhone')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentBirthYear">출생연도</Label>
            <Input
              id="studentBirthYear"
              type="number"
              placeholder="예: 2008"
              {...register('studentBirthYear', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentHighschool">학교</Label>
            <Input
              id="studentHighschool"
              placeholder="예: OO고등학교"
              {...register('studentHighschool')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentMemo">메모</Label>
            <Textarea
              id="studentMemo"
              placeholder="학생 메모를 입력하세요"
              rows={3}
              {...register('studentMemo')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? '등록 중...' : '등록'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
