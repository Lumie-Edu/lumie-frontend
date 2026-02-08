// UI Components
export { GradeSidebar } from './ui/GradeSidebar';
export { GradeDashboard } from './ui/GradeDashboard';
export { GradeStatisticsView } from './ui/GradeStatistics';
export { StudentGradeTable } from './ui/StudentGradeTable';
export { ChoiceAnalysisTable } from './ui/ChoiceAnalysisTable';
export { TypeGrowthChart } from './ui/TypeGrowthChart';
export { StabilityChart } from './ui/StabilityChart';
export { GoalSimulator } from './ui/GoalSimulator';
export { StudentDetailPanel } from './ui/StudentDetailPanel';

// Base Queries
export {
    useExamStatistics,
    useStudentGrades,
    type GradeStatistics,
    type StudentGrade,
} from './api/queries';

// Statistics Queries
export {
    useStudentRank,
    useStabilityIndex,
    useTypeGrowthTrend,
    useNormalizedScores,
    useChoiceDistribution,
    useGoalSimulation,
    useAcademyGrowth,
    type StudentRank,
    type StabilityIndex,
    type TypeGrowthTrend,
    type NormalizedScore,
    type ChoiceDistribution,
    type GoalSimulation,
    type AcademyGrowth,
} from './api/statistics-queries';
