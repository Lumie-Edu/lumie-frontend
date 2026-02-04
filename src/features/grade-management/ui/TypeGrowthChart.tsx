'use client';

import { useTypeGrowthTrend } from '../api/statistics-queries';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TypeGrowthChartProps {
    studentId: number;
}

export function TypeGrowthChart({ studentId }: TypeGrowthChartProps) {
    const { data, isLoading } = useTypeGrowthTrend(studentId);

    if (isLoading) {
        return <Skeleton className="w-full h-80 rounded-2xl" />;
    }

    if (!data || data.trends.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">유형별 성장 추이</h3>
                <div className="h-48 flex items-center justify-center text-gray-400">
                    데이터가 없습니다.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-6">유형별 성장 추이</h3>

            <div className="space-y-6">
                {data.trends.map((trend) => {
                    const isGrowth = trend.overallGrowthRate > 0;
                    const isDecline = trend.overallGrowthRate < 0;
                    const latestAccuracy = trend.trendPoints.length > 0
                        ? trend.trendPoints[trend.trendPoints.length - 1].accuracy
                        : 0;

                    return (
                        <div key={trend.questionType} className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">{trend.questionType}</span>
                                    <span className="text-sm text-gray-500">
                                        ({trend.trendPoints.length}회 응시)
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-medium ${
                                        isGrowth ? 'text-green-600' : isDecline ? 'text-red-600' : 'text-gray-500'
                                    }`}>
                                        {isGrowth && '+'}
                                        {trend.overallGrowthRate.toFixed(1)}%
                                    </span>
                                    {isGrowth ? (
                                        <TrendingUp className="w-4 h-4 text-green-600" />
                                    ) : isDecline ? (
                                        <TrendingDown className="w-4 h-4 text-red-600" />
                                    ) : (
                                        <Minus className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>
                            </div>

                            {/* Progress bar showing latest accuracy */}
                            <div className="relative">
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            latestAccuracy >= 80 ? 'bg-green-500' :
                                            latestAccuracy >= 60 ? 'bg-yellow-500' :
                                            'bg-red-500'
                                        }`}
                                        style={{ width: `${latestAccuracy}%` }}
                                    />
                                </div>
                                <span className="absolute right-0 -top-5 text-xs text-gray-500">
                                    {latestAccuracy.toFixed(0)}%
                                </span>
                            </div>

                            {/* Mini trend line */}
                            {trend.trendPoints.length > 1 && (
                                <div className="flex items-end gap-1 h-12">
                                    {trend.trendPoints.map((point, idx) => {
                                        const maxAcc = Math.max(...trend.trendPoints.map(p => p.accuracy), 1);
                                        const height = (point.accuracy / maxAcc) * 100;

                                        return (
                                            <div
                                                key={idx}
                                                className="flex-1 group relative"
                                            >
                                                <div
                                                    className={`w-full rounded-t transition-all ${
                                                        idx === trend.trendPoints.length - 1
                                                            ? 'bg-indigo-500'
                                                            : 'bg-indigo-200'
                                                    }`}
                                                    style={{ height: `${height}%` }}
                                                />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    {point.accuracy.toFixed(0)}% ({point.correctCount}/{point.totalCount})
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
