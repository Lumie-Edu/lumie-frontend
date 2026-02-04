'use client';

import { useState } from 'react';
import { Search, ChevronRight, FileText, Calendar, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useGradableExams, OmrGradableExam } from '../api/queries';

interface ExamSidebarProps {
    selectedExam: OmrGradableExam | null;
    onSelectExam: (exam: OmrGradableExam) => void;
}

export function ExamSidebar({ selectedExam, onSelectExam }: ExamSidebarProps) {
    const [search, setSearch] = useState('');
    const { data, isLoading } = useGradableExams({ page: 0, size: 50 }); // Load more for sidebar list

    const exams = data?.content.filter(exam =>
        exam.name.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200 w-80 flex-shrink-0">
            {/* Sidebar Header & Search */}
            <div className="p-4 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 px-1">시험 목록</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="시험 검색..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all h-9 text-sm rounded-lg shadow-sm"
                    />
                </div>
            </div>

            {/* Exam List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                    </div>
                ) : exams.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 px-6 text-center">
                        <p className="text-sm">검색 결과가 없습니다</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-0.5">
                        {exams.map((exam) => {
                            const isSelected = selectedExam?.id === exam.id;
                            return (
                                <button
                                    key={exam.id}
                                    onClick={() => onSelectExam(exam)}
                                    className={cn(
                                        'w-full px-3 py-3 text-left transition-all duration-200 rounded-lg group',
                                        'hover:bg-gray-100',
                                        'focus:outline-none focus:bg-gray-100',
                                        isSelected && 'bg-indigo-50 hover:bg-indigo-50 ring-1 ring-inset ring-indigo-200'
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={cn(
                                            'mt-0.5 p-1.5 rounded-md flex-shrink-0 transition-colors',
                                            isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500 group-hover:bg-white'
                                        )}>
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className={cn(
                                                'text-sm font-semibold truncate mb-0.5',
                                                isSelected ? 'text-indigo-900' : 'text-gray-900'
                                            )}>
                                                {exam.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(exam.createdAt)}
                                                </span>
                                                <span>•</span>
                                                <span>{exam.totalQuestions}문항</span>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <ChevronRight className="w-4 h-4 text-indigo-400 self-center" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Sidebar Footer */}
            <div className="p-3 border-t border-gray-100 bg-gray-50 text-xs text-center text-gray-400">
                {exams.length}개의 시험
            </div>
        </div>
    );
}
