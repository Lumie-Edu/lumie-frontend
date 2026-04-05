'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Minus, TrendingUp } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { useTypeGrowthTrend } from '../api/statistics-queries';

interface TypeGrowthRankingProps {
    studentId: number;
}

const LINE_COLORS = [
    '#6366f1', '#22c55e', '#f59e0b', '#ef4444',
    '#0ea5e9', '#a855f7', '#14b8a6', '#ec4899',
];

type SortMode = 'risk' | 'drop' | 'rise' | 'recent';

const SORT_LABELS: Record<SortMode, string> = {
    risk: '주의 필요 순',
    drop: '하락 폭 큰 순',
    rise: '상승 폭 큰 순',
    recent: '최근 정답률 높은 순',
};

interface TypeRow {
    questionType: string;
    color: string;
    latest: number | null;
    delta: number | null;
    points: { examName: string; accuracy: number }[];
}

export function TypeGrowthRanking({ studentId }: TypeGrowthRankingProps) {
    const { data, isLoading } = useTypeGrowthTrend(studentId);
    const [sortMode, setSortMode] = useState<SortMode>('risk');
    const [expanded, setExpanded] = useState<string | null>(null);

    const rows = useMemo<TypeRow[]>(() => {
        if (!data || data.trends.length === 0) return [];
        return data.trends.map((trend, index) => {
            const sorted = [...trend.trendPoints].sort((a, b) =>
                a.examDate.localeCompare(b.examDate),
            );
            const points = sorted.map((p) => ({
                examName: p.examName,
                accuracy: Number(p.accuracy.toFixed(1)),
            }));
            const latest = points.length > 0 ? points[points.length - 1].accuracy : null;
            const prev = points.length > 1 ? points[points.length - 2].accuracy : null;
            const delta =
                latest != null && prev != null ? Number((latest - prev).toFixed(1)) : null;
            return {
                questionType: trend.questionType,
                color: LINE_COLORS[index % LINE_COLORS.length],
                latest,
                delta,
                points,
            };
        });
    }, [data]);

    const sortedRows = useMemo(() => {
        const copy = [...rows];
        switch (sortMode) {
            case 'risk':
                copy.sort((a, b) => (a.latest ?? 101) - (b.latest ?? 101));
                break;
            case 'drop':
                copy.sort((a, b) => (a.delta ?? 999) - (b.delta ?? 999));
                break;
            case 'rise':
                copy.sort((a, b) => (b.delta ?? -999) - (a.delta ?? -999));
                break;
            case 'recent':
                copy.sort((a, b) => (b.latest ?? -1) - (a.latest ?? -1));
                break;
        }
        return copy;
    }, [rows, sortMode]);

    if (isLoading) {
        return <Skeleton className="w-full h-80 rounded-2xl" />;
    }

    if (rows.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-base font-bold text-gray-900">유형별 정답률 랭킹</h3>
                </div>
                <div className="h-32 flex items-center justify-center text-sm text-gray-400">
                    누적 데이터가 없습니다.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-base font-bold text-gray-900">유형별 정답률 랭킹</h3>
                </div>
                <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
                    <SelectTrigger className="w-[160px] h-8 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
                            <SelectItem key={mode} value={mode} className="text-xs">
                                {SORT_LABELS[mode]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <ul className="divide-y divide-gray-100">
                {sortedRows.map((row) => (
                    <RankingRow
                        key={row.questionType}
                        row={row}
                        isExpanded={expanded === row.questionType}
                        onToggle={() =>
                            setExpanded(expanded === row.questionType ? null : row.questionType)
                        }
                    />
                ))}
            </ul>
        </div>
    );
}

interface RankingRowProps {
    row: TypeRow;
    isExpanded: boolean;
    onToggle: () => void;
}

function RankingRow({ row, isExpanded, onToggle }: RankingRowProps) {
    const latestTone = riskTone(row.latest);
    const deltaTone =
        row.delta == null
            ? 'text-gray-400 bg-gray-50'
            : row.delta > 0
              ? 'text-emerald-700 bg-emerald-50'
              : row.delta < 0
                ? 'text-red-700 bg-red-50'
                : 'text-gray-500 bg-gray-50';
    const DeltaIcon = row.delta == null || row.delta === 0 ? Minus : row.delta > 0 ? ArrowUp : ArrowDown;
    const deltaLabel =
        row.delta == null
            ? '—'
            : row.delta > 0
              ? `+${row.delta}%p`
              : row.delta < 0
                ? `${row.delta}%p`
                : '0%p';

    return (
        <li>
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center gap-3 py-3 text-left hover:bg-gray-50/60 rounded-md px-2 -mx-2 transition-colors"
            >
                {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                )}
                <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: row.color }}
                />
                <span className="flex-1 min-w-0 text-sm font-medium text-gray-900 truncate">
                    {row.questionType}
                </span>
                <span className={`text-lg font-bold tabular-nums w-14 text-right ${latestTone}`}>
                    {row.latest != null ? `${row.latest}%` : '—'}
                </span>
                <Sparkline points={row.points} color={row.color} />
                <span
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums ${deltaTone} w-[72px] justify-center`}
                >
                    <DeltaIcon className="w-3 h-3" />
                    {deltaLabel}
                </span>
            </button>

            {isExpanded && (
                <div className="pb-4 pl-9 pr-2">
                    <ExpandedTrend row={row} />
                </div>
            )}
        </li>
    );
}

function Sparkline({ points, color }: { points: TypeRow['points']; color: string }) {
    const width = 96;
    const height = 28;
    if (points.length === 0) {
        return <div className="w-[96px] h-[28px]" />;
    }
    if (points.length === 1) {
        return (
            <svg width={width} height={height} className="shrink-0">
                <circle cx={width / 2} cy={height / 2} r={2.5} fill={color} />
            </svg>
        );
    }
    const xs = points.map((_, i) => (i / (points.length - 1)) * (width - 4) + 2);
    const ys = points.map((p) => height - 3 - (Math.max(0, Math.min(100, p.accuracy)) / 100) * (height - 6));
    const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');
    return (
        <svg width={width} height={height} className="shrink-0">
            <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r={2} fill={color} />
        </svg>
    );
}

function ExpandedTrend({ row }: { row: TypeRow }) {
    const config = useMemo<ChartConfig>(
        () => ({
            accuracy: { label: row.questionType, color: row.color },
        }),
        [row.questionType, row.color],
    );
    return (
        <ChartContainer config={config} className="h-[180px] w-full">
            <LineChart data={row.points} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                    dataKey="examName"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    tickFormatter={(v: string) => (v.length > 8 ? `${v.slice(0, 8)}…` : v)}
                />
                <YAxis
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    width={32}
                    tickFormatter={(v) => `${v}%`}
                />
                <ReferenceLine y={50} stroke="#e5e7eb" strokeDasharray="4 4" />
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            labelKey="examName"
                            formatter={(value) => <span className="font-medium">{value}%</span>}
                        />
                    }
                />
                <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke={row.color}
                    strokeWidth={2.5}
                    dot={{ r: 3, strokeWidth: 0, fill: row.color }}
                    activeDot={{ r: 5 }}
                />
            </LineChart>
        </ChartContainer>
    );
}

function riskTone(latest: number | null): string {
    if (latest == null) return 'text-gray-400';
    if (latest < 50) return 'text-red-600';
    if (latest < 70) return 'text-amber-600';
    return 'text-emerald-600';
}
