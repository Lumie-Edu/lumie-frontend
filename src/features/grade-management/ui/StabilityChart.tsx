'use client';

import { useStabilityIndex } from '../api/statistics-queries';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';

interface StabilityChartProps {
    studentId: number;
}

const STABILITY_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
    'VERY_STABLE': { label: '매우 안정', color: 'text-green-700', bgColor: 'bg-green-100' },
    'STABLE': { label: '안정', color: 'text-green-600', bgColor: 'bg-green-50' },
    'MODERATE': { label: '보통', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    'UNSTABLE': { label: '불안정', color: 'text-orange-600', bgColor: 'bg-orange-50' },
    'VERY_UNSTABLE': { label: '매우 불안정', color: 'text-red-600', bgColor: 'bg-red-50' },
    'N/A': { label: '데이터 부족', color: 'text-gray-500', bgColor: 'bg-gray-50' },
};

export function StabilityChart({ studentId }: StabilityChartProps) {
    const { data, isLoading } = useStabilityIndex(studentId);

    if (isLoading) {
        return <Skeleton className="w-full h-64 rounded-2xl" />;
    }

    if (!data || data.examCount === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-base font-bold text-gray-900">성적 안정성 지표</h3>
                </div>
                <div className="h-32 flex items-center justify-center text-gray-400">
                    시험 응시 기록이 없습니다.
                </div>
            </div>
        );
    }

    const stability = STABILITY_LABELS[data.stabilityLevel] || STABILITY_LABELS['N/A'];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-base font-bold text-gray-900">성적 안정성 지표</h3>
                </div>
                <Badge className={`${stability.bgColor} ${stability.color} border-0`}>
                    {stability.label}
                </Badge>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">{data.examCount}</p>
                    <p className="text-xs text-gray-500">응시 횟수</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-indigo-600">{data.averageScore.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">평균 점수</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">{data.standardDeviation.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">표준편차</p>
                </div>
            </div>

            {/* CV indicator */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">변동계수 (CV)</span>
                    <span className="text-sm font-medium">{data.coefficientOfVariation.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${
                            data.coefficientOfVariation < 10 ? 'bg-green-500' :
                            data.coefficientOfVariation < 15 ? 'bg-yellow-500' :
                            'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(data.coefficientOfVariation * 2, 100)}%` }}
                    />
                </div>
                <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">안정</span>
                    <span className="text-xs text-gray-400">불안정</span>
                </div>
            </div>

            {/* Score History */}
            {data.scoreHistory.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">성적 변화 추이</h4>
                    <div className="flex items-end gap-2 h-24">
                        {data.scoreHistory.map((history, idx) => {
                            const maxScore = Math.max(...data.scoreHistory.map(h => h.score), 1);
                            const height = (history.score / maxScore) * 100;
                            const prevScore = idx > 0 ? data.scoreHistory[idx - 1].score : history.score;
                            const isUp = history.score > prevScore;
                            const isDown = history.score < prevScore;

                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                                    <div className="w-full bg-gray-100 rounded-t h-full flex items-end">
                                        <div
                                            className={`w-full rounded-t transition-all ${
                                                idx === data.scoreHistory.length - 1
                                                    ? 'bg-indigo-500'
                                                    : 'bg-indigo-300'
                                            }`}
                                            style={{ height: `${height}%` }}
                                        />
                                    </div>
                                    {idx > 0 && (
                                        <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                                            {isUp && <TrendingUp className="w-3 h-3 text-green-500" />}
                                            {isDown && <TrendingDown className="w-3 h-3 text-red-500" />}
                                        </div>
                                    )}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {history.examName}<br/>
                                        {history.score}점 ({history.grade}등급)
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
