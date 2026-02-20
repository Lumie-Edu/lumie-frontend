'use client';

import { useQuestionResults, useGenerateReport, type QuestionResult } from '@/entities/exam';
import { useExamStatistics } from '@/src/features/grade-management/api/queries';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Download, CheckCircle, XCircle } from 'lucide-react';

interface ExamDetailViewProps {
  studentId: number;
  resultId: number;
  examId: number;
  onBack: () => void;
}

function StatCard({
  label,
  value,
  subtext,
  colorClass,
}: {
  label: string;
  value: string | number;
  subtext?: string;
  colorClass?: string;
}) {
  return (
    <div className="bg-white p-4 rounded-xl border">
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorClass ?? 'text-gray-900'}`}>{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  );
}

export function ExamDetailView({ studentId, resultId, examId, onBack }: ExamDetailViewProps) {
  const { data: questions, isLoading: questionsLoading } = useQuestionResults(resultId);
  const { data: stats } = useExamStatistics(examId);
  const { mutate: generateReport, isPending: isGenerating } = useGenerateReport();

  if (questionsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <div className="flex flex-col tablet:flex-row gap-6">
          <div className="grid grid-cols-2 gap-4 tablet:w-1/2">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-32 rounded-xl tablet:w-1/2" />
        </div>
        <div className="flex flex-col tablet:flex-row gap-6">
          <Skeleton className="h-64 rounded-xl tablet:flex-1" />
          <Skeleton className="h-64 rounded-xl tablet:w-2/5" />
        </div>
      </div>
    );
  }

  const questionResults = questions ?? [];
  const totalQuestions = questionResults.length;
  const correctCount = questionResults.filter((q) => q.isCorrect).length;
  const totalEarned = questionResults.reduce((sum, q) => sum + q.earnedScore, 0);
  const totalPossible = questionResults.reduce((sum, q) => sum + q.score, 0);

  // Type accuracy
  const typeMap = new Map<string, { correct: number; total: number }>();
  questionResults.forEach((q) => {
    const type = q.questionType || '기타';
    const entry = typeMap.get(type) ?? { correct: 0, total: 0 };
    entry.total++;
    if (q.isCorrect) entry.correct++;
    typeMap.set(type, entry);
  });
  const typeAccuracy = Array.from(typeMap.entries()).map(([type, { correct, total }]) => ({
    type,
    correct,
    total,
    accuracy: Math.round((correct / total) * 100),
  }));

  // Top incorrect questions
  const incorrectQuestions = questionResults
    .filter((q) => !q.isCorrect)
    .sort((a, b) => a.questionNumber - b.questionNumber);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          목록으로
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateReport({ studentId, examId })}
          disabled={isGenerating}
        >
          <Download className="h-4 w-4 mr-1" />
          리포트
        </Button>
      </div>

      <div className="flex flex-col tablet:flex-row gap-6">
        {/* 왼쪽: 문항별 결과 */}
        {totalQuestions > 0 && (
          <div className="bg-white rounded-xl border tablet:flex-1 self-start">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">문항별 결과</h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center w-16">문항</TableHead>
                    <TableHead className="text-center">선택한 답</TableHead>
                    <TableHead className="text-center">정답</TableHead>
                    <TableHead className="text-center">정답 여부</TableHead>
                    <TableHead className="text-center">유형</TableHead>
                    <TableHead className="text-center">득점</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questionResults
                    .sort((a, b) => a.questionNumber - b.questionNumber)
                    .map((q) => (
                      <TableRow key={q.id}>
                        <TableCell className="text-center font-medium">
                          {q.questionNumber}
                        </TableCell>
                        <TableCell className="text-center">{q.selectedChoice || '-'}</TableCell>
                        <TableCell className="text-center">{q.correctAnswer}</TableCell>
                        <TableCell className="text-center">
                          {q.isCorrect ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              정답
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                              <XCircle className="h-3 w-3 mr-1" />
                              오답
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {q.questionType || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {q.earnedScore}/{q.score}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* 오른쪽: 성취 카드 + 오답 문항 + 유형별 정답률 */}
        <div className="flex flex-col gap-6 tablet:w-2/5 tablet:shrink-0">
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="시험 점수"
              value={`${totalEarned}/${totalPossible}`}
              colorClass={totalEarned >= totalPossible * 0.8 ? 'text-green-600' : totalEarned >= totalPossible * 0.6 ? 'text-blue-600' : 'text-red-600'}
            />
            <StatCard
              label="전체 평균"
              value={stats ? Math.round(stats.average) : '-'}
              subtext={stats ? `표준편차 ${stats.standardDeviation.toFixed(1)}` : undefined}
            />
          </div>

          {incorrectQuestions.length > 0 && (
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-semibold mb-4">오답 문항</h3>
              <div className="grid grid-cols-2 gap-3">
                {incorrectQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 rounded-lg border border-red-100 bg-red-50/50"
                  >
                    <div className="text-sm font-medium mb-1">
                      {q.questionNumber}번 ({q.questionType || '기타'})
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="text-red-500">선택: {q.selectedChoice || '-'}</span>
                      {' / '}
                      <span className="text-green-600">정답: {q.correctAnswer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {typeAccuracy.length > 0 && (
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-semibold mb-4">유형별 정답률</h3>
              <div className="space-y-4">
                {typeAccuracy.map(({ type, correct, total, accuracy }) => (
                  <div key={type} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{type}</span>
                      <span className="text-muted-foreground">
                        {correct}/{total} ({accuracy}%)
                      </span>
                    </div>
                    <Progress
                      value={accuracy}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
