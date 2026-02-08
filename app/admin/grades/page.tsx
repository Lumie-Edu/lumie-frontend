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
        <div className="flex h-[calc(100vh-4rem)] -m-6 overflow-hidden bg-white">
            {/* Sidebar - 모바일: 콘텐츠 활성 시 숨김, tablet+: 항상 표시 */}
            <div className={cn(
                "h-full shrink-0 tablet:block tablet:w-auto",
                isContentActive ? "hidden" : "w-full"
            )}>
                <GradeSidebar
                    selectedExamId={selectedExam?.id ?? null}
                    onSelectExam={handleSelectExam}
                    onCreateClick={handleCreateMode}
                    isCreateMode={isCreateMode}
                />
            </div>

            {/* Dashboard - 모바일: 콘텐츠 비활성 시 숨김, tablet+: 항상 표시 */}
            <div className={cn(
                "h-full tablet:flex tablet:flex-1",
                isContentActive ? "flex flex-1" : "hidden"
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
