'use client';

import { Download, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGenerateReport } from '@/entities/exam';

interface StudentDetailHeaderProps {
    studentId: number;
    studentName: string;
    examId: number;
    onClose: () => void;
}

export function StudentDetailHeader({
    studentId,
    studentName,
    examId,
    onClose,
}: StudentDetailHeaderProps) {
    const { mutate: generateReport, isPending: isGenerating } = useGenerateReport();

    return (
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="min-w-0">
                <h2 className="text-xl font-bold text-gray-900 truncate">{studentName}</h2>
                <p className="text-sm text-gray-500">학생 상세 분석</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateReport({ studentId, examId })}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4 mr-1" />
                    )}
                    리포트
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
