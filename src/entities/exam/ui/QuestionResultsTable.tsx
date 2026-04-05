'use client';

import { useState } from 'react';
import { Check, CheckCircle, Pencil, X as XIcon, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { QuestionResult } from '../api/queries';
import { useUpdateQuestionAnswer } from '../api/queries';

interface QuestionResultsTableProps {
    questions: QuestionResult[];
    className?: string;
    /** examId와 resultId가 모두 주어지면 헤더에 "수정" 버튼이 노출되고 선택한 답을 편집할 수 있다. */
    editable?: {
        examId: number;
        resultId: number;
    };
}

/**
 * 학생의 시험 문항별 채점 결과 테이블.
 * 학생 상세와 성적관리 학생 상세 분석 패널 양쪽에서 재사용한다.
 */
export function QuestionResultsTable({ questions, className, editable }: QuestionResultsTableProps) {
    const [isEditMode, setIsEditMode] = useState(false);

    if (!questions || questions.length === 0) {
        return null;
    }

    return (
        <div className={`bg-white rounded-xl border ${className ?? ''}`}>
            <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">문항별 결과</h3>
                {editable && (
                    isEditMode ? (
                        <Button size="sm" variant="outline" onClick={() => setIsEditMode(false)}>
                            <Check className="h-4 w-4 mr-1" />
                            완료
                        </Button>
                    ) : (
                        <Button size="sm" variant="outline" onClick={() => setIsEditMode(true)}>
                            <Pencil className="h-4 w-4 mr-1" />
                            수정
                        </Button>
                    )
                )}
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
                        {[...questions]
                            .sort((a, b) => a.questionNumber - b.questionNumber)
                            .map((q) => (
                                <TableRow key={q.id}>
                                    <TableCell className="text-center font-medium">
                                        {q.questionNumber}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {editable && isEditMode ? (
                                            <EditableSelectedChoice
                                                question={q}
                                                examId={editable.examId}
                                                resultId={editable.resultId}
                                            />
                                        ) : (
                                            q.selectedChoice || '-'
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">{q.correctAnswer}</TableCell>
                                    <TableCell className="text-center">
                                        {q.isCorrect ? (
                                            <Badge className="bg-green-100 text-green-700 border-green-200">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                정답
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="outline"
                                                className="bg-red-50 text-red-600 border-red-200"
                                            >
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
    );
}

interface EditableSelectedChoiceProps {
    question: QuestionResult;
    examId: number;
    resultId: number;
}

function EditableSelectedChoice({ question, examId, resultId }: EditableSelectedChoiceProps) {
    const [draft, setDraft] = useState(question.selectedChoice ?? '');
    const { mutate, isPending } = useUpdateQuestionAnswer();

    const commit = () => {
        const trimmed = draft.trim();
        if (!trimmed || trimmed === (question.selectedChoice ?? '')) {
            return;
        }
        mutate({ examId, resultId, questionResultId: question.id, selectedChoice: trimmed });
    };

    const dirty = draft.trim() !== (question.selectedChoice ?? '') && draft.trim() !== '';

    return (
        <div className="flex items-center justify-center gap-1">
            <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') commit();
                }}
                onBlur={commit}
                disabled={isPending}
                maxLength={10}
                className="w-14 h-7 text-center text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-50"
            />
            {dirty && (
                <Check className="h-3.5 w-3.5 text-amber-500" aria-label="변경됨" />
            )}
        </div>
    );
}
