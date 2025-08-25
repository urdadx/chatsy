import { Markdown } from "@/components/chat/markdown";
import type { Vote } from "@/db/schema";
import { useChatbot } from "@/hooks/use-chatbot";
import { CollectFeedbackForm } from "@/lib/ai/tools-ui/collect-feedback-form";
import { CollectLeadsForm } from "@/lib/ai/tools-ui/collect-leads-form";
import { EscalateToHumanNotification } from "@/lib/ai/tools-ui/escalate-to-human-notification";
import type { ChatMessage } from "@/lib/types";
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
import { MessageReasoning } from "./message-reasoning";

const PurePreviewMessage = ({
  chatId,
  message,
  isLoading,
  vote,
  chatbot,
  requiresScrollPadding,
}: {
  chatId: string;
  message: UIMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  chatbot?: any;
  requiresScrollPadding: boolean;
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

          <div
            className={cn("flex flex-col gap-4 w-full", {
              "min-h-10": message.role === "assistant" && requiresScrollPadding,
            })}
          >
            {message.parts?.map((part, index) => {
              const { type } = part;
              const key = `message-${message.id}-part-${index}`;

              if (type === "reasoning" && part.text?.trim().length > 0) {
                return (
                  <MessageReasoning
                    key={key}
                    isLoading={isLoading}
                    reasoning={part.text}
                  />
                );
              }

              if (type === "text") {
                const hasToolCalls = message.parts?.some((part) =>
                  part.type?.startsWith("tool-escalate"),
                );

                if (hasToolCalls) {
                  return null;
                }

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
                      className={cn(
                        "flex flex-col gap-4 text-foreground bg-gray-50 prose px-3 py-2 rounded-md break-words whitespace-normal",
                        {
                          " text-white": message.role === "user",
                        },
                      )}
                    >
                      <Markdown>{sanitizeText(part.text)}</Markdown>
                    </div>
                  </div>
                );
              }

              if (type === "tool-collect_feedback") {
                const { toolCallId, state } = part;

                if (state === "input-available") {
                  return (
                    <div key={toolCallId}>
                      <CollectFeedbackForm
                        color={activeChatbot?.primaryColor}
                      />
                    </div>
                  );
                }

                if (state === "output-available") {
                  const { output } = part;

                  if (
                    output &&
                    typeof output === "object" &&
                    "error" in output
                  ) {
                    return (
                      <div
                        key={toolCallId}
                        className="text-red-500 p-2 border rounded"
                      >
                        Error: {String(output.error)}
                      </div>
                    );
                  }

                  return (
                    <div key={toolCallId}>
                      <CollectFeedbackForm
                        color={activeChatbot?.primaryColor}
                      />
                    </div>
                  );
                }
              }

              if (type === "tool-collect_leads") {
                const { toolCallId, state } = part;

                if (state === "input-available") {
                  return (
                    <div key={toolCallId}>
                      <CollectLeadsForm color={activeChatbot?.primaryColor} />
                    </div>
                  );
                }

                if (state === "output-available") {
                  const { output } = part;

                  if (
                    output &&
                    typeof output === "object" &&
                    "error" in output
                  ) {
                    return (
                      <div
                        key={toolCallId}
                        className="text-red-500 p-2 border rounded"
                      >
                        Error: {String(output.error)}
                      </div>
                    );
                  }

                  return (
                    <div key={toolCallId}>
                      <CollectLeadsForm />
                    </div>
                  );
                }
              }

              if (type === "tool-knowledge_base") {
                const { toolCallId, state } = part;

                if (state === "input-available") {
                  return (
                    <div
                      key={toolCallId}
                      className="flex items-center gap-2 text-muted-foreground text-sm"
                    >
                      <Loader
                        variant="dots"
                        className="text-muted-foreground"
                      />
                    </div>
                  );
                }

                if (state === "output-available") {
                  const { output } = part;

                  if (
                    output &&
                    typeof output === "object" &&
                    "error" in output
                  ) {
                    return (
                      <div
                        key={toolCallId}
                        className="text-red-500 p-2 border rounded"
                      >
                        Error searching knowledge base: {String(output.error)}
                      </div>
                    );
                  }
                  return null;
                }
              }

              if (type === "tool-escalate_to_human") {
                const { toolCallId, state } = part;

                if (state === "output-available") {
                  const { output } = part;

                  if (
                    output &&
                    typeof output === "object" &&
                    "error" in output
                  ) {
                    return (
                      <div
                        key={toolCallId}
                        className="text-red-500 p-2 border rounded"
                      >
                        We encountered an issue connecting you to a human
                      </div>
                    );
                  }

                  const reason = (output as any)?.reason || "complex-issue";
                  const message = (output as any)?.message || undefined;
                  const success = (output as any)?.success !== false;
                  const error = (output as any)?.error;

                  return (
                    <div key={toolCallId}>
                      <EscalateToHumanNotification
                        reason={reason}
                        message={message}
                        success={success}
                        error={error}
                      />
                    </div>
                  );
                }

                if (state === "input-available") {
                  return (
                    <div
                      key={toolCallId}
                      className="flex items-center gap-2 text-muted-foreground text-sm"
                    >
                      <Loader
                        variant="dots"
                        className="text-muted-foreground"
                      />
                      <span>Escalating to human agent...</span>
                    </div>
                  );
                }
              }

              return null;
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
  const { data: chatbot } = useChatbot();
  const activeChatbot = chatbot;

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-1 group/message "
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
        <Avatar className="size-8 shrink-0">
          <AvatarImage
            src={activeChatbot?.image || undefined}
            alt="Assistant"
          />
          <AvatarFallback className="bg-background border">
            <SparklesIcon size={14} />
          </AvatarFallback>
        </Avatar>

        <Loader variant="dots" className="text-muted-foreground" />
      </div>
    </motion.div>
  );
};
