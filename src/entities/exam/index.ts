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
  useGenerateReport,
  buildReportUrl,
} from './api/queries';

export { ExamCard } from './ui/ExamCard';
