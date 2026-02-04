'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StabilityChart } from './StabilityChart';
import { TypeGrowthChart } from './TypeGrowthChart';
import { GoalSimulator } from './GoalSimulator';

interface StudentDetailPanelProps {
    studentId: number;
    studentName: string;
    examId?: number;
    onClose: () => void;
}

export function StudentDetailPanel({
    studentId,
    studentName,
    examId,
    onClose
}: StudentDetailPanelProps) {
    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-gray-50 shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{studentName}</h2>
                        <p className="text-sm text-gray-500">학생 상세 분석</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <StabilityChart studentId={studentId} />
                    <TypeGrowthChart studentId={studentId} />
                    <GoalSimulator studentId={studentId} examId={examId} />
                </div>
            </div>
        </div>
    );
}
