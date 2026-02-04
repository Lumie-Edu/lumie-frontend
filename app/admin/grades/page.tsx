'use client';

import { useState } from 'react';
import { GradeSidebar, GradeDashboard, GradeExam } from '@/features/grade-management';

export default function GradeManagementPage() {
    const [selectedExam, setSelectedExam] = useState<GradeExam | null>(null);
    const [isCreateMode, setIsCreateMode] = useState(false);

    const handleSelectExam = (exam: GradeExam) => {
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

    return (
        <div className="flex h-[calc(100vh-4rem)] -m-6 overflow-hidden bg-white">
            {/* Sidebar - Exam List */}
            <GradeSidebar
                selectedExamId={selectedExam?.id ?? null}
                onSelectExam={handleSelectExam}
                onCreateClick={handleCreateMode}
                isCreateMode={isCreateMode}
            />

            {/* Main Workspace - Dashboard */}
            <GradeDashboard
                selectedExam={selectedExam}
                isCreateMode={isCreateMode}
                onCreateSuccess={handleCreateSuccess}
                onCreateCancel={handleCreateCancel}
            />
        </div>
    );
}
