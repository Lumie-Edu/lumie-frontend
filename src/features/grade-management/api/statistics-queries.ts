'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { examClient } from '@/src/shared/api/base';

// === Types ===

export interface StudentRank {
    studentId: number;
    examId: number;
    examName: string;
    score: number;
    rank: number;
    totalParticipants: number;
    percentile: number;
    typePercentiles: TypePercentile[];
}

export interface TypePercentile {
    questionType: string;
    correctCount: number;
    totalCount: number;
    accuracy: number;
    percentile: number;
}

export interface StabilityIndex {
    studentId: number;
    examCount: number;
    averageScore: number;
    standardDeviation: number;
    coefficientOfVariation: number;
    stabilityLevel: 'VERY_STABLE' | 'STABLE' | 'MODERATE' | 'UNSTABLE' | 'VERY_UNSTABLE' | 'N/A';
    scoreHistory: ScoreHistory[];
}

export interface ScoreHistory {
    examId: number;
    examName: string;
    score: number;
    grade: number;
    examDate: string;
}

export interface TypeGrowthTrend {
    studentId: number;
    trends: TypeTrend[];
}

export interface TypeTrend {
    questionType: string;
    trendPoints: TrendPoint[];
    overallGrowthRate: number;
}

export interface TrendPoint {
    examId: number;
    examName: string;
    examDate: string;
    correctCount: number;
    totalCount: number;
    accuracy: number;
}

export interface NormalizedScore {
    studentId: number;
    normalizedScores: NormalizedExamScore[];
}

export interface NormalizedExamScore {
    examId: number;
    examName: string;
    examDate: string;
    rawScore: number;
    examMean: number;
    examStdDev: number;
    zScore: number;
    normalizedScore: number;
}

export interface ChoiceDistribution {
    examId: number;
    examName: string;
    totalParticipants: number;
    questions: QuestionChoiceDistribution[];
}

export interface QuestionChoiceDistribution {
    questionNumber: number;
    questionType: string;
    correctAnswer: string;
    correctCount: number;
    correctRate: number;
    choiceDistribution: Record<string, ChoiceStats>;
    attractiveDistractors: AttractiveDistractor[];
}

export interface ChoiceStats {
    count: number;
    percentage: number;
    isCorrect: boolean;
}

export interface AttractiveDistractor {
    choice: string;
    count: number;
    percentage: number;
}

export interface GoalSimulationRequest {
    targetGrade: number;
    baseExamId?: number;
}

export interface GoalSimulation {
    studentId: number;
    currentGrade: number;
    targetGrade: number;
    currentScore: number;
    targetScore: number;
    scoreDifference: number;
    achievable: boolean;
    scenarios: ImprovementScenario[];
}

export interface ImprovementScenario {
    questionType: string;
    currentCorrect: number;
    totalQuestions: number;
    currentAccuracy: number;
    additionalCorrectNeeded: number;
    targetAccuracy: number;
    potentialScoreGain: number;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface AcademyGrowth {
    academyId: string;
    academyName: string;
    studentCount: number;
    averageGrowthRate: number;
    topGrowthStudents: StudentGrowth[];
    examGrowthTrend: ExamGrowth[];
}

export interface DashboardStatistics {
    totalExams: number;
    totalResults: number;
    overallAverageScore: number;
    typeAccuracyList: TypeAccuracy[];
    topIncorrectQuestions: TopIncorrectQuestion[];
}

export interface TypeAccuracy {
    questionType: string;
    totalQuestions: number;
    correctCount: number;
    accuracyRate: number;
}

export interface TopIncorrectQuestion {
    examId: number;
    examName: string;
    questionNumber: number;
    questionType: string;
    correctAnswer: string;
    totalAttempts: number;
    incorrectCount: number;
    incorrectRate: number;
    topWrongChoice: string;
    topWrongChoiceRate: number;
}

export interface StudentGrowth {
    studentId: number;
    studentName: string;
    growthRate: number;
    examCount: number;
}

export interface ExamGrowth {
    examId: number;
    examName: string;
    examDate: string;
    academyAverage: number;
    previousAcademyAverage: number;
    growthRate: number;
}

// === Query Keys ===

export const statisticsKeys = {
    all: ['statistics'] as const,
    dashboard: () => [...statisticsKeys.all, 'dashboard'] as const,
    studentRank: (studentId: number, examId: number) => [...statisticsKeys.all, 'rank', studentId, examId] as const,
    stability: (studentId: number) => [...statisticsKeys.all, 'stability', studentId] as const,
    typeGrowth: (studentId: number) => [...statisticsKeys.all, 'type-growth', studentId] as const,
    normalized: (studentId: number) => [...statisticsKeys.all, 'normalized', studentId] as const,
    choiceDistribution: (examId: number) => [...statisticsKeys.all, 'choices', examId] as const,
    academyGrowth: () => [...statisticsKeys.all, 'academy-growth'] as const,
};

// === Hooks ===

export function useStudentRank(studentId: number, examId: number) {
    return useQuery({
        queryKey: statisticsKeys.studentRank(studentId, examId),
        queryFn: () => examClient.get<StudentRank>(
            `/api/v1/statistics/students/${studentId}/rank?examId=${examId}`
        ),
        enabled: studentId > 0 && examId > 0,
    });
}

export function useStabilityIndex(studentId: number) {
    return useQuery({
        queryKey: statisticsKeys.stability(studentId),
        queryFn: () => examClient.get<StabilityIndex>(
            `/api/v1/statistics/students/${studentId}/stability`
        ),
        enabled: studentId > 0,
    });
}

export function useTypeGrowthTrend(studentId: number) {
    return useQuery({
        queryKey: statisticsKeys.typeGrowth(studentId),
        queryFn: () => examClient.get<TypeGrowthTrend>(
            `/api/v1/statistics/students/${studentId}/type-growth`
        ),
        enabled: studentId > 0,
    });
}

export function useNormalizedScores(studentId: number) {
    return useQuery({
        queryKey: statisticsKeys.normalized(studentId),
        queryFn: () => examClient.get<NormalizedScore>(
            `/api/v1/statistics/students/${studentId}/normalized`
        ),
        enabled: studentId > 0,
    });
}

export function useChoiceDistribution(examId: number) {
    return useQuery({
        queryKey: statisticsKeys.choiceDistribution(examId),
        queryFn: () => examClient.get<ChoiceDistribution>(
            `/api/v1/statistics/exams/${examId}/choices`
        ),
        enabled: examId > 0,
    });
}

export function useGoalSimulation(studentId: number) {
    return useMutation({
        mutationFn: (request: GoalSimulationRequest) =>
            examClient.post<GoalSimulation>(
                `/api/v1/statistics/students/${studentId}/goal-simulation`,
                request
            ),
    });
}

export function useAcademyGrowth() {
    return useQuery({
        queryKey: statisticsKeys.academyGrowth(),
        queryFn: () => examClient.get<AcademyGrowth>(
            `/api/v1/statistics/academy/growth`
        ),
    });
}

export function useDashboardStatistics() {
    return useQuery({
        queryKey: statisticsKeys.dashboard(),
        queryFn: () => examClient.get<DashboardStatistics>(
            `/api/v1/statistics/dashboard`
        ),
    });
}
