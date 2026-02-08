'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAnnouncements, useDeleteAnnouncement } from '@/entities/announcement';
import { useAcademies } from '@/entities/academy';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/src/shared/ui/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pin, Bell } from 'lucide-react';
import { EditAnnouncementModal } from '../../edit-announcement/ui/EditAnnouncementModal';

interface AnnouncementListProps {
  isAdmin?: boolean;
}

export function AnnouncementList({ isAdmin = false }: AnnouncementListProps) {
  const router = useRouter();
  const [selectedAcademy, setSelectedAcademy] = useState<string>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: academiesData } = useAcademies();
  const { data, isLoading, error } = useAnnouncements({
    academyId: selectedAcademy !== 'all' ? Number(selectedAcademy) : undefined
  });
  const { mutate: deleteAnnouncement, isPending: isDeleting } = useDeleteAnnouncement();

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

  const academies = academiesData?.content ?? [];
  const announcements = data?.content ?? [];

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">
            총 <span className="text-gray-900 font-bold">{data?.totalElements ?? 0}</span>개의 공지사항
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isAdmin && (
            <>
              <Select value={selectedAcademy} onValueChange={setSelectedAcademy}>
                <SelectTrigger className="w-full sm:w-[180px]">
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

              <Button onClick={() => router.push('/admin/announcements/new')} className="shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                공지 작성
              </Button>
            </>
          )}
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">등록된 공지사항이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className={`
                cursor-pointer transition-all duration-200 
                hover:shadow-md hover:-translate-y-1
                group relative overflow-hidden
                ${announcement.isItImportantAnnouncement ? 'border-l-4 border-l-blue-500 bg-blue-50/10' : 'hover:border-blue-200'}
              `}
              onClick={() => handleCardClick(announcement.id)}
            >
              <CardContent className="p-5 flex justify-between items-start gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {announcement.isItImportantAnnouncement && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">
                        <Pin className="w-3 h-3 mr-1" /> 중요
                      </Badge>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {announcement.announcementTitle}
                    </h3>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                    {announcement.announcementContent}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                    <span>{new Date(announcement.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={(e) => handleDelete(announcement.id, e)}
                    disabled={isDeleting && deletingId === announcement.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
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
