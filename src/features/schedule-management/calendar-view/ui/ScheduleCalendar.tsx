'use client';

import { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';
import { useSchedules, useDeleteSchedule, useCreateSchedule } from '@/entities/schedule';
import { Button } from '@/src/shared/ui/Button';
import { Card, CardContent } from '@/src/shared/ui/Card';
import { Trash2, Clock, User, X } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Schedule } from '@/entities/schedule';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// 시간대 매핑 (timeSlotId → 시간)
const TIME_SLOTS = [
  { id: 1, start: '09:00', end: '10:00', label: '09:00 - 10:00' },
  { id: 2, start: '10:00', end: '11:00', label: '10:00 - 11:00' },
  { id: 3, start: '11:00', end: '12:00', label: '11:00 - 12:00' },
  { id: 4, start: '13:00', end: '14:00', label: '13:00 - 14:00' },
  { id: 5, start: '14:00', end: '15:00', label: '14:00 - 15:00' },
  { id: 6, start: '15:00', end: '16:00', label: '15:00 - 16:00' },
  { id: 7, start: '16:00', end: '17:00', label: '16:00 - 17:00' },
  { id: 8, start: '17:00', end: '18:00', label: '17:00 - 18:00' },
];

// 담당자별 색상
const ADMIN_COLORS: Record<number, { bg: string; border: string; text: string }> = {
  0: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  1: { bg: '#dcfce7', border: '#22c55e', text: '#166534' },
  2: { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8' },
  3: { bg: '#ffedd5', border: '#f97316', text: '#9a3412' },
  4: { bg: '#fce7f3', border: '#ec4899', text: '#9d174d' },
  5: { bg: '#cffafe', border: '#06b6d4', text: '#155e75' },
};

function getAdminColor(adminId: number) {
  return ADMIN_COLORS[adminId % Object.keys(ADMIN_COLORS).length];
}

function getTimeSlot(timeSlotId: number) {
  return TIME_SLOTS.find(t => t.id === timeSlotId) || TIME_SLOTS[0];
}

export function ScheduleCalendar() {
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createDate, setCreateDate] = useState<string>('');

  const { data: schedulesData, isLoading } = useSchedules({});
  const { mutate: deleteSchedule, isPending: isDeleting } = useDeleteSchedule();
  const { mutate: createSchedule, isPending: isCreating } = useCreateSchedule();

  const schedules = schedulesData?.content ?? [];

  // 선택된 날짜에 이미 등록된 시간대 ID 목록
  const bookedTimeSlots = useMemo(() => {
    if (!createDate) return new Set<number>();
    return new Set(
      schedules
        .filter(s => s.date === createDate)
        .map(s => s.timeSlotId)
    );
  }, [createDate, schedules]);

  // FullCalendar 이벤트로 변환
  const events = useMemo(() => {
    return schedules.map((schedule) => {
      const timeSlot = getTimeSlot(schedule.timeSlotId);
      const color = getAdminColor(schedule.adminId);

      return {
        id: String(schedule.id),
        title: `담당자 ${schedule.adminId}`,
        start: `${schedule.date}T${timeSlot.start}`,
        end: `${schedule.date}T${timeSlot.end}`,
        backgroundColor: schedule.isAvailable ? color.bg : '#f3f4f6',
        borderColor: schedule.isAvailable ? color.border : '#9ca3af',
        textColor: schedule.isAvailable ? color.text : '#6b7280',
        extendedProps: { schedule },
      };
    });
  }, [schedules]);

  // 선택된 날짜의 스케줄 목록
  const selectedDateSchedules = useMemo(() => {
    if (!selectedDate) return [];
    return schedules
      .filter(s => s.date === selectedDate)
      .sort((a, b) => a.timeSlotId - b.timeSlotId);
  }, [selectedDate, schedules]);

  const handleEventClick = (info: EventClickArg) => {
    const schedule = info.event.extendedProps.schedule as Schedule;
    setSelectedSchedule(schedule);
    setSelectedDate(schedule.date);
  };

  const handleDateClick = (info: DateClickArg) => {
    // 달력 날짜 클릭 시 생성 모달 오픈
    setCreateDate(info.dateStr);
    setIsCreateModalOpen(true);
  };

  const handleCreateSchedule = (timeSlotId: number) => {
    createSchedule(
      { date: createDate, timeSlotId },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          setSelectedDate(createDate);
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteSchedule(id, {
        onSuccess: () => {
          setSelectedSchedule(null);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-6">
        {/* Calendar */}
        <div className="flex-1">
          <Card>
            <CardContent className="p-4">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale="ko"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek',
                }}
                buttonText={{
                  today: '오늘',
                  month: '월',
                  week: '주',
                }}
                events={events}
                eventClick={handleEventClick}
                dateClick={handleDateClick}
                height="auto"
                dayMaxEvents={4}
                moreLinkText={(num) => `+${num}개 더보기`}
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                }}
                slotMinTime="09:00:00"
                slotMaxTime="18:00:00"
                allDaySlot={false}
                weekends={true}
                fixedWeekCount={false}
              />
            </CardContent>
          </Card>
        </div>

        {/* 사이드 패널 */}
        <div className="w-80 shrink-0">
          <Card className="sticky top-4">
            <CardContent className="p-4">
              {selectedDate ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">
                      {format(new Date(selectedDate), 'M월 d일 (EEEE)', { locale: ko })}
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedDate(null);
                        setSelectedSchedule(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {selectedDateSchedules.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>등록된 스케줄이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDateSchedules.map((schedule) => {
                        const timeSlot = getTimeSlot(schedule.timeSlotId);
                        const color = getAdminColor(schedule.adminId);
                        const isSelected = selectedSchedule?.id === schedule.id;

                        return (
                          <div
                            key={schedule.id}
                            onClick={() => setSelectedSchedule(schedule)}
                            className={`
                              p-3 rounded-lg border-2 cursor-pointer transition-all
                              ${isSelected ? 'ring-2 ring-blue-500' : ''}
                              ${!schedule.isAvailable ? 'opacity-60' : ''}
                            `}
                            style={{
                              backgroundColor: color.bg,
                              borderColor: color.border,
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" style={{ color: color.text }} />
                                  <span className="font-medium" style={{ color: color.text }}>
                                    {timeSlot.label}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm" style={{ color: color.text }}>
                                  <User className="w-4 h-4" />
                                  <span>담당자 {schedule.adminId}</span>
                                </div>
                                {!schedule.isAvailable && (
                                  <span className="inline-block text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                                    마감
                                  </span>
                                )}
                                {schedule.hasReservation && (
                                  <p className="text-sm" style={{ color: color.text }}>
                                    예약 {schedule.confirmedCount}건
                                  </p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(schedule.id);
                                }}
                                loading={isDeleting}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>날짜를 클릭하여</p>
                  <p>스케줄을 등록하세요.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 범례 */}
          <Card className="mt-4">
            <CardContent className="p-3">
              <p className="text-sm font-medium text-gray-600 mb-2">담당자별 색상</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ADMIN_COLORS).slice(0, 4).map(([idx, color]) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border-2"
                      style={{ backgroundColor: color.bg, borderColor: color.border }}
                    />
                    <span className="text-xs text-gray-600">담당자 {Number(idx) + 1}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 스케줄 생성 모달 */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>상담 스케줄 등록</DialogTitle>
            <DialogDescription>
              {createDate && format(new Date(createDate), 'yyyy년 M월 d일 (EEEE)', { locale: ko })}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm font-medium text-gray-700 mb-3">시간대를 선택하세요</p>
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((slot) => {
                const isBooked = bookedTimeSlots.has(slot.id);
                return (
                  <button
                    key={slot.id}
                    onClick={() => !isBooked && handleCreateSchedule(slot.id)}
                    disabled={isBooked || isCreating}
                    className={`
                      p-3 rounded-lg border-2 text-sm font-medium transition-all
                      ${isBooked
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                      }
                      ${isCreating ? 'opacity-50' : ''}
                    `}
                  >
                    {slot.label}
                    {isBooked && <span className="block text-xs text-gray-400">등록됨</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
