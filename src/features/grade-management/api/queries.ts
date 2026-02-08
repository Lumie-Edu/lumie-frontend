'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examClient } from '@/src/shared/api/base';
import { PaginatedResponse } from '@/src/shared/types/api';
import { Exam, CreateExamInput, ExamTemplate } from '@/entities/exam';
import { toast } from 'sonner';

// Interfaces
export interface GradeExam extends Exam {
    averageScore?: number;
    highestScore?: number;
    lowestScore?: number;
    participantCount?: number;
}

export interface StudentGrade {
    studentId: number;
    studentName: string;
    studentPhone: string;
    score: number;
    rank: number;
    percentile: number;
    grade: number | null;
    examCategory: 'GRADED' | 'PASS_FAIL';
    isPassed: boolean;
    submittedAt: string;
    answers?: Record<string, string>;
}

export type GradingType = 'RELATIVE' | 'ABSOLUTE';
export type GradeScale = 'NINE_GRADE' | 'FIVE_GRADE';

export interface GradeStatistics {
    examId: number;
    examName: string;
    examCategory: 'GRADED' | 'PASS_FAIL';
    gradingType: GradingType | null;
    gradeScale: GradeScale | null;
    participantCount: number;
    average: number;
    highest: number;
    lowest: number;
    standardDeviation: number;
    // P/NP 시험 전용 필드
    passRate: number | null;
    passCount: number | null;
    failCount: number | null;
    // 등급제 시험 전용 필드
    gradeDistribution: {
        grade: number;
        count: number;
        percentage: number;
        cutoffScore: number | null;  // 해당 등급의 커트라인 점수
    }[];
    scoreRangeDistribution: {
        range: string;
        count: number;
        percentage: number;
    }[];
    typeAccuracyList: {
        questionType: string;
        totalQuestions: number;
        correctCount: number;
        accuracyRate: number;
    }[];
    topIncorrectQuestions: {
        questionNumber: number;
        questionType: string;
        correctAnswer: string;
        totalAttempts: number;
        incorrectCount: number;
        incorrectRate: number;
        topWrongChoice: string;
        topWrongChoiceRate: number;
    }[];
}

export interface ExamDetail extends Exam {
    correctAnswers: Record<string, string>;
    questionScores: Record<string, number>;
    questionTypes: Record<string, string>;
}

export interface AcademyComparison {
    academyId: number;
    academyName: string;
    participantCount: number;
    average: number;
    grade1Count: number;
    grade1Percentage: number;
}

// Keys
const QUERY_KEYS = {
    all: ['grade-management'] as const,
    exams: (params?: Record<string, unknown>) => [...QUERY_KEYS.all, 'exams', params] as const,
    examDetail: (examId: number) => [...QUERY_KEYS.all, 'detail', examId] as const,
    examStats: (examId: number) => [...QUERY_KEYS.all, 'stats', examId] as const,
    studentGrades: (examId: number, params?: Record<string, unknown>) => [...QUERY_KEYS.all, 'grades', examId, params] as const,
    academyComparison: (examId: number) => [...QUERY_KEYS.all, 'academy-comparison', examId] as const,
    templates: ['exam-templates'] as const,
};

// Hooks

export function useGradeExams(params?: { page?: number; size?: number; search?: string }) {
    return useQuery({
        queryKey: QUERY_KEYS.exams(params),
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (params?.page) searchParams.set('page', String(params.page));
            if (params?.size) searchParams.set('size', String(params.size));
            if (params?.search) searchParams.set('title', params.search);

            const query = searchParams.toString();
            const url = `/api/v1/exams?sort=createdAt,desc${query ? `&${query}` : ''}`;
            return examClient.get<PaginatedResponse<GradeExam>>(url);
        },
    });
}

export function useExamDetail(examId: number, enabled: boolean = true) {
    return useQuery({
        queryKey: QUERY_KEYS.examDetail(examId),
        queryFn: async () => {
            return examClient.get<ExamDetail>(`/api/v1/exams/${examId}/detail`);
        },
        enabled: examId > 0 && enabled,
    });
}

export function useExamStatistics(examId: number) {
    return useQuery({
        queryKey: QUERY_KEYS.examStats(examId),
        queryFn: async () => {
            return examClient.get<GradeStatistics>(`/api/v1/statistics/exams/${examId}`);
        },
        enabled: examId > 0,
    });
}

export function useStudentGrades(examId: number, params?: { page?: number; size?: number }) {
    return useQuery({
        queryKey: QUERY_KEYS.studentGrades(examId, params),
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (params?.page !== undefined) searchParams.set('page', String(params.page));
            if (params?.size) searchParams.set('size', String(params.size));

            const query = searchParams.toString();
            const url = `/api/v1/statistics/exams/${examId}/grades${query ? `?${query}` : ''}`;
            return examClient.get<PaginatedResponse<StudentGrade>>(url);
        },
        enabled: examId > 0,
    });
}

export function useUpdateGradingType(examId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (gradingType: GradingType) => {
            // 절대평가로 변경 시 9등급제로 함께 변경
            const payload = gradingType === 'ABSOLUTE'
                ? { gradingType, gradeScale: 'NINE_GRADE' }
                : { gradingType };
            return examClient.patch(`/api/v1/exams/${examId}`, payload);
        },
        onSuccess: () => {
            // 통계, 학생 성적, 학원 비교 쿼리 무효화하여 다시 조회
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.examStats(examId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.studentGrades(examId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.academyComparison(examId) });
            toast.success('평가 방식이 변경되었습니다.');
        },
        onError: () => {
            toast.error('평가 방식 변경에 실패했습니다.');
        },
    });
}

export function useUpdateGradeScale(examId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (gradeScale: GradeScale) => {
            return examClient.patch(`/api/v1/exams/${examId}`, { gradeScale });
        },
        onSuccess: () => {
            // 통계, 학생 성적, 학원 비교 쿼리 무효화하여 다시 조회
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.examStats(examId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.studentGrades(examId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.academyComparison(examId) });
            toast.success('등급 체계가 변경되었습니다.');
        },
        onError: () => {
            toast.error('등급 체계 변경에 실패했습니다.');
        },
    });
}

export function useCreateExamWithDetails() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateExamInput) => {
            return examClient.post<Exam>('/api/v1/exams', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
            toast.success('시험이 생성되었습니다.');
        },
        onError: () => {
            toast.error('시험 생성에 실패했습니다.');
        },
    });
}

export function useDeleteExam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (examId: number) => {
            return examClient.delete(`/api/v1/exams/${examId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
            toast.success('시험이 삭제되었습니다.');
        },
        onError: () => {
            toast.error('시험 삭제에 실패했습니다.');
        },
    });
}

export function useAcademyComparison(examId: number) {
    return useQuery({
        queryKey: QUERY_KEYS.academyComparison(examId),
        queryFn: async () => {
            return examClient.get<AcademyComparison[]>(
                `/api/v1/statistics/exams/${examId}/academy-comparison`
            );
        },
        enabled: examId > 0,
    });
}

// Exam Template Hooks

export function useExamTemplates() {
    return useQuery({
        queryKey: QUERY_KEYS.templates,
        queryFn: async () => {
            return examClient.get<PaginatedResponse<ExamTemplate>>(
                '/api/v1/exam-templates?sort=createdAt,desc&size=100'
            );
        },
    });
}

export function useCreateExamTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Omit<ExamTemplate, 'id' | 'totalPossibleScore' | 'createdAt' | 'updatedAt'>) => {
            return examClient.post<ExamTemplate>('/api/v1/exam-templates', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.templates });
            toast.success('템플릿이 저장되었습니다.');
        },
        onError: () => {
            toast.error('템플릿 저장에 실패했습니다.');
        },
    });
}

export function useDeleteExamTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (templateId: number) => {
            return examClient.delete(`/api/v1/exam-templates/${templateId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.templates });
            toast.success('템플릿이 삭제되었습니다.');
        },
        onError: () => {
            toast.error('템플릿 삭제에 실패했습니다.');
        },
    });
}
