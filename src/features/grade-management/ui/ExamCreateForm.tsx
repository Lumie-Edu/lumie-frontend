'use client';

import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Loader2, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useCreateExamWithDetails } from '../api/queries';
import type { ExamCategory } from '@/entities/exam';

interface ExamCreateFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

interface FormData {
    name: string;
    category: ExamCategory;
    totalQuestions: number;
    correctAnswers: Record<string, string>;
    questionScores: Record<string, number>;
    questionTypes: Record<string, string>;
    passScore: number;
}

const MAX_QUESTIONS = 45;

const QUESTION_TYPES = [
    '듣기',
    '기초유형',
    '내용파악',
    '빈칸',
    '순서',
    '삽입',
    '어법',
    '어휘',
    '단어',
];

const GRADED_TYPE_MAP: Record<number, string> = {
    1: '듣기', 2: '듣기', 3: '듣기', 4: '듣기', 5: '듣기',
    6: '듣기', 7: '듣기', 8: '듣기', 9: '듣기', 10: '듣기',
    11: '듣기', 12: '듣기', 13: '듣기', 14: '듣기', 15: '듣기',
    16: '듣기', 17: '듣기',
    18: '기초유형', 19: '기초유형',
    20: '내용파악', 21: '내용파악', 22: '내용파악', 23: '내용파악', 24: '내용파악',
    25: '기초유형', 26: '기초유형', 27: '기초유형', 28: '기초유형',
    29: '어법',
    30: '어휘',
    31: '빈칸', 32: '빈칸', 33: '빈칸', 34: '빈칸',
    35: '내용파악',
    36: '순서', 37: '순서',
    38: '삽입', 39: '삽입',
    40: '내용파악', 41: '내용파악', 42: '내용파악', 43: '내용파악', 44: '내용파악', 45: '내용파악',
};

export function ExamCreateForm({ onSuccess, onCancel }: ExamCreateFormProps) {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        category: 'GRADED',
        totalQuestions: 45,
        correctAnswers: {},
        questionScores: {},
        questionTypes: {},
        passScore: 16,
    });

    const createExamMutation = useCreateExamWithDetails();

    const setDefaultValues = useCallback((totalQuestions: number, category: ExamCategory) => {
        const correctAnswers: Record<string, string> = {};
        const questionScores: Record<string, number> = {};
        const questionTypes: Record<string, string> = {};

        for (let i = 1; i <= totalQuestions; i++) {
            correctAnswers[String(i)] = '1';
            questionScores[String(i)] = category === 'PASS_FAIL' ? 1 : 2;
            questionTypes[String(i)] = category === 'PASS_FAIL'
                ? '단어'
                : (GRADED_TYPE_MAP[i] || '기타');
        }

        setFormData(prev => ({
            ...prev,
            correctAnswers,
            questionScores,
            questionTypes,
        }));
    }, []);

    useEffect(() => {
        setDefaultValues(formData.totalQuestions, formData.category);
    }, [formData.totalQuestions, formData.category, setDefaultValues]);

    const handleCategoryChange = (value: ExamCategory) => {
        setFormData(prev => ({
            ...prev,
            category: value,
        }));
    };

    const handleTotalQuestionsChange = (value: number) => {
        const clampedValue = Math.min(Math.max(1, value), MAX_QUESTIONS);
        setFormData(prev => ({
            ...prev,
            totalQuestions: clampedValue,
        }));
    };

    const handleAnswerChange = (questionNum: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            correctAnswers: { ...prev.correctAnswers, [questionNum]: value },
        }));
    };

    const handleScoreChange = (questionNum: string, value: number) => {
        setFormData(prev => ({
            ...prev,
            questionScores: { ...prev.questionScores, [questionNum]: value },
        }));
    };

    const handleTypeChange = (questionNum: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            questionTypes: { ...prev.questionTypes, [questionNum]: value },
        }));
    };

    const handleReset = () => {
        setDefaultValues(formData.totalQuestions, formData.category);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert('시험명을 입력해주세요.');
            return;
        }

        try {
            await createExamMutation.mutateAsync({
                name: formData.name,
                category: formData.category,
                totalQuestions: formData.totalQuestions,
                correctAnswers: formData.correctAnswers,
                questionScores: formData.questionScores,
                questionTypes: formData.questionTypes,
                passScore: formData.category === 'PASS_FAIL' ? formData.passScore : undefined,
            });
            onSuccess?.();
        } catch {
            // Error handled by mutation
        }
    };

    const totalScore = Object.values(formData.questionScores).reduce((sum, score) => sum + score, 0);

    const renderQuestionInputs = () => {
        const inputs = [];
        for (let i = 1; i <= formData.totalQuestions; i++) {
            const qNum = String(i);
            inputs.push(
                <div key={i} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100">
                    <div className="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold flex-shrink-0">
                        {i}
                    </div>
                    <Select
                        value={formData.correctAnswers[qNum] || '1'}
                        onValueChange={(v) => handleAnswerChange(qNum, v)}
                    >
                        <SelectTrigger className="w-16 h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[1, 2, 3, 4, 5].map((n) => (
                                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        type="number"
                        min={1}
                        max={10}
                        value={formData.questionScores[qNum] || 2}
                        onChange={(e) => handleScoreChange(qNum, parseInt(e.target.value) || 1)}
                        className="w-14 h-8 text-xs text-center"
                    />
                    <Select
                        value={formData.questionTypes[qNum] || '기타'}
                        onValueChange={(v) => handleTypeChange(qNum, v)}
                    >
                        <SelectTrigger className="flex-1 h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {QUESTION_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            );
        }
        return inputs;
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200 shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">시험 추가</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        새로운 시험을 생성하고 정답 및 배점을 설정합니다
                    </p>
                </div>
                {onCancel && (
                    <Button variant="outline" onClick={onCancel}>
                        취소
                    </Button>
                )}
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-500" />
                            기본 정보
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <Label htmlFor="examName" className="text-sm font-medium">시험명</Label>
                                <Input
                                    id="examName"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="예: 블루밍 모의고사 8회"
                                    className="mt-1.5"
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-medium">시험 유형</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(v) => handleCategoryChange(v as ExamCategory)}
                                >
                                    <SelectTrigger className="mt-1.5">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GRADED">등급제</SelectItem>
                                        <SelectItem value="PASS_FAIL">P/NP</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-sm font-medium">문항 수</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={MAX_QUESTIONS}
                                    value={formData.totalQuestions}
                                    onChange={(e) => handleTotalQuestionsChange(parseInt(e.target.value) || 1)}
                                    className="mt-1.5"
                                />
                                <p className="text-xs text-gray-500 mt-1">최대 {MAX_QUESTIONS}문항</p>
                            </div>

                            {formData.category === 'PASS_FAIL' && (
                                <div>
                                    <Label className="text-sm font-medium">합격 기준 점수</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={formData.totalQuestions}
                                        value={formData.passScore}
                                        onChange={(e) => setFormData(prev => ({ ...prev, passScore: parseInt(e.target.value) || 1 }))}
                                        className="mt-1.5"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{formData.totalQuestions}점 만점 중 {formData.passScore}점 이상 합격</p>
                                </div>
                            )}
                        </div>

                        {/* Summary */}
                        <div className="mt-4 p-3 bg-indigo-50 rounded-lg flex items-center justify-between">
                            <span className="text-sm text-indigo-700">
                                총 <span className="font-bold">{formData.totalQuestions}</span>문항 /
                                총점 <span className="font-bold">{totalScore}</span>점
                            </span>
                            {formData.category === 'GRADED' && (
                                <span className="text-xs text-indigo-600">
                                    * 평가 방식(절대/상대)은 채점 후 결과 화면에서 변경할 수 있습니다
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Question Settings Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-indigo-500" />
                                    문제별 정답 및 배점
                                </h3>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    정답(1~5) / 배점(1~10점) / 유형
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleReset}
                                className="gap-1.5"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                기본값으로 재설정
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto p-1">
                            {renderQuestionInputs()}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3">
                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel}>
                                취소
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={createExamMutation.isPending || !formData.name.trim()}
                            className={cn(
                                "gap-2 px-8",
                                createExamMutation.isPending && "opacity-70"
                            )}
                        >
                            {createExamMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    생성 중...
                                </>
                            ) : (
                                '시험 생성'
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
