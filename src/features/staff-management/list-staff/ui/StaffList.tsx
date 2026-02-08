'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useStaffList, useDeleteStaff, StaffCard } from '@/entities/staff';
import {
  useActivePositions,
  useCreatePosition,
  useUpdatePosition,
  useDeletePosition,
  CreatePositionInput,
  createPositionSchema,
} from '@/entities/position';
import type { Position } from '@/entities/position';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Search, Briefcase, Pencil, Trash2 } from 'lucide-react';
import { CreateStaffForm } from '../../create-staff/ui/CreateStaffForm';
import { ApiError } from '@/src/shared/types/api';

function StaffCardSkeleton() {
  return (
    <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div>
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 pt-3">
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

export function StaffList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPositionOpen, setIsPositionOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, error } = useStaffList();
  const { mutate: deleteStaff, isPending: isDeleting } = useDeleteStaff();

  const handleDelete = (id: number) => {
    setDeletingId(id);
    deleteStaff(id, {
      onSettled: () => setDeletingId(null),
    });
  };

  const staffList = data?.content ?? [];
  const totalStaff = data?.totalElements ?? 0;

  const filteredStaff = staffList.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.position?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">직원 목록을 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">직원 관리</h1>
          <Badge variant="secondary" className="text-base px-3 py-1">
            총 {totalStaff}명
          </Badge>
        </div>

        <div className="flex gap-2">
          <div className="relative w-full sm:w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="이름 또는 직책으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                직원 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>직원 계정 생성</DialogTitle>
              </DialogHeader>
              <CreateStaffForm onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
          <Dialog open={isPositionOpen} onOpenChange={setIsPositionOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Briefcase className="w-4 h-4 mr-2" />
                직책
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>직책 관리</DialogTitle>
              </DialogHeader>
              <PositionManager />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 카드 그리드 */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <StaffCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground mb-2">
            {searchTerm ? '검색된 직원이 없습니다.' : '등록된 직원이 없습니다.'}
          </p>
          {!searchTerm && (
            <p className="text-sm text-muted-foreground">새 직원을 추가해보세요.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredStaff.map((staff) => (
            <StaffCard
              key={staff.id}
              staff={staff}
              onDelete={handleDelete}
              isDeleting={isDeleting && deletingId === staff.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Position Manager (모달 내부) ───

function PositionManager() {
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  const { data: positions, isLoading } = useActivePositions();
  const { mutate: deletePosition } = useDeletePosition();

  const handleDelete = (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deletePosition(id);
      if (editingPosition?.id === id) setEditingPosition(null);
    }
  };

  if (editingPosition) {
    return (
      <EditPositionForm
        position={editingPosition}
        onBack={() => setEditingPosition(null)}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <div className="space-y-4">
      <CreatePositionForm />

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">등록된 직책</h4>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : !positions?.length ? (
          <p className="text-sm text-muted-foreground text-center py-4">등록된 직책이 없습니다.</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {positions.map((position) => (
              <div
                key={position.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="font-medium">{position.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditingPosition(position)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-red-100"
                    onClick={() => handleDelete(position.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CreatePositionForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePositionInput>({
    resolver: zodResolver(createPositionSchema),
    defaultValues: { name: '' },
  });

  const { mutate: createPosition, isPending, error } = useCreatePosition();
  const apiError = error as ApiError | null;

  const onSubmit = (data: CreatePositionInput) => {
    createPosition(data, { onSuccess: () => reset() });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      {apiError && (
        <div className="p-2 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{apiError.message}</p>
        </div>
      )}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="직책명 (예: 원장, 강사)"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>
        <Button type="submit" size="sm" disabled={isPending}>
          <Plus className="w-4 h-4 mr-1" />
          {isPending ? '추가 중...' : '추가'}
        </Button>
      </div>
    </form>
  );
}

interface EditPositionFormProps {
  position: Position;
  onBack: () => void;
  onDelete: (id: number) => void;
}

function EditPositionForm({ position, onBack, onDelete }: EditPositionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePositionInput>({
    resolver: zodResolver(createPositionSchema),
    defaultValues: { name: position.name },
  });

  const { mutate: updatePosition, isPending, error } = useUpdatePosition(position.id);
  const apiError = error as ApiError | null;

  const onSubmit = (data: CreatePositionInput) => {
    updatePosition(data, { onSuccess: onBack });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {apiError && (
        <div className="p-2 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{apiError.message}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label>직책명 *</Label>
        <Input {...register('name')} />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="flex justify-between pt-2">
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            뒤로
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => { onDelete(position.id); onBack(); }}
          >
            삭제
          </Button>
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? '수정 중...' : '수정'}
        </Button>
      </div>
    </form>
  );
}
