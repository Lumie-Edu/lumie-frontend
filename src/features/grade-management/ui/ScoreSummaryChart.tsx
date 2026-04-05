'use client';

import { useMemo } from 'react';
import { Target } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    ReferenceLine,
    XAxis,
    YAxis,
} from 'recharts';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudentRank } from '../api/statistics-queries';
import { useExamStatistics } from '../api/queries';

interface ScoreSummaryChartProps {
    studentId: number;
    examId: number;
}

const chartConfig = {
    value: {
        label: '점수',
        color: '#94a3b8',
    },
} satisfies ChartConfig;

export function ScoreSummaryChart({ studentId, examId }: ScoreSummaryChartProps) {
    const { data: rank, isLoading: rankLoading } = useStudentRank(studentId, examId);
    const { data: stats, isLoading: statsLoading } = useExamStatistics(examId);

    const chartData = useMemo(() => {
        if (!rank || !stats) return [];
        return [
            { name: '최저', value: stats.lowest, highlight: false },
            { name: '평균', value: Number(stats.average.toFixed(1)), highlight: false },
            { name: '내 점수', value: rank.score, highlight: true },
            { name: '최고', value: stats.highest, highlight: false },
        ];
    }, [rank, stats]);

    if (rankLoading || statsLoading) {
        return <Skeleton className="w-full h-72 rounded-2xl" />;
    }

    if (!rank || !stats) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="h-32 flex items-center justify-center text-sm text-gray-400">
                    점수 데이터를 불러오지 못했습니다.
                </div>
            </div>
        );
    }

    const deviation = rank.score - stats.average;
    const deviationLabel = deviation >= 0 ? `+${deviation.toFixed(1)}` : deviation.toFixed(1);
    const deviationTone =
        deviation > 0 ? 'text-emerald-600' : deviation < 0 ? 'text-red-600' : 'text-gray-500';

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
                <Target className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-gray-900">점수 요약</h3>
            </div>

            <div className="grid grid-cols-1 tablet:grid-cols-5 gap-6">
                {/* 좌측 2칸: 핵심 수치 */}
                <div className="tablet:col-span-2 flex flex-col justify-center">
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">내 점수</p>
                            <p className="text-4xl font-bold text-indigo-600">
                                {rank.score}
                                <span className="text-base text-gray-400 ml-1">점</span>
                            </p>
                            <p className={`text-sm font-medium mt-1 ${deviationTone}`}>
                                전체 평균 대비 {deviationLabel}점
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                            <div>
                                <p className="text-xs font-medium text-gray-500">등수</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {rank.rank}
                                    <span className="text-sm text-gray-400">
                                        /{rank.totalParticipants}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500">백분위</p>
                                <p className="text-lg font-bold text-gray-900">
                                    상위 {(100 - rank.percentile).toFixed(0)}%
                                </p>
                            </div>
                        </div>

                        <PercentileBar percentile={rank.percentile} />
                    </div>
                </div>

                {/* 우측 3칸: 점수 비교 차트 */}
                <div className="tablet:col-span-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">점수 비교</p>
                    <ChartContainer config={chartConfig} className="h-[240px] w-full">
                        <BarChart
                            data={chartData}
                            margin={{ top: 24, right: 16, left: 0, bottom: 8 }}
                        >
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                                fontSize={12}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                fontSize={11}
                                width={32}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        formatter={(value) => (
                                            <span className="font-medium">{value}점</span>
                                        )}
                                    />
                                }
                            />
                            <ReferenceLine
                                y={stats.average}
                                stroke="#6366f1"
                                strokeDasharray="4 4"
                                strokeOpacity={0.4}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.highlight ? '#6366f1' : '#cbd5e1'}
                                    />
                                ))}
                                <LabelList
                                    dataKey="value"
                                    position="top"
                                    fontSize={11}
                                    fill="#475569"
                                />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </div>
            </div>
        </div>
    );
}

function PercentileBar({ percentile }: { percentile: number }) {
    // percentile: 0(하위) ~ 100(상위). 학생 위치를 막대 위 마커로 표시.
    const clamped = Math.max(0, Math.min(100, percentile));
    return (
        <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>하위</span>
                <span className="font-medium text-indigo-600">
                    백분위 {clamped.toFixed(0)}
                </span>
                <span>상위</span>
            </div>
            <div className="relative h-2 rounded-full bg-gradient-to-r from-red-200 via-yellow-200 to-emerald-200">
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white shadow"
                    style={{ left: `calc(${clamped}% - 6px)` }}
                />
            </div>
        </div>
    );
}
