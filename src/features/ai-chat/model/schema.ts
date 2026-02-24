import { z } from 'zod';

export const messageRoleSchema = z.enum(['USER', 'ASSISTANT', 'TOOL', 'SYSTEM']);
export type MessageRole = z.infer<typeof messageRoleSchema>;

export const chatMessageSchema = z.object({
  id: z.number(),
  role: messageRoleSchema,
  content: z.string().nullable(),
  toolCallId: z.string().nullable().optional(),
  toolCalls: z.string().nullable().optional(),
  pendingAction: z.string().nullable().optional(),
  createdAt: z.string(),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const conversationSchema = z.object({
  id: z.number(),
  title: z.string(),
  isActive: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  messages: z.array(chatMessageSchema).optional(),
});
export type Conversation = z.infer<typeof conversationSchema>;

export const pendingActionSchema = z.object({
  messageId: z.number(),
  toolName: z.string(),
  description: z.string(),
  arguments: z.record(z.string(), z.unknown()),
});
export type PendingAction = z.infer<typeof pendingActionSchema>;

export const chatResponseSchema = z.object({
  conversationId: z.number(),
  message: z.string(),
  pendingAction: pendingActionSchema.optional(),
});
export type ChatResponse = z.infer<typeof chatResponseSchema>;

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
