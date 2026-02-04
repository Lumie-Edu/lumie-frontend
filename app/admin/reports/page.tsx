'use client';

import { useState } from 'react';
import { ReportSidebar, ReportDashboard } from '@/features/report-management';

export interface ReportExam {
  id: number;
  name: string;
  status: string;
  totalScore: number;
  createdAt: string;
}

export default function ReportManagementPage() {
  const [selectedExam, setSelectedExam] = useState<ReportExam | null>(null);

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6 overflow-hidden bg-white">
      {/* Sidebar - Exam List */}
      <ReportSidebar
        selectedExamId={selectedExam?.id ?? null}
        onSelectExam={setSelectedExam}
      />

      {/* Main Workspace - Report Dashboard */}
      <ReportDashboard selectedExam={selectedExam} />
    </div>
  );
}
