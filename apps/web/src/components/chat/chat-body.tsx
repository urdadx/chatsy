import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import type { Vote } from "@/db/schema";
import type { ChatMessage } from "@/lib/types";
import { RiBardFill } from "@remixicon/react";
import type { useQueryClient } from "@tanstack/react-query";
import type { ChatRequestOptions, ChatStatus } from "ai";
import type { ReactNode } from "react";

import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { GreetingMessage } from "./greeting-message";
import { PreviewMessage, ThinkingMessage } from "./preview-message";

interface ChatBodyProps {
  isLoading?: boolean;
  error?: Error | null;
  isDeactivated?: boolean;
  messages: ChatMessage[];
  setMessages: (
    messages: ChatMessage[] | ((messages: ChatMessage[]) => ChatMessage[]),
  ) => void;
  status: ChatStatus;
  chatError?: Error | null;
  chatId: string;
  votes?: Vote[];
  regenerate: (
    options?: { messageId?: string } & ChatRequestOptions,
  ) => Promise<void>;
  chatbot?: {
    initialMessage?: string | null;
    [key: string]: any;
  };
  queryClient?: ReturnType<typeof useQueryClient>;
  className?: string;
  children?: ReactNode;
}

export function ChatBody({
  isLoading,
  error,
  isDeactivated,
  messages,
  setMessages,
  status,
  chatError,
  chatId,
  votes,
  chatbot,
  queryClient,
  className,
  children,
}: ChatBodyProps) {
  const greetingMessage = chatbot?.initialMessage || "";
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();


  if (isDeactivated) {
    return (
      <div className={`relative flex-1 min-h-0 overflow-hidden ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-6 max-w-sm">
            <div className="mb-4">
              <div className="rounded-full w-9 h-9 flex items-center justify-center">
                <RiBardFill size={20} className="text-white rounded-full" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chatbot Unavailable
            </h3>
            <p className="text-gray-600 text-sm">
              This chatbot is currently deactivated. Please try again later or
              contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`relative flex-1 min-h-0 overflow-hidden ${className}`}>
        <div className="flex items-center justify-center h-full">
          <Spinner className="text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative flex-1 min-h-0 overflow-hidden ${className}`}>
        <div className="flex items-center justify-center h-full text-red-500">
          <div className="text-center">
            <p className="text-sm">Error loading messages</p>
            {queryClient && (
              <Button
                variant="outline"
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ["messages"] })
                }
                className="mt-2"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={messagesContainerRef} className={`relative flex-1 min-h-0 overflow-hidden ${className}`}>
      <Conversation className="h-full overflow-hidden">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              title={greetingMessage}
              description=""
              icon={<RiBardFill size={20} className="text-muted-foreground" />}
            />
          ) : (
            <Conversation className="mx-auto flex min-w-0 max-w-4xl flex-col gap-4 md:gap-6">
              <ConversationContent className="flex  flex-col gap-4 px-2 py-4 md:gap-6">
                {messages.length === 0 && <GreetingMessage />}

                {messages.map((message, index) => (
                  <PreviewMessage
                    key={message.id}
                    chatId={chatId}
                    message={message}
                    isLoading={
                      status === 'streaming' && messages.length - 1 === index
                    }
                    vote={
                      votes
                        ? votes.find((vote) => vote.messageId === message.id)
                        : undefined
                    }
                    setMessages={setMessages}
                    chatbot={chatbot}
                    showActions={false}
                  />
                ))}

                {status === 'submitted' &&
                  messages.length > 0 &&
                  messages[messages.length - 1].role === 'user' && <ThinkingMessage />}

                <div
                  ref={messagesEndRef}
                  className="shrink-0 min-w-[24px] min-h-[24px]"
                />
              </ConversationContent>
            </Conversation>
          )}

          {status === "error" && chatError && (
            <div className="text-red-500 p-4">Error: {chatError.message}</div>
          )}
          {children}
        </ConversationContent>

        <ConversationScrollButton className="shadow-lg" />
      </Conversation>

    </div>
  );
}
