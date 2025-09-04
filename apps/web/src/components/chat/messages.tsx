import type { Vote } from "@/db/schema";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import type { ChatMessage } from "@/lib/types";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import equal from "fast-deep-equal";
import { motion } from "framer-motion";
import { memo } from "react";
import { PreviewMessage, ThinkingMessage } from "./message";

interface MessagesProps {
  chatId: string;
  status: UseChatHelpers<ChatMessage>["status"];
  votes?: Array<Vote> | undefined;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  reload: UseChatHelpers<ChatMessage>["regenerate"];
  chatbot?: any;
}

function PureMessages({
  chatId,
  status,
  votes,
  messages,
  setMessages,
  chatbot,
}: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-hidden pt-4 relative"
    >
      {messages.map((message, index) => (
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          isLoading={status === "streaming" && messages.length - 1 === index}
          vote={
            votes
              ? votes.find((vote) => vote.messageId === message.id)
              : undefined
          }
          setMessages={setMessages}
          chatbot={chatbot}
        />
      ))}

      {status === "submitted" &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "user" && <ThinkingMessage />}

      <motion.div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
      />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.status && nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;
  if (!equal(prevProps.chatbot, nextProps.chatbot)) return false;

  return true;
});
