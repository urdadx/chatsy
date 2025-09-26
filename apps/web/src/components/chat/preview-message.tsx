import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ai-elements/message";
import { Response } from '@/components/ai-elements/response';
import type { Vote } from "@/db/schema";
import { useChatbot } from "@/hooks/use-chatbot";
import { CollectFeedbackForm } from "@/lib/ai/tools-ui/collect-feedback-form";
import { CollectLeadsForm } from "@/lib/ai/tools-ui/collect-leads-form";
import { EscalateToHumanNotification } from "@/lib/ai/tools-ui/escalate-to-human-notification";
import type { ChatMessage } from "@/lib/types";
import { sanitizeText } from "@/lib/utils";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { Loader } from "../ui/loader";
import { MessageActions } from "./message-actions";
import { MessageReasoning } from "./message-reasoning";

export const PreviewMessage = ({
  chatId,
  message,
  isLoading,
  vote,
  chatbot,
  showActions = true,
}: {
  chatId: string;
  message: UIMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages?: UseChatHelpers<ChatMessage>["setMessages"];
  chatbot?: any;
  requiresScrollPadding?: boolean;
  showActions?: boolean;
}) => {
  const { data: fallbackChatbot } = useChatbot();
  const activeChatbot = chatbot || fallbackChatbot;

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Message from={message.role}>
          {message.role === "assistant" && (
            <MessageAvatar
              src={activeChatbot?.image || "/placeholder-avatar.png"}
              name={activeChatbot?.name || "Assistant"}
            />
          )}

          <MessageContent
            variant={message.role === "user" ? "contained" : "flat"}
            className={message.role === "user" ? "bg-primary text-primary-foreground" : ""}
            style={{
              backgroundColor:
                message.role === "user"
                  ? activeChatbot?.primaryColor
                  : undefined,
            }}
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
                return (
                  <div key={key}>

                    <Response>{sanitizeText(part.text)}</Response>
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

                if (state === "input-streaming") {
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
            {showActions && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </MessageContent>
        </Message>
      </motion.div>
    </AnimatePresence>
  );
};


export const ThinkingMessage = () => {
  const { data: chatbot } = useChatbot();
  const activeChatbot = chatbot;

  return (
    <motion.div
      data-testid="message-assistant-loading"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
    >
      <Message from="assistant">
        <MessageAvatar
          src={activeChatbot?.image || "/placeholder-avatar.png"}
          name={activeChatbot?.name || "Assistant"}
        />
        <MessageContent variant="flat">
          <Loader variant="dots" className="text-muted-foreground" />
        </MessageContent>
      </Message>
    </motion.div>
  );
};
