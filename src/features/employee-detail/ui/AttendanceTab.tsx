'use client';

import { useState } from 'react';
import {
  useEmployeeAttendances,
  useAttendanceSummary,
  useClockIn,
  useClockOut,
  EmployeeAttendanceStatusLabel,
  EmployeeAttendanceStatusColor,
} from '@/entities/employee-attendance';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LogIn, LogOut, Clock, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatTime } from '@/src/shared/lib/format';

interface AttendanceTabProps {
  adminId: number;
}

export function AttendanceTab({ adminId }: AttendanceTabProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const yearMonth = `${year}-${String(month).padStart(2, '0')}`;

  const { data: summary, isLoading: isLoadingSummary } = useAttendanceSummary(adminId, yearMonth);
  const { data: attendancesData, isLoading: isLoadingList } = useEmployeeAttendances({
    adminId,
    dateFrom: `${yearMonth}-01`,
    dateTo: `${yearMonth}-31`,
    size: 31,
  });
  const { mutate: clockIn, isPending: isClockingIn } = useClockIn();
  const { mutate: clockOut, isPending: isClockingOut } = useClockOut();

  const attendances = attendancesData?.content ?? [];

  const handlePrevMonth = () => {
    if (month === 1) { setYear(year - 1); setMonth(12); }
    else setMonth(month - 1);
  };

  const handleNextMonth = () => {
    if (month === 12) { setYear(year + 1); setMonth(1); }
    else setMonth(month + 1);
  };

  // Build calendar grid
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const attendanceMap = new Map(attendances.map((a) => [a.workDate, a]));

  return (
    <div className="space-y-6">
      {/* 출퇴근 버튼 */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold flex-1">출퇴근</h2>
        <Button onClick={() => clockIn()} disabled={isClockingIn} className="bg-green-600 hover:bg-green-700">
          <LogIn className="h-4 w-4 mr-2" />
          {isClockingIn ? '기록 중...' : '출근'}
        </Button>
        <Button onClick={() => clockOut()} disabled={isClockingOut} variant="outline">
          <LogOut className="h-4 w-4 mr-2" />
          {isClockingOut ? '기록 중...' : '퇴근'}
        </Button>
      </div>

      {/* 월간 요약 */}
      {isLoadingSummary ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="출근" value={`${summary.presentDays}일`} color="text-green-600" />
          <StatCard label="지각" value={`${summary.lateDays}일`} color="text-yellow-600" />
          <StatCard label="결근" value={`${summary.absentDays}일`} color="text-red-600" />
          <StatCard
            label="총 근무시간"
            value={`${Math.floor(summary.totalWorkMinutes / 60)}시간 ${summary.totalWorkMinutes % 60}분`}
            color="text-blue-600"
          />
        </div>
      ) : null}

      {/* 월 선택 */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-lg font-medium">{year}년 {month}월</span>
        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* 캘린더 그리드 */}
      {isLoadingList ? (
        <Skeleton className="h-64 rounded-lg" />
      ) : (
        <div className="border rounded-lg overflow-hidden">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 bg-muted/50">
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          {/* 날짜 셀 */}
          <div className="grid grid-cols-7">
            {/* 빈 셀 */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2 border-t min-h-[60px]" />
            ))}
            {/* 날짜 */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${yearMonth}-${String(day).padStart(2, '0')}`;
              const attendance = attendanceMap.get(dateStr);
              const status = attendance?.status;
              const colorClass = status
                ? EmployeeAttendanceStatusColor[status as keyof typeof EmployeeAttendanceStatusColor] ?? ''
                : '';
              return (
                <div key={day} className="p-2 border-t min-h-[60px]">
                  <p className="text-sm font-medium">{day}</p>
                  {attendance && (
                    <div className="mt-1">
                      <Badge variant="outline" className={`text-[10px] px-1 py-0 ${colorClass}`}>
                        {EmployeeAttendanceStatusLabel[status as keyof typeof EmployeeAttendanceStatusLabel] ?? status}
                      </Badge>
                      {attendance.clockInTime && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {formatTime(attendance.clockInTime)}
                          {attendance.clockOutTime && ` - ${formatTime(attendance.clockOutTime)}`}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-4 rounded-lg border bg-white">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
