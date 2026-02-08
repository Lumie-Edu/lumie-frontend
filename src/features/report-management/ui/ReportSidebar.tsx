'use client';

import { useState } from 'react';
import { Search, ChevronRight, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useExams, type Exam } from '@/entities/exam';

interface ReportSidebarProps {
  selectedExamId: number | null;
  onSelectExam: (exam: Exam) => void;
}

export function ReportSidebar({ selectedExamId, onSelectExam }: ReportSidebarProps) {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useExams({ page: 0, size: 50, status: 'CLOSED' });

  const exams = data?.content.filter(exam =>
    exam.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-full tablet:w-80 flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 px-1">학습 리포트</h2>
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
          <div className="p-2 space-y-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-3 py-3 rounded-lg">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-7 h-7 rounded-md flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 px-6 text-center">
            <FileText className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">종료된 시험이 없습니다</p>
            <p className="text-xs mt-1">시험이 종료되면 리포트를 생성할 수 있습니다</p>
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {exams.map((exam) => {
              const isSelected = selectedExamId === exam.id;
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
                      <div className="text-xs text-gray-500">
                        {exam.category === 'PASS_FAIL'
                          ? '합격/불합격'
                          : exam.gradingType === 'RELATIVE'
                            ? `상대평가 · ${exam.gradeScale === 'FIVE_GRADE' ? '5등급제' : '9등급제'}`
                            : '절대평가'}
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

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 bg-gray-50 text-xs text-center text-gray-400">
        {exams.length}개의 시험
      </div>
    </div>
  );
}
