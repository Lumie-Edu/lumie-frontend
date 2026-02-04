'use client';

import { useChoiceDistribution } from '../api/statistics-queries';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ChoiceAnalysisTableProps {
    examId: number;
}

export function ChoiceAnalysisTable({ examId }: ChoiceAnalysisTableProps) {
    const { data, isLoading } = useChoiceDistribution(examId);

    if (isLoading) {
        return <Skeleton className="w-full h-96 rounded-2xl" />;
    }

    if (!data || data.questions.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">문항별 선지 분석</h3>
                <div className="h-48 flex items-center justify-center text-gray-400">
                    데이터가 없습니다.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900">문항별 선지 분석</h3>
                    <span className="text-sm text-gray-500">응시자 {data.totalParticipants}명</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="w-16 text-center">문항</TableHead>
                            <TableHead className="w-20">유형</TableHead>
                            <TableHead className="text-center">정답률</TableHead>
                            <TableHead className="text-center">1번</TableHead>
                            <TableHead className="text-center">2번</TableHead>
                            <TableHead className="text-center">3번</TableHead>
                            <TableHead className="text-center">4번</TableHead>
                            <TableHead className="text-center">5번</TableHead>
                            <TableHead>매력적 오답</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.questions.map((question) => {
                            const isLowCorrectRate = question.correctRate < 50;

                            return (
                                <TableRow
                                    key={question.questionNumber}
                                    className={isLowCorrectRate ? 'bg-red-50/50' : ''}
                                >
                                    <TableCell className="text-center font-medium">
                                        {question.questionNumber}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-xs">
                                            {question.questionType || '-'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {isLowCorrectRate ? (
                                                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                            ) : (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                            )}
                                            <span className={`font-medium ${
                                                isLowCorrectRate ? 'text-red-600' : 'text-green-600'
                                            }`}>
                                                {question.correctRate.toFixed(1)}%
                                            </span>
                                        </div>
                                    </TableCell>

                                    {['1', '2', '3', '4', '5'].map((choice) => {
                                        const choiceData = question.choiceDistribution[choice];
                                        if (!choiceData) {
                                            return <TableCell key={choice} className="text-center text-gray-300">-</TableCell>;
                                        }

                                        const isCorrect = choiceData.isCorrect;
                                        const isHighSelect = choiceData.percentage > 20 && !isCorrect;

                                        return (
                                            <TableCell key={choice} className="text-center">
                                                <div className={`inline-flex flex-col items-center px-2 py-1 rounded ${
                                                    isCorrect
                                                        ? 'bg-green-100 text-green-700'
                                                        : isHighSelect
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : 'text-gray-500'
                                                }`}>
                                                    <span className="text-sm font-medium">
                                                        {choiceData.percentage.toFixed(0)}%
                                                    </span>
                                                    <span className="text-xs">
                                                        ({choiceData.count}명)
                                                    </span>
                                                </div>
                                            </TableCell>
                                        );
                                    })}

                                    <TableCell>
                                        <div className="flex gap-1">
                                            {question.attractiveDistractors.slice(0, 2).map((distractor, idx) => (
                                                <Badge
                                                    key={idx}
                                                    variant="outline"
                                                    className="bg-orange-50 text-orange-700 border-orange-200 text-xs"
                                                >
                                                    {distractor.choice}번 ({distractor.percentage.toFixed(0)}%)
                                                </Badge>
                                            ))}
                                            {question.attractiveDistractors.length === 0 && (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
