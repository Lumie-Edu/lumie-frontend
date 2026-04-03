'use client';

import { ScheduleCalendar } from '@/features/schedule-management';
import { PageListHeader } from '@/src/shared/ui/PageListHeader';

export default function AdminSchedulesPage() {
  return (
    <div className="space-y-6">
      <PageListHeader title="상담 일정 관리" />
      <ScheduleCalendar />
    </div>
  );
}
