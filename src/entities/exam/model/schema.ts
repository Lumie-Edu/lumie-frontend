import { z } from 'zod';

export const examStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']);
export type ExamStatus = z.infer<typeof examStatusSchema>;

export const examSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: examStatusSchema.optional(),
  category: z.enum(['GRADED', 'PASS_FAIL']).optional(),
  gradingType: z.enum(['ABSOLUTE', 'RELATIVE']).optional(),
  gradeScale: z.enum(['NINE_GRADE', 'FIVE_GRADE']).optional(),
  totalQuestions: z.number().optional(),
  totalPossibleScore: z.number().optional(),
  passScore: z.number().nullable().optional(),
  correctAnswers: z.record(z.string(), z.string()).optional(),
  questionScores: z.record(z.string(), z.number()).optional(),
  questionTypes: z.record(z.string(), z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type Exam = z.infer<typeof examSchema>;

export const examCategorySchema = z.enum(['GRADED', 'PASS_FAIL']);
export type ExamCategory = z.infer<typeof examCategorySchema>;

export const gradingTypeSchema = z.enum(['ABSOLUTE', 'RELATIVE']);
export type GradingType = z.infer<typeof gradingTypeSchema>;

export const gradeScaleSchema = z.enum(['NINE_GRADE', 'FIVE_GRADE']);
export type GradeScale = z.infer<typeof gradeScaleSchema>;

export const createExamSchema = z.object({
  name: z.string().min(2, '시험명은 최소 2자 이상이어야 합니다.').max(100, '시험명은 100자를 초과할 수 없습니다.'),
  category: examCategorySchema,
  gradingType: gradingTypeSchema.optional(),
  gradeScale: gradeScaleSchema.optional(),
  totalQuestions: z.number().min(1, '문제 수는 1 이상이어야 합니다.'),
  correctAnswers: z.record(z.string(), z.string()),
  questionScores: z.record(z.string(), z.number()),
  questionTypes: z.record(z.string(), z.string()).optional(),
  passScore: z.number().optional(),
});

export type CreateExamInput = z.infer<typeof createExamSchema>;

export const updateExamSchema = createExamSchema.partial();
export type UpdateExamInput = z.infer<typeof updateExamSchema>;

export const examResultSchema = z.object({
  id: z.number(),
  examId: z.number(),
  examName: z.string().optional(),
  studentId: z.number(),
  studentName: z.string().optional(),
  totalScore: z.number().optional(),
  score: z.number(),
  grade: z.number().optional(),
  correctCount: z.number().optional(),
  incorrectCount: z.number().optional(),
  isPassed: z.boolean().optional(),
  submittedAt: z.string().optional(),
  gradedAt: z.string().optional(),
  createdAt: z.string().optional(),
});

export type ExamResult = z.infer<typeof examResultSchema>;

export const submitExamResultSchema = z.object({
  studentId: z.number({ error: '학생을 선택해주세요.' }),
  score: z.number().min(0, '점수는 0점 이상이어야 합니다.'),
});

export type SubmitExamResultInput = z.infer<typeof submitExamResultSchema>;
