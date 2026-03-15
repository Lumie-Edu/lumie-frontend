'use client';

import { useState } from 'react';
import { FileText, Download, Users, Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGenerateReport, type Exam } from '@/entities/exam';
import { useStudentResultSummaries, type StudentResultSummary } from '@/features/grade-management';
import { cn } from '@/lib/utils';

interface ReportDashboardProps {
  selectedExam: Exam | null;
  onBack?: () => void;
}

export function ReportDashboard({ selectedExam, onBack }: ReportDashboardProps) {
  const { data: results = [], isLoading } = useStudentResultSummaries(selectedExam?.id ?? 0);
  const { mutate: generateReport, isPending } = useGenerateReport();
  const [generatingIds, setGeneratingIds] = useState<Set<number>>(new Set());

  const isGraded = selectedExam?.category === 'GRADED';

  const handleGenerateReport = (studentId: number) => {
    if (!selectedExam) return;
    setGeneratingIds(prev => new Set(prev).add(studentId));
    generateReport(
      { studentId, examId: selectedExam.id },
      {
        onSettled: () => {
          setGeneratingIds(prev => {
            const next = new Set(prev);
            next.delete(studentId);
            return next;
          });
        },
      }
    );
  };

  const handleGenerateAll = async () => {
    if (!selectedExam) return;
    for (const result of results) {
      generateReport({ studentId: result.studentId, examId: selectedExam.id });
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  if (!selectedExam) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50/50">
        <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
          <FileText className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">리포트를 생성할 시험을 선택하세요</h3>
        <p className="text-gray-500 text-center max-w-sm">
          좌측 목록에서 종료된 시험을 선택하면<br />
          학생별 학습 리포트를 생성할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50/50 overflow-hidden">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between px-4 tablet:px-8 py-4 tablet:py-5 bg-white border-b border-gray-200 sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="tablet:hidden -ml-1 p-1.5"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
          <h2 className="text-xl tablet:text-2xl font-bold text-gray-900">{selectedExam.name}</h2>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">
              {selectedExam.category === 'PASS_FAIL'
                ? '합격/불합격'
                : selectedExam.gradingType === 'RELATIVE'
                  ? `상대평가 · ${selectedExam.gradeScale === 'FIVE_GRADE' ? '5등급제' : '9등급제'}`
                  : '절대평가'}
            </span>
            <span>•</span>
            <span>{results.length}명 응시</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleGenerateAll}
            disabled={results.length === 0 || isPending}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            전체 리포트 다운로드
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 tablet:p-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Users className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">응시한 학생이 없습니다</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    학생
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    점수
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {isGraded ? '등급' : '결과'}
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    리포트
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => {
                  const isGenerating = generatingIds.has(result.studentId);
                  const maxScore = selectedExam.totalPossibleScore || 100;

                  return (
                    <TableRow key={result.studentId} className="hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-indigo-600">
                              {result.studentName?.charAt(0) ?? '?'}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{result.studentName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900">{result.score}</span>
                        <span className="text-gray-400 ml-1">/ {maxScore}</span>
                      </TableCell>
                      <TableCell>
                        {isGraded ? (
                          result.grade != null ? (
                            <span className={cn(
                              'inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm',
                              result.grade <= 2 ? 'bg-indigo-100 text-indigo-700' :
                              result.grade <= 4 ? 'bg-blue-100 text-blue-700' :
                              result.grade <= 6 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            )}>
                              {result.grade}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )
                        ) : result.isPassed ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">합격</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">불합격</span>
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateReport(result.studentId)}
                          disabled={isGenerating}
                          className="gap-2"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              생성 중...
                            </>
                          ) : (
                            <>
                              <FileText className="w-4 h-4" />
                              리포트
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
