'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSchedules, useDeleteSchedule } from '@/entities/schedule';
import { useAcademies } from '@/entities/academy';
import { Button } from '@/src/shared/ui/Button';
import { Card, CardContent } from '@/src/shared/ui/Card';
import { Plus, Trash2, Calendar, Clock, User } from 'lucide-react';

// 시간대 매핑 (timeSlotId → 시간 문자열)
const TIME_SLOTS: Record<number, string> = {
  1: '09:00 - 10:00',
  2: '10:00 - 11:00',
  3: '11:00 - 12:00',
  4: '13:00 - 14:00',
  5: '14:00 - 15:00',
  6: '15:00 - 16:00',
  7: '16:00 - 17:00',
  8: '17:00 - 18:00',
};

export function ScheduleList() {
  const router = useRouter();
  const [selectedAcademy, setSelectedAcademy] = useState<number | undefined>();
  const { data: academiesData } = useAcademies();
  const { data: schedulesData, isLoading } = useSchedules({
    academyId: selectedAcademy,
  });
  const { mutate: deleteSchedule, isPending: isDeleting } = useDeleteSchedule();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('정말 삭제하시겠습니까?')) {
      setDeletingId(id);
      deleteSchedule(id, {
        onSettled: () => setDeletingId(null),
      });
    }
  };

  const academies = academiesData?.content ?? [];
  const schedules = schedulesData?.content ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            상담 스케줄 ({schedulesData?.totalElements ?? 0}개)
          </h2>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedAcademy ?? ''}
            onChange={(e) => setSelectedAcademy(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">전체 학원</option>
            {academies.map((academy) => (
              <option key={academy.id} value={academy.id}>
                {academy.name}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={() => router.push('/admin/schedules/new')}>
          <Plus className="w-4 h-4 mr-2" />
          스케줄 추가
        </Button>
      </div>

      {schedules.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">등록된 스케줄이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((schedule) => {
            const timeSlot = TIME_SLOTS[schedule.timeSlotId] || `시간대 ${schedule.timeSlotId}`;

            return (
              <Card key={schedule.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900">상담 #{schedule.id}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      schedule.isAvailable
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {schedule.isAvailable ? '예약 가능' : '마감'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{schedule.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{timeSlot}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>담당자 ID: {schedule.adminId}</span>
                    </div>
                    {schedule.hasReservation && (
                      <p className="text-blue-600">예약 {schedule.confirmedCount}건 확정</p>
                    )}
                  </div>

                  <div className="mt-4">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={(e) => handleDelete(schedule.id, e)}
                      loading={isDeleting && deletingId === schedule.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
