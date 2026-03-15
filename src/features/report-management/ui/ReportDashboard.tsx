'use client';

import { useState } from 'react';
import { FileText, Download, Users, Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useGenerateReport, type Exam } from '@/entities/exam';
import { useStudentResultSummaries, type StudentResultSummary } from '@/features/grade-management';
import { cn } from '@/lib/utils';

interface ReportDashboardProps {
  selectedExam: Exam | null;
  onBack?: () => void;
}

function ReportTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow className="text-base">
            <TableHead className="text-center">이름</TableHead>
            <TableHead className="text-center">점수</TableHead>
            <TableHead className="text-center">등급</TableHead>
            <TableHead className="text-center w-[15%]">리포트</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }).map((_, i) => (
            <TableRow key={i} className="text-base">
              <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-5 w-20 mx-auto" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-8 w-8 rounded-full mx-auto" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-9 w-20 mx-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
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
              <Badge variant="secondary" className="text-xs">
                {selectedExam.category === 'PASS_FAIL'
                  ? '합격/불합격'
                  : selectedExam.gradingType === 'RELATIVE'
                    ? `상대평가 · ${selectedExam.gradeScale === 'FIVE_GRADE' ? '5등급제' : '9등급제'}`
                    : '절대평가'}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {results.length}명 응시
              </Badge>
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
            <span className="hidden smalltablet:inline">전체 리포트 다운로드</span>
            <span className="smalltablet:hidden">전체</span>
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 tablet:p-8">
        {isLoading ? (
          <ReportTableSkeleton />
        ) : results.length === 0 ? (
          <div className="text-center py-12 bg-muted/50 rounded-lg">
            <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">응시한 학생이 없습니다</p>
          </div>
        ) : (
          <>
            {/* 모바일 카드 뷰 */}
            <div className="space-y-3 smalltablet:hidden">
              {results.map((result) => {
                const isGenerating = generatingIds.has(result.studentId);
                const maxScore = selectedExam.totalPossibleScore || 100;
                return (
                  <div key={result.studentId} className="rounded-lg border p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-base">{result.studentName}</span>
                      {isGraded ? (
                        result.grade != null ? (
                          <span className={cn(
                            'inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-sm',
                            result.grade <= 2 ? 'bg-indigo-100 text-indigo-700' :
                            result.grade <= 4 ? 'bg-blue-100 text-blue-700' :
                            result.grade <= 6 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          )}>
                            {result.grade}
                          </span>
                        ) : <span className="text-muted-foreground">-</span>
                      ) : (
                        <Badge variant={result.isPassed ? 'default' : 'destructive'} className="text-xs">
                          {result.isPassed ? '합격' : '불합격'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{result.score} / {maxScore}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateReport(result.studentId)}
                        disabled={isGenerating}
                        className="gap-1.5 h-8"
                      >
                        {isGenerating ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <FileText className="w-3.5 h-3.5" />
                        )}
                        {isGenerating ? '생성 중' : '리포트'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 테이블 뷰 (smalltablet 이상) */}
            <div className="hidden smalltablet:block rounded-md border">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow className="text-base">
                    <TableHead className="text-center">이름</TableHead>
                    <TableHead className="text-center">점수</TableHead>
                    <TableHead className="text-center">{isGraded ? '등급' : '결과'}</TableHead>
                    <TableHead className="text-center w-[15%]">리포트</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => {
                    const isGenerating = generatingIds.has(result.studentId);
                    const maxScore = selectedExam.totalPossibleScore || 100;

                    return (
                      <TableRow key={result.studentId} className="text-base">
                        <TableCell className="text-center font-medium">{result.studentName}</TableCell>
                        <TableCell className="text-center">
                          {result.score}
                          <span className="text-muted-foreground ml-1">/ {maxScore}</span>
                        </TableCell>
                        <TableCell className="text-center">
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
                              <span className="text-muted-foreground">-</span>
                            )
                          ) : result.isPassed ? (
                            <span className="inline-flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              합격
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-600">
                              <XCircle className="w-4 h-4" />
                              불합격
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
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
          </>
        )}
      </div>
    </div>
  );
}
