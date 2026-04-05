'use client';

import { useState } from 'react';
import { useStudentExamResults, type ExamResult } from '@/entities/exam';
import { useStabilityIndex } from '@/src/features/grade-management/api/statistics-queries';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  ClipboardList,
  TrendingUp,
  Trophy,
  AlertTriangle,
} from 'lucide-react';
import { formatDate } from '@/src/shared/lib/format';
import { StudentDetailPanel } from '@/features/grade-management/ui/StudentDetailPanel';

interface ExamResultsTabProps {
  studentId: number;
  studentName: string;
}

const chartConfig = {
  score: {
    label: '점수',
    color: 'var(--color-chart-1)',
  },
} satisfies ChartConfig;

function MetricCard({
  label,
  value,
  icon: Icon,
  gradientClass,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  gradientClass: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${gradientClass} p-5 text-white`}>
      <div className="absolute -right-3 -top-3 h-20 w-20 rounded-full bg-white/10" />
      <Icon className="absolute right-3 bottom-3 h-12 w-12 text-white/15" />
      <p className="text-xs tablet:text-sm font-medium text-white/80">{label}</p>
      <h3 className="text-xl tablet:text-2xl desktop:text-3xl font-bold mt-1">{value}</h3>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 70) return 'text-blue-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

function getGradeLabel(grade: number | undefined | null): string {
  if (grade == null) return '-';
  return `${grade}등급`;
}

export function ExamResultsTab({ studentId, studentName }: ExamResultsTabProps) {
  const [selectedResultId, setSelectedResultId] = useState<number | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);

  const { data: results, isLoading } = useStudentExamResults(studentId);
  const { data: stability } = useStabilityIndex(studentId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col tablet:flex-row gap-6">
          <div className="grid grid-cols-2 gap-4 tablet:w-1/2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl tablet:w-1/2" />
        </div>
      </div>
    );
  }

  const examResults = results ?? [];
  const totalExams = examResults.length;
  const scores = examResults.map((r) => r.score);
  const avgScore = totalExams > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / totalExams) : 0;
  const maxScore = totalExams > 0 ? Math.max(...scores) : 0;
  const minScore = totalExams > 0 ? Math.min(...scores) : 0;

  const chartData = (
    stability?.scoreHistory?.map((h) => ({
      name: h.examName,
      score: h.score,
      grade: h.grade,
      date: h.examDate,
    })) ?? []
  ).slice(-10);

  return (
    <div className="space-y-6">
      {/* 성과 지표 + 점수 추이 */}
      <div className="flex flex-col tablet:flex-row gap-6">
        {/* 성과 지표 카드 2x2 */}
        <div className="grid grid-cols-2 grid-rows-2 gap-4 tablet:w-1/2">
          <MetricCard
            label="총 시험 수"
            value={totalExams}
            icon={ClipboardList}
            gradientClass="bg-gradient-to-br from-blue-500 to-indigo-600"
          />
          <MetricCard
            label="평균 점수"
            value={avgScore}
            icon={TrendingUp}
            gradientClass={avgScore >= 80 ? 'bg-gradient-to-br from-emerald-500 to-green-600' : avgScore >= 60 ? 'bg-gradient-to-br from-amber-500 to-yellow-600' : 'bg-gradient-to-br from-orange-500 to-red-600'}
          />
          <MetricCard
            label="최고 점수"
            value={maxScore}
            icon={Trophy}
            gradientClass="bg-gradient-to-br from-amber-400 to-orange-500"
          />
          <MetricCard
            label="최저 점수"
            value={minScore}
            icon={AlertTriangle}
            gradientClass="bg-gradient-to-br from-rose-500 to-pink-600"
          />
        </div>

        {/* 점수 추이 차트 */}
        {chartData.length > 1 && (
          <div className="bg-white rounded-xl border p-6 tablet:w-1/2">
            <h3 className="text-lg font-semibold mb-4">점수 추이</h3>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={false} height={10} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [
                        <span key="value" className="font-bold">{value}점</span>,
                        '점수',
                      ]}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-score)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        )}
      </div>

      {/* 시험 목록 */}
      {totalExams === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">시험 결과가 없습니다.</p>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-semibold mb-4">시험 목록</h3>
          <div className="grid grid-cols-1 smalltablet:grid-cols-2 tablet:grid-cols-3 gap-4">
            {examResults.map((result) => (
              <button
                key={result.id}
                className="bg-white rounded-xl border p-5 text-left hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  setSelectedResultId(result.id);
                  setSelectedExamId(result.examId);
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {result.examName ?? `시험 #${result.examId}`}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(result.submittedAt || result.createdAt)}
                    </p>
                  </div>
                  {result.grade != null && (
                    <Badge variant="outline" className="shrink-0 ml-2">
                      {getGradeLabel(result.grade)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-end justify-between">
                  <span className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    / {result.totalScore ?? 100}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedResultId != null && selectedExamId != null && (
        <StudentDetailPanel
          studentId={studentId}
          studentName={studentName}
          examId={selectedExamId}
          resultId={selectedResultId}
          onClose={() => {
            setSelectedResultId(null);
            setSelectedExamId(null);
          }}
        />
      )}
    </div>
  );
}
