'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useActivePositions,
  useCreatePosition,
  useUpdatePosition,
  useDeletePosition,
  CreatePositionInput,
  createPositionSchema,
} from '@/entities/position';
import type { Position } from '@/entities/position';
import { PermissionEditor } from '@/features/permission-management';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Pencil, Trash2, Plus, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApiError } from '@/src/shared/types/api';

/* ──────────────────────── Dialog ──────────────────────── */

export function PositionManagerDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [activeTab, setActiveTab] = useState<string>('positions');
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setEditingPosition(null);
    }
    onOpenChange(next);
  };

  const isPermissionTab = activeTab === 'permissions';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Briefcase className="w-4 h-4 mr-2" />
          <span className="hidden smalltablet:inline">직책</span>
        </Button>
      </DialogTrigger>
      <DialogContent className={cn('sm:max-w-[500px] transition-[max-width] duration-200', isPermissionTab && 'sm:max-w-[700px]')}>
        <DialogHeader>
          <DialogTitle>{editingPosition ? '직책 편집' : '직책 관리'}</DialogTitle>
        </DialogHeader>
        {editingPosition ? (
          <EditPositionForm position={editingPosition} onBack={() => setEditingPosition(null)} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="positions" className="flex-1">
                <Briefcase className="h-4 w-4 mr-1.5" />
                직책 관리
              </TabsTrigger>
              <TabsTrigger value="permissions" className="flex-1">
                <Shield className="h-4 w-4 mr-1.5" />
                권한 관리
              </TabsTrigger>
            </TabsList>
            <TabsContent value="positions">
              <PositionListView onEdit={setEditingPosition} />
            </TabsContent>
            <TabsContent value="permissions">
              <PermissionEditor />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────────────── Position List ──────────────────────── */

function PositionListView({ onEdit }: { onEdit: (p: Position) => void }) {
  const { data: positions, isLoading } = useActivePositions();
  const { mutate: deletePosition } = useDeletePosition();

  const handleDelete = (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deletePosition(id);
    }
  };

  return (
    <div className="space-y-4">
      <CreatePositionForm />
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">등록된 직책</h4>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
          </div>
        ) : !positions?.length ? (
          <p className="text-sm text-muted-foreground text-center py-4">등록된 직책이 없습니다.</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {positions.map((position) => (
              <div key={position.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="font-medium">{position.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(position)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-100" onClick={() => handleDelete(position.id)}>
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

/* ──────────────────────── Position Forms ──────────────────────── */

function CreatePositionForm() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreatePositionInput>({
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
          <Input placeholder="직책명 (예: 원장, 강사)" {...register('name')} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>
        <Button type="submit" size="sm" disabled={isPending}>
          <Plus className="w-4 h-4 mr-1" />
          {isPending ? '추가 중...' : '추가'}
        </Button>
      </div>
    </form>
  );
}

function EditPositionForm({ position, onBack }: { position: Position; onBack: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreatePositionInput>({
    resolver: zodResolver(createPositionSchema),
    defaultValues: { name: position.name },
  });
  const { mutate: updatePosition, isPending, error } = useUpdatePosition(position.id);
  const { mutate: deletePosition } = useDeletePosition();
  const apiError = error as ApiError | null;

  const onSubmit = (data: CreatePositionInput) => {
    updatePosition(data, { onSuccess: onBack });
  };

  const handleDelete = () => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deletePosition(position.id, { onSuccess: onBack });
    }
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
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>
      <div className="flex justify-between pt-2">
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack}>뒤로</Button>
          <Button type="button" variant="destructive" onClick={handleDelete}>삭제</Button>
        </div>
        <Button type="submit" disabled={isPending}>{isPending ? '수정 중...' : '수정'}</Button>
      </div>
    </form>
  );
}
