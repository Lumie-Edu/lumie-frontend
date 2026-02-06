'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAcademies, useDeleteAcademy, CreateAcademyInput, createAcademySchema, useCreateAcademy } from '@/entities/academy';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, Building2, MapPin, Phone, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { EditAcademyModal } from '../../edit-academy/ui/EditAcademyModal';
import { ApiError } from '@/src/shared/types/api';
import { formatPhoneNumber } from '@/src/shared/lib/format';

function AcademyCardSkeleton() {
  return (
    <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="w-8 h-8 rounded" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  );
}

export function AcademyList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, error } = useAcademies();
  const { mutate: deleteAcademy, isPending: isDeleting } = useDeleteAcademy();

  const handleDelete = (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setDeletingId(id);
      deleteAcademy(id, {
        onSettled: () => setDeletingId(null),
      });
    }
  };

  const academies = data?.content ?? [];
  const totalAcademies = data?.totalElements ?? 0;

  const filteredAcademies = academies.filter(
    (academy) =>
      academy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      academy.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">학원 목록을 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">학원 관리</h1>
          <Badge variant="secondary" className="text-base px-3 py-1">
            총 {totalAcademies}개
          </Badge>
        </div>

        <div className="flex gap-2">
          <div className="relative w-full sm:w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="학원명 또는 주소로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                학원 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>새 학원 등록</DialogTitle>
              </DialogHeader>
              <CreateAcademyFormDialog onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 카드 그리드 */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <AcademyCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredAcademies.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-2">
            {searchTerm ? '검색된 학원이 없습니다.' : '등록된 학원이 없습니다.'}
          </p>
          {!searchTerm && (
            <p className="text-sm text-muted-foreground">새 학원을 추가해보세요.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredAcademies.map((academy) => (
            <div
              key={academy.id}
              className="group p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setEditingId(academy.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    academy.isActive !== false ? 'bg-blue-100' : 'bg-gray-200'
                  }`}>
                    <Building2 className={`w-5 h-5 ${
                      academy.isActive !== false ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                  </div>
                  <h3 className={`font-semibold truncate max-w-[150px] ${
                    academy.isActive !== false ? 'text-gray-900' : 'text-gray-500 line-through'
                  }`}>
                    {academy.name}
                  </h3>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(academy.id);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(academy.id);
                      }}
                      disabled={isDeleting && deletingId === academy.id}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {academy.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{academy.address}</span>
                  </div>
                )}
                {academy.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{formatPhoneNumber(academy.phone)}</span>
                  </div>
                )}
                {!academy.address && !academy.phone && (
                  <p className="text-gray-400 italic">정보 없음</p>
                )}
              </div>

              {academy.description && (
                <p className="mt-3 pt-3 border-t text-sm text-gray-500 line-clamp-2">
                  {academy.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <EditAcademyModal
        academyId={editingId}
        open={!!editingId}
        onOpenChange={(open) => !open && setEditingId(null)}
      />
    </div>
  );
}

function CreateAcademyFormDialog({ onSuccess }: { onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAcademyInput>({
    resolver: zodResolver(createAcademySchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      description: '',
    },
  });

  const { mutate: createAcademy, isPending, error } = useCreateAcademy();

  const onSubmit = (data: CreateAcademyInput) => {
    createAcademy(data, {
      onSuccess: () => {
        onSuccess();
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

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? '생성 중...' : '학원 생성'}
        </Button>
      </div>
    </form>
  );
}
