'use client';

import { useState } from 'react';
import { ExamSidebar, OmrProWorkspace, OmrGradableExam } from '@/features/omr-grading';

export default function OmrGradingPage() {
    const [selectedExam, setSelectedExam] = useState<OmrGradableExam | null>(null);

    // Split View Layout: Full height minus header
    // Assuming the main layout provides a container, we fit within it.
    // We use absolute positioning or flex-1 to fill the remaining space.

    return (
        <div className="flex h-[calc(100vh-4rem)] -m-6 overflow-hidden bg-white">
            {/* Sidebar - Exam Selection */}
            <ExamSidebar
                selectedExam={selectedExam}
                onSelectExam={setSelectedExam}
            />

            {/* Main Workspace - Drag & Drop / Grading */}
            <OmrProWorkspace selectedExam={selectedExam} />
        </div>
    );
}
