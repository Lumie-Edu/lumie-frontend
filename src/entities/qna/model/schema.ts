import { z } from 'zod';

export const qnaStatusSchema = z.enum(['PENDING', 'ANSWERED']);
export type QnaStatus = z.infer<typeof qnaStatusSchema>;

export const qnaSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  answer: z.string().optional(),
  academyId: z.number(),
  authorId: z.number(),
  authorName: z.string(),
  status: qnaStatusSchema,
  answeredAt: z.string().optional(),
  answeredBy: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Qna = z.infer<typeof qnaSchema>;

export const createQnaSchema = z.object({
  title: z.string().min(2, '제목은 최소 2자 이상이어야 합니다.').max(200, '제목은 200자를 초과할 수 없습니다.'),
  content: z.string().min(1, '질문 내용을 입력해주세요.'),
  academyId: z.number({ error: '학원을 선택해주세요.' }),
});

export type CreateQnaInput = z.infer<typeof createQnaSchema>;

export const answerQnaSchema = z.object({
  answer: z.string().min(1, '답변 내용을 입력해주세요.'),
});

export type AnswerQnaInput = z.infer<typeof answerQnaSchema>;
