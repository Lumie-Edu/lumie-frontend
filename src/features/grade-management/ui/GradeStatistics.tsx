'use client';

import { useExamStatistics, useAcademyComparison, GradeStatistics, AcademyComparison } from '../api/queries';
import {
    Users, Trophy, Target, TrendingUp, CheckCircle, XCircle, Building2
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Pie, PieChart, Cell } from 'recharts';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';

interface GradeStatisticsProps {
    examId: number;
}

function StatCard({ label, value, subtext, icon: Icon, colorClass }: any) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
                </div>
                <div className={`p-2 rounded-xl ${colorClass}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
            {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
        </div>
    );
}

const chartConfig = {
    count: {
        label: "인원",
        color: "hsl(var(--chart-1))",
    },
    pass: {
        label: "합격",
        color: "#22c55e",
    },
    fail: {
        label: "불합격",
        color: "#ef4444",
    },
} satisfies ChartConfig;

// P/NP 시험용 파이 차트 컴포넌트
function PassFailPieChart({ passCount, failCount }: { passCount: number; failCount: number }) {
    const data = [
        { name: '합격', value: passCount, fill: '#22c55e' },
        { name: '불합격', value: failCount, fill: '#ef4444' },
    ];

    const total = passCount + failCount;
    if (total === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                응시 데이터가 없습니다.
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center gap-8">
            <ChartContainer config={chartConfig} className="h-[200px] w-[200px]">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <ChartTooltip
                        content={
                            <ChartTooltipContent
                                formatter={(value, name) => (
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium">{value}명</span>
                                        <span className="text-muted-foreground text-xs">
                                            ({((Number(value) / total) * 100).toFixed(1)}%)
                                        </span>
                                    </div>
                                )}
                            />
                        }
                    />
                </PieChart>
            </ChartContainer>
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-green-500" />
                    <div>
                        <span className="font-medium text-gray-900">합격</span>
                        <span className="text-gray-500 ml-2">{passCount}명</span>
                        <span className="text-green-600 ml-1">({((passCount / total) * 100).toFixed(1)}%)</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-red-500" />
                    <div>
                        <span className="font-medium text-gray-900">불합격</span>
                        <span className="text-gray-500 ml-2">{failCount}명</span>
                        <span className="text-red-600 ml-1">({((failCount / total) * 100).toFixed(1)}%)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GradeDistributionChart({ data, gradeScale }: { data: GradeStatistics['gradeDistribution']; gradeScale?: 'NINE_GRADE' | 'FIVE_GRADE' | null }) {
    // 등급 체계에 따라 표시할 등급 범위 결정
    const maxGrade = gradeScale === 'FIVE_GRADE' ? 5 : 9;
    const allGrades = Array.from({ length: maxGrade }, (_, i) => i + 1);
    const gradeMap = new Map(data?.map(item => [item.grade, item]) ?? []);

    const chartData = allGrades.map(grade => {
        const item = gradeMap.get(grade);
        return {
            grade: `${grade}등급`,
            count: item?.count ?? 0,
            percentage: item?.percentage ?? 0,
        };
    });

    const hasData = chartData.some(item => item.count > 0);

    if (!hasData) {
        return (
            <div className="text-center text-gray-500 py-8">
                등급 분포 데이터가 없습니다.
            </div>
        );
    }

    return (
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                    dataKey="grade"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    fontSize={12}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickFormatter={(value) => `${value}명`}
                />
                <ChartTooltip
                    cursor={false}
                    content={
                        <ChartTooltipContent
                            formatter={(value, name, item) => (
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium">{value}명</span>
                                    <span className="text-muted-foreground text-xs">
                                        ({(item.payload as { percentage?: number })?.percentage ?? 0}%)
                                    </span>
                                </div>
                            )}
                        />
                    }
                />
                <Bar
                    dataKey="count"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ChartContainer>
    );
}

function TypeAccuracyChart({ data }: { data: GradeStatistics['typeAccuracyList'] }) {
    if (!data || data.length === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                유형 데이터가 없습니다.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {data.map((item) => (
                <div key={item.questionType} className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{item.questionType}</span>
                        <span className="text-gray-500">{item.accuracyRate}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                            className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${item.accuracyRate}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function TopIncorrectTable({ data }: { data: GradeStatistics['topIncorrectQuestions'] }) {
    if (!data || data.length === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                오답 데이터가 없습니다.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-gray-50/50">
                    <TableRow>
                        <TableHead className="w-12 text-center">순위</TableHead>
                        <TableHead className="text-center">문항</TableHead>
                        <TableHead className="text-center">유형</TableHead>
                        <TableHead className="text-center">오답률</TableHead>
                        <TableHead className="text-center">정답</TableHead>
                        <TableHead className="text-center">최다 오답</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item, index) => (
                        <TableRow key={item.questionNumber}>
                            <TableCell className="text-center font-medium text-gray-700">
                                {index + 1}
                            </TableCell>
                            <TableCell className="text-center font-medium">
                                {item.questionNumber}번
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant="outline" className="text-xs">
                                    {item.questionType || '-'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                                <span className={`font-bold ${item.incorrectRate >= 70 ? 'text-red-600' : item.incorrectRate >= 50 ? 'text-orange-600' : 'text-yellow-600'}`}>
                                    {item.incorrectRate}%
                                </span>
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                    {item.correctAnswer}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                    {item.topWrongChoice} ({item.topWrongChoiceRate}%)
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function AcademyComparisonTable({ examId }: { examId: number }) {
    const { data, isLoading } = useAcademyComparison(examId);

    if (isLoading) {
        return <Skeleton className="h-48" />;
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                학원 데이터가 없습니다.
            </div>
        );
    }

    return (
        <div className="overflow-auto h-full">
            <Table>
                <TableHeader className="bg-gray-50/50 sticky top-0">
                    <TableRow>
                        <TableHead className="w-12 text-center bg-gray-50">순위</TableHead>
                        <TableHead className="bg-gray-50">학원</TableHead>
                        <TableHead className="text-center bg-gray-50">응시자</TableHead>
                        <TableHead className="text-center bg-gray-50">평균</TableHead>
                        <TableHead className="text-center bg-gray-50">1등급</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((academy, index) => (
                        <TableRow key={academy.academyId}>
                            <TableCell className="text-center font-medium text-gray-700">
                                {index + 1}
                            </TableCell>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-gray-400" />
                                    {academy.academyName}
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                {academy.participantCount}명
                            </TableCell>
                            <TableCell className="text-center">
                                <span className="font-semibold text-blue-600">
                                    {academy.average}점
                                </span>
                            </TableCell>
                            <TableCell className="text-center">
                                <span className="font-semibold text-green-600">
                                    {academy.grade1Count}명
                                </span>
                                <span className="text-gray-500 text-sm ml-1">
                                    ({academy.grade1Percentage}%)
                                </span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export function GradeStatisticsView({ examId }: GradeStatisticsProps) {
    const { data, isLoading } = useExamStatistics(examId);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-2xl" />
                    ))}
                </div>
                <Skeleton className="h-64 rounded-2xl" />
            </div>
        );
    }

    if (!data) return null;

    const isPassFail = data.examCategory === 'PASS_FAIL';

    return (
        <div className="space-y-6">
            {/* 상단 영역: 4개 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="평균 점수"
                    value={`${data.average}점`}
                    subtext={`표준편차 ${data.standardDeviation}`}
                    icon={TrendingUp}
                    colorClass="bg-blue-500"
                />
                <StatCard
                    label="최고 점수"
                    value={`${data.highest}점`}
                    subtext={`최저 ${data.lowest}점`}
                    icon={Trophy}
                    colorClass="bg-yellow-500"
                />
                {isPassFail ? (
                    // P/NP 시험: 합격률, 합격자수 표시
                    <>
                        <StatCard
                            label="응시자 / 합격률"
                            value={`${data.participantCount}명 / ${data.passRate ?? 0}%`}
                            subtext={`${data.passCount ?? 0}명 합격`}
                            icon={Users}
                            colorClass="bg-indigo-500"
                        />
                        <StatCard
                            label="불합격"
                            value={`${data.failCount ?? 0}명`}
                            subtext="재시험 대상"
                            icon={XCircle}
                            colorClass="bg-red-500"
                        />
                    </>
                ) : (
                    // 등급제 시험: 응시자수 + 1등급 정보
                    <>
                        <StatCard
                            label="총 응시자"
                            value={`${data.participantCount}명`}
                            subtext="성적 등록 기준"
                            icon={Users}
                            colorClass="bg-indigo-500"
                        />
                        {data.gradingType === 'RELATIVE' ? (
                            <StatCard
                                label="1등급 컷 / 비율"
                                value={`${data.gradeDistribution?.find(g => g.grade === 1)?.cutoffScore ?? '-'}점`}
                                subtext={`${data.gradeDistribution?.find(g => g.grade === 1)?.count ?? 0}명 (${data.gradeDistribution?.find(g => g.grade === 1)?.percentage ?? 0}%)`}
                                icon={Target}
                                colorClass="bg-green-500"
                            />
                        ) : (
                            <StatCard
                                label="1등급 비율"
                                value={`${data.gradeDistribution?.find(g => g.grade === 1)?.percentage ?? 0}%`}
                                subtext={`${data.gradeDistribution?.find(g => g.grade === 1)?.count ?? 0}명 (90점 이상)`}
                                icon={Target}
                                colorClass="bg-green-500"
                            />
                        )}
                    </>
                )}
            </div>

            {/* Academy Comparison & Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* Academy Comparison */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-hidden">
                        <AcademyComparisonTable examId={examId} />
                    </div>
                </div>

                {/* P/NP는 파이 차트, 등급제는 등급 분포 차트 */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col min-h-[280px]">
                    {isPassFail ? (
                        <>
                            <h3 className="text-base font-bold text-gray-900 mb-4">합격/불합격 현황</h3>
                            <div className="flex-1 flex items-center justify-center">
                                <PassFailPieChart
                                    passCount={data.passCount ?? 0}
                                    failCount={data.failCount ?? 0}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-base font-bold text-gray-900 mb-4">등급 분포</h3>
                            <div className="flex-1">
                                <GradeDistributionChart data={data.gradeDistribution ?? []} gradeScale={data.gradeScale} />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Type Accuracy & Top Incorrect Questions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Type Accuracy */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-6">문제 유형별 정답률</h3>
                    <TypeAccuracyChart data={data.typeAccuracyList ?? []} />
                </div>

                {/* Top Incorrect Questions */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 pb-4">
                        <h3 className="text-base font-bold text-gray-900">오답률 TOP 10</h3>
                    </div>
                    <TopIncorrectTable data={data.topIncorrectQuestions ?? []} />
                </div>
            </div>
        </div>
    );
}
