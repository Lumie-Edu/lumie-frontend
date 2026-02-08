'use client';

import { useState } from 'react';
import { ReportSidebar, ReportDashboard } from '@/features/report-management';
import { type Exam } from '@/entities/exam';
import { cn } from '@/lib/utils';

export default function ReportManagementPage() {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const isContentActive = selectedExam !== null;

  const handleBack = () => {
    setSelectedExam(null);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6 overflow-hidden bg-white">
      {/* Sidebar - 모바일: 콘텐츠 활성 시 숨김, tablet+: 항상 표시 */}
      <div className={cn(
        "h-full shrink-0 tablet:block tablet:w-auto",
        isContentActive ? "hidden" : "w-full"
      )}>
        <ReportSidebar
          selectedExamId={selectedExam?.id ?? null}
          onSelectExam={setSelectedExam}
        />
      </div>

      {/* Dashboard - 모바일: 콘텐츠 비활성 시 숨김, tablet+: 항상 표시 */}
      <div className={cn(
        "h-full tablet:flex tablet:flex-1",
        isContentActive ? "flex flex-1" : "hidden"
      )}>
        <ReportDashboard
          selectedExam={selectedExam}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
