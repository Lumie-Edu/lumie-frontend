'use client';

import type { QuestionResult } from '../api/queries';

interface IncorrectQuestionsCardProps {
    questions: QuestionResult[];
    className?: string;
}

/**
 * 학생의 오답 문항 카드.
 * 학생 상세(ExamDetailView)와 성적관리 학생 상세 분석 패널 양쪽에서 동일한 마크업으로 재사용한다.
 */
export function IncorrectQuestionsCard({ questions, className }: IncorrectQuestionsCardProps) {
    const incorrectQuestions = questions
        .filter((q) => !q.isCorrect)
        .sort((a, b) => a.questionNumber - b.questionNumber);

    if (incorrectQuestions.length === 0) {
        return null;
    }

    return (
        <div className={`bg-white rounded-xl border p-6 ${className ?? ''}`}>
            <h3 className="text-lg font-semibold mb-4">오답 문항</h3>
            <div className="grid grid-cols-2 gap-3">
                {incorrectQuestions.map((q) => (
                    <div
                        key={q.id}
                        className="p-3 rounded-lg border border-red-100 bg-red-50/50"
                    >
                        <div className="text-sm font-medium mb-1">
                            {q.questionNumber}번 ({q.questionType || '기타'})
                        </div>
                        <div className="text-xs text-muted-foreground">
                            <span className="text-red-500">선택: {q.selectedChoice || '-'}</span>
                            {' / '}
                            <span className="text-green-600">정답: {q.correctAnswer}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
