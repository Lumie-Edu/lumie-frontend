'use client';

import { useState } from 'react';
import { GradeSidebar, GradeDashboard } from '@/features/grade-management';
import { type Exam } from '@/entities/exam';
import { cn } from '@/lib/utils';

export default function GradeManagementPage() {
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [isCreateMode, setIsCreateMode] = useState(false);

    // 모바일에서 콘텐츠가 활성화된 상태인지
    const isContentActive = isCreateMode || selectedExam !== null;

    const handleSelectExam = (exam: Exam) => {
        setSelectedExam(exam);
        setIsCreateMode(false);
    };

    const handleCreateMode = () => {
        setSelectedExam(null);
        setIsCreateMode(true);
    };

    const handleCreateSuccess = () => {
        setIsCreateMode(false);
    };

    const handleCreateCancel = () => {
        setIsCreateMode(false);
    };

    const handleBack = () => {
        setSelectedExam(null);
        setIsCreateMode(false);
    };

    return (
        <div className="flex -m-6 bg-white min-h-[calc(100svh-3.5rem)]">
            {/* Sidebar - 모바일: 콘텐츠 활성 시 숨김, tablet+: sticky로 고정 */}
            <div className={cn(
                "shrink-0 tablet:block tablet:w-auto tablet:sticky tablet:top-14 tablet:self-start tablet:h-[calc(100svh-3.5rem)]",
                isContentActive ? "hidden" : "w-full min-h-[calc(100svh-3.5rem)]"
            )}>
                <GradeSidebar
                    selectedExamId={selectedExam?.id ?? null}
                    onSelectExam={handleSelectExam}
                    onCreateClick={handleCreateMode}
                    isCreateMode={isCreateMode}
                />
            </div>

            {/* Dashboard - 모바일: 콘텐츠 비활성 시 숨김, tablet+: flex-1로 자연스럽게 확장 */}
            <div className={cn(
                "tablet:flex tablet:flex-1 tablet:min-w-0",
                isContentActive ? "flex flex-1 min-w-0" : "hidden"
            )}>
                <GradeDashboard
                    selectedExam={selectedExam}
                    isCreateMode={isCreateMode}
                    onCreateSuccess={handleCreateSuccess}
                    onCreateCancel={handleCreateCancel}
                    onBack={handleBack}
                />
            </div>
        </div>
    );
}
