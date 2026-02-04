'use client';

import { ScheduleCalendar } from '@/features/schedule-management';

export default function AdminSchedulesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">상담 일정 관리</h1>
        <p className="text-gray-600">모든 상담 스케줄을 달력에서 한눈에 확인하고 관리합니다.</p>
      </div>
      <ScheduleCalendar />
    </div>
  );
}
