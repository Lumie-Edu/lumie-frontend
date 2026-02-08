'use client';

import { useState, useCallback } from 'react';
import { RotateCcw, Loader2, FileText, CheckCircle, ChevronDown, ChevronUp, X, Save } from 'lucide-react';
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
import { useCreateExamWithDetails, useExamTemplates, useCreateExamTemplate, useDeleteExamTemplate } from '../api/queries';
import type { ExamCategory, ExamTemplate } from '@/entities/exam';

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

function buildDefaultValues(totalQuestions: number, category: ExamCategory) {
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

    return { correctAnswers, questionScores, questionTypes };
}

export function ExamCreateForm({ onSuccess, onCancel }: ExamCreateFormProps) {
    const [formData, setFormData] = useState<FormData>(() => {
        const defaults = buildDefaultValues(45, 'GRADED');
        return {
            name: '',
            category: 'GRADED',
            totalQuestions: 45,
            ...defaults,
            passScore: 16,
        };
    });
    const [templateCardOpen, setTemplateCardOpen] = useState(true);

    const createExamMutation = useCreateExamWithDetails();
    const { data: templatesData } = useExamTemplates();
    const createTemplateMutation = useCreateExamTemplate();
    const deleteTemplateMutation = useDeleteExamTemplate();

    const templates = templatesData?.content ?? [];

    const setDefaultValues = useCallback((totalQuestions: number, category: ExamCategory) => {
        const defaults = buildDefaultValues(totalQuestions, category);
        setFormData(prev => ({
            ...prev,
            ...defaults,
        }));
    }, []);

    const handleCategoryChange = (value: ExamCategory) => {
        setFormData(prev => ({
            ...prev,
            category: value,
        }));
        setDefaultValues(formData.totalQuestions, value);
    };

    const handleTotalQuestionsChange = (value: number) => {
        const clampedValue = Math.min(Math.max(1, value), MAX_QUESTIONS);
        setFormData(prev => ({
            ...prev,
            totalQuestions: clampedValue,
        }));
        setDefaultValues(clampedValue, formData.category);
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

    const handleApplyTemplate = (template: ExamTemplate) => {
        const correctAnswers: Record<string, string> = {};
        for (let i = 1; i <= template.totalQuestions; i++) {
            correctAnswers[String(i)] = '1';
        }

        setFormData(prev => ({
            ...prev,
            name: '',
            category: template.category,
            totalQuestions: template.totalQuestions,
            correctAnswers,
            questionScores: { ...template.questionScores },
            questionTypes: template.questionTypes ? { ...template.questionTypes } : {},
            passScore: template.passScore ?? prev.passScore,
        }));
    };

    const handleSaveAsTemplate = async () => {
        const templateName = prompt('템플릿 이름을 입력하세요:');
        if (!templateName?.trim()) return;

        await createTemplateMutation.mutateAsync({
            name: templateName.trim(),
            category: formData.category,
            totalQuestions: formData.totalQuestions,
            questionScores: formData.questionScores,
            questionTypes: formData.questionTypes,
            passScore: formData.category === 'PASS_FAIL' ? formData.passScore : undefined,
        });
    };

    const handleDeleteTemplate = async (e: React.MouseEvent, templateId: number) => {
        e.stopPropagation();
        if (!confirm('이 템플릿을 삭제하시겠습니까?')) return;
        await deleteTemplateMutation.mutateAsync(templateId);
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
                <div key={i} className="flex items-center gap-1.5 p-2 bg-white rounded-lg border border-gray-100">
                    <div className="w-7 h-7 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full text-xs font-bold shrink-0">
                        {i}
                    </div>
                    <div className="shrink-0">
                        <Select
                            value={formData.correctAnswers[qNum] || '1'}
                            onValueChange={(v) => handleAnswerChange(qNum, v)}
                        >
                            <SelectTrigger className="w-14 h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Input
                        type="number"
                        min={1}
                        max={10}
                        value={formData.questionScores[qNum] || 2}
                        onChange={(e) => handleScoreChange(qNum, parseInt(e.target.value) || 1)}
                        className="w-12 h-8 text-xs text-center shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <Select
                            value={formData.questionTypes[qNum] || '기타'}
                            onValueChange={(v) => handleTypeChange(qNum, v)}
                        >
                            <SelectTrigger className="w-full h-8 text-xs [&>span]:truncate">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {QUESTION_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            );
        }
        return inputs;
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 tablet:px-6 desktop:px-8 py-4 desktop:py-5 bg-white border-b border-gray-200 shrink-0">
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

            {/* Form Content — 2-column on desktop */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto desktop:overflow-hidden p-4 tablet:p-6 desktop:p-8">
                <div className="flex flex-col desktop:flex-row desktop:h-full gap-4 desktop:gap-6">

                    {/* Left Column — settings */}
                    <div className="w-full desktop:w-[340px] shrink-0 space-y-4 desktop:overflow-y-auto">
                        {/* Template */}
                        <div className="bg-white rounded-xl border border-gray-200">
                            <button
                                type="button"
                                className="w-full flex items-center justify-between px-5 py-4 text-left"
                                onClick={() => setTemplateCardOpen(prev => !prev)}
                            >
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Save className="w-4 h-4 text-gray-400" />
                                    템플릿
                                    {templates.length > 0 && (
                                        <span className="text-xs font-normal text-gray-500">
                                            ({templates.length})
                                        </span>
                                    )}
                                </h3>
                                {templateCardOpen ? (
                                    <ChevronUp className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                )}
                            </button>

                            {templateCardOpen && (
                                <div className="px-5 pb-4 -mt-1">
                                    {templates.length === 0 ? (
                                        <p className="text-xs text-gray-500 py-2">
                                            저장된 템플릿이 없습니다.
                                        </p>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                            {templates.map((template) => (
                                                <div
                                                    key={template.id}
                                                    className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                                                    onClick={() => handleApplyTemplate(template)}
                                                >
                                                    <span className="text-xs font-medium text-gray-900">
                                                        {template.name}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500">
                                                        {template.category === 'GRADED' ? '등급제' : 'P/NP'} · {template.totalQuestions}문항
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="p-0.5 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                                                        onClick={(e) => handleDeleteTemplate(e, template.id)}
                                                        disabled={deleteTemplateMutation.isPending}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                기본 정보
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <Label htmlFor="examName" className="text-xs font-medium">시험명</Label>
                                    <Input
                                        id="examName"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="예: 블루밍 모의고사 8회"
                                        className="mt-1 h-9"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs font-medium">시험 유형</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(v) => handleCategoryChange(v as ExamCategory)}
                                        >
                                            <SelectTrigger className="mt-1 h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="GRADED">등급제</SelectItem>
                                                <SelectItem value="PASS_FAIL">P/NP</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="text-xs font-medium">문항 수</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={MAX_QUESTIONS}
                                            value={formData.totalQuestions}
                                            onChange={(e) => handleTotalQuestionsChange(parseInt(e.target.value) || 1)}
                                            className="mt-1 h-9"
                                        />
                                    </div>
                                </div>

                                {formData.category === 'PASS_FAIL' && (
                                    <div>
                                        <Label className="text-xs font-medium">합격 기준 점수</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={formData.totalQuestions}
                                            value={formData.passScore}
                                            onChange={(e) => setFormData(prev => ({ ...prev, passScore: parseInt(e.target.value) || 1 }))}
                                            className="mt-1 h-9"
                                        />
                                        <p className="text-[10px] text-gray-500 mt-1">{formData.totalQuestions}점 만점 중 {formData.passScore}점 이상</p>
                                    </div>
                                )}
                            </div>

                            {/* Summary */}
                            <div className="mt-4 p-2.5 bg-gray-50 rounded-lg">
                                <span className="text-xs text-gray-700">
                                    총 <span className="font-bold">{formData.totalQuestions}</span>문항 /
                                    총점 <span className="font-bold">{totalScore}</span>점
                                </span>
                                {formData.category === 'GRADED' && (
                                    <p className="text-[10px] text-gray-500 mt-1">
                                        * 평가 방식은 채점 후 변경 가능
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                            <Button
                                type="submit"
                                disabled={createExamMutation.isPending || !formData.name.trim()}
                                className={cn(
                                    "w-full gap-2",
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
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSaveAsTemplate}
                                    disabled={createTemplateMutation.isPending}
                                    className="flex-1 gap-1.5 text-xs"
                                >
                                    {createTemplateMutation.isPending ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Save className="w-3.5 h-3.5" />
                                    )}
                                    템플릿으로 저장
                                </Button>
                                {onCancel && (
                                    <Button type="button" variant="outline" size="sm" onClick={onCancel} className="flex-1 text-xs">
                                        취소
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column — question grid */}
                    <div className="flex-1 min-w-0 min-h-0 bg-white rounded-xl border border-gray-200 p-4 desktop:p-5 flex flex-col">
                        <div className="flex items-center justify-between mb-3 shrink-0">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-gray-400" />
                                    문제별 정답 및 배점
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    정답(1~5) / 배점(1~10점) / 유형
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleReset}
                                className="gap-1.5 text-xs"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                재설정
                            </Button>
                        </div>

                        <div className="grid gap-2 flex-1 overflow-y-auto p-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                            {renderQuestionInputs()}
                        </div>
                    </div>

                </div>
            </form>
        </div>
    );
}
