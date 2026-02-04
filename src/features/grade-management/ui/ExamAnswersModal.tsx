'use client';

import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useExamDetail } from '../api/queries';
import type { Exam } from '@/entities/exam';

interface ExamAnswersModalProps {
    exam: Exam;
}

export function ExamAnswersModal({ exam }: ExamAnswersModalProps) {
    const [open, setOpen] = useState(false);
    const { data: examDetail, isLoading } = useExamDetail(exam.id, open);

    const correctAnswers = examDetail?.correctAnswers || exam.correctAnswers || {};
    const questionScores = examDetail?.questionScores || exam.questionScores || {};
    const questionTypes = examDetail?.questionTypes || exam.questionTypes || {};
    const totalQuestions = examDetail?.totalQuestions || exam.totalQuestions || Object.keys(correctAnswers).length;

    const totalScore = Object.values(questionScores).reduce((sum, score) => sum + score, 0);

    const renderAnswerTable = () => {
        const rows = [];
        for (let i = 1; i <= totalQuestions; i++) {
            const qNum = String(i);
            rows.push(
                <tr key={i} className={cn(
                    "border-b border-gray-100",
                    i % 2 === 0 && "bg-gray-50/50"
                )}>
                    <td className="px-3 py-2 text-center font-medium text-gray-900">{i}</td>
                    <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full font-bold text-sm">
                            {correctAnswers[qNum] || '-'}
                        </span>
                    </td>
                    <td className="px-3 py-2 text-center text-gray-700">{questionScores[qNum] || 0}점</td>
                    <td className="px-3 py-2 text-center">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {questionTypes[qNum] || '-'}
                        </span>
                    </td>
                </tr>
            );
        }
        return rows;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7">
                    <FileText className="w-3.5 h-3.5" />
                    답안
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between pr-8">
                        <span>{exam.name} - 정답표</span>
                        <span className="text-sm font-normal text-gray-500">
                            {totalQuestions}문항 / {totalScore}점
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 text-center font-medium text-gray-700">번호</th>
                                    <th className="px-3 py-2 text-center font-medium text-gray-700">정답</th>
                                    <th className="px-3 py-2 text-center font-medium text-gray-700">배점</th>
                                    <th className="px-3 py-2 text-center font-medium text-gray-700">유형</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderAnswerTable()}
                            </tbody>
                        </table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
