'use client';

import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, FileText, Calendar, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useGradableExams, OmrGradableExam } from '../api/queries';

interface ExamSelectionPanelProps {
    selectedExam: OmrGradableExam | null;
    onSelectExam: (exam: OmrGradableExam) => void;
}

export function ExamSelectionPanel({ selectedExam, onSelectExam }: ExamSelectionPanelProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 5;

    const { data, isLoading } = useGradableExams({ page: currentPage, size: pageSize });

    const exams = data?.content ?? [];
    const totalPages = data?.totalPages ?? 1;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-xl">
                        <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">시험 선택</h2>
                        <p className="text-sm text-gray-500">채점할 시험을 선택하세요</p>
                    </div>
                </div>
            </div>

            {/* Exam List */}
            <div className="divide-y divide-gray-50">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    </div>
                ) : exams.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <FileText className="w-12 h-12 mb-3" />
                        <p className="text-sm">채점 가능한 시험이 없습니다</p>
                    </div>
                ) : (
                    exams.map((exam) => {
                        const isSelected = selectedExam?.id === exam.id;
                        return (
                            <button
                                key={exam.id}
                                onClick={() => onSelectExam(exam)}
                                className={cn(
                                    'w-full px-6 py-4 text-left transition-all duration-200',
                                    'hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-transparent',
                                    'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500',
                                    isSelected && 'bg-gradient-to-r from-indigo-50 to-indigo-25 border-l-4 border-l-indigo-500'
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={cn(
                                                'font-semibold text-gray-900 truncate',
                                                isSelected && 'text-indigo-700'
                                            )}>
                                                {exam.name}
                                            </h3>
                                            {isSelected && (
                                                <span className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 bg-indigo-500 rounded-full">
                                                    <Check className="w-3 h-3 text-white" />
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <span className="font-medium text-gray-600">총 {exam.totalQuestions}문제</span>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDate(exam.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                    {!isSelected && (
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                                    )}
                                </div>
                            </button>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                            disabled={currentPage === 0}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <Button
                                    key={i}
                                    variant={currentPage === i ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setCurrentPage(i)}
                                    className={cn(
                                        'h-8 w-8 p-0 text-xs font-medium',
                                        currentPage === i && 'bg-indigo-600 hover:bg-indigo-700'
                                    )}
                                >
                                    {i + 1}
                                </Button>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={currentPage >= totalPages - 1}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
