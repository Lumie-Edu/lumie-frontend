export {
  type Exam,
  type ExamStatus,
  type ExamCategory,
  type GradingType,
  type GradeScale,
  type CreateExamInput,
  type UpdateExamInput,
  type ExamResult,
  type SubmitExamResultInput,
  type ExamTemplate,
  examSchema,
  examStatusSchema,
  examCategorySchema,
  gradingTypeSchema,
  gradeScaleSchema,
  createExamSchema,
  updateExamSchema,
  examResultSchema,
  submitExamResultSchema,
  examTemplateSchema,
} from './model/schema';

export {
  type QuestionResult,
  useExams,
  useExam,
  useCreateExam,
  useUpdateExam,
  usePublishExam,
  useCloseExam,
  useDeleteExam,
  useExamResults,
  useSubmitExamResult,
  useMyExamResults,
  useStudentExamResults,
  useQuestionResults,
  useUpdateQuestionAnswer,
  useDeleteExamResult,
  useGenerateReport,
  buildReportUrl,
} from './api/queries';

export { ExamCard } from './ui/ExamCard';
export { QuestionResultsTable } from './ui/QuestionResultsTable';
export { IncorrectQuestionsCard } from './ui/IncorrectQuestionsCard';
