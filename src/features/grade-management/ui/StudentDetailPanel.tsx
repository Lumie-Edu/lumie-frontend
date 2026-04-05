'use client';

import { IncorrectQuestionsCard, QuestionResultsTable, useQuestionResults } from '@/entities/exam';
import { StudentDetailHeader } from './StudentDetailHeader';
import { ScoreSummaryChart } from './ScoreSummaryChart';
import { TypeGrowthRanking } from './TypeGrowthRanking';
import { OmrImageInline } from './OmrImageInline';

interface StudentDetailPanelProps {
    studentId: number;
    studentName: string;
    examId: number;
    resultId: number;
    onClose: () => void;
}

export function StudentDetailPanel({
    studentId,
    studentName,
    examId,
    resultId,
    onClose,
}: StudentDetailPanelProps) {
    const { data: questions } = useQuestionResults(resultId);

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Panel */}
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-4xl bg-gray-50 shadow-2xl overflow-hidden flex flex-col">
                <StudentDetailHeader
                    studentId={studentId}
                    studentName={studentName}
                    examId={examId}
                    onClose={onClose}
                />

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <ScoreSummaryChart studentId={studentId} examId={examId} />
                    <TypeGrowthRanking studentId={studentId} />
                    <OmrImageInline examId={examId} resultId={resultId} />
                    <QuestionResultsTable
                        questions={questions ?? []}
                        editable={{ examId, resultId }}
                    />
                    <IncorrectQuestionsCard questions={questions ?? []} />
                </div>
            </div>
        </div>
    );
}
