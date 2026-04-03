'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useResources, useDeleteResource } from '@/entities/resource';
import { useAcademies } from '@/entities/academy';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PageListHeader } from '@/src/shared/ui/PageListHeader';
import { Plus, Trash2, Pin, FolderOpen } from 'lucide-react';
import { EmptyState } from '@/src/shared/ui/EmptyState';
import { CreateResourceModal } from '../../create-resource/ui/CreateResourceModal';

interface ResourceListProps {
  isAdmin?: boolean;
}

export function ResourceList({ isAdmin = false }: ResourceListProps) {
  const router = useRouter();
  const [selectedAcademy, setSelectedAcademy] = useState<string>('all');
  const { data: academiesData } = useAcademies();
  const { data, isLoading, error } = useResources({
    academyId: selectedAcademy !== 'all' ? Number(selectedAcademy) : undefined
  });
  const { mutate: deleteResource, isPending: isDeleting } = useDeleteResource();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const basePath = isAdmin ? '/admin/resources' : '/dashboard/resources';
  const academies = academiesData?.content ?? [];
  const resources = data?.content ?? [];

  const academyMap = useMemo(() => {
    const map = new Map<number, string>();
    academies.forEach((a) => map.set(a.id, a.name));
    return map;
  }, [academies]);

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('정말 삭제하시겠습니까?')) {
      setDeletingId(id);
      deleteResource(id, {
        onSettled: () => setDeletingId(null),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">자료를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageListHeader title="자료실" count={data?.totalElements ?? 0} countUnit="개">
        {isAdmin && (
          <>
            <Select value={selectedAcademy} onValueChange={setSelectedAcademy}>
              <SelectTrigger className="order-last basis-full smalltablet:order-none smalltablet:basis-auto w-full smalltablet:w-[180px]">
                <SelectValue placeholder="학원 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 학원</SelectItem>
                {academies.map((academy) => (
                  <SelectItem key={academy.id} value={String(academy.id)}>
                    {academy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setIsCreateOpen(true)} className="shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              자료 등록
            </Button>
          </>
        )}
      </PageListHeader>

      {resources.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          message="등록된 자료가 없습니다."
          actionLabel={isAdmin ? '자료 등록' : undefined}
          onAction={isAdmin ? () => setIsCreateOpen(true) : undefined}
        />
      ) : (
        <div className="border rounded-lg divide-y">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className={`
                flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors
                hover:bg-muted/50 group
                ${resource.isItImportantAnnouncement ? 'border-l-3 border-l-blue-500 bg-blue-50/30' : ''}
              `}
              onClick={() => router.push(`${basePath}/${resource.id}`)}
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  {resource.isItImportantAnnouncement && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-0 px-1.5 py-0 text-xs shrink-0">
                      <Pin className="w-3 h-3 mr-0.5" />
                      중요
                    </Badge>
                  )}
                  <h3 className="font-semibold text-sm truncate">
                    {resource.announcementTitle}
                  </h3>
                </div>

                <p className="text-muted-foreground text-xs line-clamp-1">
                  {resource.announcementContent}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                  <span>{new Date(resource.createdAt).toLocaleDateString('ko-KR')}</span>
                  <span>·</span>
                  <span>
                    {!resource.academyIds || resource.academyIds.length === 0
                      ? '전체 학원'
                      : resource.academyIds.map((id) => academyMap.get(id) ?? `학원${id}`).join(', ')}
                  </span>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={(e) => handleDelete(resource.id, e)}
                  disabled={isDeleting && deletingId === resource.id}
                  className="p-1.5 text-muted-foreground/50 hover:text-red-600 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal (admin only) */}
      {isAdmin && (
        <CreateResourceModal
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
        />
      )}
    </div>
  );
}
