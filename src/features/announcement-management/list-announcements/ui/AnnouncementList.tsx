'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAnnouncements, useDeleteAnnouncement } from '@/entities/announcement';
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
import { Plus, Trash2, Pin, Bell } from 'lucide-react';
import { EmptyState } from '@/src/shared/ui/EmptyState';
import { EditAnnouncementModal } from '../../edit-announcement/ui/EditAnnouncementModal';
import { CreateAnnouncementModal } from '../../create-announcement/ui/CreateAnnouncementModal';

interface AnnouncementListProps {
  isAdmin?: boolean;
}

export function AnnouncementList({ isAdmin = false }: AnnouncementListProps) {
  const router = useRouter();
  const [selectedAcademy, setSelectedAcademy] = useState<string>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: academiesData } = useAcademies();
  const { data, isLoading, error } = useAnnouncements({
    academyId: selectedAcademy !== 'all' ? Number(selectedAcademy) : undefined
  });
  const { mutate: deleteAnnouncement, isPending: isDeleting } = useDeleteAnnouncement();

  const academies = academiesData?.content ?? [];
  const announcements = data?.content ?? [];

  const academyMap = useMemo(() => {
    const map = new Map<number, string>();
    academies.forEach((a) => map.set(a.id, a.name));
    return map;
  }, [academies]);

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('정말 삭제하시겠습니까?')) {
      setDeletingId(id);
      deleteAnnouncement(id, {
        onSettled: () => setDeletingId(null),
      });
    }
  };

  const handleCardClick = (id: number) => {
    if (isAdmin) {
      setEditingId(id);
    } else {
      router.push(`/dashboard/announcements/${id}`);
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
        <p className="text-red-600">공지사항을 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageListHeader title="공지사항" count={data?.totalElements ?? 0} countUnit="개">
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
              공지 작성
            </Button>
          </>
        )}
      </PageListHeader>

      {announcements.length === 0 ? (
        <EmptyState
          icon={Bell}
          message="등록된 공지사항이 없습니다."
          actionLabel={isAdmin ? '공지 작성' : undefined}
          onAction={isAdmin ? () => setIsCreateOpen(true) : undefined}
        />
      ) : (
        <div className="border rounded-lg divide-y">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`
                flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors
                hover:bg-muted/50 group
                ${announcement.isItImportantAnnouncement ? 'border-l-3 border-l-blue-500 bg-blue-50/30' : ''}
              `}
              onClick={() => handleCardClick(announcement.id)}
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  {announcement.isItImportantAnnouncement && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-0 px-1.5 py-0 text-xs shrink-0">
                      <Pin className="w-3 h-3 mr-0.5" />
                      중요
                    </Badge>
                  )}
                  <h3 className="font-semibold text-sm truncate">
                    {announcement.announcementTitle}
                  </h3>
                </div>

                <p className="text-muted-foreground text-xs line-clamp-1">
                  {announcement.announcementContent}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                  <span>{new Date(announcement.createdAt).toLocaleDateString('ko-KR')}</span>
                  <span>·</span>
                  <span>
                    {!announcement.academyIds || announcement.academyIds.length === 0
                      ? '전체 학원'
                      : announcement.academyIds.map((id) => academyMap.get(id) ?? `학원${id}`).join(', ')}
                  </span>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={(e) => handleDelete(announcement.id, e)}
                  disabled={isDeleting && deletingId === announcement.id}
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
        <CreateAnnouncementModal
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
        />
      )}

      {/* Edit Modal (admin only) */}
      {isAdmin && (
        <EditAnnouncementModal
          announcementId={editingId}
          open={!!editingId}
          onOpenChange={(open) => !open && setEditingId(null)}
        />
      )}
    </div>
  );
}
