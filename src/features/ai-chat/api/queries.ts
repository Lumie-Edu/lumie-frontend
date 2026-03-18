import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiClient } from '@/src/shared/api/base';
import type {
  Conversation,
  ChatResponse,
  PaginatedResponse,
} from '../model/schema';

const QUERY_KEYS = {
  all: ['ai-chat'] as const,
  conversations: () => [...QUERY_KEYS.all, 'conversations'] as const,
  conversation: (id: number) => [...QUERY_KEYS.all, 'conversation', id] as const,
};

export function useConversations() {
  return useQuery({
    queryKey: QUERY_KEYS.conversations(),
    queryFn: () =>
      aiClient.get<PaginatedResponse<Conversation>>(
        '/v1/conversations?size=50&sort=updatedAt,desc'
      ),
  });
}

export function useConversation(id: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.conversation(id!),
    queryFn: () => aiClient.get<Conversation>(`/v1/conversations/${id}`),
    enabled: id !== null && id > 0,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { conversationId?: number; message: string }) =>
      aiClient.post<ChatResponse>('/v1/chat', data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.conversation(data.conversationId),
      });
    },
  });
}

export function useConfirmAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { messageId: number; confirmed: boolean }) =>
      aiClient.post<ChatResponse>('/v1/chat/confirm', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      aiClient.delete<void>(`/v1/conversations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations() });
    },
  });
}
