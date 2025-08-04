import { Markdown } from "@/components/chat/markdown";
import type { Vote } from "@/db/schema";
import { useChatbot } from "@/hooks/use-chatbot";
import { CollectFeedbackForm } from "@/lib/ai/tools-ui/collect-feedback-form";
import { CollectLeadsForm } from "@/lib/ai/tools-ui/collect-leads-form";
import { cn, sanitizeText } from "@/lib/utils";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import cx from "classnames";
import equal from "fast-deep-equal";
import { AnimatePresence, motion } from "framer-motion";
import { SparklesIcon } from "lucide-react";
import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Loader } from "../ui/loader";
import { MessageActions } from "./message-actions";

const PurePreviewMessage = ({
  chatId,
  message,
  isLoading,
  vote,
  chatbot,
}: {
  chatId: string;
  message: UIMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers["setMessages"];
  chatbot?: any;
}) => {
  const { data: fallbackChatbot } = useChatbot();
  const activeChatbot = chatbot || fallbackChatbot;

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="w-full mx-auto max-w-3xl group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex items-start gap-3 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:w-fit",
          )}
        >
          {message.role === "assistant" && (
            <Avatar className="size-8 shrink-0">
              <AvatarImage
                src={activeChatbot?.image || undefined}
                alt="Assistant"
              />
              <AvatarFallback className="bg-background border">
                <SparklesIcon size={14} />
              </AvatarFallback>
            </Avatar>
          )}

          <div className="flex flex-col gap-4 w-full">
            {message.parts?.map((part, index) => {
              const { type } = part;
              const key = `message-${message.id}-part-${index}`;

              if (type === "text") {
                const sanitizedText = sanitizeText(part.text);

                return (
                  <div key={key} className="flex flex-row gap-2 items-start">
                    <div
                      style={{
                        backgroundColor:
                          message.role === "user"
                            ? activeChatbot?.primaryColor
                            : undefined,
                      }}
                      data-testid="message-content"
                      className={cn("flex flex-col gap-4", {
                        " text-primary-foreground px-3 py-2 rounded-md":
                          message.role === "user",
                      })}
                    >
                      <Markdown>{sanitizedText}</Markdown>
                    </div>
                  </div>
                );
              }

              if (type === "tool-invocation") {
                const { toolInvocation } = part;
                const { toolName, toolCallId, state } = toolInvocation;

                if (state === "call") {
                  if (toolName === "collect_feedback") {
                    return (
                      <div key={toolCallId}>
                        <CollectFeedbackForm
                          color={activeChatbot?.primaryColor}
                        />
                      </div>
                    );
                  }
                }
                if (state === "call") {
                  if (toolName === "collect_leads") {
                    return (
                      <div key={toolCallId}>
                        <CollectLeadsForm />
                      </div>
                    );
                  }
                }

                if (state === "result") {
                  if (toolName === "knowledge_base") {
                    return null;
                  }
                }
              }
            })}
            <MessageActions
              key={`action-${message.id}`}
              chatId={chatId}
              message={message}
              vote={vote}
              isLoading={isLoading}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.id !== nextProps.message.id) return false;
    if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
    if (!equal(prevProps.chatbot, nextProps.chatbot)) return false;

    return true;
  },
);

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-2 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          "flex gap-3 items-start group-data-[role=user]/message:px-1 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          },
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon className="text-muted-foreground" size={14} />
        </div>

        <Loader variant="dots" className="text-muted-foreground" />
      </div>
    </motion.div>
  );
};
