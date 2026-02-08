import { z } from 'zod';

export const positionSchema = z.object({
  id: z.number(),
  name: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Position = z.infer<typeof positionSchema>;

export const createPositionSchema = z.object({
  name: z.string().min(1, '직책명은 필수입니다.').max(50, '직책명은 50자를 초과할 수 없습니다.'),
});

export type CreatePositionInput = z.infer<typeof createPositionSchema>;
