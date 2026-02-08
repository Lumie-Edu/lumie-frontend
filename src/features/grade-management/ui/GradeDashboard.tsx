'use client';

import { useState } from 'react';
import { StudentGrade, useExamStatistics, useUpdateGradingType, useUpdateGradeScale, GradingType, GradeScale } from '../api/queries';
import { type Exam } from '@/entities/exam';
import { GradeStatisticsView } from './GradeStatistics';
import { StudentGradeTable } from './StudentGradeTable';
import { ChoiceAnalysisTable } from './ChoiceAnalysisTable';
import { StudentDetailPanel } from './StudentDetailPanel';
import { ExamCreateForm } from './ExamCreateForm';
import { BarChart3, Users, PieChart, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GradeDashboardProps {
    selectedExam: Exam | null;
    isCreateMode?: boolean;
    onCreateSuccess?: () => void;
    onCreateCancel?: () => void;
    onBack?: () => void;
}

type TabType = 'overview' | 'students' | 'analysis';

// 등급제 시험용 평가 방식 전환 토글
function GradingTypeToggle({
    examId,
    currentType,
}: {
    examId: number;
    currentType: GradingType | null;
}) {
    const { mutate, isPending } = useUpdateGradingType(examId);

    const handleChange = (newType: GradingType) => {
        if (newType !== currentType && !isPending) {
            mutate(newType);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 mr-1">평가 방식:</span>
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
                <button
                    onClick={() => handleChange('RELATIVE')}
                    disabled={isPending}
                    className={cn(
                        'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                        currentType === 'RELATIVE'
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    )}
                >
                    상대평가
                </button>
                <button
                    onClick={() => handleChange('ABSOLUTE')}
                    disabled={isPending}
                    className={cn(
                        'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                        currentType === 'ABSOLUTE'
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    )}
                >
                    절대평가
                </button>
            </div>
            {isPending && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
        </div>
    );
}

// 등급 체계 전환 토글
function GradeScaleToggle({
    examId,
    currentScale,
    disabled = false,
}: {
    examId: number;
    currentScale: GradeScale | null;
    disabled?: boolean;
}) {
    const { mutate, isPending } = useUpdateGradeScale(examId);

    const handleChange = (newScale: GradeScale) => {
        if (newScale !== currentScale && !isPending && !disabled) {
            mutate(newScale);
        }
    };

    return (
        <div className={cn("flex items-center gap-2", disabled && "opacity-50")}>
            <span className="text-sm text-gray-500 mr-1">등급 체계:</span>
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
                <button
                    onClick={() => handleChange('NINE_GRADE')}
                    disabled={isPending || disabled}
                    className={cn(
                        'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                        currentScale === 'NINE_GRADE'
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900',
                        disabled && 'cursor-not-allowed'
                    )}
                >
                    9등급제
                </button>
                <button
                    onClick={() => handleChange('FIVE_GRADE')}
                    disabled={isPending || disabled}
                    className={cn(
                        'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                        currentScale === 'FIVE_GRADE'
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900',
                        disabled && 'cursor-not-allowed'
                    )}
                >
                    5등급제
                </button>
            </div>
            {isPending && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
        </div>
    );
}

export function GradeDashboard({ selectedExam, isCreateMode, onCreateSuccess, onCreateCancel, onBack }: GradeDashboardProps) {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [selectedStudent, setSelectedStudent] = useState<StudentGrade | null>(null);

    // 시험 통계 조회 (examCategory, gradingType 확인용)
    const { data: statsData } = useExamStatistics(selectedExam?.id ?? 0);

    // 시험 생성 모드일 때 ExamCreateForm 표시
    if (isCreateMode) {
        return (
            <ExamCreateForm
                onSuccess={onCreateSuccess}
                onCancel={onCreateCancel}
            />
        );
    }

    if (!selectedExam) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50/50">
                <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                    <BarChart3 className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">통계를 확인할 시험을 선택하세요</h3>
                <p className="text-gray-500 text-center max-w-sm">
                    좌측 목록에서 시험을 선택하면<br />
                    상세한 성적 분석과 학생별 리포트를 확인할 수 있습니다.
                </p>
            </div>
        );
    }

    const tabs: { id: TabType; label: string; icon: typeof BarChart3 }[] = [
        { id: 'overview', label: '전체 통계', icon: BarChart3 },
        { id: 'students', label: '학생별 성적', icon: Users },
        { id: 'analysis', label: '문항 분석', icon: PieChart },
    ];

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50/50 overflow-hidden">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between px-4 tablet:px-8 py-4 tablet:py-5 bg-white border-b border-gray-200 sticky top-0 z-10 shrink-0">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBack}
                            className="tablet:hidden -ml-1 p-1.5"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    )}
                    <div>
                        <h2 className="text-xl tablet:text-2xl font-bold text-gray-900">{selectedExam.name}</h2>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">
                                {statsData?.examCategory === 'PASS_FAIL'
                                    ? '합격/불합격'
                                    : statsData?.gradingType === 'RELATIVE'
                                        ? `상대평가 · ${statsData?.gradeScale === 'FIVE_GRADE' ? '5등급제' : '9등급제'}`
                                        : '절대평가'}
                            </span>
                            <span>•</span>
                            <span>총 {selectedExam.totalQuestions}문항</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-8 pt-6 flex items-center justify-between">
                <div className="inline-flex bg-white border border-gray-200 rounded-lg p-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <Button
                                key={tab.id}
                                variant="ghost"
                                size="sm"
                                onClick={() => setActiveTab(tab.id)}
                                className={`gap-2 ${
                                    isActive
                                        ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-50'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </Button>
                        );
                    })}
                </div>

                {/* 등급제 시험일 때만 토글 표시 */}
                {statsData?.examCategory === 'GRADED' && (
                    <div className="flex items-center gap-4">
                        <GradeScaleToggle
                            examId={selectedExam.id}
                            currentScale={statsData.gradingType === 'ABSOLUTE' ? 'NINE_GRADE' : statsData.gradeScale}
                            disabled={statsData.gradingType === 'ABSOLUTE'}
                        />
                        <GradingTypeToggle
                            examId={selectedExam.id}
                            currentType={statsData.gradingType}
                        />
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 pt-6">
                {activeTab === 'overview' && (
                    <GradeStatisticsView examId={selectedExam.id} />
                )}
                {activeTab === 'students' && (
                    <StudentGradeTable
                        examId={selectedExam.id}
                        onStudentSelect={setSelectedStudent}
                    />
                )}
                {activeTab === 'analysis' && (
                    <ChoiceAnalysisTable examId={selectedExam.id} />
                )}
            </div>

            {/* Student Detail Panel */}
            {selectedStudent && (
                <StudentDetailPanel
                    studentId={selectedStudent.studentId}
                    studentName={selectedStudent.studentName}
                    examId={selectedExam.id}
                    onClose={() => setSelectedStudent(null)}
                />
            )}
        </div>
    );
}
