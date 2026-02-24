'use client';

import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Conversation } from '../model/schema';
import { useDeleteConversation } from '../api/queries';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onNew: () => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onNew,
}: ConversationListProps) {
  const { mutate: deleteConversation } = useDeleteConversation();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-3">
        <Button onClick={onNew} className="w-full" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          새 대화
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 && (
          <p className="p-4 text-center text-sm text-muted-foreground">
            대화 내역이 없습니다
          </p>
        )}
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={cn(
              'group flex cursor-pointer items-center gap-2 border-b px-3 py-2.5 transition-colors hover:bg-muted/50',
              selectedId === conv.id && 'bg-muted'
            )}
            onClick={() => onSelect(conv.id)}
          >
            <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate text-sm">{conv.title}</span>
            <button
              className="hidden shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive group-hover:block"
              onClick={(e) => {
                e.stopPropagation();
                deleteConversation(conv.id);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
