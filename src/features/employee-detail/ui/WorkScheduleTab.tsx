'use client';

import { useState } from 'react';
import {
  useWorkSchedules,
  useCreateWorkSchedule,
  useDeleteWorkSchedule,
  DayOfWeekLabel,
  DAY_ORDER,
  type WorkSchedule,
} from '@/entities/work-schedule';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Trash2, Clock } from 'lucide-react';
import { formatTime } from '@/src/shared/lib/format';

interface WorkScheduleTabProps {
  adminId: number;
}

export function WorkScheduleTab({ adminId }: WorkScheduleTabProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: schedules, isLoading } = useWorkSchedules(adminId);
  const { mutate: deleteSchedule } = useDeleteWorkSchedule(adminId);

  const handleDelete = (scheduleId: number) => {
    if (confirm('스케줄을 삭제하시겠습니까?')) {
      deleteSchedule(scheduleId);
    }
  };

  const sortedSchedules = [...(schedules ?? [])].sort(
    (a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek)
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">근무 스케줄</h2>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          스케줄 설정
        </Button>
      </div>

      {sortedSchedules.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">설정된 근무 스케줄이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {DAY_ORDER.map((day) => {
            const schedule = sortedSchedules.find((s) => s.dayOfWeek === day);
            return (
              <div
                key={day}
                className={`p-4 rounded-lg border text-center ${
                  schedule?.isDayOff
                    ? 'bg-gray-50 border-gray-200'
                    : schedule
                    ? 'bg-white border-gray-200'
                    : 'bg-gray-50 border-dashed border-gray-200'
                }`}
              >
                <p className="font-semibold text-sm mb-2">{DayOfWeekLabel[day] || day}</p>
                {schedule ? (
                  schedule.isDayOff ? (
                    <p className="text-sm text-muted-foreground">휴무</p>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      </p>
                      {schedule.breakStartTime && schedule.breakEndTime && (
                        <p className="text-xs text-muted-foreground">
                          휴식 {formatTime(schedule.breakStartTime)}-{formatTime(schedule.breakEndTime)}
                        </p>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 mt-1"
                        onClick={() => handleDelete(schedule.id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  )
                ) : (
                  <p className="text-xs text-muted-foreground">미설정</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <CreateScheduleDialog
        adminId={adminId}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        existingDays={sortedSchedules.map((s) => s.dayOfWeek)}
      />
    </div>
  );
}

interface CreateScheduleDialogProps {
  adminId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingDays: string[];
}

function CreateScheduleDialog({ adminId, open, onOpenChange, existingDays }: CreateScheduleDialogProps) {
  const { mutate: createSchedule, isPending } = useCreateWorkSchedule(adminId);
  const [entries, setEntries] = useState(
    DAY_ORDER.filter((d) => !existingDays.includes(d)).map((day) => ({
      dayOfWeek: day,
      startTime: '09:00',
      endTime: '18:00',
      breakStartTime: '12:00',
      breakEndTime: '13:00',
      effectiveFrom: new Date().toISOString().split('T')[0],
      isDayOff: ['SATURDAY', 'SUNDAY'].includes(day),
    }))
  );

  const updateEntry = (index: number, field: string, value: string | boolean) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    );
  };

  const handleSubmit = () => {
    createSchedule(entries, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>주간 근무 스케줄 설정</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div key={entry.dayOfWeek} className="flex items-center gap-3 p-3 rounded-lg border">
              <span className="font-medium w-8 text-center">{DayOfWeekLabel[entry.dayOfWeek]}</span>
              <div className="flex items-center gap-2">
                <Label className="text-xs">휴무</Label>
                <Switch
                  checked={entry.isDayOff}
                  onCheckedChange={(v) => updateEntry(index, 'isDayOff', v)}
                />
              </div>
              {!entry.isDayOff && (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="time"
                    value={entry.startTime}
                    onChange={(e) => updateEntry(index, 'startTime', e.target.value)}
                    className="w-28"
                  />
                  <span>-</span>
                  <Input
                    type="time"
                    value={entry.endTime}
                    onChange={(e) => updateEntry(index, 'endTime', e.target.value)}
                    className="w-28"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? '저장 중...' : '저장'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
