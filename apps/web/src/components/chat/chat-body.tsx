import { Button } from "@/components/ui/button";
import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from "@/components/ui/chat-container";
import { ScrollButton } from "@/components/ui/scroll-button";
import Spinner from "@/components/ui/spinner";
import type { Vote } from "@/db/schema";
import type { ChatMessage } from "@/lib/types";
import { RiBardFill } from "@remixicon/react";
import type { useQueryClient } from "@tanstack/react-query";
import type { ChatRequestOptions, ChatStatus } from "ai";
import type { ReactNode } from "react";
import { GreetingMessage } from "./greeting-message";
import { Messages } from "./messages";

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
  regenerate,
  chatbot,
  queryClient,
  className,
  children,
}: ChatBodyProps) {
  const greetingMessage = chatbot?.initialMessage || "";

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
    <div className={`relative flex-1 min-h-0 overflow-hidden ${className}`}>
      <ChatContainerRoot className="h-full smooth-div">
        <ChatContainerContent className="p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <GreetingMessage title={greetingMessage} />
            ) : (
              <Messages
                chatId={chatId}
                status={status}
                votes={votes}
                messages={messages}
                setMessages={setMessages}
                reload={regenerate}
                chatbot={chatbot}
              />
            )}

            {status === "error" && chatError && (
              <div className="text-red-500 p-4">Error: {chatError.message}</div>
            )}

            {children}

            <ChatContainerScrollAnchor />
          </div>
        </ChatContainerContent>

        <div className="absolute bottom-2 right-2 z-10">
          <ScrollButton className="shadow-lg" />
        </div>
      </ChatContainerRoot>
    </div>
  );
}
