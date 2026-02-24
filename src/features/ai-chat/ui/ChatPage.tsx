'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Loader2, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useConversations,
  useConversation,
  useSendMessage,
  useConfirmAction,
} from '../api/queries';
import type { ChatMessage as ChatMessageType, PendingAction } from '../model/schema';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ConversationList } from './ConversationList';
import { PendingActionCard } from './PendingActionCard';
import { cn } from '@/lib/utils';

export function ChatPage() {
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessageType[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversationsData } = useConversations();
  const { data: conversationDetail, isLoading: isLoadingDetail } = useConversation(selectedConvId);
  const sendMessage = useSendMessage();
  const confirmAction = useConfirmAction();

  const conversations = conversationsData?.content ?? [];
  const messages = conversationDetail?.messages ?? [];
  const isWaiting = sendMessage.isPending || confirmAction.isPending;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, optimisticMessages, scrollToBottom]);

  const handleSend = useCallback(
    (text: string) => {
      const optimistic: ChatMessageType = {
        id: -Date.now(),
        role: 'USER',
        content: text,
        createdAt: new Date().toISOString(),
      };
      setOptimisticMessages((prev) => [...prev, optimistic]);
      setPendingAction(null);

      sendMessage.mutate(
        {
          conversationId: selectedConvId ?? undefined,
          message: text,
        },
        {
          onSuccess: (data) => {
            setOptimisticMessages([]);
            setSelectedConvId(data.conversationId);
            if (data.pendingAction) {
              setPendingAction(data.pendingAction);
            }
          },
          onError: () => {
            setOptimisticMessages([]);
          },
        }
      );
    },
    [selectedConvId, sendMessage]
  );

  const handleConfirm = useCallback(
    (confirmed: boolean) => {
      if (!pendingAction) return;
      confirmAction.mutate(
        { messageId: pendingAction.messageId, confirmed },
        {
          onSuccess: (data) => {
            setPendingAction(null);
            if (data.pendingAction) {
              setPendingAction(data.pendingAction);
            }
          },
        }
      );
    },
    [pendingAction, confirmAction]
  );

  const handleNewConversation = useCallback(() => {
    setSelectedConvId(null);
    setPendingAction(null);
    setOptimisticMessages([]);
  }, []);

  const allMessages = [...messages, ...optimisticMessages];

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6 overflow-hidden bg-background">
      {/* Conversation sidebar */}
      <div
        className={cn(
          'h-full shrink-0 border-r bg-muted/30 transition-all duration-200',
          showSidebar ? 'w-72' : 'w-0 overflow-hidden border-r-0'
        )}
      >
        <ConversationList
          conversations={conversations}
          selectedId={selectedConvId}
          onSelect={(id) => {
            setSelectedConvId(id);
            setPendingAction(null);
            setOptimisticMessages([]);
          }}
          onNew={handleNewConversation}
        />
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex h-12 items-center gap-2 border-b px-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowSidebar((v) => !v)}
          >
            {showSidebar ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </Button>
          <Sparkles className="h-4 w-4 text-violet-500" />
          <span className="text-sm font-medium">
            {selectedConvId ? conversationDetail?.title : 'Lumie AI'}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {allMessages.length === 0 && !isLoadingDetail ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-foreground">
                  Lumie AI
                </p>
                <p className="text-sm">
                  학원 관리에 대해 무엇이든 물어보세요
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-4 p-4">
              {allMessages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {pendingAction && (
                <PendingActionCard
                  action={pendingAction}
                  onConfirm={() => handleConfirm(true)}
                  onDeny={() => handleConfirm(false)}
                  isLoading={confirmAction.isPending}
                />
              )}

              {isWaiting && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="rounded-2xl bg-muted px-4 py-2.5">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput onSend={handleSend} disabled={isWaiting} />
      </div>
    </div>
  );
}
