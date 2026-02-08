'use client';

import { useState } from 'react';
import { Search, ChevronRight, BarChart3, Loader2, Trash2, MoreVertical, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useExams, useDeleteExam, type Exam } from '@/entities/exam';
import { ExamAnswersModal } from './ExamAnswersModal';

interface GradeSidebarProps {
    selectedExamId: number | null;
    onSelectExam: (exam: Exam) => void;
    onCreateClick?: () => void;
    isCreateMode?: boolean;
}

export function GradeSidebar({ selectedExamId, onSelectExam, onCreateClick, isCreateMode }: GradeSidebarProps) {
    const [search, setSearch] = useState('');
    const [deleteExamId, setDeleteExamId] = useState<number | null>(null);
    const { data, isLoading } = useExams({ page: 0, size: 50, sort: 'createdAt,desc' });
    const deleteExamMutation = useDeleteExam();

    const exams = data?.content.filter(exam =>
        exam.name.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

    const handleDelete = async () => {
        if (deleteExamId) {
            await deleteExamMutation.mutateAsync(deleteExamId);
            setDeleteExamId(null);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200 w-80 flex-shrink-0">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-2xl font-bold text-gray-900">성적 관리</h2>
                    <Button
                        size="sm"
                        onClick={onCreateClick}
                        className={cn(
                            "gap-1.5",
                            isCreateMode && "bg-indigo-700"
                        )}
                    >
                        <Plus className="w-4 h-4" />
                        시험 추가
                    </Button>
                </div>
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

            {/* List */}
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
                            const isSelected = selectedExamId === exam.id;
                            return (
                                <div
                                    key={exam.id}
                                    className={cn(
                                        'relative px-3 py-3 transition-all duration-200 rounded-lg group',
                                        'hover:bg-gray-100',
                                        isSelected && 'bg-indigo-50 hover:bg-indigo-50 ring-1 ring-inset ring-indigo-200'
                                    )}
                                >
                                    <button
                                        onClick={() => onSelectExam(exam)}
                                        className="w-full text-left focus:outline-none"
                                    >
                                        <div className="flex items-start gap-3 pr-8">
                                            <div className={cn(
                                                'mt-0.5 p-1.5 rounded-md flex-shrink-0 transition-colors',
                                                isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500 group-hover:bg-white'
                                            )}>
                                                <BarChart3 className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className={cn(
                                                    'text-sm font-semibold truncate mb-0.5',
                                                    isSelected ? 'text-indigo-900' : 'text-gray-900'
                                                )}>
                                                    {exam.name}
                                                </h3>
                                                <div className="text-xs text-gray-500">
                                                    {exam.category === 'PASS_FAIL'
                                                        ? '합격/불합격'
                                                        : exam.gradingType === 'RELATIVE'
                                                            ? `상대평가 · ${exam.gradeScale === 'FIVE_GRADE' ? '5등급제' : '9등급제'}`
                                                            : '절대평가'}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <ChevronRight className="w-4 h-4 text-indigo-400 self-center absolute right-10 top-1/2 -translate-y-1/2" />
                                            )}
                                        </div>
                                    </button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreVertical className="w-4 h-4 text-gray-400" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-36">
                                            <DropdownMenuItem asChild>
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <ExamAnswersModal exam={exam} />
                                                </div>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteExamId(exam.id);
                                                }}
                                            >
                                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                                삭제
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-100 bg-gray-50 text-xs text-center text-gray-400">
                {exams.length}개의 시험
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteExamId !== null} onOpenChange={() => setDeleteExamId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>시험 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                            이 시험을 삭제하시겠습니까? 삭제된 시험과 관련된 모든 성적 데이터가 함께 삭제됩니다.
                            이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteExamMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Trash2 className="w-4 h-4 mr-2" />
                            )}
                            삭제
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
