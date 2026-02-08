'use client';

import { useState } from 'react';
import { ExamSidebar, OmrProWorkspace } from '@/features/omr-grading';
import { type Exam } from '@/entities/exam';
import { cn } from '@/lib/utils';

export default function OmrGradingPage() {
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
                <ExamSidebar
                    selectedExam={selectedExam}
                    onSelectExam={setSelectedExam}
                />
            </div>

            {/* Workspace - 모바일: 콘텐츠 비활성 시 숨김, tablet+: 항상 표시 */}
            <div className={cn(
                "h-full tablet:flex tablet:flex-1",
                isContentActive ? "flex flex-1" : "hidden"
            )}>
                <OmrProWorkspace
                    selectedExam={selectedExam}
                    onBack={handleBack}
                />
            </div>
        </div>
    );
}
