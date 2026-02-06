'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useAcademy,
  useUpdateAcademy,
  useToggleAcademyActive,
  useDeleteAcademy,
  UpdateAcademyInput,
  updateAcademySchema,
} from '@/entities/academy';
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
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2 } from 'lucide-react';

interface EditAcademyModalProps {
  academyId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAcademyModal({ academyId, open, onOpenChange }: EditAcademyModalProps) {
  const { data: academy, isLoading } = useAcademy(academyId ?? 0, {
    enabled: !!academyId && open,
  });
  const { mutate: updateAcademy, isPending: isUpdating } = useUpdateAcademy(academyId ?? 0);
  const { mutate: toggleActive, isPending: isToggling } = useToggleAcademyActive(academyId ?? 0);
  const { mutate: deleteAcademy, isPending: isDeleting } = useDeleteAcademy();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateAcademyInput>({
    resolver: zodResolver(updateAcademySchema),
  });

  useEffect(() => {
    if (academy) {
      reset({
        name: academy.name,
        address: academy.address ?? '',
        phone: academy.phone ?? '',
        description: academy.description ?? '',
      });
    }
  }, [academy, reset]);

  const onSubmit = (data: UpdateAcademyInput) => {
    updateAcademy(data, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const handleToggleActive = (checked: boolean) => {
    toggleActive(checked);
  };

  const handleDelete = () => {
    if (confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      deleteAcademy(academyId!, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>학원 정보 수정</DialogTitle>
          <DialogDescription>학원 정보를 수정합니다.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 활성/비활성 토글 */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">학원 상태</Label>
                <p className="text-sm text-muted-foreground">
                  {academy?.isActive ? '운영 중' : '운영 중지'}
                </p>
              </div>
              <Switch
                id="isActive"
                checked={academy?.isActive ?? true}
                onCheckedChange={handleToggleActive}
                disabled={isToggling}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">학원명 *</Label>
              <Input
                id="name"
                placeholder="학원명을 입력하세요"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">주소</Label>
              <Input
                id="address"
                placeholder="주소를 입력하세요"
                {...register('address')}
              />
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
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                placeholder="학원에 대한 설명을 입력하세요"
                rows={3}
                {...register('description')}
              />
            </div>

            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? '삭제 중...' : '삭제'}
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  취소
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? '저장 중...' : '저장'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
