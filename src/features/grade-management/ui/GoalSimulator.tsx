'use client';

import { useState } from 'react';
import { useGoalSimulation } from '../api/statistics-queries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface GoalSimulatorProps {
    studentId: number;
    examId?: number;
}

export function GoalSimulator({ studentId, examId }: GoalSimulatorProps) {
    const [targetGrade, setTargetGrade] = useState<number>(3);
    const { mutate, data, isPending } = useGoalSimulation(studentId);

    const handleSimulate = () => {
        mutate({
            targetGrade,
            baseExamId: examId,
        });
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-gray-900">목표 등급 시뮬레이션</h3>
            </div>

            {/* Grade Selector */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    목표 등급 선택
                </label>
                <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((grade) => (
                        <button
                            key={grade}
                            onClick={() => setTargetGrade(grade)}
                            className={`w-10 h-10 rounded-lg font-medium transition-all ${
                                targetGrade === grade
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {grade}
                        </button>
                    ))}
                </div>
            </div>

            <Button
                onClick={handleSimulate}
                disabled={isPending}
                className="w-full mb-6"
            >
                {isPending ? '분석 중...' : '시뮬레이션 실행'}
            </Button>

            {/* Results */}
            {isPending && (
                <div className="space-y-4">
                    <Skeleton className="h-24 rounded-xl" />
                    <Skeleton className="h-32 rounded-xl" />
                </div>
            )}

            {data && !isPending && (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className={`p-4 rounded-xl ${
                        data.achievable ? 'bg-green-50' : 'bg-orange-50'
                    }`}>
                        <div className="flex items-start gap-3">
                            {data.achievable ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                            )}
                            <div>
                                <p className={`font-medium ${
                                    data.achievable ? 'text-green-800' : 'text-orange-800'
                                }`}>
                                    {data.achievable
                                        ? '목표 달성 가능!'
                                        : '도전적인 목표입니다'
                                    }
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    현재 {data.currentGrade}등급 → 목표 {data.targetGrade}등급
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                    <span className="text-gray-500">
                                        현재 점수: <strong>{data.currentScore}점</strong>
                                    </span>
                                    <span className="text-gray-500">
                                        목표 점수: <strong>{data.targetScore}점</strong>
                                    </span>
                                    {data.scoreDifference > 0 && (
                                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                            +{data.scoreDifference}점 필요
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Improvement Scenarios */}
                    {data.scenarios.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                                유형별 개선 시나리오
                            </h4>
                            <div className="space-y-3">
                                {data.scenarios.map((scenario, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-4 rounded-lg border ${
                                            scenario.priority === 'HIGH'
                                                ? 'border-red-200 bg-red-50/50'
                                                : scenario.priority === 'MEDIUM'
                                                    ? 'border-yellow-200 bg-yellow-50/50'
                                                    : 'border-gray-200 bg-gray-50/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">
                                                    {scenario.questionType}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${
                                                        scenario.priority === 'HIGH'
                                                            ? 'bg-red-100 text-red-700 border-red-300'
                                                            : scenario.priority === 'MEDIUM'
                                                                ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                                                                : 'bg-gray-100 text-gray-600 border-gray-300'
                                                    }`}
                                                >
                                                    {scenario.priority === 'HIGH' ? '우선 개선' :
                                                     scenario.priority === 'MEDIUM' ? '개선 권장' : '유지'}
                                                </Badge>
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                +{scenario.potentialScoreGain}점 가능
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">현재: </span>
                                                <span className="font-medium">
                                                    {scenario.currentCorrect}/{scenario.totalQuestions}문항
                                                    ({scenario.currentAccuracy.toFixed(0)}%)
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">목표: </span>
                                                <span className="font-medium text-indigo-600">
                                                    +{scenario.additionalCorrectNeeded}문항
                                                    ({scenario.targetAccuracy.toFixed(0)}%)
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress visualization */}
                                        <div className="mt-3">
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full flex">
                                                    <div
                                                        className="bg-indigo-500 h-full"
                                                        style={{ width: `${scenario.currentAccuracy}%` }}
                                                    />
                                                    <div
                                                        className="bg-indigo-300 h-full animate-pulse"
                                                        style={{ width: `${scenario.targetAccuracy - scenario.currentAccuracy}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
